import express from "express";
import {
  createGiftCard,
  getAllGiftCards,
  getGiftCard,
  updateGiftCard,
  deleteGiftCard,
  toggleGiftCardStatus,
  verifyGiftCard,
  applyGiftCard
} from "../controllers/giftCardController.js";

const router = express.Router();

// Admin routes (add authentication middleware as needed)
router.post("/", createGiftCard);                    // Create new gift card
router.get("/", getAllGiftCards);                    // Get all gift cards with pagination and filters
router.get("/:id", getGiftCard);                     // Get single gift card
router.put("/:id", updateGiftCard);                  // Update gift card
router.delete("/:id", deleteGiftCard);               // Delete gift card
router.patch("/:id/toggle", toggleGiftCardStatus);   // Toggle active status

// Public routes
router.post("/verify", verifyGiftCard);              // Verify gift card validity
router.post("/apply", applyGiftCard);                // Apply gift card to order

export default router;