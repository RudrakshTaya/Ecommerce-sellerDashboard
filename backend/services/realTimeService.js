import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";

class RealTimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Store user connections
    this.orderRooms = new Map(); // Store order-specific rooms
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || "http://localhost:8080",
          process.env.MARKETPLACE_URL || "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log("🔴 Real-time service initialized with Socket.IO");
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user data based on user type
        let user;
        if (decoded.userType === "seller") {
          user = await Seller.findById(decoded.id);
        } else if (decoded.userType === "customer") {
          user = await Customer.findById(decoded.id);
        }

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = decoded.id;
        socket.userType = decoded.userType;
        socket.userData = user;

        next();
      } catch (error) {
        next(new Error("Invalid authentication token"));
      }
    });
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userType})`);

      // Store connection
      this.connectedUsers.set(socket.userId, {
        socket,
        userType: socket.userType,
        userData: socket.userData,
        connectedAt: new Date(),
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle joining order tracking rooms
      socket.on("join_order_tracking", async (orderId) => {
        try {
          const order = await Order.findById(orderId);

          if (!order) {
            socket.emit("error", { message: "Order not found" });
            return;
          }

          // Check if user has permission to track this order
          const hasPermission =
            (socket.userType === "customer" &&
              order.customerId.toString() === socket.userId) ||
            (socket.userType === "seller" &&
              order.sellerId.toString() === socket.userId);

          if (!hasPermission) {
            socket.emit("error", {
              message: "Not authorized to track this order",
            });
            return;
          }

          // Join order room
          socket.join(`order_${orderId}`);

          // Store order room mapping
          if (!this.orderRooms.has(orderId)) {
            this.orderRooms.set(orderId, new Set());
          }
          this.orderRooms.get(orderId).add(socket.userId);

          // Send current order status
          socket.emit("order_status_update", {
            orderId: order._id,
            status: order.status,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            lastUpdated: order.updatedAt,
          });

          console.log(
            `User ${socket.userId} joined order tracking for ${orderId}`,
          );
        } catch (error) {
          socket.emit("error", {
            message: "Failed to join order tracking",
            error: error.message,
          });
        }
      });

      // Handle leaving order tracking
      socket.on("leave_order_tracking", (orderId) => {
        socket.leave(`order_${orderId}`);

        if (this.orderRooms.has(orderId)) {
          this.orderRooms.get(orderId).delete(socket.userId);
          if (this.orderRooms.get(orderId).size === 0) {
            this.orderRooms.delete(orderId);
          }
        }

        console.log(`User ${socket.userId} left order tracking for ${orderId}`);
      });

      // Handle inventory alerts for sellers
      socket.on("subscribe_inventory_alerts", () => {
        if (socket.userType === "seller") {
          socket.join(`seller_inventory_${socket.userId}`);
          console.log(`Seller ${socket.userId} subscribed to inventory alerts`);
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);

        // Clean up order rooms
        for (const [orderId, userSet] of this.orderRooms.entries()) {
          userSet.delete(socket.userId);
          if (userSet.size === 0) {
            this.orderRooms.delete(orderId);
          }
        }
      });
    });
  }

  // Broadcast order status update
  broadcastOrderStatusUpdate(orderId, orderData) {
    if (!this.io) return;

    const updateData = {
      orderId: orderData._id,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      estimatedDelivery: orderData.estimatedDelivery,
      lastUpdated: orderData.updatedAt,
      message: this.getStatusMessage(orderData.status),
    };

    // Broadcast to all users tracking this order
    this.io.to(`order_${orderId}`).emit("order_status_update", updateData);

    console.log(
      `Order status update broadcasted for order ${orderId}: ${orderData.status}`,
    );
  }

  // Send notification to specific user
  sendUserNotification(userId, notification) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit("notification", {
      id: Date.now(),
      type: notification.type || "info",
      title: notification.title,
      message: notification.message,
      timestamp: new Date(),
      data: notification.data || {},
    });

    console.log(`Notification sent to user ${userId}: ${notification.title}`);
  }

  // Send low stock alert to seller
  sendLowStockAlert(sellerId, products) {
    if (!this.io) return;

    this.io.to(`seller_inventory_${sellerId}`).emit("low_stock_alert", {
      type: "low_stock",
      title: "Low Stock Alert",
      message: `${products.length} products are running low on stock`,
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        sku: p.sku,
      })),
      timestamp: new Date(),
    });

    console.log(
      `Low stock alert sent to seller ${sellerId} for ${products.length} products`,
    );
  }

  // Send payment confirmation
  sendPaymentConfirmation(customerId, paymentData) {
    if (!this.io) return;

    this.sendUserNotification(customerId, {
      type: "payment_success",
      title: "Payment Confirmed",
      message: `Your payment of ₹${paymentData.amount} has been processed successfully`,
      data: {
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        orderId: paymentData.orderId,
      },
    });
  }

  // Send new order notification to seller
  sendNewOrderNotification(sellerId, orderData) {
    if (!this.io) return;

    this.sendUserNotification(sellerId, {
      type: "new_order",
      title: "New Order Received",
      message: `New order #${orderData.orderNumber} for ₹${orderData.totalAmount}`,
      data: {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber,
        amount: orderData.totalAmount,
        itemCount: orderData.items.length,
      },
    });
  }

  // Broadcast system announcement
  broadcastAnnouncement(announcement) {
    if (!this.io) return;

    this.io.emit("system_announcement", {
      id: Date.now(),
      type: "announcement",
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority || "normal",
      timestamp: new Date(),
    });

    console.log(`System announcement broadcasted: ${announcement.title}`);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users tracking specific order
  getUsersTrackingOrder(orderId) {
    return this.orderRooms.get(orderId) || new Set();
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get status message for order status
  getStatusMessage(status) {
    const statusMessages = {
      pending: "Order is being processed",
      confirmed: "Order confirmed and being prepared",
      processing: "Order is being prepared",
      shipped: "Order has been shipped",
      out_for_delivery: "Order is out for delivery",
      delivered: "Order has been delivered",
      cancelled: "Order has been cancelled",
      refunded: "Order has been refunded",
    };

    return statusMessages[status] || "Order status updated";
  }

  // Send bulk notifications
  sendBulkNotifications(userIds, notification) {
    if (!this.io) return;

    userIds.forEach((userId) => {
      this.sendUserNotification(userId, notification);
    });

    console.log(
      `Bulk notification sent to ${userIds.length} users: ${notification.title}`,
    );
  }

  // Emergency broadcast (for urgent system issues)
  emergencyBroadcast(message) {
    if (!this.io) return;

    this.io.emit("emergency_broadcast", {
      type: "emergency",
      title: "Important Notice",
      message: message,
      timestamp: new Date(),
      priority: "urgent",
    });

    console.log(`Emergency broadcast sent: ${message}`);
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService;
