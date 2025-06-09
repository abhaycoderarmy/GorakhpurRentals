import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";
import { createProduct } from "../controllers/productController.js";

const router = express.Router();

router.use(authenticateToken, authorizeAdmin);

// Route to create product with image upload
router.post("/products", upload.single("image"), createProduct);

export default router;
