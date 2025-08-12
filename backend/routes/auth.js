import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("storeName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Store name must be between 2 and 100 characters"),
  body("contactNumber")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please enter a valid contact number"),
  body("businessAddress")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Business address must be between 10 and 500 characters"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Helper function to generate response with token
const generateTokenResponse = (seller) => {
  const token = seller.generateAuthToken();

  return {
    success: true,
    token,
    seller: {
      id: seller.id,
      email: seller.email,
      storeName: seller.storeName,
      contactNumber: seller.contactNumber,
      businessAddress: seller.businessAddress,
      gstNumber: seller.gstNumber,
      isVerified: seller.isVerified,
      status: seller.status,
      totalProducts: seller.totalProducts,
      totalOrders: seller.totalOrders,
      totalRevenue: seller.totalRevenue,
    },
  };
};

// @desc    Register new seller
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  validateRegistration,
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      email,
      password,
      storeName,
      contactNumber,
      businessAddress,
      gstNumber,
      bankDetails,
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller already exists with this email",
      });
    }

    // Check if store name is taken
    const existingStore = await Seller.findOne({
      storeName: { $regex: new RegExp("^" + storeName + "$", "i") },
    });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "Store name is already taken",
      });
    }

    try {
      // Create new seller
      const seller = await Seller.create({
        email,
        password,
        storeName,
        contactNumber,
        businessAddress,
        gstNumber,
        bankDetails,
        status: process.env.NODE_ENV === "development" ? "active" : "pending", // Auto-activate in development
        isVerified: process.env.NODE_ENV === "development" ? true : false, // Auto-verify in development
      });

      // Update last login
      seller.lastLogin = new Date();
      await seller.save();

      res.status(201).json({
        success: true,
        message: "Seller registered successfully. Account is pending approval.",
        ...generateTokenResponse(seller),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating seller account",
      });
    }
  }),
);

// @desc    Login seller
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  validateLogin,
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // Find seller and include password for comparison
      const seller = await Seller.findOne({ email }).select("+password");

      if (!seller) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check password
      const isPasswordValid = await seller.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if account is active
      if (seller.status === "suspended") {
        return res.status(403).json({
          success: false,
          message: "Account is suspended. Please contact support.",
        });
      }

      // Update last login
      seller.lastLogin = new Date();
      await seller.save();

      res.json({
        success: true,
        message: "Login successful",
        ...generateTokenResponse(seller),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error during login",
      });
    }
  }),
);

// @desc    Get current seller profile
// @route   GET /api/auth/me
// @access  Private
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      seller: {
        id: req.seller._id,
        email: req.seller.email,
        storeName: req.seller.storeName,
        contactNumber: req.seller.contactNumber,
        businessAddress: req.seller.businessAddress,
        gstNumber: req.seller.gstNumber,
        bankDetails: req.seller.bankDetails,
        isVerified: req.seller.isVerified,
        status: req.seller.status,
        totalProducts: req.seller.totalProducts,
        totalOrders: req.seller.totalOrders,
        totalRevenue: req.seller.totalRevenue,
        rating: req.seller.rating,
        reviewCount: req.seller.reviewCount,
        createdAt: req.seller.createdAt,
      },
    });
  }),
);

// @desc    Update seller profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    body("storeName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Store name must be between 2 and 100 characters"),
    body("contactNumber")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Please enter a valid contact number"),
    body("businessAddress")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Business address must be between 10 and 500 characters"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const allowedUpdates = [
      "storeName",
      "contactNumber",
      "businessAddress",
      "gstNumber",
      "bankDetails",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    try {
      const seller = await Seller.findByIdAndUpdate(req.seller._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        seller: {
          id: seller.id,
          email: seller.email,
          storeName: seller.storeName,
          contactNumber: seller.contactNumber,
          businessAddress: seller.businessAddress,
          gstNumber: seller.gstNumber,
          bankDetails: seller.bankDetails,
          isVerified: seller.isVerified,
          status: seller.status,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      });
    }
  }),
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Get seller with password
      const seller = await Seller.findById(req.seller._id).select("+password");

      // Check current password
      const isCurrentPasswordValid =
        await seller.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      seller.password = newPassword;
      await seller.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Error changing password",
      });
    }
  }),
);

// @desc    Logout seller (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }),
);

export default router;
