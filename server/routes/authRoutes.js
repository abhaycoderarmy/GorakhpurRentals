import express from "express";
import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

// Basic email/password auth
router.post("/signup", signup);
router.post("/login", login);

// OTP routes
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// // For a different OTP flow
// router.post("/send-otp", sendOtpToEmail);
// router.post("/verify-register", verifyOtpAndRegister);

// Google login
router.post("/google-login", googleLogin);



export default router;