import express from 'express';
import multer from 'multer';
import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Public Route - Get all products
router.get("/", getAllProducts);

// ✅ Public Route - Get product by ID
router.get("/:id", getProductById);

// ✅ Admin Routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
