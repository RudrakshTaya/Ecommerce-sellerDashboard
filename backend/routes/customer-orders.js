import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { protectCustomer } from "./customer-auth.js";

const router = express.Router();

// @desc    Create new order by customer
// @route   POST /api/customer-orders
// @access  Private (Customer)
router.post(
  "/",
  protectCustomer,
  [
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.productId")
      .isMongoId()
      .withMessage("Valid product ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("items.*.selectedColor").optional().trim(),
    body("items.*.selectedSize").optional().trim(),
    body("items.*.customization").optional(),
    body("shippingAddress.firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("shippingAddress.lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),
    body("shippingAddress.address")
      .trim()
      .notEmpty()
      .withMessage("Address is required"),
    body("shippingAddress.city")
      .trim()
      .notEmpty()
      .withMessage("City is required"),
    body("shippingAddress.state")
      .trim()
      .notEmpty()
      .withMessage("State is required"),
    body("shippingAddress.pincode")
      .matches(/^[0-9]{6}$/)
      .withMessage("Valid pincode is required"),
    body("shippingAddress.phone")
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Valid phone number is required"),
    body("paymentMethod")
      .isIn(["cod", "card", "upi", "netbanking", "wallet"])
      .withMessage("Invalid payment method"),
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

    const { items, shippingAddress, paymentMethod, notes } = req.body;

    try {
      // Get all product IDs and verify they exist
      const productIds = items.map((item) => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        status: "active",
        inStock: true,
      }).populate("sellerId", "storeName email contactNumber");

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more products not found or not available",
        });
      }

      // Group items by seller to create separate orders
      const ordersBySeller = {};

      for (const item of items) {
        const product = products.find(
          (p) => p._id.toString() === item.productId,
        );

        // Check stock availability
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          });
        }

        const sellerId = product.sellerId._id.toString();

        if (!ordersBySeller[sellerId]) {
          ordersBySeller[sellerId] = {
            sellerId: product.sellerId._id,
            sellerInfo: product.sellerId,
            items: [],
            subtotal: 0,
          };
        }

        const itemTotal = product.price * item.quantity;
        ordersBySeller[sellerId].subtotal += itemTotal;
        ordersBySeller[sellerId].items.push({
          product: product._id,
          sellerId: product.sellerId._id,
          productSnapshot: {
            name: product.name,
            price: product.price,
            image: product.image,
            sku: product.sku,
            category: product.category,
          },
          quantity: item.quantity,
          price: product.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          customization: item.customization,
          deliveryDays: product.deliveryDays,
        });
      }

      const createdOrders = [];

      // Create separate orders for each seller
      for (const [sellerId, orderData] of Object.entries(ordersBySeller)) {
        // Calculate shipping (simplified - can be made more complex)
        const shipping = orderData.subtotal > 999 ? 0 : 99;
        const tax = Math.round(orderData.subtotal * 0.18); // 18% GST
        const total = orderData.subtotal + shipping + tax;

        // Calculate estimated delivery date (max delivery days from items)
        const maxDeliveryDays = Math.max(
          ...orderData.items.map((item) => item.deliveryDays),
        );
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(
          estimatedDelivery.getDate() + maxDeliveryDays,
        );

        // Generate order ID
        const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const order = await Order.create({
          orderNumber,
          customerId: req.customer._id,
          sellerId: orderData.sellerId,
          items: orderData.items,
          subtotal: orderData.subtotal,
          shipping,
          tax,
          total,
          shippingAddress,
          billingAddress: shippingAddress, // Same as shipping for now
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
          status: "pending",
          notes,
          estimatedDelivery,
          customerInfo: {
            name: req.customer.name,
            email: req.customer.email,
            phone: req.customer.phone,
          },
          statusHistory: [
            {
              status: "pending",
              timestamp: new Date(),
              note: "Order placed by customer",
              updatedBy: "Customer",
            },
          ],
        });

        // Update product stock and order count
        for (const item of orderData.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: {
              stock: -item.quantity,
              orders: 1,
            },
          });
        }

        createdOrders.push(order);
      }

      // Update customer statistics (total from all orders)
      const grandTotal = createdOrders.reduce(
        (sum, order) => sum + order.total,
        0,
      );
      await req.customer.updateStats(grandTotal);

      res.status(201).json({
        success: true,
        message: `${createdOrders.length} order(s) created successfully`,
        data: {
          orders: createdOrders,
          totalAmount: grandTotal,
          orderCount: createdOrders.length,
        },
      });
    } catch (error) {
      console.error("Create customer order error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating order",
      });
    }
  }),
);

// @desc    Get customer's orders
// @route   GET /api/customer-orders
// @access  Private (Customer)
router.get(
  "/",
  protectCustomer,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    try {
      const query = { customerId: req.customer._id };
      if (status && status !== "all") {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate("sellerId", "storeName rating reviewCount")
        .populate("items.product", "name image sku category")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: orders,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get customer orders error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
      });
    }
  }),
);

// @desc    Get single order details
// @route   GET /api/customer-orders/:id
// @access  Private (Customer)
router.get(
  "/:id",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        customerId: req.customer._id,
      })
        .populate(
          "sellerId",
          "storeName email contactNumber businessAddress rating reviewCount",
        )
        .populate("items.product", "name image sku category");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get customer order error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching order",
      });
    }
  }),
);

// @desc    Cancel order (only if pending or confirmed)
// @route   PATCH /api/customer-orders/:id/cancel
// @access  Private (Customer)
router.patch(
  "/:id/cancel",
  protectCustomer,
  [
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason cannot exceed 500 characters"),
  ],
  asyncHandler(async (req, res) => {
    const { reason = "Cancelled by customer" } = req.body;

    try {
      const order = await Order.findOne({
        _id: req.params.id,
        customerId: req.customer._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if order can be cancelled
      if (!["pending", "confirmed"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: "Order cannot be cancelled at this stage",
        });
      }

      // Update order status
      order.status = "cancelled";
      order.statusHistory.push({
        status: "cancelled",
        timestamp: new Date(),
        note: reason,
        updatedBy: "Customer",
      });

      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
            orders: -1,
          },
        });
      }

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Error cancelling order",
      });
    }
  }),
);

// @desc    Request return/refund
// @route   PATCH /api/customer-orders/:id/return
// @access  Private (Customer)
router.patch(
  "/:id/return",
  protectCustomer,
  [
    body("reason").trim().notEmpty().withMessage("Return reason is required"),
    body("itemIds")
      .optional()
      .isArray()
      .withMessage("Item IDs must be an array"),
  ],
  asyncHandler(async (req, res) => {
    const { reason, itemIds } = req.body;

    try {
      const order = await Order.findOne({
        _id: req.params.id,
        customerId: req.customer._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if order is delivered
      if (order.status !== "delivered") {
        return res.status(400).json({
          success: false,
          message: "Only delivered orders can be returned",
        });
      }

      // Check if return window is still open (30 days)
      const deliveryDate = order.actualDelivery || order.estimatedDelivery;
      const returnWindow = new Date(deliveryDate);
      returnWindow.setDate(returnWindow.getDate() + 30);

      if (new Date() > returnWindow) {
        return res.status(400).json({
          success: false,
          message: "Return window has expired",
        });
      }

      // Update order status
      order.status = "returned";
      order.returnRequest = {
        reason,
        requestedAt: new Date(),
        itemIds: itemIds || order.items.map((item) => item._id),
        status: "pending",
      };

      order.statusHistory.push({
        status: "returned",
        timestamp: new Date(),
        note: `Return requested: ${reason}`,
        updatedBy: "Customer",
      });

      await order.save();

      res.json({
        success: true,
        message: "Return request submitted successfully",
        data: order,
      });
    } catch (error) {
      console.error("Return request error:", error);
      res.status(500).json({
        success: false,
        message: "Error processing return request",
      });
    }
  }),
);

export default router;
