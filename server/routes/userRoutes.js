import express from 'express';
import {
  sendOtpToEmail,
  verifyOtpAndRegister,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  resetPassword,
} from "../controllers/userController.js";
import { authenticate } from '../middleware/auth.middleware.js';
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post('/send-otp', sendOtpToEmail);
router.post('/verify-otp', verifyOtpAndRegister);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);


// Profile
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, upload.single("profilePhoto"), updateUserProfile);
router.put("/reset-password", authenticate, resetPassword);

export default router;
