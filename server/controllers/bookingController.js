import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

// @desc Create a new booking
export const createBooking = async (req, res) => {
  const { productId, bookedDate } = req.body;
  const userId = req.user._id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.availableDates.includes(bookedDate)) {
      return res.status(400).json({ message: "Product not available on this date" });
    }

    // Remove the date from availability
    product.availableDates = product.availableDates.filter(date => date !== bookedDate);
    await product.save();

    const booking = await Booking.create({ userId, productId, bookedDate });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// @desc Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('productId', 'name image');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to get bookings", error: err.message });
  }
};

// @desc Get my bookings (logged-in user)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('productId', 'name image');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user bookings", error: err.message });
  }
};
