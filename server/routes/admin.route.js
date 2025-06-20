import express from "express";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const mostPopular = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      mostPopularProduct: mostPopular[0]?.product?.name || "N/A",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/users", adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.patch("/users/:id/toggle",  adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true });
});
router.get("/products", adminOnly, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get("/orders", adminOnly, async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
});

export default router;
