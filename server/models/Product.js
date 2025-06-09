import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  pricePerDay: { type: Number, required: true },
  category: String,
  image: String,
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
