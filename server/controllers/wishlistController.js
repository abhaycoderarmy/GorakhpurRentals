import User from "../models/user.model.js";
import Product from "../models/Product.js";

export const addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyWishlist = async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist);
};