import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },

    // Images
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    images: [
      {
        url: String,
        public_id: String, // Cloudinary public_id for deletion
        alt: String,
      },
    ],

    // Inventory
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },

    // Product attributes
    materials: [String],
    colors: [String],
    sizes: [String],
    tags: [String],

    // Flags
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    isDIY: {
      type: Boolean,
      default: false,
    },
    isInstagramPick: {
      type: Boolean,
      default: false,
    },
    isHandmade: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },

    // Shipping & delivery
    deliveryDays: {
      type: Number,
      required: [true, "Delivery days is required"],
      min: [1, "Delivery days must be at least 1"],
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
    },

    // Warranty
    warranty: {
      period: String,
      description: String,
      type: {
        type: String,
        enum: ["none", "manufacturer", "seller"],
        default: "none",
      },
    },

    // Return policy
    returnPolicy: {
      returnable: {
        type: Boolean,
        default: true,
      },
      period: String,
      conditions: [String],
    },

    // Dimensions
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: {
        type: String,
        enum: ["cm", "inches", "kg", "lbs"],
        default: "cm",
      },
    },

    // Care and sustainability
    careInstructions: [String],
    certifications: [String],
    sustainabilityInfo: String,

    // SEO
    seoTitle: String,
    seoDescription: String,

    // FAQ
    faq: [
      {
        question: String,
        answer: String,
      },
    ],

    // Seller reference
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // Review and rating
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    badges: [String],

    // Vendor info
    vendor: {
      name: String,
      location: String,
      rating: {
        type: Number,
        min: 0,
        max: 5,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "out_of_stock"],
      default: "active",
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create indexes
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ sku: 1 });
productSchema.index({ status: 1, inStock: 1 });
productSchema.index({ rating: -1, reviews: -1 });

// Ensure _id is included in JSON output and transform to id for frontend compatibility
productSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual("stockStatus").get(function () {
  if (this.stock === 0) return "out_of_stock";
  if (this.stock <= this.lowStockThreshold) return "low_stock";
  return "in_stock";
});

// Pre-save middleware to update inStock status
productSchema.pre("save", function (next) {
  this.inStock = this.stock > 0;
  next();
});

// Static method to get products by seller
productSchema.statics.getBySellerWithStats = function (sellerId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    status = "active",
    category,
    search,
  } = options;

  const query = { sellerId };

  if (status !== "all") {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("sellerId", "storeName rating")
    .exec();
};

export default mongoose.model("Product", productSchema);
