import express from "express";
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  syncCart,
  updateRentalDates
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// GET /api/cart - Get user's cart
router.get("/", getCart);

router.put('/update-dates', updateRentalDates);

// POST /api/cart/add - Add item to cart
router.post("/add", addToCart);

// PUT /api/cart/update - Update cart item quantity
router.put("/update", updateCartQuantity);

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete("/remove/:productId", removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", clearCart);

// POST /api/cart/sync - Sync cart with localStorage (for guest users who login)
router.post("/sync", syncCart);

export default router;