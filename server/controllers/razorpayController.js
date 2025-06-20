import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import GiftCard from "../models/giftcard.model.js";

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, items, customerDetails, email, discount } = req.body;

    // Validate required fields
    if (!amount || !items || !customerDetails || !email) {
      return res.status(400).json({ 
        error: "Missing required fields: amount, items, customerDetails, or email" 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        email: email,
        customerName: customerDetails.name,
        phone: customerDetails.phone,
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
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      customerDetails,
      email,
      discount
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified, create order in database
      const order = new Order({
        items: items.map(item => ({
          ProductId: item.ProductId || null,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        total: total,
        email: email,
        customerDetails: {
          name: customerDetails.name,
          phone: customerDetails.phone,
          address: customerDetails.address,
        },
        paymentStatus: "paid",
        paymentDetails: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        discount: discount || 0,
        orderDate: new Date(),
      });

      const savedOrder = await order.save();

      // If gift code was used, mark it as used or decrease usage count
      // You might want to implement usage tracking here
      
      res.json({
        success: true,
        message: "Payment verified and order created successfully",
        orderId: savedOrder._id,
        order: savedOrder,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during payment verification",
    });
  }
});

// Get payment details
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Webhook to handle payment status updates (optional)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature === expectedSignature) {
      const event = JSON.parse(body);
      
      // Handle different payment events
      switch (event.event) {
        case "payment.captured":
          // Payment was successful
          console.log("Payment captured:", event.payload.payment.entity);
          break;
        case "payment.failed":
          // Payment failed
          console.log("Payment failed:", event.payload.payment.entity);
          break;
        default:
          console.log("Unhandled event:", event.event);
      }

      res.status(200).json({ status: "ok" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Refund payment (admin only)
router.post("/refund", async (req, res) => {
  try {
    const { payment_id, amount, reason } = req.body;
    
    const refund = await razorpay.payments.refund(payment_id, {
      amount: amount * 100, // Convert to paise
      notes: {
        reason: reason || "Refund requested by admin",
      },
    });

    // Update order status in database
    await Order.findOneAndUpdate(
      { "paymentDetails.razorpay_payment_id": payment_id },
      { 
        paymentStatus: "refunded",
        refundDetails: {
          refund_id: refund.id,
          refund_amount: amount,
          refund_date: new Date(),
          reason: reason,
        }
      }
    );

    res.json({
      success: true,
      refund: refund,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Refund processing failed" });
  }
});

export default router;