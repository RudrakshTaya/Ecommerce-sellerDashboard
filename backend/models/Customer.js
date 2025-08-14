import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include in queries by default
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    // Addresses
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Wishlist
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Order statistics
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: Date,
    averageOrderValue: {
      type: Number,
      default: 0,
    },

    // Customer segments
    segment: {
      type: String,
      enum: ["new", "regular", "vip", "inactive"],
      default: "new",
    },

    // Preferences
    preferences: {
      communication: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      categories: [String],
      brands: [String],
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    // Analytics
    source: String, // How customer found the store
    firstPurchaseDate: Date,
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create indexes
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ segment: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastOrderDate: -1 });

// Ensure _id is included in JSON output and transform to id for frontend compatibility
customerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret.password; // Never return password
    return ret;
  },
});

// Virtual for full name from first address
customerSchema.virtual("fullName").get(function () {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddr =
      this.addresses.find((addr) => addr.isDefault) || this.addresses[0];
    return `${defaultAddr.firstName} ${defaultAddr.lastName}`;
  }
  return this.name;
});

// Virtual for customer lifetime value
customerSchema.virtual("lifetimeValue").get(function () {
  return this.totalSpent;
});

// Method to update customer statistics
customerSchema.methods.updateStats = async function (orderValue) {
  this.totalOrders += 1;
  this.totalSpent += orderValue;
  this.lastOrderDate = new Date();
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  this.lastActiveDate = new Date();

  // Update segment based on spending
  if (this.totalSpent > 50000) {
    this.segment = "vip";
  } else if (this.totalOrders > 5) {
    this.segment = "regular";
  }

  if (!this.firstPurchaseDate) {
    this.firstPurchaseDate = new Date();
  }

  return this.save();
};

export default mongoose.model("Customer", customerSchema);
