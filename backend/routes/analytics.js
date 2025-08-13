import express from "express";
import { query, validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { protect, requireVerified } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get dashboard overview statistics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get(
  "/dashboard",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const sellerId = req.seller._id;
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get overall statistics
      const [
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalOrders,
        recentOrders,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        pendingOrders,
        processingOrders,
        totalCustomers,
      ] = await Promise.all([
        Product.countDocuments({ sellerId }),
        Product.countDocuments({ sellerId, status: "active" }),
        Product.countDocuments({
          sellerId,
          status: "active",
          $expr: { $lte: ["$stock", "$lowStockThreshold"] },
        }),
        Order.countDocuments({ sellerId }),
        Order.countDocuments({ sellerId, createdAt: { $gte: last7Days } }),
        Order.aggregate([
          { $match: { sellerId, status: "delivered" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.aggregate([
          {
            $match: {
              sellerId,
              status: "delivered",
              createdAt: { $gte: last30Days },
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.aggregate([
          {
            $match: {
              sellerId,
              status: "delivered",
              createdAt: { $gte: last7Days },
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.countDocuments({ sellerId, status: "pending" }),
        Order.countDocuments({
          sellerId,
          status: { $in: ["confirmed", "processing", "packed", "shipped"] },
        }),
        Order.distinct("customerId", { sellerId }).then((ids) => ids.length),
      ]);

      // Get recent orders with details
      const recentOrdersDetails = await Order.find({
        sellerId,
        createdAt: { $gte: last7Days },
      })
        .populate("customerId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderId customerInfo total status createdAt");

      // Get top selling products
      const topProducts = await Order.aggregate([
        { $match: { sellerId, status: "delivered" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            productName: { $first: "$items.productSnapshot.name" },
            productImage: { $first: "$items.productSnapshot.image" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]);

      // Get daily sales for the last 7 days
      const dailySales = await Order.aggregate([
        {
          $match: {
            sellerId,
            status: "delivered",
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            sales: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get order status distribution
      const orderStatusDistribution = await Order.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Calculate growth rates
      const previousMonthRevenue = await Order.aggregate([
        {
          $match: {
            sellerId,
            status: "delivered",
            createdAt: {
              $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
              $lt: last30Days,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);

      const previousWeekRevenue = await Order.aggregate([
        {
          $match: {
            sellerId,
            status: "delivered",
            createdAt: {
              $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
              $lt: last7Days,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);

      const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
      const currentWeekRevenue = weeklyRevenue[0]?.total || 0;
      const prevMonthRevenue = previousMonthRevenue[0]?.total || 0;
      const prevWeekRevenue = previousWeekRevenue[0]?.total || 0;

      const monthlyGrowth =
        prevMonthRevenue > 0
          ? (
              ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) *
              100
            ).toFixed(1)
          : 0;

      const weeklyGrowth =
        prevWeekRevenue > 0
          ? (
              ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) *
              100
            ).toFixed(1)
          : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalOrders,
            recentOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: currentMonthRevenue,
            weeklyRevenue: currentWeekRevenue,
            pendingOrders,
            processingOrders,
            totalCustomers,
            monthlyGrowth: parseFloat(monthlyGrowth),
            weeklyGrowth: parseFloat(weeklyGrowth),
          },
          recentOrders: recentOrdersDetails,
          topProducts,
          dailySales,
          orderStatusDistribution,
        },
      });
    } catch (error) {
      console.error("Dashboard analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching dashboard analytics",
      });
    }
  }),
);

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private
router.get(
  "/sales",
  protect,
  [
    query("period")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Invalid period"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
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

    const { period = "30d", startDate, endDate } = req.query;

    try {
      // Calculate date range
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      } else {
        const days =
          period === "7d"
            ? 7
            : period === "30d"
              ? 30
              : period === "90d"
                ? 90
                : 365;
        dateFilter = {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        };
      }

      const matchQuery = {
        sellerId: req.seller._id,
        status: "delivered",
        ...dateFilter,
      };

      // Get sales trends
      const groupBy =
        period === "7d"
          ? {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            }
          : period === "30d"
            ? {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              }
            : period === "90d"
              ? {
                  $dateToString: { format: "%Y-%U", date: "$createdAt" },
                }
              : {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                };

      const salesTrends = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            averageOrderValue: { $avg: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get category performance
      const categoryPerformance = await Order.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $group: {
            _id: "$productInfo.category",
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            quantity: { $sum: "$items.quantity" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Get payment method analysis
      const paymentAnalysis = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            revenue: { $sum: "$total" },
            averageValue: { $avg: "$total" },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Get hourly sales pattern
      const hourlySales = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        data: {
          salesTrends,
          categoryPerformance,
          paymentAnalysis,
          hourlySales,
        },
      });
    } catch (error) {
      console.error("Sales analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching sales analytics",
      });
    }
  }),
);

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private
router.get(
  "/products",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const sellerId = req.seller._id;

      // Get product performance metrics
      const productMetrics = await Product.aggregate([
        { $match: { sellerId } },
        {
          $lookup: {
            from: "orders",
            let: { productId: "$_id" },
            pipeline: [
              { $match: { sellerId } },
              { $unwind: "$items" },
              { $match: { $expr: { $eq: ["$items.product", "$$productId"] } } },
              {
                $group: {
                  _id: null,
                  totalSold: { $sum: "$items.quantity" },
                  totalRevenue: {
                    $sum: { $multiply: ["$items.quantity", "$items.price"] },
                  },
                  totalOrders: { $sum: 1 },
                },
              },
            ],
            as: "salesData",
          },
        },
        {
          $addFields: {
            totalSold: {
              $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0],
            },
            totalRevenue: {
              $ifNull: [{ $arrayElemAt: ["$salesData.totalRevenue", 0] }, 0],
            },
            totalOrders: {
              $ifNull: [{ $arrayElemAt: ["$salesData.totalOrders", 0] }, 0],
            },
          },
        },
        {
          $project: {
            name: 1,
            sku: 1,
            category: 1,
            price: 1,
            stock: 1,
            status: 1,
            image: 1,
            totalSold: 1,
            totalRevenue: 1,
            totalOrders: 1,
            stockStatus: {
              $cond: {
                if: { $eq: ["$stock", 0] },
                then: "out_of_stock",
                else: {
                  $cond: {
                    if: { $lte: ["$stock", "$lowStockThreshold"] },
                    then: "low_stock",
                    else: "in_stock",
                  },
                },
              },
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      // Get category summary
      const categorySummary = await Product.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: "$category",
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            totalStock: { $sum: "$stock" },
            averagePrice: { $avg: "$price" },
          },
        },
        { $sort: { totalProducts: -1 } },
      ]);

      // Get stock alerts
      const stockAlerts = await Product.find({
        sellerId,
        status: "active",
        $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      })
        .select("name sku stock lowStockThreshold category image")
        .sort({ stock: 1 })
        .limit(10);

      // Get top performers
      const topPerformers = productMetrics
        .filter((product) => product.totalSold > 0)
        .slice(0, 10);

      // Get poor performers
      const poorPerformers = productMetrics
        .filter(
          (product) => product.totalSold === 0 && product.status === "active",
        )
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          productMetrics,
          categorySummary,
          stockAlerts,
          topPerformers,
          poorPerformers,
        },
      });
    } catch (error) {
      console.error("Product analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching product analytics",
      });
    }
  }),
);

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private
router.get(
  "/customers",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const sellerId = req.seller._id;

      // Get customer segments from orders
      const customerAnalytics = await Order.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: "$customerId",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$total" },
            averageOrderValue: { $avg: "$total" },
            firstOrder: { $min: "$createdAt" },
            lastOrder: { $max: "$createdAt" },
            customerInfo: { $first: "$customerInfo" },
          },
        },
        {
          $addFields: {
            segment: {
              $cond: {
                if: { $gte: ["$totalSpent", 50000] },
                then: "vip",
                else: {
                  $cond: {
                    if: { $gte: ["$totalOrders", 5] },
                    then: "regular",
                    else: "new",
                  },
                },
              },
            },
            daysSinceLastOrder: {
              $divide: [
                { $subtract: [new Date(), "$lastOrder"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        { $sort: { totalSpent: -1 } },
      ]);

      // Get segment distribution
      const segmentDistribution = customerAnalytics.reduce((acc, customer) => {
        acc[customer.segment] = (acc[customer.segment] || 0) + 1;
        return acc;
      }, {});

      // Get top customers
      const topCustomers = customerAnalytics.slice(0, 10);

      // Get new customers (first order in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const newCustomers = customerAnalytics.filter(
        (customer) => customer.firstOrder >= thirtyDaysAgo,
      );

      // Get at-risk customers (no order in last 60 days)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const atRiskCustomers = customerAnalytics.filter(
        (customer) =>
          customer.lastOrder < sixtyDaysAgo && customer.totalOrders > 1,
      );

      // Get customer acquisition trends
      const acquisitionTrends = await Order.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: {
              customerId: "$customerId",
              firstOrder: { $min: "$createdAt" },
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$_id.firstOrder" },
            },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]);

      // Calculate summary statistics
      const totalCustomers = customerAnalytics.length;
      const averageOrderValue =
        customerAnalytics.reduce(
          (sum, customer) => sum + customer.averageOrderValue,
          0,
        ) / totalCustomers || 0;
      const averageLifetimeValue =
        customerAnalytics.reduce(
          (sum, customer) => sum + customer.totalSpent,
          0,
        ) / totalCustomers || 0;

      res.json({
        success: true,
        data: {
          summary: {
            totalCustomers,
            newCustomers: newCustomers.length,
            atRiskCustomers: atRiskCustomers.length,
            averageOrderValue: Math.round(averageOrderValue),
            averageLifetimeValue: Math.round(averageLifetimeValue),
          },
          segmentDistribution,
          topCustomers,
          newCustomers: newCustomers.slice(0, 10),
          atRiskCustomers: atRiskCustomers.slice(0, 10),
          acquisitionTrends,
        },
      });
    } catch (error) {
      console.error("Customer analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching customer analytics",
      });
    }
  }),
);

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private
router.get(
  "/inventory",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const sellerId = req.seller._id;

      // Get inventory summary
      const inventorySummary = await Product.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
            outOfStock: {
              $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stock", 0] },
                      { $lte: ["$stock", "$lowStockThreshold"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
          },
        },
      ]);

      // Get category-wise inventory
      const categoryInventory = await Product.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: "$category",
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
            averagePrice: { $avg: "$price" },
            outOfStock: {
              $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stock", 0] },
                      { $lte: ["$stock", "$lowStockThreshold"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { totalValue: -1 } },
      ]);

      // Get stock movement (products that need attention)
      const stockAlerts = await Product.find({
        sellerId,
        $or: [
          { stock: 0 },
          { $expr: { $lte: ["$stock", "$lowStockThreshold"] } },
        ],
      })
        .select("name sku category stock lowStockThreshold price status")
        .sort({ stock: 1 });

      // Get top valuable inventory
      // Get top value products using aggregation for calculated sort
      const topValueProducts = await Product.aggregate([
        { $match: { sellerId } },
        {
          $addFields: {
            totalValue: { $multiply: ["$stock", "$price"] }
          }
        },
        { $sort: { totalValue: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: 1,
            sku: 1,
            category: 1,
            stock: 1,
            price: 1,
            totalValue: 1
          }
        }
      ]);

      // Calculate inventory turnover (simplified)
      const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const salesVelocity = await Order.aggregate([
        {
          $match: {
            sellerId,
            status: "delivered",
            createdAt: { $gte: last90Days },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            soldQuantity: { $sum: "$items.quantity" },
            soldValue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            productName: "$product.name",
            sku: "$product.sku",
            currentStock: "$product.stock",
            soldQuantity: 1,
            soldValue: 1,
            turnoverRate: {
              $cond: {
                if: { $gt: ["$product.stock", 0] },
                then: { $divide: ["$soldQuantity", "$product.stock"] },
                else: 0,
              },
            },
          },
        },
        { $sort: { turnoverRate: -1 } },
        { $limit: 20 },
      ]);

      res.json({
        success: true,
        data: {
          summary: inventorySummary[0] || {
            totalProducts: 0,
            totalStock: 0,
            totalValue: 0,
            outOfStock: 0,
            lowStock: 0,
            activeProducts: 0,
          },
          categoryInventory,
          stockAlerts,
          topValueProducts,
          salesVelocity,
        },
      });
    } catch (error) {
      console.error("Inventory analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching inventory analytics",
      });
    }
  }),
);

export default router;
