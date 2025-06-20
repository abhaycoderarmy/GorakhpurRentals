import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protect as verifyToken, adminOnly as verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
// Admin routes
router.get("/", verifyAdmin, getAllOrders);
router.put("/:orderId/status", verifyAdmin, updateOrderStatus);

// Public routes (for guest checkout)
router.get("/:orderId", getOrderById); // Get single order by ID
router.get("/email/:email", getUserOrders); // Get orders by email for guest users

// Authenticated users
router.post("/", verifyToken, createOrder);
router.get("/user/:userId", verifyToken, getUserOrders);



export default router;