import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/Product.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
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
          as: "product",
        },
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
};