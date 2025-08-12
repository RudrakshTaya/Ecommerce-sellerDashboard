import { upload } from "../config/cloudinary.js";
import { asyncHandler } from "./errorHandler.js";

// Single image upload middleware
export const uploadSingle = (fieldName) => {
  return asyncHandler(async (req, res, next) => {
    const uploadSingleFile = upload.single(fieldName);

    uploadSingleFile(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size too large. Maximum size is 5MB.",
          });
        }

        if (err.message === "Only image files are allowed!") {
          return res.status(400).json({
            success: false,
            message: "Only image files are allowed.",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading file.",
        });
      }

      next();
    });
  });
};

// Multiple images upload middleware
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return asyncHandler(async (req, res, next) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount);

    uploadMultipleFiles(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size too large. Maximum size is 5MB per file.",
          });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed.`,
          });
        }

        if (err.message === "Only image files are allowed!") {
          return res.status(400).json({
            success: false,
            message: "Only image files are allowed.",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading files.",
        });
      }

      next();
    });
  });
};

// Middleware to handle image upload response
export const handleImageUpload = asyncHandler(async (req, res, next) => {
  if (req.file) {
    // Single file upload
    req.uploadedImage = {
      url: req.file.path,
      public_id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    };
  } else if (req.files && req.files.length > 0) {
    // Multiple files upload
    req.uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));
  }

  next();
});

// Middleware to validate uploaded images
export const validateImages = (options = {}) => {
  const { required = false, minCount = 1, maxCount = 5 } = options;

  return (req, res, next) => {
    const hasFiles = req.file || (req.files && req.files.length > 0);

    if (required && !hasFiles) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required.",
      });
    }

    if (req.files && req.files.length < minCount) {
      return res.status(400).json({
        success: false,
        message: `At least ${minCount} image(s) required.`,
      });
    }

    if (req.files && req.files.length > maxCount) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxCount} images allowed.`,
      });
    }

    next();
  };
};
