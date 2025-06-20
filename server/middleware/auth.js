import jwt from "jsonwebtoken";
import User from '../models/user.model.js'; 

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admins only" });
  next();
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid. User not found."
      });
    }

    // Check if user account is verified (if email verification is required)
    if (!user.isVerified && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address to continue."
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token is not valid."
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again."
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication."
    });
  }
};
