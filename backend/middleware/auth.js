import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import { asyncHandler } from "./errorHandler.js";

// Protect routes - check if user is authenticated
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please login.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get seller from token
    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "No seller found with this token",
      });
    }

    // Check if seller is active
    if (seller.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    // Add seller to request
    req.seller = seller;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
});

// Check if seller is verified
export const requireVerified = asyncHandler(async (req, res, next) => {
  if (!req.seller.isVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Account not verified. Please verify your account to access this feature.",
    });
  }
  next();
});

// Admin only middleware (for future admin features)
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.seller.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
});

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const seller = await Seller.findById(decoded.id).select("-password");

      if (seller && seller.status === "active") {
        req.seller = seller;
      }
    } catch (error) {
      // Token invalid, but continue without auth
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
});

// Rate limiting for sensitive routes
export const sensitiveRouteLimit = asyncHandler(async (req, res, next) => {
  // This could be enhanced to use Redis for distributed rate limiting
  // For now, we'll rely on express-rate-limit middleware
  next();
});
