import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { realTimeService } from "./services/realTimeService.js";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import analyticsRoutes from "./routes/analytics.js";
import uploadRoutes from "./routes/upload.js";
import testRoutes from "./routes/test.js";
import adminRoutes from "./routes/admin.js";
import publicRoutes from "./routes/public.js";
import customerAuthRoutes from "./routes/customer-auth.js";
import customerOrderRoutes from "./routes/customer-orders.js";
import mockDataRoutes from "./routes/mock-data.js";
import paymentRoutes from "./routes/payments.js";
import inventoryRoutes from "./routes/inventory.js";
import notificationRoutes from "./routes/notifications.js";
import advancedAnalyticsRoutes from "./routes/advanced-analytics.js";
import orderTrackingRoutes from "./routes/order-tracking.js";
import searchRoutes from "./routes/search.js";
import reviewRoutes from "./routes/reviews.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration - Updated to allow marketplace frontend
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:8080",
    "http://localhost:3001", // Marketplace frontend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Ecommerce Multi-Platform Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      seller_dashboard: process.env.FRONTEND_URL || "http://localhost:8080",
      marketplace: "http://localhost:3001",
      backend: `http://localhost:${process.env.PORT || 5000}`,
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);                    // Seller authentication
app.use("/api/products", productRoutes);             // Seller products management
app.use("/api/orders", orderRoutes);                 // Seller orders management
app.use("/api/analytics", analyticsRoutes);          // Seller analytics
app.use("/api/upload", uploadRoutes);                // File uploads
app.use("/api/test", testRoutes);                    // Testing endpoints
app.use("/api/admin", adminRoutes);                  // Admin endpoints
app.use("/api/public", publicRoutes);                // Public marketplace endpoints
app.use("/api/mock", mockDataRoutes);                 // Mock data for testing
app.use("/api/customer-auth", customerAuthRoutes);   // Customer authentication
app.use("/api/customer-orders", customerOrderRoutes); // Customer orders
app.use("/api/payments", paymentRoutes);              // Payment processing
app.use("/api/inventory", inventoryRoutes);            // Inventory management
app.use("/api/notifications", notificationRoutes);      // Notification system
app.use("/api/advanced-analytics", advancedAnalyticsRoutes); // Advanced analytics
app.use("/api/order-tracking", orderTrackingRoutes);        // Real-time order tracking
app.use("/api/search", searchRoutes);                       // Advanced search functionality
app.use("/api/reviews", reviewRoutes);                      // Review and rating system

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize real-time service
realTimeService.initialize(server);

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
  console.log(`📊 API Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Seller Dashboard: ${process.env.FRONTEND_URL || "http://localhost:8080"}`);
  console.log(`🛍️ Customer Marketplace: http://localhost:3001`);
  console.log(`\n📋 Available API Endpoints:`);
  console.log(`   • Seller Auth: /api/auth/*`);
  console.log(`   • Seller Products: /api/products/*`);
  console.log(`   • Seller Orders: /api/orders/*`);
  console.log(`   • Customer Auth: /api/customer-auth/*`);
  console.log(`   • Customer Orders: /api/customer-orders/*`);
  console.log(`   • Public Products: /api/public/*`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Promise Rejection! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
