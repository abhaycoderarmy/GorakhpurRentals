import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOTP } from "../config/nodemailer.js";

export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );
    await sendOTP(email, otp);
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtpAndRegister = async (req, res) => {
  const { email, name, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.name = name;
    user.password = await bcrypt.hash(password, 10);
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "Account verified & registered" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not verified" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

export const googleLogin = async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, googleId, isVerified: true });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch {
    res.status(500).json({ message: "Google login failed" });
  }
};
// Fix getUserProfile to always return JSON
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user); // Consistent JSON response
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Fix updateUserProfile for better error handling
import cloudinary from "../config/cloudinary.js";

export const updateUserProfile = async (req, res) => {
  try {
    const { name, address, contactNumber, pincode } = req.body;
    let profilePhotoUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "gorakhpur_rentals/profiles",
      });
      profilePhotoUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        address,
        contactNumber,
        pincode,
        ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
      },
      { new: true, runValidators: true }
    ).select("-password -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Fix resetPassword with better validation
export const resetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};