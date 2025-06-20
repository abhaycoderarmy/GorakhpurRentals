import User from "../models/user.model.js";
import Product from "../models/Product.js";

// Helper function to check if a date range is available
const checkDateRangeAvailability = (startDate, endDate, availableDates) => {
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  while (currentDate <= endDateObj) {
    // Check if current date exists in available dates
    const isDateAvailable = availableDates.some(availableDate => {
      return availableDate.toDateString() === currentDate.toDateString();
    });
    
    if (!isDateAvailable) {
      return false;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return true;
};

// Enhanced date validation function
const validateRentalDates = (startDate, endDate, product = null) => {
  if (!startDate || !endDate) {
    return { valid: false, message: "Both start and end dates are required" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for valid date objects
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }

  // Check if start date is not in the past
  if (start < today) {
    return { valid: false, message: "Start date cannot be in the past" };
  }

  // Check if end date is after start date
  if (end <= start) {
    return { valid: false, message: "End date must be after start date" };
  }

  // Check product availability if product is provided
  if (product) {
    try {
      const actualAvailableDates = product.getActualAvailableDates();
      const availableDateObjects = actualAvailableDates.map(dateStr => new Date(dateStr));
      
      const isAvailable = checkDateRangeAvailability(start, end, availableDateObjects);
      
      if (!isAvailable) {
        return { valid: false, message: "Product is not available for the selected dates" };
      }
    } catch (error) {
      console.error("Error checking product availability:", error);
      return { valid: false, message: "Error checking product availability" };
    }
  }

  return { valid: true };
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'name price images description category stock rentDuration bookedDates'
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Filter out any null products (in case product was deleted)
    const validCartItems = user.cart.filter(item => item.productId !== null);
    
    // Update user's cart if any products were removed
    if (validCartItems.length !== user.cart.length) {
      user.cart = validCartItems;
      await user.save();
    }

    // Format cart items for frontend
    const cartItems = validCartItems.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      images: item.productId.images,
      image: item.productId.images?.[0],
      description: item.productId.description,
      category: item.productId.category,
      qty: item.quantity,
      stock: item.productId.stock,
      rentDuration: item.productId.rentDuration,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    res.status(200).json({
      success: true,
      cart: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0),
      totalAmount: cartItems.reduce((sum, item) => {
        const days = item.startDate && item.endDate ? 
          Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24)) : 1;
        return sum + (item.price * item.qty * Math.max(days, 1));
      }, 0)
    });

  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cart" 
    });
  }
};

// Add item to cart with enhanced date validation
export const addToCart = async (req, res) => {
  try {
    console.log("=== ADD TO CART WITH RENTAL DATES ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    if (!req.user || !req.user.id) {
      console.error("Authentication failed: req.user or req.user.id is missing");
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const userId = req.user.id;
    const { productId, quantity = 1, startDate, endDate } = req.body;

    console.log("Extracted data:", { userId, productId, quantity, startDate, endDate });

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity must be a positive integer" 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Enhanced date validation with product availability check
    if (startDate && endDate) {
      const dateValidation = validateRentalDates(startDate, endDate, product);
      if (!dateValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: dateValidation.message 
        });
      }
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if product already exists in cart with same dates
    const existingCartItem = user.cart.find(item => {
      if (item.productId && item.productId.toString() === productId) {
        // If dates are provided, check if they match
        if (startDate && endDate) {
          return item.startDate && item.endDate &&
                 new Date(item.startDate).getTime() === new Date(startDate).getTime() &&
                 new Date(item.endDate).getTime() === new Date(endDate).getTime();
        }
        // If no dates provided, match any existing item for this product
        return true;
      }
      return false;
    });

    if (existingCartItem) {
      // Update quantity if product already in cart with same rental period
      existingCartItem.quantity = existingCartItem.quantity + Number(quantity);
      
      // Update dates if they were provided
      if (startDate) existingCartItem.startDate = new Date(startDate);
      if (endDate) existingCartItem.endDate = new Date(endDate);
    } else {
      // Add new item to cart
      const cartItem = {
        productId: productId,
        quantity: Number(quantity)
      };

      // Add rental dates if provided
      if (startDate) cartItem.startDate = new Date(startDate);
      if (endDate) cartItem.endDate = new Date(endDate);

      user.cart.push(cartItem);
    }

    await user.save();

    // Populate and return updated cart
    await user.populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'name price images description category stock rentDuration bookedDates'
    });

    // Filter out any null products and format cart items
    const validCartItems = user.cart.filter(item => item.productId !== null);
    
    const cartItems = validCartItems.map(item => {
      if (!item.productId) {
        console.warn("Cart item with null productId:", item);
        return null;
      }
      
      return {
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        images: item.productId.images,
        image: item.productId.images?.[0],
        description: item.productId.description,
        category: item.productId.category,
        qty: item.quantity,
        stock: item.productId.stock,
        rentDuration: item.productId.rentDuration,
        startDate: item.startDate,
        endDate: item.endDate
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0)
    });

  } catch (error) {
    console.error("=== ADD TO CART ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to add item to cart",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update cart item quantity and rental dates with enhanced validation
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, startDate, endDate } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid product ID and quantity are required" 
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Enhanced date validation with product availability check
    if (startDate && endDate) {
      const dateValidation = validateRentalDates(startDate, endDate, product);
      if (!dateValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: dateValidation.message 
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Find and update cart item
    const cartItem = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    cartItem.quantity = quantity;
    
    // Update rental dates if provided
    if (startDate) cartItem.startDate = new Date(startDate);
    if (endDate) cartItem.endDate = new Date(endDate);

    await user.save();

    // Populate and return updated cart
    await user.populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'name price images description category stock rentDuration bookedDates'
    });

    const cartItems = user.cart.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      images: item.productId.images,
      image: item.productId.images?.[0],
      description: item.productId.description,
      category: item.productId.category,
      qty: item.quantity,
      stock: item.productId.stock,
      rentDuration: item.productId.rentDuration,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0)
    });

  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update cart" 
    });
  }
};

// Update rental dates for a cart item with enhanced validation
export const updateRentalDates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, startDate, endDate } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Enhanced date validation with product availability check
    if (startDate && endDate) {
      const dateValidation = validateRentalDates(startDate, endDate, product);
      if (!dateValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: dateValidation.message 
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Find and update cart item
    const cartItem = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    // Update rental dates
    if (startDate) cartItem.startDate = new Date(startDate);
    if (endDate) cartItem.endDate = new Date(endDate);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Rental dates updated successfully"
    });

  } catch (error) {
    console.error("Update rental dates error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update rental dates" 
    });
  }
};

// Check availability for cart item dates
export const checkCartItemAvailability = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;
    
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID, start date, and end date are required" 
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    const dateValidation = validateRentalDates(startDate, endDate, product);
    
    res.status(200).json({
      success: true,
      available: dateValidation.valid,
      message: dateValidation.valid ? 
        "Product is available for the selected dates" : 
        dateValidation.message
    });

  } catch (error) {
    console.error("Check cart item availability error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check availability" 
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Remove item from cart
    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter(
      item => item.productId.toString() !== productId
    );

    if (user.cart.length === initialCartLength) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    await user.save();

    // Populate and return updated cart
    await user.populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'name price images description category stock rentDuration bookedDates'
    });

    const cartItems = user.cart.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      images: item.productId.images,
      image: item.productId.images?.[0],
      description: item.productId.description,
      category: item.productId.category,
      qty: item.quantity,
      stock: item.productId.stock,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0)
    });

  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove item from cart" 
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
      totalItems: 0
    });

  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to clear cart" 
    });
  }
};

// Sync cart with localStorage (for guest users who login)
export const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart items must be an array" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Validate and add items to cart
    for (const item of cartItems) {
      if (!item.productId || !item.quantity) continue;

      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Validate dates if provided
      if (item.startDate && item.endDate) {
        const dateValidation = validateRentalDates(item.startDate, item.endDate, product);
        if (!dateValidation.valid) {
          console.warn(`Skipping cart item ${item.productId} due to invalid dates: ${dateValidation.message}`);
          continue;
        }
      }

      const existingCartItem = user.cart.find(
        cartItem => cartItem.productId.toString() === item.productId
      );

      if (existingCartItem) {
        existingCartItem.quantity = Math.max(existingCartItem.quantity, item.quantity);
        if (item.startDate) existingCartItem.startDate = new Date(item.startDate);
        if (item.endDate) existingCartItem.endDate = new Date(item.endDate);
      } else {
        const cartItem = {
          productId: item.productId,
          quantity: item.quantity
        };
        
        if (item.startDate) cartItem.startDate = new Date(item.startDate);
        if (item.endDate) cartItem.endDate = new Date(item.endDate);
        
        user.cart.push(cartItem);
      }
    }

    await user.save();

    // Return updated cart
    await user.populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'name price images description category stock rentDuration bookedDates'
    });

    const cartData = user.cart.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      images: item.productId.images,
      image: item.productId.images?.[0],
      description: item.productId.description,
      category: item.productId.category,
      qty: item.quantity,
      stock: item.productId.stock,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    res.status(200).json({
      success: true,
      message: "Cart synced successfully",
      cart: cartData,
      totalItems: cartData.reduce((sum, item) => sum + item.qty, 0)
    });

  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to sync cart" 
    });
  }
};