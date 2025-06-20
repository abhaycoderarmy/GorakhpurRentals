import Order from "../models/order.model.js";
import Product from "../models/Product.js"; // Import Product model

// Create a new order (used by payment verification)
export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      total, 
      userId, 
      email, 
      customerDetails,
      paymentDetails,
      discount = 0 
    } = req.body;

    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Items received:', JSON.stringify(items, null, 2));
    console.log('UserId:', userId);

    // Validate that items array exists and has elements
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No items provided in order"
      });
    }

    // Transform items to match Order schema and validate dates
    const processedItems = [];
    for (let item of items) {
      // Get product ID from various possible fields
      const productId = item.ProductId || item._id || item.id || item.productId;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: `Missing product ID for item: ${item.name || 'Unknown'}`
        });
      }

      // Check for required rental dates
      if (!item.startDate || !item.endDate) {
        return res.status(400).json({
          success: false,
          error: `Missing rental dates for item: ${item.name || 'Unknown'}`
        });
      }

      processedItems.push({
        ProductId: productId,
        name: item.name,
        price: item.price,
        qty: item.qty || item.quantity || 1,
        startDate: item.startDate,
        endDate: item.endDate
      });
    }

    // Create the order first
    const order = new Order({
      items: processedItems,
      total,
      userId: userId,
      email,
      customerDetails,
      paymentStatus: "paid",
      paymentDetails,
      discount,
      orderDate: new Date(),
      orderStatus: "placed"
    });

    // Save the order
    const savedOrder = await order.save();
    console.log('Order saved successfully with ID:', savedOrder._id);

    // Update product availability for each item
    const updateResults = [];
    
    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];
      console.log(`\n--- Processing item ${i + 1}/${processedItems.length} ---`);
      console.log('Item data:', JSON.stringify(item, null, 2));
      
      try {
        const productId = item.ProductId;
        console.log('Attempting to find product with ID:', productId);

        const product = await Product.findById(productId);
        
        if (!product) {
          console.error(`❌ Product not found with ID: ${productId}`);
          updateResults.push({ 
            item: item.name || 'Unknown', 
            success: false, 
            error: `Product not found: ${productId}` 
          });
          continue;
        }

        console.log(`✅ Product found: ${product.name} (${product._id})`);

        // Validate and parse dates
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error(`❌ Invalid dates for item: ${item.name}`);
          console.log('StartDate:', item.startDate, 'EndDate:', item.endDate);
          updateResults.push({ 
            item: item.name || product.name, 
            success: false, 
            error: 'Invalid date format' 
          });
          continue;
        }

        if (startDate >= endDate) {
          console.error(`❌ Start date must be before end date for item: ${item.name}`);
          updateResults.push({ 
            item: item.name || product.name, 
            success: false, 
            error: 'Invalid date range' 
          });
          continue;
        }

        console.log(`📅 Dates validated: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Check current availability
        const isCurrentlyAvailable = product.isAvailableForDates(startDate, endDate);
        console.log(`🔍 Product availability check: ${isCurrentlyAvailable}`);
        
        if (!isCurrentlyAvailable) {
          console.warn(`⚠️ Product ${product.name} is not available for dates ${startDate.toDateString()} to ${endDate.toDateString()}`);
          // Continue anyway since payment was already processed
        }

        // Log current booked dates before update
        console.log('Current booked dates:', product.bookedDates.length);
        product.bookedDates.forEach((booking, idx) => {
          console.log(`  ${idx + 1}. ${booking.startDate} to ${booking.endDate} (Order: ${booking.orderId})`);
        });

        // Create booking object
        const newBooking = {
          startDate: startDate,
          endDate: endDate,
          userId: userId,
          orderId: savedOrder._id
        };

        console.log('New booking to add:', JSON.stringify(newBooking, null, 2));

        // Method 1: Use Mongoose $push operator (more reliable)
        const updateResult = await Product.findByIdAndUpdate(
          productId,
          { 
            $push: { 
              bookedDates: newBooking 
            } 
          },
          { 
            new: true,
            runValidators: true 
          }
        );

        if (updateResult) {
          console.log(`✅ Successfully updated product ${product.name}`);
          console.log(`📊 Total booked dates now: ${updateResult.bookedDates.length}`);
          updateResults.push({ 
            item: item.name || product.name, 
            success: true, 
            bookedDatesCount: updateResult.bookedDates.length 
          });
        } else {
          console.error(`❌ Failed to update product ${product.name}`);
          updateResults.push({ 
            item: item.name || product.name, 
            success: false, 
            error: 'Update operation failed' 
          });
        }
        
      } catch (productError) {
        console.error(`❌ Error updating product for item ${i + 1}:`, productError);
        updateResults.push({ 
          item: item.name || 'Unknown', 
          success: false, 
          error: productError.message 
        });
      }
    }

    // Log summary of updates
    console.log('\n=== UPDATE SUMMARY ===');
    const successCount = updateResults.filter(r => r.success).length;
    const failureCount = updateResults.filter(r => !r.success).length;
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${failureCount}`);
    
    updateResults.forEach((result, idx) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${idx + 1}. ${result.item} - ${result.success ? 'Success' : result.error}`);
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
      productUpdateResults: updateResults // Include update results for debugging
    });

  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

// Get all orders for a user (by email for guest users)
export const getUserOrders = async (req, res) => {
  try {
    const { userId, email } = req.params;
    
    let query = {};
    
    if (email) {
      // Guest user - search by email
      query.email = email;
    } else if (userId && userId !== 'guest') {
      // Authenticated user
      query.userId = userId;
    } else {
      return res.status(400).json({ error: "User ID or email required" });
    }

    const orders = await Order.find(query)
      .populate("items.ProductId")
      .sort({ orderDate: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Could not fetch orders" });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("items.ProductId")
      .populate("userId", "name email");
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Could not fetch order" });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    
    let query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.ProductId", "name images")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Could not fetch all orders" });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, notes } = req.body;
    
    const validStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    
    const updateData = { orderStatus };
    if (notes) updateData.notes = notes;
    if (orderStatus === "delivered") updateData.deliveredAt = new Date();
    
    // Handle cancellation - free up the booked dates
    if (orderStatus === "cancelled") {
      await handleOrderCancellation(orderId);
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Could not update order status" });
  }
};

// Helper function to handle order cancellation
const handleOrderCancellation = async (orderId) => {
  try {
    console.log(`🔄 Handling cancellation for order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('❌ Order not found for cancellation');
      return;
    }

    // Remove bookings from all products in this order
    for (const item of order.items) {
      try {
        const productId = item.ProductId || item._id || item.id;
        
        const updateResult = await Product.findByIdAndUpdate(
          productId,
          { 
            $pull: { 
              bookedDates: { orderId: orderId } 
            } 
          },
          { new: true }
        );

        if (updateResult) {
          console.log(`✅ Freed up booked dates for product: ${updateResult.name}`);
        }
      } catch (productError) {
        console.error(`❌ Error freeing up dates for product ${item.ProductId}:`, productError);
      }
    }
  } catch (error) {
    console.error("❌ Error handling order cancellation:", error);
  }
};

// Debug endpoint to check product booking status
export const debugProductBookings = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({
      success: true,
      productName: product.name,
      totalBookings: product.bookedDates.length,
      bookedDates: product.bookedDates,
      availability: product.availability
    });
  } catch (error) {
    console.error("Error debugging product bookings:", error);
    res.status(500).json({ error: "Could not fetch product booking info" });
  }
};