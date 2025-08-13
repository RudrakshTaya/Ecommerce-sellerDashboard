import express from "express";
import { query, validationResult } from "express-validator";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// @desc    Get all public products for marketplace
// @route   GET /api/public/products
// @access  Public
router.get(
  "/products",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sort")
      .optional()
      .isIn([
        "name",
        "-name",
        "price",
        "-price",
        "createdAt",
        "-createdAt",
        "rating",
        "-rating",
        "views",
        "-views",
      ]),
    query("category").optional().trim(),
    query("search").optional().trim(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("isHandmade").optional().isBoolean(),
    query("isCustomizable").optional().isBoolean(),
    query("isTrending").optional().isBoolean(),
    query("isNewProduct").optional().isBoolean(),
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

    const {
      page = 1,
      limit = 12,
      sort = "-createdAt",
      category,
      search,
      minPrice,
      maxPrice,
      isHandmade,
      isCustomizable,
      isTrending,
      isNew,
    } = req.query;

    try {
      // Build query
      const query = { status: "active", inStock: true };

      if (category) query.category = category;
      if (search) query.$text = { $search: search };
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (isHandmade === "true") query.isHandmade = true;
      if (isCustomizable === "true") query.isCustomizable = true;
      if (isTrending === "true") query.isTrending = true;
      if (isNew === "true") query.isNew = true;

      // Get products
      const products = await Product.find(query)
        .populate("sellerId", "storeName rating reviewCount isVerified")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      // Get total count for pagination
      const total = await Product.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Get filter data
      const categories = await Product.distinct("category", { status: "active" });
      const priceRange = await Product.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          categories: categories.map(cat => ({ name: cat, count: 0 })), // TODO: Add counts
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 },
        },
      });
    } catch (error) {
      console.error("Get public products error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products",
      });
    }
  }),
);

// @desc    Get featured products
// @route   GET /api/public/products/featured
// @access  Public
router.get(
  "/products/featured",
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    try {
      // First try to get featured products
      let products = await Product.find({
        status: "active",
        inStock: true,
        isFeatured: true,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort("-views")
        .limit(parseInt(limit))
        .exec();

      // If no featured products, get any active products
      if (products.length === 0) {
        products = await Product.find({
          status: "active",
          inStock: true,
        })
          .populate("sellerId", "storeName rating reviewCount")
          .sort("-createdAt")
          .limit(parseInt(limit))
          .exec();
      }

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get featured products error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching featured products",
      });
    }
  }),
);

// @desc    Get trending products
// @route   GET /api/public/products/trending
// @access  Public
router.get(
  "/products/trending",
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    try {
      // First try to get trending products
      let products = await Product.find({
        status: "active",
        inStock: true,
        isTrending: true,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort("-views")
        .limit(parseInt(limit))
        .exec();

      // If no trending products, get recent products sorted by views
      if (products.length === 0) {
        products = await Product.find({
          status: "active",
          inStock: true,
        })
          .populate("sellerId", "storeName rating reviewCount")
          .sort("-views -createdAt")
          .limit(parseInt(limit))
          .exec();
      }

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get trending products error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching trending products",
      });
    }
  }),
);

// @desc    Get new products
// @route   GET /api/public/products/new
// @access  Public
router.get(
  "/products/new",
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    try {
      const products = await Product.find({
        status: "active",
        inStock: true,
        isNew: true,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort("-createdAt")
        .limit(parseInt(limit))
        .exec();

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get new products error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching new products",
      });
    }
  }),
);

// @desc    Get customizable products
// @route   GET /api/public/products/customizable
// @access  Public
router.get(
  "/products/customizable",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 12 } = req.query;

    try {
      const products = await Product.find({
        status: "active",
        inStock: true,
        isCustomizable: true,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort("-createdAt")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Product.countDocuments({
        status: "active",
        inStock: true,
        isCustomizable: true,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get customizable products error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching customizable products",
      });
    }
  }),
);

// @desc    Get products by category
// @route   GET /api/public/products/category/:category
// @access  Public
router.get(
  "/products/category/:category",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sort")
      .optional()
      .isIn([
        "name",
        "-name",
        "price",
        "-price",
        "createdAt",
        "-createdAt",
        "rating",
        "-rating",
      ]),
  ],
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = "-createdAt" } = req.query;
    const { category } = req.params;

    try {
      const products = await Product.find({
        status: "active",
        inStock: true,
        category: category,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Product.countDocuments({
        status: "active",
        inStock: true,
        category: category,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get products by category error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products by category",
      });
    }
  }),
);

// @desc    Get all categories
// @route   GET /api/public/categories
// @access  Public
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    try {
      const categories = await Product.distinct("category", { status: "active" });

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching categories",
      });
    }
  }),
);

// @desc    Search products
// @route   GET /api/public/products/search
// @access  Public
router.get(
  "/products/search",
  [
    query("q").notEmpty().withMessage("Search query is required"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { q, page = 1, limit = 12 } = req.query;

    try {
      const products = await Product.find({
        status: "active",
        inStock: true,
        $text: { $search: q },
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Product.countDocuments({
        status: "active",
        inStock: true,
        $text: { $search: q },
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({
        success: false,
        message: "Error searching products",
      });
    }
  }),
);

// @desc    Get all public sellers
// @route   GET /api/public/sellers
// @access  Public
router.get(
  "/sellers",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = "-createdAt" } = req.query;

    try {
      const sellers = await Seller.find({
        isActive: true,
        isVerified: true,
      })
        .select("storeName email rating reviewCount totalSales isVerified businessAddress profileImage")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Seller.countDocuments({
        isActive: true,
        isVerified: true,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: sellers,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get public sellers error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching sellers",
      });
    }
  }),
);

// @desc    Get featured sellers
// @route   GET /api/public/sellers/featured
// @access  Public
router.get(
  "/sellers/featured",
  asyncHandler(async (req, res) => {
    const { limit = 6 } = req.query;

    try {
      // First try to get featured sellers
      let sellers = await Seller.find({
        isActive: true,
        isVerified: true,
        isFeatured: true,
      })
        .select("storeName email rating reviewCount totalSales isVerified businessAddress profileImage")
        .sort("-totalSales")
        .limit(parseInt(limit))
        .exec();

      // If no featured sellers, get any verified sellers
      if (sellers.length === 0) {
        sellers = await Seller.find({
          isVerified: true,
        })
          .select("storeName email rating reviewCount totalSales isVerified businessAddress profileImage")
          .sort("-totalSales -createdAt")
          .limit(parseInt(limit))
          .exec();
      }

      res.json({
        success: true,
        data: sellers,
      });
    } catch (error) {
      console.error("Get featured sellers error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching featured sellers",
      });
    }
  }),
);

// @desc    Get single seller by ID (public)
// @route   GET /api/public/sellers/:id
// @access  Public
router.get(
  "/sellers/:id",
  asyncHandler(async (req, res) => {
    try {
      const seller = await Seller.findOne({
        _id: req.params.id,
        isActive: true,
      }).select("-password -refreshToken");

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      res.json({
        success: true,
        data: seller,
      });
    } catch (error) {
      console.error("Get public seller error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching seller",
      });
    }
  }),
);

// @desc    Get products by seller
// @route   GET /api/public/sellers/:id/products
// @access  Public
router.get(
  "/sellers/:id/products",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = "-createdAt" } = req.query;
    const { id: sellerId } = req.params;

    try {
      const products = await Product.find({
        sellerId: sellerId,
        status: "active",
        inStock: true,
      })
        .populate("sellerId", "storeName rating reviewCount")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Product.countDocuments({
        sellerId: sellerId,
        status: "active",
        inStock: true,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get products by seller error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products by seller",
      });
    }
  }),
);

// @desc    Get single product by ID (public) - MUST BE LAST
// @route   GET /api/public/products/:id
// @access  Public
router.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        status: "active",
      }).populate("sellerId", "storeName rating reviewCount isVerified businessAddress");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Increment view count
      await Product.findByIdAndUpdate(req.params.id, {
        $inc: { views: 1 },
      });

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get public product error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching product",
      });
    }
  }),
);

export default router;
