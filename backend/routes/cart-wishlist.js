import express from "express";
import { body, validationResult } from "express-validator";
import { protect as verifyAuth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const router = express.Router();

// === CART ROUTES ===

// Get customer's cart
router.get("/cart", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const cart = await Cart.getOrCreateCart(customerId);

    // Filter out inactive products
    cart.items = cart.items.filter(
      (item) => item.productId && item.productId.status === "active",
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Add item to cart
router.post(
  "/cart/add",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("quantity")
      .isInt({ min: 1, max: 99 })
      .withMessage("Quantity must be between 1 and 99"),
    body("selectedVariant")
      .optional()
      .isObject()
      .withMessage("Selected variant must be an object"),
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

      const { productId, quantity, selectedVariant = {} } = req.body;
      const customerId = req.user.id;

      // Verify product exists and is active
      const product = await Product.findOne({
        _id: productId,
        status: "active",
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found or not available",
        });
      }

      // Check stock availability
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      // Get or create cart
      const cart = await Cart.getOrCreateCart(customerId);

      // Add item to cart
      cart.addItem(productId, quantity, product.price, selectedVariant);
      await cart.save();

      // Populate cart for response
      await cart.populate("items.productId", "name price image stock status");

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Update cart item quantity
router.put(
  "/cart/update",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("quantity")
      .isInt({ min: 0, max: 99 })
      .withMessage("Quantity must be between 0 and 99"),
    body("selectedVariant")
      .optional()
      .isObject()
      .withMessage("Selected variant must be an object"),
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

      const { productId, quantity, selectedVariant = {} } = req.body;
      const customerId = req.user.id;

      const cart = await Cart.findOne({ customerId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      // Update item quantity
      const updated = cart.updateItemQuantity(
        productId,
        quantity,
        selectedVariant,
      );
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      await cart.save();
      await cart.populate("items.productId", "name price image stock status");

      res.status(200).json({
        success: true,
        message:
          quantity > 0 ? "Cart updated successfully" : "Item removed from cart",
        data: cart,
      });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Remove item from cart
router.delete(
  "/cart/remove",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("selectedVariant")
      .optional()
      .isObject()
      .withMessage("Selected variant must be an object"),
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

      const { productId, selectedVariant = {} } = req.body;
      const customerId = req.user.id;

      const cart = await Cart.findOne({ customerId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const removed = cart.removeItem(productId, selectedVariant);
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      await cart.save();
      await cart.populate("items.productId", "name price image stock status");

      res.status(200).json({
        success: true,
        message: "Item removed from cart successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Clear entire cart
router.delete("/cart/clear", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.clear();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// === WISHLIST ROUTES ===

// Get customer's wishlist
router.get("/wishlist", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const wishlist = await Wishlist.getOrCreateWishlist(customerId);

    // Filter out inactive products
    wishlist.items = wishlist.items.filter(
      (item) => item.productId && item.productId.status === "active",
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Add item to wishlist
router.post(
  "/wishlist/add",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("notifyOnSale")
      .optional()
      .isBoolean()
      .withMessage("Notify on sale must be boolean"),
    body("notifyOnRestock")
      .optional()
      .isBoolean()
      .withMessage("Notify on restock must be boolean"),
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
        productId,
        notifyOnSale = false,
        notifyOnRestock = false,
      } = req.body;
      const customerId = req.user.id;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Get or create wishlist
      const wishlist = await Wishlist.getOrCreateWishlist(customerId);

      // Add item to wishlist
      const added = wishlist.addItem(
        productId,
        product.price,
        notifyOnSale,
        notifyOnRestock,
      );
      await wishlist.save();

      await wishlist.populate({
        path: "items.productId",
        select:
          "name price originalPrice image stock status rating reviewCount sellerId",
        populate: {
          path: "sellerId",
          select: "storeName",
        },
      });

      res.status(200).json({
        success: true,
        message: added
          ? "Item added to wishlist successfully"
          : "Item already in wishlist, preferences updated",
        data: wishlist,
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Remove item from wishlist
router.delete(
  "/wishlist/remove",
  verifyAuth,
  [body("productId").isMongoId().withMessage("Valid product ID is required")],
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

      const { productId } = req.body;
      const customerId = req.user.id;

      const wishlist = await Wishlist.findOne({ customerId });
      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: "Wishlist not found",
        });
      }

      const removed = wishlist.removeItem(productId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Item not found in wishlist",
        });
      }

      await wishlist.save();
      await wishlist.populate({
        path: "items.productId",
        select:
          "name price originalPrice image stock status rating reviewCount sellerId",
        populate: {
          path: "sellerId",
          select: "storeName",
        },
      });

      res.status(200).json({
        success: true,
        message: "Item removed from wishlist successfully",
        data: wishlist,
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Toggle item in wishlist
router.post(
  "/wishlist/toggle",
  verifyAuth,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("notifyOnSale")
      .optional()
      .isBoolean()
      .withMessage("Notify on sale must be boolean"),
    body("notifyOnRestock")
      .optional()
      .isBoolean()
      .withMessage("Notify on restock must be boolean"),
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
        productId,
        notifyOnSale = false,
        notifyOnRestock = false,
      } = req.body;
      const customerId = req.user.id;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Get or create wishlist
      const wishlist = await Wishlist.getOrCreateWishlist(customerId);

      // Toggle item in wishlist
      const result = wishlist.toggleItem(
        productId,
        product.price,
        notifyOnSale,
        notifyOnRestock,
      );
      await wishlist.save();

      await wishlist.populate({
        path: "items.productId",
        select:
          "name price originalPrice image stock status rating reviewCount sellerId",
        populate: {
          path: "sellerId",
          select: "storeName",
        },
      });

      res.status(200).json({
        success: true,
        message: `Item ${result.action} ${result.action === "added" ? "to" : "from"} wishlist successfully`,
        data: {
          wishlist,
          action: result.action,
          inWishlist: result.inWishlist,
        },
      });
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Check if item is in wishlist
router.get("/wishlist/check/:productId", verifyAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;

    const wishlist = await Wishlist.findOne({ customerId });
    const inWishlist = wishlist ? wishlist.hasItem(productId) : false;

    res.status(200).json({
      success: true,
      message: "Wishlist status checked successfully",
      data: {
        productId,
        inWishlist,
      },
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Clear entire wishlist
router.delete("/wishlist/clear", verifyAuth, async (req, res) => {
  try {
    const customerId = req.user.id;

    const wishlist = await Wishlist.findOne({ customerId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.clear();
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Move items from wishlist to cart
router.post(
  "/wishlist/move-to-cart",
  verifyAuth,
  [
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

      const { productIds } = req.body;
      const customerId = req.user.id;

      const [wishlist, cart] = await Promise.all([
        Wishlist.findOne({ customerId }),
        Cart.getOrCreateCart(customerId),
      ]);

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: "Wishlist not found",
        });
      }

      const moved = [];
      const failed = [];

      for (const productId of productIds) {
        const wishlistItem = wishlist.items.find(
          (item) => item.productId.toString() === productId,
        );

        if (wishlistItem) {
          // Get current product info
          const product = await Product.findById(productId);
          if (product && product.status === "active" && product.stock > 0) {
            // Add to cart
            cart.addItem(productId, 1, product.price);
            // Remove from wishlist
            wishlist.removeItem(productId);
            moved.push(productId);
          } else {
            failed.push({
              productId,
              reason: "Product not available or out of stock",
            });
          }
        } else {
          failed.push({ productId, reason: "Product not in wishlist" });
        }
      }

      await Promise.all([wishlist.save(), cart.save()]);

      // Populate for response
      await Promise.all([
        wishlist.populate({
          path: "items.productId",
          select:
            "name price originalPrice image stock status rating reviewCount sellerId",
          populate: {
            path: "sellerId",
            select: "storeName",
          },
        }),
        cart.populate("items.productId", "name price image stock status"),
      ]);

      res.status(200).json({
        success: true,
        message: `${moved.length} items moved to cart successfully`,
        data: {
          cart,
          wishlist,
          moved,
          failed,
        },
      });
    } catch (error) {
      console.error("Move to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

export default router;
