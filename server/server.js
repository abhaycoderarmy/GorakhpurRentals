import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleUploadError } from './middleware/upload.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from "./routes/order.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import adminRoutes from './routes/admin.route.js';
import giftCardRoutes from "./routes/giftcard.route.js";
import razorpayRoutes from "./routes/razorpay.route.js";
import authRoutes from './routes/authRoutes.js';
import newsletterRoutes from './routes/newsletter.route.js';
import cartRoutes from './routes/cart.route.js';
import paymentRouter from './routes/payment.js'


// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/newsletter', newsletterRoutes);

// Handle multer upload errors
app.use(handleUploadError);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/giftcards", giftCardRoutes);
app.use("/api/v1/razorpay", razorpayRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use('/api/v1/payment', paymentRouter);
app.use("/api/v1/cart", cartRoutes); 
app.get('/', (req, res) => {
  res.send('API Running...');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));