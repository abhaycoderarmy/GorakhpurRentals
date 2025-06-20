// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

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

// export const adminOnly = (req, res, next) => {
//   if (!req.user?.isAdmin) return res.status(403).json({ message: "Admins only" });
//   next();
// };
export const adminOnly = (req, res, next) => {
  // First check if user is authenticated
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Then check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};