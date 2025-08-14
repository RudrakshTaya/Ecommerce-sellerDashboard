import express from "express";
import { body, validationResult } from "express-validator";
import { protect as verifyAuth } from "../middleware/auth.js";
import Order from "../models/Order.js";
import { realTimeService } from "../services/realTimeService.js";
import { notificationService } from "../services/notificationService.js";

const router = express.Router();

// Get order tracking information
router.get("/:orderId", verifyAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType || "customer";

    const order = await Order.findById(orderId)
      .populate("customerId", "name email phone")
      .populate("sellerId", "storeName email contactNumber")
      .populate("items.productId", "name image price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check permission
    const hasPermission =
      (userType === "customer" && order.customerId._id.toString() === userId) ||
      (userType === "seller" && order.sellerId._id.toString() === userId);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    // Generate tracking timeline
    const trackingTimeline = generateTrackingTimeline(order);

    res.status(200).json({
      success: true,
      message: "Order tracking information retrieved successfully",
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          shippingAddress: order.shippingAddress,
          items: order.items,
        },
        customer: order.customerId,
        seller: order.sellerId,
        timeline: trackingTimeline,
        realTimeEnabled: true,
      },
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update order status (Seller only)
router.patch(
  "/:orderId/status",
  verifyAuth,
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ])
      .withMessage("Invalid order status"),
    body("note").optional().isString().withMessage("Note must be a string"),
    body("trackingNumber")
      .optional()
      .isString()
      .withMessage("Tracking number must be a string"),
    body("estimatedDelivery")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
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

      const { orderId } = req.params;
      const { status, note, trackingNumber, estimatedDelivery } = req.body;
      const sellerId = req.user.id;

      const order = await Order.findOne({ _id: orderId, sellerId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not authorized",
        });
      }

      // Update order
      const previousStatus = order.status;
      order.status = status;

      if (note) {
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
          status,
          note,
          timestamp: new Date(),
          updatedBy: sellerId,
        });
      }

      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (estimatedDelivery)
        order.estimatedDelivery = new Date(estimatedDelivery);

      await order.save();

      // Populate customer data for notifications
      await order.populate("customerId", "name email phone");

      // Send real-time update
      realTimeService.broadcastOrderStatusUpdate(orderId, order);

      // Send notifications if status changed significantly
      if (shouldSendNotification(previousStatus, status)) {
        try {
          await notificationService.sendOrderStatusUpdate(
            order.customerId,
            order,
          );
        } catch (notificationError) {
          console.error("Notification sending failed:", notificationError);
          // Don't fail the request if notification fails
        }
      }

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: {
          orderId: order._id,
          previousStatus,
          newStatus: status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          updatedAt: order.updatedAt,
        },
      });
    } catch (error) {
      console.error("Order status update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Add tracking event (for detailed tracking)
router.post(
  "/:orderId/events",
  verifyAuth,
  [
    body("event").notEmpty().withMessage("Event description is required"),
    body("location")
      .optional()
      .isString()
      .withMessage("Location must be a string"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Invalid timestamp format"),
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

      const { orderId } = req.params;
      const { event, location, timestamp } = req.body;
      const sellerId = req.user.id;

      const order = await Order.findOne({ _id: orderId, sellerId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not authorized",
        });
      }

      // Add tracking event
      order.trackingEvents = order.trackingEvents || [];
      order.trackingEvents.push({
        event,
        location: location || "",
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        recordedBy: sellerId,
      });

      await order.save();

      // Send real-time update
      realTimeService.broadcastOrderStatusUpdate(orderId, order);

      res.status(200).json({
        success: true,
        message: "Tracking event added successfully",
        data: {
          orderId: order._id,
          event,
          location,
          timestamp:
            order.trackingEvents[order.trackingEvents.length - 1].timestamp,
        },
      });
    } catch (error) {
      console.error("Add tracking event error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get all orders with tracking info for customer
router.get("/customer/all", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { customerId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("sellerId", "storeName")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    // Add tracking status for each order
    const ordersWithTracking = orders.map((order) => ({
      ...order.toObject(),
      trackingInfo: {
        canTrack: !!order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        statusMessage: getStatusMessage(order.status),
        isDelivered: order.status === "delivered",
        canCancel: ["pending", "confirmed"].includes(order.status),
      },
    }));

    res.status(200).json({
      success: true,
      message: "Customer orders retrieved successfully",
      data: ordersWithTracking,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get delivery analytics for seller
router.get("/seller/delivery-analytics", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = "30d" } = req.query;

    const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
      },
    };

    // Delivery performance metrics
    const deliveryMetrics = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $cond: {
                if: { $in: ["$status", ["delivered", "shipped"]] },
                then: { $subtract: ["$updatedAt", "$createdAt"] },
                else: null,
              },
            },
          },
        },
      },
    ]);

    // On-time delivery rate
    const onTimeDeliveries = await Order.countDocuments({
      sellerId,
      status: "delivered",
      deliveredAt: { $lte: "$estimatedDelivery" },
      ...dateFilter,
    });

    const totalDeliveries = await Order.countDocuments({
      sellerId,
      status: "delivered",
      ...dateFilter,
    });

    const onTimeRate =
      totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    res.status(200).json({
      success: true,
      message: "Delivery analytics retrieved successfully",
      data: {
        period,
        metrics: deliveryMetrics,
        onTimeDeliveryRate: onTimeRate,
        totalDeliveries,
        onTimeDeliveries,
        summary: {
          avgProcessingTime:
            deliveryMetrics.reduce(
              (sum, m) => sum + (m.avgProcessingTime || 0),
              0,
            ) /
            deliveryMetrics.length /
            (1000 * 60 * 60 * 24), // Convert to days
          statusDistribution: deliveryMetrics.reduce((acc, m) => {
            acc[m._id] = m.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    console.error("Delivery analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Helper functions
function generateTrackingTimeline(order) {
  const timeline = [];

  // Add order placed event
  timeline.push({
    status: "placed",
    title: "Order Placed",
    description: "Your order has been placed successfully",
    timestamp: order.createdAt,
    completed: true,
  });

  // Add status history
  if (order.statusHistory && order.statusHistory.length > 0) {
    order.statusHistory.forEach((entry) => {
      timeline.push({
        status: entry.status,
        title: getStatusTitle(entry.status),
        description: entry.note || getStatusMessage(entry.status),
        timestamp: entry.timestamp,
        completed: true,
      });
    });
  } else {
    // Generate timeline based on current status
    const statusOrder = [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    statusOrder.forEach((status, index) => {
      timeline.push({
        status,
        title: getStatusTitle(status),
        description: getStatusMessage(status),
        timestamp: index <= currentStatusIndex ? order.updatedAt : null,
        completed: index <= currentStatusIndex,
        estimated: index === currentStatusIndex + 1,
      });
    });
  }

  // Add tracking events if available
  if (order.trackingEvents && order.trackingEvents.length > 0) {
    order.trackingEvents.forEach((event) => {
      timeline.push({
        status: "tracking_event",
        title: event.event,
        description: event.location ? `Location: ${event.location}` : "",
        timestamp: event.timestamp,
        completed: true,
        isTrackingEvent: true,
      });
    });
  }

  return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function getStatusTitle(status) {
  const titles = {
    pending: "Order Pending",
    confirmed: "Order Confirmed",
    processing: "Being Prepared",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return titles[status] || status;
}

function getStatusMessage(status) {
  const messages = {
    pending: "Your order is being processed",
    confirmed: "Your order has been confirmed",
    processing: "Your order is being prepared",
    shipped: "Your order has been shipped",
    out_for_delivery: "Your order is out for delivery",
    delivered: "Your order has been delivered",
    cancelled: "Your order has been cancelled",
    refunded: "Your order has been refunded",
  };
  return messages[status] || "Order status updated";
}

function shouldSendNotification(previousStatus, newStatus) {
  // Send notifications for significant status changes
  const notificationStatuses = [
    "confirmed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  return (
    notificationStatuses.includes(newStatus) && previousStatus !== newStatus
  );
}

export default router;
