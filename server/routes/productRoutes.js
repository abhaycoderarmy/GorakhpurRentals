import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkAvailability,
  addRating,
  getProductStats,
  getProductBookedDates
} from "../controllers/productController.js";
import upload from "../middleware/upload.middleware.js";
import { protect, adminOnly as verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllProducts);
router.get("/stats", getProductStats); // Public stats endpoint
router.get("/:id", getProductById);
router.post("/:id/check-availability", checkAvailability);

// Protected routes (authentication required)
router.post("/:id/rating", addRating);

// Admin only routes
router.post("/create",protect, verifyAdmin, upload.array("images", 10), createProduct); // max 10 images
router.put("/:id", protect, verifyAdmin, upload.array("images", 10), updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
router.get('/:id/booked-dates', getProductBookedDates);

// Admin stats endpoint (if you want separate admin stats)
router.get("/admin/stats", verifyAdmin, getProductStats);

export default router;
