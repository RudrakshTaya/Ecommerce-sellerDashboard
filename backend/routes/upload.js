import express from 'express';
import { uploadMultiple, uploadSingle, handleImageUpload } from '../middleware/upload.js';
import { uploadBase64Image, deleteImage } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
router.post('/single',
  protect,
  uploadSingle('image'),
  handleImageUpload,
  asyncHandler(async (req, res) => {
    if (!req.uploadedImage) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.uploadedImage.url,
        public_id: req.uploadedImage.public_id,
        size: req.uploadedImage.size,
        originalName: req.uploadedImage.originalName
      }
    });
  })
);

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple',
  protect,
  uploadMultiple('images', 10),
  handleImageUpload,
  asyncHandler(async (req, res) => {
    if (!req.uploadedImages || req.uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const uploadedImages = req.uploadedImages.map(img => ({
      url: img.url,
      public_id: img.public_id,
      size: img.size,
      originalName: img.originalName
    }));

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: uploadedImages
    });
  })
);

// @desc    Upload base64 image
// @route   POST /api/upload/base64
// @access  Private
router.post('/base64', protect, asyncHandler(async (req, res) => {
  const { imageData, folder = 'ecommerce-products' } = req.body;

  if (!imageData) {
    return res.status(400).json({
      success: false,
      message: 'Image data is required'
    });
  }

  try {
    const result = await uploadBase64Image(imageData, folder);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
}));

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Public ID is required'
    });
  }

  try {
    // Decode the public ID (in case it's URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteImage(decodedPublicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
}));

// @desc    Get image info
// @route   GET /api/upload/info/:publicId
// @access  Private
router.get('/info/:publicId', protect, asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Public ID is required'
    });
  }

  try {
    const { cloudinary } = await import('../config/cloudinary.js');
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await cloudinary.api.resource(decodedPublicId);

    res.json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        created_at: result.created_at,
        resource_type: result.resource_type
      }
    });

  } catch (error) {
    console.error('Get image info error:', error);
    
    if (error.http_code === 404) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching image info'
    });
  }
}));

export default router;
