import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sellerSchema = new mongoose.Schema(
  {
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
      select: false, // Don't include password in queries by default
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10,15}$/, "Please enter a valid contact number"],
    },
    businessAddress: {
      type: String,
      required: [true, "Business address is required"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    gstNumber: {
      type: String,
      sparse: true, // Allows multiple null values
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter a valid GST number",
      ],
    },
    bankDetails: {
      accountNumber: {
        type: String,
        select: false, // Sensitive information
      },
      ifscCode: {
        type: String,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"],
      },
      bankName: {
        type: String,
        maxlength: [100, "Bank name cannot exceed 100 characters"],
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Business metrics
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
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
sellerSchema.index({ email: 1 });
sellerSchema.index({ storeName: 1 });
sellerSchema.index({ isVerified: 1, status: 1 });

// Ensure _id is included in JSON output and transform to id for frontend compatibility
sellerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// Hash password before saving
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
sellerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
sellerSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      storeName: this.storeName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
};

// Generate password reset token
sellerSchema.methods.generateResetToken = function () {
  const resetToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET + this.password,
    { expiresIn: "1h" },
  );

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

export default mongoose.model("Seller", sellerSchema);
