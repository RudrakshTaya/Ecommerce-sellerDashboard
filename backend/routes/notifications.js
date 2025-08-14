import express from "express";
import { body, validationResult } from "express-validator";
import { protect as verifyAuth } from "../middleware/auth.js";
import { notificationService } from "../services/notificationService.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

// Send test notification (for testing purposes)
router.post(
  "/test",
  verifyAuth,
  [
    body("type")
      .isIn(["email", "sms", "both"])
      .withMessage("Invalid notification type"),
    body("recipient").notEmpty().withMessage("Recipient is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { type, recipient } = req.body;
      const testData = {
        name: "Test User",
        email: type === "email" || type === "both" ? recipient : null,
        phone: type === "sms" || type === "both" ? recipient : null,
      };

      const result =
        await notificationService.sendWelcomeNotifications(testData);

      res.status(200).json({
        success: true,
        message: "Test notification sent",
        data: result,
      });
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send test notification",
        error: error.message,
      });
    }
  },
);

// Send promotional notification to customers
router.post(
  "/promotional",
  verifyAuth,
  [
    body("offer").notEmpty().withMessage("Offer description is required"),
    body("targetAudience")
      .isIn(["all", "active", "inactive"])
      .withMessage("Invalid target audience"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { offer, targetAudience } = req.body;

      // Build customer query based on target audience
      let customerQuery = { smsConsent: true };

      if (targetAudience === "active") {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        customerQuery.lastActive = { $gte: thirtyDaysAgo };
      } else if (targetAudience === "inactive") {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        customerQuery.lastActive = { $lt: thirtyDaysAgo };
      }

      const customers = await Customer.find(customerQuery).select(
        "name email phone smsConsent",
      );

      const result = await notificationService.sendBulkNotifications(
        customers,
        "promotional",
        offer,
      );

      res.status(200).json({
        success: true,
        message: `Promotional notification sent to ${result.processed} customers`,
        data: result,
      });
    } catch (error) {
      console.error("Promotional notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send promotional notifications",
        error: error.message,
      });
    }
  },
);

// Send low stock alerts to seller
router.post("/low-stock-alert", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get seller information
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Get low stock products
    const lowStockProducts = await Product.find({
      sellerId,
      stock: { $lte: 10, $gt: 0 },
      status: "active",
    }).select("name stock");

    if (lowStockProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No low stock products found",
        data: { alertsSent: 0 },
      });
    }

    const result = await notificationService.sendLowStockAlert(
      seller,
      lowStockProducts,
    );

    res.status(200).json({
      success: true,
      message: "Low stock alert sent successfully",
      data: {
        alertsSent: lowStockProducts.length,
        result,
      },
    });
  } catch (error) {
    console.error("Low stock alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send low stock alert",
      error: error.message,
    });
  }
});

// Trigger order notifications manually (for testing)
router.post(
  "/order-notification",
  verifyAuth,
  [
    body("orderId").isMongoId().withMessage("Valid order ID is required"),
    body("type")
      .isIn(["confirmation", "status_update"])
      .withMessage("Invalid notification type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { orderId, type } = req.body;

      // Get order and customer information
      const order = await Order.findById(orderId).populate("customerId");
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const customer = order.customerId;
      let result;

      if (type === "confirmation") {
        result = await notificationService.sendOrderConfirmation(
          customer,
          order,
        );
      } else if (type === "status_update") {
        result = await notificationService.sendOrderStatusUpdate(
          customer,
          order,
        );
      }

      res.status(200).json({
        success: true,
        message: `Order ${type} notification sent successfully`,
        data: result,
      });
    } catch (error) {
      console.error("Order notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send order notification",
        error: error.message,
      });
    }
  },
);

// Send OTP for phone verification
router.post(
  "/send-otp",
  [body("phone").isMobilePhone().withMessage("Valid phone number is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { phone } = req.body;

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Store OTP in session/cache (in production, use Redis)
      // For now, we'll use a simple in-memory store
      global.otpStore = global.otpStore || {};
      global.otpStore[phone] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      const result = await notificationService.sendOTP(phone, otp);

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        data: {
          phone,
          expiresIn: 600, // 10 minutes in seconds
        },
      });
    } catch (error) {
      console.error("OTP sending error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      });
    }
  },
);

// Verify OTP
router.post(
  "/verify-otp",
  [
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { phone, otp } = req.body;

      // Check OTP from store
      const storedOTP = global.otpStore?.[phone];

      if (!storedOTP) {
        return res.status(400).json({
          success: false,
          message: "No OTP found for this phone number",
        });
      }

      if (Date.now() > storedOTP.expiresAt) {
        delete global.otpStore[phone];
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }

      if (storedOTP.otp.toString() !== otp.toString()) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // OTP verified successfully
      delete global.otpStore[phone];

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: {
          phone,
          verified: true,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
        error: error.message,
      });
    }
  },
);

// Get notification preferences for customer
router.get("/preferences", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await Customer.findById(customerId).select(
      "emailConsent smsConsent notificationPreferences",
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences retrieved successfully",
      data: {
        emailConsent: customer.emailConsent || true,
        smsConsent: customer.smsConsent || false,
        preferences: customer.notificationPreferences || {
          orderUpdates: true,
          promotions: false,
          lowStock: true,
          newsletters: false,
        },
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification preferences",
      error: error.message,
    });
  }
});

// Update notification preferences for customer
router.put(
  "/preferences",
  verifyAuth,
  [
    body("emailConsent")
      .optional()
      .isBoolean()
      .withMessage("Email consent must be boolean"),
    body("smsConsent")
      .optional()
      .isBoolean()
      .withMessage("SMS consent must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const customerId = req.user.id;
      const { emailConsent, smsConsent, preferences } = req.body;

      const updateData = {};
      if (emailConsent !== undefined) updateData.emailConsent = emailConsent;
      if (smsConsent !== undefined) updateData.smsConsent = smsConsent;
      if (preferences) updateData.notificationPreferences = preferences;

      const customer = await Customer.findByIdAndUpdate(
        customerId,
        { $set: updateData },
        { new: true },
      ).select("emailConsent smsConsent notificationPreferences");

      res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notification preferences",
        error: error.message,
      });
    }
  },
);

export default router;
