import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  bookedDate: { type: String, required: true }, // e.g., '2025-06-10'
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
