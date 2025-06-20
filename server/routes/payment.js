import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { createOrder } from "../controllers/orderController.js";

dotenv.config();

const router = express.Router();

// Debug: Check if environment variables are loaded
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Loaded' : 'Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : 'Missing');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Missing Razorpay credentials in environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, items, customerDetails, email, discount } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ 
        error: "Amount is required" 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        email: email || '',
        customerName: customerDetails?.name || '',
        phone: customerDetails?.phone || '',
        discount: discount || 0,
      },
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ 
      order,
      key_id: process.env.RAZORPAY_KEY_ID 
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Verify payment and create order
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      customerDetails,
      email,
      discount
    } = req.body;

    console.log('=== PAYMENT VERIFICATION DEBUG ===');
    console.log('Items received for verification:', JSON.stringify(items, null, 2));

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature"
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        error: "Payment not captured"
      });
    }

    // Validate items and rental dates before creating order
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No items provided"
      });
    }

    // Check that all items have rental dates
    const itemsWithoutDates = items.filter(item => !item.startDate || !item.endDate);
    if (itemsWithoutDates.length > 0) {
      console.error('Items missing rental dates:', itemsWithoutDates);
      return res.status(400).json({
        success: false,
        error: "All items must have rental dates (startDate and endDate)"
      });
    }

    // Create order data with proper structure
    const orderData = {
      items: items.map(item => ({
        ProductId: item.ProductId || item._id || item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || item.quantity || 1,
        startDate: item.startDate,
        endDate: item.endDate
      })),
      total,
      userId: userId,
      email,
      customerDetails,
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_method: payment.method,
        payment_status: payment.status,
        amount_paid: payment.amount / 100, // Convert back to rupees
      },
      discount: discount || 0
    };

    console.log('Order data being sent to createOrder:', JSON.stringify(orderData, null, 2));

    // Create a mock request and response to pass to createOrder
    const mockReq = { body: orderData };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 201 && data.success) {
            // Success case
            res.json({
              success: true,
              message: "Payment verified and order created successfully",
              orderId: data.order._id,
              order: data.order,
              productUpdateResults: data.productUpdateResults
            });
          } else {
            // Error case
            res.status(code).json(data);
          }
        }
      }),
      json: (data) => {
        // Handle direct json calls
        res.json(data);
      }
    };

    // Call the createOrder function with mock req/res
    await createOrder(mockReq, mockRes);

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
      details: error.message
    });
  }
});

// Get payment status
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        method: payment.method,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment status"
    });
  }
});

export default router;