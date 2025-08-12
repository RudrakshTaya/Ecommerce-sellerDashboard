import express from "express";
import Seller from "../models/Seller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// @desc    Activate seller account (for testing/admin use)
// @route   PUT /api/admin/activate-seller/:sellerId
// @access  Public (should be admin-only in production)
router.put(
  "/activate-seller/:sellerId",
  asyncHandler(async (req, res) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.sellerId,
        {
          status: "active",
          isVerified: true, // Also set as verified for product creation
        },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      res.json({
        success: true,
        message: "Seller account activated successfully",
        seller: {
          id: seller.id,
          email: seller.email,
          storeName: seller.storeName,
          status: seller.status,
          isVerified: seller.isVerified,
        },
      });
    } catch (error) {
      console.error("Activate seller error:", error);
      res.status(500).json({
        success: false,
        message: "Error activating seller account",
      });
    }
  }),
);

// @desc    Get all sellers (for admin)
// @route   GET /api/admin/sellers
// @access  Public (should be admin-only in production)
router.get(
  "/sellers",
  asyncHandler(async (req, res) => {
    try {
      const sellers = await Seller.find({})
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: sellers,
        count: sellers.length,
      });
    } catch (error) {
      console.error("Get sellers error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching sellers",
      });
    }
  }),
);

export default router;
