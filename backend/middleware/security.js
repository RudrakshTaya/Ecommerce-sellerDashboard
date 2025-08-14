import rateLimit from "express-rate-limit";
import MongoStore from "rate-limit-mongo";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

// Enhanced rate limiting with different limits for different endpoints
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = "Too many requests, please try again later.",
    keyGenerator = null,
    skip = null,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator:
      keyGenerator ||
      ((req) => {
        // Use IP + User ID for authenticated users, just IP for anonymous
        const userId = req.user?.id || "";
        return `${req.ip}-${userId}`;
      }),
    skip: skip || (() => false),
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });
};

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: "Too many authentication attempts, please try again in 15 minutes.",
  keyGenerator: (req) => req.ip, // Only use IP for auth attempts
});

// Rate limiting for password reset
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: "Too many password reset attempts, please try again in 1 hour.",
  keyGenerator: (req) => req.ip,
});

// Rate limiting for API endpoints
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window for authenticated users
  message: "API rate limit exceeded, please try again later.",
});

// Rate limiting for search endpoints
export const searchRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: "Search rate limit exceeded, please slow down.",
});

// Rate limiting for order creation
export const orderRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 orders per 5 minutes
  message: "Too many orders placed, please wait before placing another order.",
});

// Rate limiting for review submissions
export const reviewRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: "Too many reviews submitted, please try again later.",
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;

    // Remove dangerous HTML tags and scripts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// SQL injection protection for MongoDB
export const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remove keys that start with $ or contain .
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }

      if (typeof value === "object") {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

// Request size limiting
export const requestSizeLimit = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get("content-length") || "0");
    const maxBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request entity too large. Maximum size is ${maxSize}.`,
      });
    }

    next();
  };
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // In development, allow all IPs
    if (process.env.NODE_ENV === "development") {
      return next();
    }

    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: "Access denied from this IP address.",
    });
  };
};

// Enhanced CORS headers
export const enhancedCORS = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader("X-Powered-By");

  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  // CSP header
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.razorpay.com; " +
      "frame-src https://api.razorpay.com;",
  );

  next();
};

// JWT token validation with enhanced security
export const validateJWT = (req, res, next) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is blacklisted (implement token blacklist in production)
    // This would require a Redis store or database table to track invalidated tokens

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Token validation failed",
      });
    }
  }
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script>/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /exec\s*\(/gi, // Code injection
  ];

  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const foundSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(requestString),
  );

  if (foundSuspicious) {
    console.warn("🚨 SECURITY ALERT:", {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
    });
  }

  // Log the request
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      ip: req.ip,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    if (foundSuspicious || res.statusCode >= 400) {
      console.warn("Security/Error Log:", logData);
    }
  });

  next();
};

// Password strength validator
export const validatePasswordStrength = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

// Email validation
export const validateEmail = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// Phone number validation
export const validatePhone = [
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];

// MongoDB ObjectId validation
export const validateObjectId = (field) => [
  body(field).isMongoId().withMessage(`${field} must be a valid ID`),
];

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// CSRF protection (for forms)
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for API endpoints in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};

// File upload security
export const secureFileUpload = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const files = req.files || [req.file];

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed.",
      });
    }

    if (file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  next();
};

export default {
  createRateLimiter,
  authRateLimit,
  passwordResetRateLimit,
  apiRateLimit,
  searchRateLimit,
  orderRateLimit,
  reviewRateLimit,
  sanitizeInput,
  mongoSanitize,
  requestSizeLimit,
  ipWhitelist,
  enhancedCORS,
  validateJWT,
  securityLogger,
  validatePasswordStrength,
  validateEmail,
  validatePhone,
  validateObjectId,
  handleValidationErrors,
  csrfProtection,
  secureFileUpload,
};
