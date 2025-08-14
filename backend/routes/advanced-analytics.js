import express from "express";
import { protect as verifyAuth } from "../middleware/auth.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// Advanced dashboard analytics with time periods
router.get("/dashboard-advanced", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = "30d", startDate, endDate } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      let daysBack;
      switch (period) {
        case "7d":
          daysBack = 7;
          break;
        case "30d":
          daysBack = 30;
          break;
        case "90d":
          daysBack = 90;
          break;
        case "365d":
          daysBack = 365;
          break;
        default:
          daysBack = 30;
      }

      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000),
        },
      };
    }

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          status: { $in: ["confirmed", "shipped", "delivered"] },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Product performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          status: { $in: ["confirmed", "shipped", "delivered"] },
          ...dateFilter,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderCount: { $sum: 1 },
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
          category: "$product.category",
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ["$totalRevenue", "$totalSold"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Customer acquisition and retention
    const customerMetrics = await Customer.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                sellerId: sellerId,
                ...dateFilter,
              },
            },
          ],
          as: "orders",
        },
      },
      {
        $match: {
          "orders.0": { $exists: true },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          orderCount: { $size: "$orders" },
          totalSpent: { $sum: "$orders.totalAmount" },
          firstOrder: { $min: "$orders.createdAt" },
          lastOrder: { $max: "$orders.createdAt" },
          isNewCustomer: {
            $gte: [
              { $min: "$orders.createdAt" },
              new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            ],
          },
        },
      },
    ]);

    // Category performance
    const categoryPerformance = await Product.aggregate([
      {
        $match: { sellerId: sellerId },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                sellerId: sellerId,
                status: { $in: ["confirmed", "shipped", "delivered"] },
                ...dateFilter,
              },
            },
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.productId", "$$productId"] },
              },
            },
          ],
          as: "orders",
        },
      },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          totalOrders: { $sum: { $size: "$orders" } },
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: "$orders",
                  as: "order",
                  in: {
                    $multiply: [
                      "$$order.items.price",
                      "$$order.items.quantity",
                    ],
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Growth metrics
    const previousPeriodFilter = {
      createdAt: {
        $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    };

    const currentPeriodRevenue = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          status: { $in: ["confirmed", "shipped", "delivered"] },
          ...dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const previousPeriodRevenue = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          status: { $in: ["confirmed", "shipped", "delivered"] },
          ...previousPeriodFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const currentRevenue = currentPeriodRevenue[0]?.total || 0;
    const previousRevenue = previousPeriodRevenue[0]?.total || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    res.status(200).json({
      success: true,
      message: "Advanced analytics retrieved successfully",
      data: {
        period,
        dateRange: dateFilter,
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          timeline: revenueData,
        },
        products: {
          topPerforming: productPerformance,
          categoryBreakdown: categoryPerformance,
        },
        customers: {
          metrics: customerMetrics,
          newCustomers: customerMetrics.filter((c) => c.isNewCustomer).length,
          returningCustomers: customerMetrics.filter((c) => c.orderCount > 1)
            .length,
        },
        summary: {
          totalOrders: revenueData.reduce(
            (sum, item) => sum + item.orderCount,
            0,
          ),
          averageOrderValue:
            revenueData.reduce((sum, item) => sum + item.averageOrderValue, 0) /
              revenueData.length || 0,
          totalProducts: await Product.countDocuments({ sellerId }),
          activeProducts: await Product.countDocuments({
            sellerId,
            status: "active",
          }),
        },
      },
    });
  } catch (error) {
    console.error("Advanced analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Sales funnel analysis
router.get("/sales-funnel", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = "30d" } = req.query;

    const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
      },
    };

    // Product views (simulated - in real app, track page views)
    const totalProducts = await Product.countDocuments({
      sellerId,
      status: "active",
    });
    const estimatedViews = totalProducts * 50; // Assume 50 views per product on average

    // Add to cart (simulated - track cart additions)
    const cartAdditions = Math.floor(estimatedViews * 0.1); // 10% add to cart rate

    // Orders placed
    const ordersPlaced = await Order.countDocuments({
      sellerId,
      ...dateFilter,
    });

    // Orders completed
    const ordersCompleted = await Order.countDocuments({
      sellerId,
      status: { $in: ["confirmed", "shipped", "delivered"] },
      ...dateFilter,
    });

    // Calculate conversion rates
    const viewToCartRate = (cartAdditions / estimatedViews) * 100;
    const cartToOrderRate = (ordersPlaced / cartAdditions) * 100;
    const orderCompletionRate = (ordersCompleted / ordersPlaced) * 100;
    const overallConversionRate = (ordersCompleted / estimatedViews) * 100;

    res.status(200).json({
      success: true,
      message: "Sales funnel analysis retrieved successfully",
      data: {
        funnel: [
          {
            stage: "Product Views",
            count: estimatedViews,
            conversionRate: 100,
          },
          {
            stage: "Add to Cart",
            count: cartAdditions,
            conversionRate: viewToCartRate,
          },
          {
            stage: "Orders Placed",
            count: ordersPlaced,
            conversionRate: cartToOrderRate,
          },
          {
            stage: "Orders Completed",
            count: ordersCompleted,
            conversionRate: orderCompletionRate,
          },
        ],
        insights: {
          overallConversionRate,
          dropOffPoints: {
            viewToCart: 100 - viewToCartRate,
            cartToOrder: 100 - cartToOrderRate,
            orderCompletion: 100 - orderCompletionRate,
          },
        },
      },
    });
  } catch (error) {
    console.error("Sales funnel error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Customer lifetime value analysis
router.get("/customer-ltv", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    const customerLTV = await Customer.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                sellerId: sellerId,
                status: { $in: ["confirmed", "shipped", "delivered"] },
              },
            },
          ],
          as: "orders",
        },
      },
      {
        $match: {
          "orders.0": { $exists: true },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          orderCount: { $size: "$orders" },
          totalSpent: { $sum: "$orders.totalAmount" },
          averageOrderValue: { $avg: "$orders.totalAmount" },
          firstOrder: { $min: "$orders.createdAt" },
          lastOrder: { $max: "$orders.createdAt" },
          customerAge: {
            $divide: [
              { $subtract: [new Date(), { $min: "$orders.createdAt" }] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $addFields: {
          estimatedLTV: {
            $multiply: [
              "$averageOrderValue",
              {
                $divide: [
                  "$orderCount",
                  { $max: [{ $divide: ["$customerAge", 30] }, 1] },
                ],
              }, // Orders per month
              12, // Estimate for a year
            ],
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    // Calculate segments
    const highValueCustomers = customerLTV.filter((c) => c.totalSpent > 10000);
    const mediumValueCustomers = customerLTV.filter(
      (c) => c.totalSpent > 5000 && c.totalSpent <= 10000,
    );
    const lowValueCustomers = customerLTV.filter((c) => c.totalSpent <= 5000);

    res.status(200).json({
      success: true,
      message: "Customer LTV analysis retrieved successfully",
      data: {
        customers: customerLTV,
        segments: {
          highValue: {
            count: highValueCustomers.length,
            customers: highValueCustomers.slice(0, 10),
          },
          mediumValue: {
            count: mediumValueCustomers.length,
            customers: mediumValueCustomers.slice(0, 10),
          },
          lowValue: {
            count: lowValueCustomers.length,
            customers: lowValueCustomers.slice(0, 10),
          },
        },
        averages: {
          averageLTV:
            customerLTV.reduce((sum, c) => sum + (c.estimatedLTV || 0), 0) /
            customerLTV.length,
          averageOrderValue:
            customerLTV.reduce((sum, c) => sum + c.averageOrderValue, 0) /
            customerLTV.length,
          averageOrderCount:
            customerLTV.reduce((sum, c) => sum + c.orderCount, 0) /
            customerLTV.length,
        },
      },
    });
  } catch (error) {
    console.error("Customer LTV error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Inventory turnover analysis
router.get("/inventory-turnover", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = "30d" } = req.query;

    const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
      },
    };

    const inventoryAnalysis = await Product.aggregate([
      {
        $match: { sellerId: sellerId },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                sellerId: sellerId,
                status: { $in: ["confirmed", "shipped", "delivered"] },
                ...dateFilter,
              },
            },
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.productId", "$$productId"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$items.quantity" },
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
          turnoverRate: {
            $cond: {
              if: { $gt: ["$stock", 0] },
              then: {
                $divide: [
                  {
                    $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0],
                  },
                  "$stock",
                ],
              },
              else: 0,
            },
          },
          stockStatus: {
            $cond: {
              if: { $eq: ["$stock", 0] },
              then: "out_of_stock",
              else: {
                $cond: {
                  if: { $lte: ["$stock", 10] },
                  then: "low_stock",
                  else: {
                    $cond: {
                      if: { $gte: ["$stock", 100] },
                      then: "overstock",
                      else: "normal",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          sku: 1,
          category: 1,
          stock: 1,
          price: 1,
          totalSold: 1,
          turnoverRate: 1,
          stockStatus: 1,
          stockValue: { $multiply: ["$stock", "$price"] },
          daysOfStock: {
            $cond: {
              if: { $gt: ["$totalSold", 0] },
              then: {
                $divide: [
                  { $multiply: ["$stock", parseInt(period)] },
                  "$totalSold",
                ],
              },
              else: 999, // High number for products with no sales
            },
          },
        },
      },
      { $sort: { turnoverRate: -1 } },
    ]);

    // Categorize products
    const fastMoving = inventoryAnalysis.filter((p) => p.turnoverRate > 0.5);
    const slowMoving = inventoryAnalysis.filter(
      (p) => p.turnoverRate < 0.1 && p.turnoverRate > 0,
    );
    const nonMoving = inventoryAnalysis.filter((p) => p.turnoverRate === 0);

    res.status(200).json({
      success: true,
      message: "Inventory turnover analysis retrieved successfully",
      data: {
        products: inventoryAnalysis,
        categories: {
          fastMoving: { count: fastMoving.length, products: fastMoving },
          slowMoving: { count: slowMoving.length, products: slowMoving },
          nonMoving: { count: nonMoving.length, products: nonMoving },
        },
        summary: {
          totalInventoryValue: inventoryAnalysis.reduce(
            (sum, p) => sum + p.stockValue,
            0,
          ),
          averageTurnoverRate:
            inventoryAnalysis.reduce((sum, p) => sum + p.turnoverRate, 0) /
            inventoryAnalysis.length,
          stockDistribution: {
            outOfStock: inventoryAnalysis.filter(
              (p) => p.stockStatus === "out_of_stock",
            ).length,
            lowStock: inventoryAnalysis.filter(
              (p) => p.stockStatus === "low_stock",
            ).length,
            normal: inventoryAnalysis.filter((p) => p.stockStatus === "normal")
              .length,
            overstock: inventoryAnalysis.filter(
              (p) => p.stockStatus === "overstock",
            ).length,
          },
        },
      },
    });
  } catch (error) {
    console.error("Inventory turnover error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Export reports
router.get("/export/:reportType", verifyAuth, async (req, res) => {
  try {
    const { reportType } = req.params;
    const { format = "json", period = "30d" } = req.query;
    const sellerId = req.user.id;

    let data;
    let filename;

    switch (reportType) {
      case "sales":
        data = await generateSalesReport(sellerId, period);
        filename = `sales_report_${period}.${format}`;
        break;
      case "inventory":
        data = await generateInventoryReport(sellerId);
        filename = `inventory_report.${format}`;
        break;
      case "customers":
        data = await generateCustomerReport(sellerId, period);
        filename = `customer_report_${period}.${format}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    if (format === "csv") {
      // Convert to CSV (simplified)
      const csv = convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.send(csv);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.json({
        success: true,
        message: `${reportType} report generated successfully`,
        data,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Export report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
});

// Helper functions
async function generateSalesReport(sellerId, period) {
  const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const dateFilter = {
    createdAt: {
      $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
    },
  };

  return await Order.find({
    sellerId,
    status: { $in: ["confirmed", "shipped", "delivered"] },
    ...dateFilter,
  })
    .populate("customerId", "name email")
    .populate("items.productId", "name sku")
    .select("orderNumber totalAmount status createdAt items");
}

async function generateInventoryReport(sellerId) {
  return await Product.find({ sellerId })
    .select("name sku category stock price status createdAt")
    .sort({ category: 1, name: 1 });
}

async function generateCustomerReport(sellerId, period) {
  const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  return await Customer.aggregate([
    {
      $lookup: {
        from: "orders",
        let: { customerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$customerId", "$$customerId"] },
              sellerId: sellerId,
              createdAt: {
                $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
              },
            },
          },
        ],
        as: "recentOrders",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        createdAt: 1,
        recentOrderCount: { $size: "$recentOrders" },
        recentOrderValue: { $sum: "$recentOrders.totalAmount" },
      },
    },
  ]);
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

export default router;
