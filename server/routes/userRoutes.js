import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin only
router.get('/', protect, adminOnly, getAllUsers);

export default router;
