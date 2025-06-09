import express from 'express';
import {
  createBooking,
  getAllBookings,
  getUserBookings
} from '../controllers/bookingController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User bookings
router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);

// Admin view
router.get('/', protect, adminOnly, getAllBookings);

export default router;
