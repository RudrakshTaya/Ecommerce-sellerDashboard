import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Customer auth middleware
const protectCustomer = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== "customer") {
        throw new Error("Invalid token type");
      }

      req.customer = await Customer.findById(decoded.id);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Generate JWT token for customer
const generateCustomerToken = (customerId) => {
  return jwt.sign(
    { id: customerId, type: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
};

// Validation middleware
const validateCustomerRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("phone")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please enter a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateCustomerLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// @desc    Register new customer
// @route   POST /api/customer-auth/register
// @access  Public
router.post(
  "/register",
  validateCustomerRegistration,
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

    const { name, email, phone, password, dateOfBirth, gender } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    // Check if phone is taken
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create customer
      const customer = await Customer.create({
        name,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        status: "active",
        source: "website",
        lastActiveDate: new Date(),
      });

      // Generate token
      const token = generateCustomerToken(customer._id);

      res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          dateOfBirth: customer.dateOfBirth,
          gender: customer.gender,
          addresses: customer.addresses,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          segment: customer.segment,
          preferences: customer.preferences,
        },
      });
    } catch (error) {
      console.error("Customer registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating customer account",
      });
    }
  }),
);

// @desc    Login customer
// @route   POST /api/customer-auth/login
// @access  Public
router.post(
  "/login",
  validateCustomerLogin,
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

    const { email, password } = req.body;

    try {
      // Find customer and include password
      const customer = await Customer.findOne({ email }).select("+password");

      if (!customer) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, customer.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if account is active
      if (customer.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Account is blocked. Please contact support.",
        });
      }

      // Update last active date
      customer.lastActiveDate = new Date();
      await customer.save();

      // Generate token
      const token = generateCustomerToken(customer._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          dateOfBirth: customer.dateOfBirth,
          gender: customer.gender,
          addresses: customer.addresses,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          segment: customer.segment,
          preferences: customer.preferences,
        },
      });
    } catch (error) {
      console.error("Customer login error:", error);
      res.status(500).json({
        success: false,
        message: "Error during login",
      });
    }
  }),
);

// @desc    Get current customer profile
// @route   GET /api/customer-auth/me
// @access  Private (Customer)
router.get(
  "/me",
  protectCustomer,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      customer: {
        id: req.customer._id,
        name: req.customer.name,
        email: req.customer.email,
        phone: req.customer.phone,
        dateOfBirth: req.customer.dateOfBirth,
        gender: req.customer.gender,
        addresses: req.customer.addresses,
        totalOrders: req.customer.totalOrders,
        totalSpent: req.customer.totalSpent,
        lastOrderDate: req.customer.lastOrderDate,
        averageOrderValue: req.customer.averageOrderValue,
        segment: req.customer.segment,
        preferences: req.customer.preferences,
        createdAt: req.customer.createdAt,
      },
    });
  }),
);

// @desc    Update customer profile
// @route   PUT /api/customer-auth/profile
// @access  Private (Customer)
router.put(
  "/profile",
  protectCustomer,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("phone")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Please enter a valid phone number"),
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

    const allowedUpdates = [
      "name",
      "phone",
      "dateOfBirth",
      "gender",
      "preferences",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    try {
      const customer = await Customer.findByIdAndUpdate(
        req.customer._id,
        updates,
        {
          new: true,
          runValidators: true,
        },
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          dateOfBirth: customer.dateOfBirth,
          gender: customer.gender,
          addresses: customer.addresses,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          segment: customer.segment,
          preferences: customer.preferences,
        },
      });
    } catch (error) {
      console.error("Customer profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      });
    }
  }),
);

// @desc    Add customer address
// @route   POST /api/customer-auth/addresses
// @access  Private (Customer)
router.post(
  "/addresses",
  protectCustomer,
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("pincode")
      .matches(/^[0-9]{6}$/)
      .withMessage("Valid pincode is required"),
    body("phone")
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Valid phone number is required"),
    body("type")
      .optional()
      .isIn(["home", "work", "other"])
      .withMessage("Invalid address type"),
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

    try {
      const customer = await Customer.findById(req.customer._id);

      // If this is the first address or marked as default, make it default
      const isDefault = customer.addresses.length === 0 || req.body.isDefault;

      // If setting as default, remove default from other addresses
      if (isDefault) {
        customer.addresses.forEach((addr) => (addr.isDefault = false));
      }

      const newAddress = {
        ...req.body,
        isDefault,
      };

      customer.addresses.push(newAddress);
      await customer.save();

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        address: customer.addresses[customer.addresses.length - 1],
      });
    } catch (error) {
      console.error("Add address error:", error);
      res.status(500).json({
        success: false,
        message: "Error adding address",
      });
    }
  }),
);

// @desc    Get customer addresses
// @route   GET /api/customer-auth/addresses
// @access  Private (Customer)
router.get(
  "/addresses",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const customer = await Customer.findById(req.customer._id);
      res.json({
        success: true,
        data: customer.addresses,
      });
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching addresses",
      });
    }
  }),
);

// @desc    Update customer address
// @route   PUT /api/customer-auth/addresses/:id
// @access  Private (Customer)
router.put(
  "/addresses/:id",
  protectCustomer,
  [
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("address")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Address cannot be empty"),
    body("city")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("City cannot be empty"),
    body("state")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("State cannot be empty"),
    body("pincode")
      .optional()
      .matches(/^[0-9]{6}$/)
      .withMessage("Valid pincode is required"),
    body("phone")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Valid phone number is required"),
    body("type")
      .optional()
      .isIn(["home", "work", "other"])
      .withMessage("Invalid address type"),
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

    try {
      const customer = await Customer.findById(req.customer._id);
      const address = customer.addresses.id(req.params.id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      Object.assign(address, req.body);
      await customer.save();

      res.json({
        success: true,
        message: "Address updated successfully",
        data: address,
      });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating address",
      });
    }
  }),
);

// @desc    Delete customer address
// @route   DELETE /api/customer-auth/addresses/:id
// @access  Private (Customer)
router.delete(
  "/addresses/:id",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const customer = await Customer.findById(req.customer._id);
      const address = customer.addresses.id(req.params.id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      address.remove();
      await customer.save();

      res.json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting address",
      });
    }
  }),
);

// @desc    Set default address
// @route   PUT /api/customer-auth/addresses/:id/default
// @access  Private (Customer)
router.put(
  "/addresses/:id/default",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const customer = await Customer.findById(req.customer._id);
      const address = customer.addresses.id(req.params.id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Remove default from all addresses
      customer.addresses.forEach((addr) => (addr.isDefault = false));

      // Set this address as default
      address.isDefault = true;
      await customer.save();

      res.json({
        success: true,
        message: "Default address updated successfully",
        data: address,
      });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({
        success: false,
        message: "Error setting default address",
      });
    }
  }),
);

// @desc    Get customer wishlist
// @route   GET /api/customer-auth/wishlist
// @access  Private (Customer)
router.get(
  "/wishlist",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const customer = await Customer.findById(req.customer._id).populate(
        "wishlist",
      );
      res.json({
        success: true,
        data: customer.wishlist || [],
      });
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching wishlist",
      });
    }
  }),
);

// @desc    Add product to wishlist
// @route   POST /api/customer-auth/wishlist
// @access  Private (Customer)
router.post(
  "/wishlist",
  protectCustomer,
  [body("productId").isMongoId().withMessage("Valid product ID is required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const customer = await Customer.findById(req.customer._id);

      if (!customer.wishlist.includes(req.body.productId)) {
        customer.wishlist.push(req.body.productId);
        await customer.save();
      }

      res.json({
        success: true,
        message: "Product added to wishlist",
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Error adding to wishlist",
      });
    }
  }),
);

// @desc    Remove product from wishlist
// @route   DELETE /api/customer-auth/wishlist/:productId
// @access  Private (Customer)
router.delete(
  "/wishlist/:productId",
  protectCustomer,
  asyncHandler(async (req, res) => {
    try {
      const customer = await Customer.findById(req.customer._id);
      customer.wishlist = customer.wishlist.filter(
        (productId) => productId.toString() !== req.params.productId,
      );
      await customer.save();

      res.json({
        success: true,
        message: "Product removed from wishlist",
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Error removing from wishlist",
      });
    }
  }),
);

// @desc    Change customer password
// @route   PUT /api/customer-auth/change-password
// @access  Private (Customer)
router.put(
  "/change-password",
  protectCustomer,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
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

    const { currentPassword, newPassword } = req.body;

    try {
      // Get customer with password
      const customer = await Customer.findById(req.customer._id).select(
        "+password",
      );

      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        customer.password,
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(newPassword, salt);
      await customer.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Error changing password",
      });
    }
  }),
);

// @desc    Logout customer (client-side token removal)
// @route   POST /api/customer-auth/logout
// @access  Private (Customer)
router.post(
  "/logout",
  protectCustomer,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }),
);

export { protectCustomer };
export default router;
