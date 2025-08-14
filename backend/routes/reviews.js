import express from "express";
import { body, validationResult } from "express-validator";
import { verifyAuth } from "../middleware/auth.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";

const router = express.Router();

// Create a new review (Customer only)
router.post(
  "/",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("orderId").isMongoId().withMessage("Valid order ID is required"),
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .isLength({ min: 5, max: 100 })
      .withMessage("Title must be between 5 and 100 characters"),
    body("comment")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
    body("pros").optional().isArray().withMessage("Pros must be an array"),
    body("cons").optional().isArray().withMessage("Cons must be an array"),
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

      const { productId, orderId, rating, title, comment, pros, cons, images } =
        req.body;
      const customerId = req.user.id;

      // Verify order exists and belongs to customer
      const order = await Order.findOne({
        _id: orderId,
        customerId: customerId,
        status: { $in: ["delivered"] }, // Only allow reviews for delivered orders
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or not eligible for review (order must be delivered)",
        });
      }

      // Verify product is in the order
      const orderItem = order.items.find(
        (item) => item.productId.toString() === productId,
      );
      if (!orderItem) {
        return res.status(400).json({
          success: false,
          message: "Product not found in this order",
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        productId,
        customerId,
        orderId,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this product for this order",
        });
      }

      // Get product and seller info
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Create review
      const review = new Review({
        productId,
        customerId,
        orderId,
        sellerId: product.sellerId,
        rating,
        title,
        comment,
        pros: pros || [],
        cons: cons || [],
        images: images || [],
        verified: true, // Mark as verified since it's from a real purchase
      });

      await review.save();

      // Populate review data for response
      await review.populate([
        { path: "customerId", select: "name" },
        { path: "productId", select: "name" },
      ]);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "newest",
      rating,
      verified,
      withImages,
    } = req.query;

    // Build filter
    let filter = {
      productId,
      status: "approved",
    };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (verified === "true") {
      filter.verified = true;
    }

    if (withImages === "true") {
      filter["images.0"] = { $exists: true };
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      case "highest-rating":
        sortOptions.rating = -1;
        break;
      case "lowest-rating":
        sortOptions.rating = 1;
        break;
      case "most-helpful":
        sortOptions.helpful = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const reviews = await Review.find(filter)
      .populate("customerId", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments(filter);

    // Get rating summary
    const ratingSummary = await Review.getProductRatingSummary(productId);

    res.status(200).json({
      success: true,
      message: "Product reviews retrieved successfully",
      data: {
        reviews,
        summary: ratingSummary,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalItems: totalReviews,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get customer's reviews
router.get("/customer/my-reviews", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ customerId })
      .populate("productId", "name image")
      .populate("sellerId", "storeName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({ customerId });

    res.status(200).json({
      success: true,
      message: "Customer reviews retrieved successfully",
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalItems: totalReviews,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get customer reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get seller's reviews
router.get("/seller/my-reviews", verifyAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 10, rating } = req.query;

    let filter = { sellerId };
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const reviews = await Review.find(filter)
      .populate("customerId", "name")
      .populate("productId", "name image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments(filter);

    // Get seller rating summary
    const ratingSummary = await Review.aggregate([
      { $match: { sellerId: sellerId, status: "approved" } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Seller reviews retrieved successfully",
      data: {
        reviews,
        summary: ratingSummary[0] || { totalReviews: 0, averageRating: 0 },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalItems: totalReviews,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update review (Customer only - their own reviews)
router.put(
  "/:reviewId",
  verifyAuth,
  [
    body("rating")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .optional()
      .isLength({ min: 5, max: 100 })
      .withMessage("Title must be between 5 and 100 characters"),
    body("comment")
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
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

      const { reviewId } = req.params;
      const customerId = req.user.id;
      const updateData = req.body;

      const review = await Review.findOne({
        _id: reviewId,
        customerId: customerId,
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found or not authorized to edit",
        });
      }

      // Update review
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          review[key] = updateData[key];
        }
      });

      await review.save();

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Delete review (Customer only - their own reviews)
router.delete("/:reviewId", verifyAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      customerId: customerId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Mark review as helpful/unhelpful
router.post(
  "/:reviewId/helpful",
  verifyAuth,
  [body("helpful").isBoolean().withMessage("Helpful must be boolean")],
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

      const { reviewId } = req.params;
      const { helpful } = req.body;
      const customerId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Check if customer already voted
      const existingVoteIndex = review.helpfulVotes.findIndex(
        (vote) => vote.customerId.toString() === customerId,
      );

      if (existingVoteIndex >= 0) {
        // Update existing vote
        review.helpfulVotes[existingVoteIndex].helpful = helpful;
      } else {
        // Add new vote
        review.helpfulVotes.push({
          customerId,
          helpful,
        });
      }

      // Update helpful count
      review.helpful = review.helpfulVotes.filter(
        (vote) => vote.helpful,
      ).length;

      await review.save();

      res.status(200).json({
        success: true,
        message: "Vote recorded successfully",
        data: {
          helpful: review.helpful,
          helpfulPercentage: review.helpfulPercentage,
        },
      });
    } catch (error) {
      console.error("Mark helpful error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Seller response to review
router.post(
  "/:reviewId/response",
  verifyAuth,
  [
    body("message")
      .isLength({ min: 10, max: 500 })
      .withMessage("Response must be between 10 and 500 characters"),
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

      const { reviewId } = req.params;
      const { message } = req.body;
      const sellerId = req.user.id;

      const review = await Review.findOne({
        _id: reviewId,
        sellerId: sellerId,
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found or not authorized to respond",
        });
      }

      review.sellerResponse = {
        message,
        respondedAt: new Date(),
        respondedBy: sellerId,
      };

      await review.save();

      res.status(200).json({
        success: true,
        message: "Response added successfully",
        data: review.sellerResponse,
      });
    } catch (error) {
      console.error("Seller response error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Flag review for moderation
router.post(
  "/:reviewId/flag",
  verifyAuth,
  [
    body("reason")
      .isIn(["inappropriate", "spam", "fake", "offensive", "other"])
      .withMessage("Invalid flag reason"),
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

      const { reviewId } = req.params;
      const { reason } = req.body;
      const customerId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Check if customer already flagged this review
      const alreadyFlagged = review.flagged.flaggedBy.some(
        (flag) => flag.customerId.toString() === customerId,
      );

      if (alreadyFlagged) {
        return res.status(400).json({
          success: false,
          message: "You have already flagged this review",
        });
      }

      // Add flag
      review.flagged.flaggedBy.push({
        customerId,
        reason,
        flaggedAt: new Date(),
      });

      review.flagged.count += 1;
      if (!review.flagged.reasons.includes(reason)) {
        review.flagged.reasons.push(reason);
      }

      // Auto-moderate if too many flags
      if (review.flagged.count >= 5) {
        review.status = "flagged";
      }

      await review.save();

      res.status(200).json({
        success: true,
        message: "Review flagged successfully",
      });
    } catch (error) {
      console.error("Flag review error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get review statistics
router.get("/stats", async (req, res) => {
  try {
    const { productId, sellerId } = req.query;

    let matchFilter = { status: "approved" };
    if (productId) matchFilter.productId = productId;
    if (sellerId) matchFilter.sellerId = sellerId;

    const stats = await Review.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          verifiedReviews: {
            $sum: { $cond: ["$verified", 1, 0] },
          },
          reviewsWithImages: {
            $sum: { $cond: [{ $gt: [{ $size: "$images" }, 0] }, 1, 0] },
          },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
      {
        $addFields: {
          ratingBreakdown: {
            5: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 5] },
                },
              },
            },
            4: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 4] },
                },
              },
            },
            3: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 3] },
                },
              },
            },
            2: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 2] },
                },
              },
            },
            1: {
              $size: {
                $filter: {
                  input: "$ratingDistribution",
                  cond: { $eq: ["$$this", 1] },
                },
              },
            },
          },
          verificationRate: {
            $multiply: [
              { $divide: ["$verifiedReviews", "$totalReviews"] },
              100,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Review statistics retrieved successfully",
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        verifiedReviews: 0,
        reviewsWithImages: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verificationRate: 0,
      },
    });
  } catch (error) {
    console.error("Review stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
