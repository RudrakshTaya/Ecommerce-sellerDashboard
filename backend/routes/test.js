import express from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// @desc    Test protected route
// @route   GET /api/test/protected
// @access  Private
router.get(
  "/protected",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Protected route accessed successfully",
      seller: {
        id: req.seller._id,
        email: req.seller.email,
        storeName: req.seller.storeName,
      },
      timestamp: new Date().toISOString(),
    });
  }),
);

// @desc    Test unprotected route
// @route   GET /api/test/public
// @access  Public
router.get(
  "/public",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Public route accessed successfully",
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
