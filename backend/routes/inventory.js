import express from "express";
import { body, validationResult } from "express-validator";
import { verifyAuth } from "../middleware/auth.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// Get inventory overview
router.get("/overview", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get inventory stats
    const totalProducts = await Product.countDocuments({ sellerId });
    const lowStockProducts = await Product.countDocuments({
      sellerId,
      stock: { $lte: 10, $gt: 0 },
    });
    const outOfStockProducts = await Product.countDocuments({
      sellerId,
      stock: 0,
    });
    const totalInventoryValue = await Product.aggregate([
      { $match: { sellerId: sellerId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);

    // Get recent stock movements (from orders)
    const recentMovements = await Order.aggregate([
      {
        $match: {
          sellerId: sellerId,
          status: { $in: ["confirmed", "shipped", "delivered"] },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$product.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      message: "Inventory overview retrieved successfully",
      data: {
        stats: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalInventoryValue: totalInventoryValue[0]?.total || 0,
        },
        recentMovements,
      },
    });
  } catch (error) {
    console.error("Inventory overview error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get low stock products
router.get("/low-stock", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.find({
      sellerId,
      stock: { $lte: parseInt(threshold), $gt: 0 },
      status: "active",
    })
      .select("name sku stock price image category")
      .sort({ stock: 1 });

    res.status(200).json({
      success: true,
      message: "Low stock products retrieved successfully",
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Low stock products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update stock for single product
router.patch(
  "/update-stock/:id",
  verifyAuth,
  [
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("reason")
      .notEmpty()
      .withMessage("Reason for stock update is required"),
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

      const { id } = req.params;
      const { stock, reason } = req.body;
      const sellerId = req.user.id;

      const product = await Product.findOne({ _id: id, sellerId });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const previousStock = product.stock;
      product.stock = stock;
      product.stockHistory = product.stockHistory || [];
      product.stockHistory.push({
        date: new Date(),
        previousStock,
        newStock: stock,
        reason,
        updatedBy: sellerId,
      });

      await product.save();

      res.status(200).json({
        success: true,
        message: "Stock updated successfully",
        data: {
          productId: product._id,
          name: product.name,
          previousStock,
          newStock: stock,
          reason,
        },
      });
    } catch (error) {
      console.error("Stock update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Bulk stock update
router.patch(
  "/bulk-stock-update",
  verifyAuth,
  [
    body("updates").isArray().withMessage("Updates must be an array"),
    body("updates.*.productId")
      .isMongoId()
      .withMessage("Valid product ID is required"),
    body("updates.*.stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("reason").notEmpty().withMessage("Reason for bulk update is required"),
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

      const { updates, reason } = req.body;
      const sellerId = req.user.id;

      const results = [];
      const failed = [];

      for (const update of updates) {
        try {
          const product = await Product.findOne({
            _id: update.productId,
            sellerId,
          });

          if (!product) {
            failed.push({
              productId: update.productId,
              error: "Product not found",
            });
            continue;
          }

          const previousStock = product.stock;
          product.stock = update.stock;
          product.stockHistory = product.stockHistory || [];
          product.stockHistory.push({
            date: new Date(),
            previousStock,
            newStock: update.stock,
            reason: `Bulk update: ${reason}`,
            updatedBy: sellerId,
          });

          await product.save();

          results.push({
            productId: product._id,
            name: product.name,
            previousStock,
            newStock: update.stock,
          });
        } catch (error) {
          failed.push({
            productId: update.productId,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Bulk stock update completed. ${results.length} updated, ${failed.length} failed.`,
        data: {
          updated: results,
          failed,
        },
      });
    } catch (error) {
      console.error("Bulk stock update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get stock history for a product
router.get("/stock-history/:id", verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const product = await Product.findOne(
      { _id: id, sellerId },
      { stockHistory: 1, name: 1, sku: 1 },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stockHistory = product.stockHistory || [];

    res.status(200).json({
      success: true,
      message: "Stock history retrieved successfully",
      data: {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
        },
        history: stockHistory.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        ),
      },
    });
  } catch (error) {
    console.error("Stock history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Generate stock alert report
router.get("/alerts", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Critical alerts (out of stock)
    const outOfStock = await Product.find({
      sellerId,
      stock: 0,
      status: "active",
    })
      .select("name sku price image category")
      .sort({ name: 1 });

    // Warning alerts (low stock)
    const lowStock = await Product.find({
      sellerId,
      stock: { $lte: 10, $gt: 0 },
      status: "active",
    })
      .select("name sku stock price image category")
      .sort({ stock: 1 });

    // Overstock alerts (high inventory)
    const overstock = await Product.find({
      sellerId,
      stock: { $gte: 100 },
      status: "active",
    })
      .select("name sku stock price image category")
      .sort({ stock: -1 });

    res.status(200).json({
      success: true,
      message: "Stock alerts retrieved successfully",
      data: {
        critical: outOfStock,
        warning: lowStock,
        overstock: overstock,
      },
    });
  } catch (error) {
    console.error("Stock alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Bulk operations (delete, status change, category change)
router.patch(
  "/bulk-operations",
  verifyAuth,
  [
    body("operation")
      .isIn(["delete", "activate", "deactivate", "changeCategory"])
      .withMessage("Invalid operation"),
    body("productIds").isArray().withMessage("Product IDs must be an array"),
    body("productIds.*")
      .isMongoId()
      .withMessage("Valid product IDs are required"),
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

      const { operation, productIds, category } = req.body;
      const sellerId = req.user.id;

      let updateQuery = {};
      let operationName = "";

      switch (operation) {
        case "delete":
          const deleteResult = await Product.deleteMany({
            _id: { $in: productIds },
            sellerId,
          });
          return res.status(200).json({
            success: true,
            message: `${deleteResult.deletedCount} products deleted successfully`,
            data: { deletedCount: deleteResult.deletedCount },
          });

        case "activate":
          updateQuery = { status: "active" };
          operationName = "activated";
          break;

        case "deactivate":
          updateQuery = { status: "inactive" };
          operationName = "deactivated";
          break;

        case "changeCategory":
          if (!category) {
            return res.status(400).json({
              success: false,
              message: "Category is required for category change operation",
            });
          }
          updateQuery = { category };
          operationName = "category updated";
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid operation",
          });
      }

      const updateResult = await Product.updateMany(
        { _id: { $in: productIds }, sellerId },
        { $set: updateQuery },
      );

      res.status(200).json({
        success: true,
        message: `${updateResult.modifiedCount} products ${operationName} successfully`,
        data: { modifiedCount: updateResult.modifiedCount },
      });
    } catch (error) {
      console.error("Bulk operations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

export default router;
