import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productSnapshot: {
    // Store product details at time of order to handle product changes
    name: String,
    price: Number,
    image: String,
    sku: String,
    category: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  selectedColor: String,
  selectedSize: String,
  customization: {
    text: String,
    color: String,
    size: String,
    image: String,
    additionalCost: {
      type: Number,
      default: 0,
    },
  },
  deliveryDays: {
    type: Number,
    default: 7,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
});

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    maxlength: [500, "Address cannot exceed 500 characters"],
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // Customer information
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerInfo: {
      name: String,
      email: String,
      phone: String,
    },

    // Items
    items: [orderItemSchema],

    // Seller (main seller for this order)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },

    // Status history
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: String,
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, "Shipping cost cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },

    // Addresses
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: addressSchema,

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentId: String,

    // Delivery
    estimatedDelivery: Date,
    actualDelivery: Date,

    // Shipping
    trackingNumber: String,
    shippingPartner: String,

    // Return/Cancellation
    returnRequest: {
      reason: String,
      requestedAt: Date,
      itemIds: [String],
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "processed"],
        default: "pending"
      }
    },
    cancellationReason: String,
    refundAmount: {
      type: Number,
      default: 0,
    },

    // Special instructions
    notes: String,
    giftMessage: String,

    // Analytics
    source: {
      type: String,
      enum: ["web", "mobile", "api", "admin"],
      default: "web",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.product": 1 });

// Ensure _id is included in JSON output and transform to id for frontend compatibility
orderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// Virtual for full customer name
orderSchema.virtual("customerName").get(function () {
  if (this.customerInfo && this.customerInfo.name) {
    return this.customerInfo.name;
  }
  if (this.shippingAddress) {
    return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
  }
  return "Unknown Customer";
});

// Virtual for days since order
orderSchema.virtual("daysSinceOrder").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    // Generate order number: ORD + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Static method to get orders by seller with filters
orderSchema.statics.getBySellerWithFilters = function (sellerId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    search,
    sort = "-createdAt",
  } = options;

  const query = { sellerId };

  if (status && status !== "all") {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customerInfo.name": { $regex: search, $options: "i" } },
      { "customerInfo.email": { $regex: search, $options: "i" } },
    ];
  }

  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("items.product", "name price image sku category")
    .populate("customerId", "name email phone segment totalOrders totalSpent")
    .populate("sellerId", "storeName email contactNumber")
    .exec();
};

// Method to update order status with history
orderSchema.methods.updateStatus = function (
  newStatus,
  note = "",
  updatedBy = "system",
) {
  const oldStatus = this.status;
  this.status = newStatus;

  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status changed from ${oldStatus} to ${newStatus}`,
    updatedBy,
  });

  return this.save();
};

export default mongoose.model("Order", orderSchema);
