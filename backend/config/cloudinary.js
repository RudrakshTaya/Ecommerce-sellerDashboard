import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
console.log("cloud",process.env.CLOUDINARY_CLOUD_NAME)
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  
});


// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce-products", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto:good",
        format: "auto",
      },
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `product-${timestamp}-${random}`;
    },
  },
});

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to generate optimized image URLs
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 800,
    quality = "auto:good",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop: "limit",
    quality,
    format,
    secure: true,
  });
};

// Helper function to upload base64 image
const uploadBase64Image = async (
  base64String,
  folder = "ecommerce-products",
) => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto:good",
          format: "auto",
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw error;
  }
};

export {
  cloudinary,
  upload,
  deleteImage,
  getOptimizedImageUrl,
  uploadBase64Image,
};
