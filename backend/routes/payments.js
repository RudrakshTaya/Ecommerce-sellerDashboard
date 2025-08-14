import express from "express";
import { body, validationResult } from "express-validator";
import { verifyAuth } from "../middleware/auth.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchPaymentDetails,
  refundPayment,
} from "../config/razorpay.js";

const router = express.Router();

// Create payment order
router.post(
  "/create-order",
  verifyAuth,
  [
    body("orderId").isMongoId().withMessage("Valid order ID is required"),
    body("amount").isNumeric().withMessage("Valid amount is required"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Invalid currency"),
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

      const { orderId, amount, currency = "INR" } = req.body;
      const customerId = req.user.id;

      // Verify order exists and belongs to customer
      const order = await Order.findOne({
        _id: orderId,
        customerId: customerId,
        status: "pending",
      }).populate("items.productId");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not eligible for payment",
        });
      }

      // Verify amount matches order total
      if (Math.abs(order.totalAmount - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Amount mismatch with order total",
        });
      }

      // Create Razorpay order
      const razorpayResult = await createRazorpayOrder(
        amount,
        currency,
        `order_${orderId}_${Date.now()}`,
      );

      if (!razorpayResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to create payment order",
          error: razorpayResult.error,
        });
      }

      // Create payment record
      const payment = new Payment({
        orderId: order._id,
        customerId: customerId,
        sellerId: order.sellerId,
        amount: amount,
        currency: currency,
        paymentMethod: "online", // Will be updated after payment
        razorpayOrderId: razorpayResult.order.id,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });

      await payment.save();

      res.status(200).json({
        success: true,
        message: "Payment order created successfully",
        data: {
          orderId: razorpayResult.order.id,
          amount: razorpayResult.order.amount,
          currency: razorpayResult.order.currency,
          paymentId: payment._id,
          orderDetails: {
            id: order._id,
            items: order.items.length,
            totalAmount: order.totalAmount,
          },
        },
      });
    } catch (error) {
      console.error("Create payment order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Verify payment
router.post(
  "/verify-payment",
  verifyAuth,
  [
    body("razorpay_order_id")
      .notEmpty()
      .withMessage("Razorpay order ID is required"),
    body("razorpay_payment_id")
      .notEmpty()
      .withMessage("Razorpay payment ID is required"),
    body("razorpay_signature")
      .notEmpty()
      .withMessage("Razorpay signature is required"),
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

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
      const customerId = req.user.id;

      // Find payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        customerId: customerId,
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      // Verify signature
      const isValidSignature = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );

      if (!isValidSignature) {
        payment.status = "failed";
        payment.failureReason = "Invalid signature";
        await payment.save();

        return res.status(400).json({
          success: false,
          message: "Payment verification failed - invalid signature",
        });
      }

      // Fetch payment details from Razorpay
      const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

      if (!paymentDetails.success) {
        payment.status = "failed";
        payment.failureReason = "Failed to fetch payment details";
        await payment.save();

        return res.status(500).json({
          success: false,
          message: "Failed to verify payment with gateway",
        });
      }

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "completed";
      payment.paymentMethod = paymentDetails.payment.method || "online";
      payment.gatewayResponse = paymentDetails.payment;

      await payment.save();

      // Update order status
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.status = "confirmed";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        await order.save();

        // Update product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity, soldCount: item.quantity },
          });
        }
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and order confirmed",
        data: {
          paymentId: payment._id,
          orderId: order._id,
          status: payment.status,
          amount: payment.amount,
        },
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get payment history
router.get("/history", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ customerId })
      .populate({
        path: "orderId",
        select: "orderNumber items totalAmount",
        populate: {
          path: "items.productId",
          select: "name image",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ customerId });

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Initiate refund (Admin/Seller only)
router.post(
  "/refund",
  verifyAuth,
  [
    body("paymentId").isMongoId().withMessage("Valid payment ID is required"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Valid refund amount required"),
    body("reason").notEmpty().withMessage("Refund reason is required"),
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

      const { paymentId, amount, reason } = req.body;

      // Find payment
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Check if payment is eligible for refund
      if (payment.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Payment is not eligible for refund",
        });
      }

      // Calculate refund amount
      const refundAmount = amount || payment.amount - payment.refundAmount;

      if (
        refundAmount <= 0 ||
        refundAmount > payment.amount - payment.refundAmount
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid refund amount",
        });
      }

      // Process refund with Razorpay
      const refundResult = await refundPayment(
        payment.razorpayPaymentId,
        refundAmount,
        { reason },
      );

      if (!refundResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to process refund",
          error: refundResult.error,
        });
      }

      // Update payment record
      payment.refundAmount += refundAmount;
      payment.refundReason = reason;
      if (payment.refundAmount >= payment.amount) {
        payment.status = "refunded";
      }

      await payment.save();

      // Update order status if fully refunded
      if (payment.refundAmount >= payment.amount) {
        await Order.findByIdAndUpdate(payment.orderId, {
          status: "refunded",
          paymentStatus: "refunded",
        });
      }

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        data: {
          refundId: refundResult.refund.id,
          amount: refundAmount,
          status: refundResult.refund.status,
        },
      });
    } catch (error) {
      console.error("Refund processing error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get payment by ID
router.get("/:id", verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const payment = await Payment.findOne({
      _id: id,
      customerId: customerId,
    }).populate({
      path: "orderId",
      select: "orderNumber items totalAmount shippingAddress",
      populate: {
        path: "items.productId",
        select: "name image price",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
