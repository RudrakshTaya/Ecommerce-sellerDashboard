import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect, requireVerified } from '../middleware/auth.js';
import { uploadMultiple, handleImageUpload, validateImages } from '../middleware/upload.js';
import { deleteImage } from '../config/cloudinary.js';

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('sku')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('deliveryDays')
    .isInt({ min: 1 })
    .withMessage('Delivery days must be at least 1'),
  body('origin')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Origin is required')
];

// @desc    Get all products for authenticated seller
// @route   GET /api/products
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['name', '-name', 'price', '-price', 'createdAt', '-createdAt', 'stock', '-stock']),
  query('status').optional().isIn(['active', 'inactive', 'draft', 'out_of_stock', 'all']),
  query('category').optional().trim(),
  query('search').optional().trim()
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status = 'active',
    category,
    search
  } = req.query;

  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      status,
      category,
      search
    };

    const products = await Product.getBySellerWithStats(req.seller.id, options);
    
    // Get total count for pagination
    const query = { sellerId: req.seller.id };
    if (status !== 'all') query.status = status;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
}));

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.seller._id
    }).populate('sellerId', 'storeName rating reviewCount');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
}));

// @desc    Create new product
// @route   POST /api/products
// @access  Private
router.post('/', 
  protect, 
  requireVerified,
  uploadMultiple('images', 5),
  handleImageUpload,
  validateImages({ required: false, maxCount: 5 }),
  validateProduct,
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }

      // Process uploaded images
      let images = [];
      let mainImage = '/placeholder.svg';

      if (req.uploadedImages && req.uploadedImages.length > 0) {
        images = req.uploadedImages.map(img => ({
          url: img.url,
          public_id: img.public_id,
          alt: req.body.name
        }));
        mainImage = images[0].url;
      }

      // Create product data
      const productData = {
        ...req.body,
        sellerId: req.seller._id,
        image: mainImage,
        images,
        sku: req.body.sku.toUpperCase(),
        inStock: parseInt(req.body.stock) > 0,
        
        // Process arrays from comma-separated strings
        materials: req.body.materials ? req.body.materials.split(',').map(m => m.trim()).filter(m => m) : [],
        colors: req.body.colors ? req.body.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        careInstructions: req.body.careInstructions ? req.body.careInstructions.split(',').map(c => c.trim()).filter(c => c) : [],
        certifications: req.body.certifications ? req.body.certifications.split(',').map(c => c.trim()).filter(c => c) : [],
        
        // Process warranty and return policy
        warranty: req.body.warrantyEnabled === 'true' ? {
          period: req.body.warrantyPeriod,
          description: req.body.warrantyDescription,
          type: req.body.warrantyType || 'none'
        } : undefined,
        
        returnPolicy: req.body.returnPolicyEnabled === 'true' ? {
          returnable: true,
          period: req.body.returnPeriod,
          conditions: req.body.returnConditions ? req.body.returnConditions.split(',').map(c => c.trim()).filter(c => c) : []
        } : undefined,
        
        // Process dimensions
        dimensions: req.body.dimensionsLength ? {
          length: parseFloat(req.body.dimensionsLength) || undefined,
          width: parseFloat(req.body.dimensionsWidth) || undefined,
          height: parseFloat(req.body.dimensionsHeight) || undefined,
          weight: parseFloat(req.body.dimensionsWeight) || undefined,
          unit: req.body.dimensionsUnit || 'cm'
        } : undefined,
        
        // Process FAQ
        faq: req.body.faqQuestions ? req.body.faqQuestions.map((question, index) => ({
          question: question,
          answer: req.body.faqAnswers[index] || ''
        })).filter(item => item.question && item.answer) : []
      };

      const product = await Product.create(productData);

      // Update seller's product count
      await Seller.findByIdAndUpdate(req.seller._id, {
        $inc: { totalProducts: 1 }
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });

    } catch (error) {
      console.error('Create product error:', error);
      
      // Clean up uploaded images if product creation fails
      if (req.uploadedImages) {
        req.uploadedImages.forEach(async (img) => {
          try {
            await deleteImage(img.public_id);
          } catch (deleteError) {
            console.error('Error deleting image:', deleteError);
          }
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error creating product'
      });
    }
  })
);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id',
  protect,
  requireVerified,
  uploadMultiple('newImages', 5),
  handleImageUpload,
  asyncHandler(async (req, res) => {
    try {
      // Find the product
      const product = await Product.findOne({
        _id: req.params.id,
        sellerId: req.seller._id
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Process new uploaded images
      let newImages = [];
      if (req.uploadedImages && req.uploadedImages.length > 0) {
        newImages = req.uploadedImages.map(img => ({
          url: img.url,
          public_id: img.public_id,
          alt: req.body.name || product.name
        }));
      }

      // Handle image updates
      let updatedImages = [...product.images];
      
      // Add new images
      if (newImages.length > 0) {
        updatedImages = [...updatedImages, ...newImages];
      }

      // Remove images if specified
      if (req.body.removeImages) {
        const removeIds = JSON.parse(req.body.removeImages);
        const imagesToRemove = updatedImages.filter(img => removeIds.includes(img.public_id));
        
        // Delete from Cloudinary
        for (const img of imagesToRemove) {
          try {
            await deleteImage(img.public_id);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
        
        updatedImages = updatedImages.filter(img => !removeIds.includes(img.public_id));
      }

      // Prepare update data
      const updateData = {
        ...req.body,
        images: updatedImages,
        image: updatedImages.length > 0 ? updatedImages[0].url : '/placeholder.svg',
        inStock: parseInt(req.body.stock || product.stock) > 0,
        
        // Process arrays from comma-separated strings
        materials: req.body.materials ? req.body.materials.split(',').map(m => m.trim()).filter(m => m) : product.materials,
        colors: req.body.colors ? req.body.colors.split(',').map(c => c.trim()).filter(c => c) : product.colors,
        sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()).filter(s => s) : product.sizes,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : product.tags,
        careInstructions: req.body.careInstructions ? req.body.careInstructions.split(',').map(c => c.trim()).filter(c => c) : product.careInstructions,
        certifications: req.body.certifications ? req.body.certifications.split(',').map(c => c.trim()).filter(c => c) : product.certifications
      };

      // Clean up undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product'
      });
    }
  })
);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.seller._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          await deleteImage(image.public_id);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    // Update seller's product count
    await Seller.findByIdAndUpdate(req.seller._id, {
      $inc: { totalProducts: -1 }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
}));

// @desc    Get product categories for seller
// @route   GET /api/products/categories
// @access  Private
router.get('/categories', protect, asyncHandler(async (req, res) => {
  try {
    const categories = await Product.distinct('category', { sellerId: req.seller.id });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
}));

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private
router.patch('/:id/status', protect, [
  body('status').isIn(['active', 'inactive', 'draft', 'out_of_stock']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.seller.id },
      { status: req.body.status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product status updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status'
    });
  }
}));

export default router;
