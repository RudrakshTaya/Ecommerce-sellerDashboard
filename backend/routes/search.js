import express from "express";
import { query, validationResult } from "express-validator";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

const router = express.Router();

// Advanced product search with filters and sorting
router.get(
  "/products",
  [
    query("q").optional().isString().withMessage("Search query must be a string"),
    query("category").optional().isString().withMessage("Category must be a string"),
    query("minPrice").optional().isNumeric().withMessage("Min price must be a number"),
    query("maxPrice").optional().isNumeric().withMessage("Max price must be a number"),
    query("sortBy").optional().isIn(["price", "name", "rating", "soldCount", "createdAt", "relevance"]).withMessage("Invalid sort field"),
    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),
    query("inStock").optional().isBoolean().withMessage("In stock must be boolean"),
    query("sellerId").optional().isMongoId().withMessage("Invalid seller ID"),
    query("tags").optional().isString().withMessage("Tags must be a string"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
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

      const {
        q,
        category,
        minPrice,
        maxPrice,
        sortBy = "relevance",
        sortOrder = "desc",
        inStock,
        sellerId,
        tags,
        page = 1,
        limit = 12
      } = req.query;

      // Build search query
      let searchQuery = { status: "active" };

      // Text search
      if (q) {
        searchQuery.$or = [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } }
        ];
      }

      // Category filter
      if (category) {
        searchQuery.category = { $regex: category, $options: "i" };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
      }

      // Stock filter
      if (inStock === "true") {
        searchQuery.stock = { $gt: 0 };
      } else if (inStock === "false") {
        searchQuery.stock = 0;
      }

      // Seller filter
      if (sellerId) {
        searchQuery.sellerId = sellerId;
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(",").map(tag => tag.trim());
        searchQuery.tags = { $in: tagArray };
      }

      // Build sort options
      let sortOptions = {};
      if (sortBy === "relevance" && q) {
        // Use text score for relevance when there's a search query
        searchQuery.$text = { $search: q };
        sortOptions = { score: { $meta: "textScore" } };
      } else {
        switch (sortBy) {
          case "price":
            sortOptions.price = sortOrder === "asc" ? 1 : -1;
            break;
          case "name":
            sortOptions.name = sortOrder === "asc" ? 1 : -1;
            break;
          case "rating":
            sortOptions.rating = sortOrder === "asc" ? 1 : -1;
            break;
          case "soldCount":
            sortOptions.soldCount = sortOrder === "asc" ? 1 : -1;
            break;
          case "createdAt":
            sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
            break;
          default:
            sortOptions.createdAt = -1; // Default sort by newest
        }
      }

      // Execute search with aggregation for better performance
      const aggregationPipeline = [
        { $match: searchQuery },
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
            pipeline: [{ $project: { storeName: 1, rating: 1, isVerified: 1 } }]
          }
        },
        { $unwind: "$seller" },
        {
          $addFields: {
            // Add calculated fields for better sorting/filtering
            discountPercentage: {
              $cond: {
                if: { $and: [{ $gt: ["$originalPrice", 0] }, { $lt: ["$price", "$originalPrice"] }] },
                then: { $multiply: [{ $divide: [{ $subtract: ["$originalPrice", "$price"] }, "$originalPrice"] }, 100] },
                else: 0
              }
            },
            isOnSale: {
              $cond: {
                if: { $and: [{ $gt: ["$originalPrice", 0] }, { $lt: ["$price", "$originalPrice"] }] },
                then: true,
                else: false
              }
            }
          }
        },
        { $sort: sortOptions },
        {
          $facet: {
            products: [
              { $skip: (page - 1) * limit },
              { $limit: parseInt(limit) },
              {
                $project: {
                  name: 1,
                  description: 1,
                  price: 1,
                  originalPrice: 1,
                  discountPercentage: 1,
                  isOnSale: 1,
                  image: 1,
                  images: 1,
                  category: 1,
                  tags: 1,
                  rating: 1,
                  reviewCount: 1,
                  stock: 1,
                  soldCount: 1,
                  isInStock: { $gt: ["$stock", 0] },
                  seller: 1,
                  createdAt: 1
                }
              }
            ],
            totalCount: [{ $count: "count" }],
            facets: [
              {
                $group: {
                  _id: null,
                  categories: { $addToSet: "$category" },
                  priceRange: {
                    $push: {
                      min: { $min: "$price" },
                      max: { $max: "$price" }
                    }
                  },
                  sellers: { $addToSet: { id: "$sellerId", name: "$seller.storeName" } },
                  tags: { $addToSet: "$tags" }
                }
              }
            ]
          }
        }
      ];

      const results = await Product.aggregate(aggregationPipeline);
      const products = results[0].products;
      const totalCount = results[0].totalCount[0]?.count || 0;
      const facets = results[0].facets[0] || {};

      // Get suggested search terms if no results
      let suggestions = [];
      if (totalCount === 0 && q) {
        suggestions = await getSuggestions(q);
      }

      res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: parseInt(limit),
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1
          },
          filters: {
            categories: facets.categories || [],
            priceRange: {
              min: Math.min(...(facets.priceRange || []).map(p => p.min)),
              max: Math.max(...(facets.priceRange || []).map(p => p.max))
            },
            sellers: facets.sellers || [],
            availableTags: [].concat(...(facets.tags || [])).filter((tag, index, arr) => arr.indexOf(tag) === index)
          },
          searchInfo: {
            query: q,
            appliedFilters: {
              category,
              priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
              inStock,
              sellerId,
              tags
            },
            sortBy,
            sortOrder,
            suggestions
          }
        }
      });
    } catch (error) {
      console.error("Product search error:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: error.message,
      });
    }
  }
);

// Search sellers
router.get(
  "/sellers",
  [
    query("q").optional().isString().withMessage("Search query must be a string"),
    query("location").optional().isString().withMessage("Location must be a string"),
    query("verified").optional().isBoolean().withMessage("Verified must be boolean"),
    query("minRating").optional().isNumeric().withMessage("Min rating must be a number"),
    query("sortBy").optional().isIn(["name", "rating", "totalProducts", "totalSales"]).withMessage("Invalid sort field"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Limit must be between 1 and 20"),
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

      const {
        q,
        location,
        verified,
        minRating,
        sortBy = "rating",
        page = 1,
        limit = 10
      } = req.query;

      let searchQuery = { status: "active" };

      // Text search
      if (q) {
        searchQuery.$or = [
          { storeName: { $regex: q, $options: "i" } },
          { businessAddress: { $regex: q, $options: "i" } }
        ];
      }

      // Location filter
      if (location) {
        searchQuery.businessAddress = { $regex: location, $options: "i" };
      }

      // Verified filter
      if (verified !== undefined) {
        searchQuery.isVerified = verified === "true";
      }

      // Rating filter
      if (minRating) {
        searchQuery.rating = { $gte: parseFloat(minRating) };
      }

      // Sort options
      let sortOptions = {};
      switch (sortBy) {
        case "name":
          sortOptions.storeName = 1;
          break;
        case "rating":
          sortOptions.rating = -1;
          break;
        case "totalProducts":
          sortOptions.totalProducts = -1;
          break;
        case "totalSales":
          sortOptions.totalRevenue = -1;
          break;
        default:
          sortOptions.rating = -1;
      }

      const sellers = await Seller.find(searchQuery)
        .select("storeName businessAddress rating reviewCount totalProducts totalRevenue isVerified createdAt")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalCount = await Seller.countDocuments(searchQuery);

      res.status(200).json({
        success: true,
        message: "Seller search completed successfully",
        data: {
          sellers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error("Seller search error:", error);
      res.status(500).json({
        success: false,
        message: "Seller search failed",
        error: error.message,
      });
    }
  }
);

// Get search suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters long"
      });
    }

    const suggestions = await getSuggestions(q);

    res.status(200).json({
      success: true,
      message: "Suggestions retrieved successfully",
      data: {
        suggestions,
        query: q
      }
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get suggestions",
      error: error.message,
    });
  }
});

// Get popular search terms
router.get("/popular", async (req, res) => {
  try {
    // Get popular categories
    const popularCategories = await Product.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { term: "$_id", type: "category", count: 1 } }
    ]);

    // Get popular tags
    const popularTags = await Product.aggregate([
      { $match: { status: "active" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { term: "$_id", type: "tag", count: 1 } }
    ]);

    // Get trending products (most sold recently)
    const trendingProducts = await Product.find({
      status: "active",
      soldCount: { $gt: 0 }
    })
      .select("name soldCount")
      .sort({ soldCount: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Popular search terms retrieved successfully",
      data: {
        categories: popularCategories,
        tags: popularTags,
        trending: trendingProducts.map(p => ({ term: p.name, type: "product", count: p.soldCount }))
      }
    });
  } catch (error) {
    console.error("Popular search terms error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popular search terms",
      error: error.message,
    });
  }
});

// Helper function to get search suggestions
async function getSuggestions(query) {
  try {
    const regex = new RegExp(query, "i");

    // Get product name suggestions
    const productSuggestions = await Product.find({
      status: "active",
      name: { $regex: regex }
    })
      .select("name")
      .limit(5);

    // Get category suggestions
    const categorySuggestions = await Product.distinct("category", {
      status: "active",
      category: { $regex: regex }
    });

    // Get tag suggestions
    const tagSuggestions = await Product.distinct("tags", {
      status: "active",
      tags: { $regex: regex }
    });

    return [
      ...productSuggestions.map(p => ({ text: p.name, type: "product" })),
      ...categorySuggestions.slice(0, 3).map(c => ({ text: c, type: "category" })),
      ...tagSuggestions.slice(0, 3).map(t => ({ text: t, type: "tag" }))
    ];
  } catch (error) {
    console.error("Get suggestions error:", error);
    return [];
  }
}

export default router;
