import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect, requireVerified } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all orders for authenticated seller
// @route   GET /api/orders
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded', 'all']),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
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
    status = 'all',
    startDate,
    endDate,
    search,
    sort = '-createdAt'
  } = req.query;

  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate,
      search,
      sort
    };

    const orders = await Order.getBySellerWithFilters(req.seller._id, options);

    // Get total count for pagination
    const query = { sellerId: req.seller._id };
    if (status !== 'all') query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate summary statistics
    const stats = await Order.aggregate([
      { $match: { sellerId: req.seller._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'processing', 'packed']] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $in: ['$status', ['shipped', 'out_for_delivery']] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
}));

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      sellerId: req.seller._id
    })
    .populate('items.product', 'name price image sku category')
    .populate('customerId', 'name email phone segment totalOrders totalSpent')
    .populate('sellerId', 'storeName email contactNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
}));

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
router.patch('/:id/status', protect, requireVerified, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded']).withMessage('Invalid status'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
  body('trackingNumber').optional().trim()
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

  const { status, note, trackingNumber } = req.body;

  try {
    const order = await Order.findOne({
      _id: req.params.id,
      sellerId: req.seller._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['packed', 'cancelled'],
      'packed': ['shipped', 'cancelled'],
      'shipped': ['out_for_delivery', 'delivered'],
      'out_for_delivery': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': ['refunded'],
      'refunded': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update order status
    const updatedOrder = await order.updateStatus(
      status, 
      note || `Status updated to ${status}`,
      req.seller.storeName
    );

    // Add tracking number if provided
    if (trackingNumber && (status === 'shipped' || status === 'out_for_delivery')) {
      updatedOrder.trackingNumber = trackingNumber;
      await updatedOrder.save();
    }

    // Update delivery date if delivered
    if (status === 'delivered') {
      updatedOrder.actualDelivery = new Date();
      await updatedOrder.save();
    }

    // Update seller statistics
    if (status === 'delivered') {
      await Seller.findByIdAndUpdate(req.seller._id, {
        $inc: { 
          totalOrders: 1,
          totalRevenue: order.total
        }
      });

      // Update customer statistics
      if (order.customerId) {
        const customer = await Customer.findById(order.customerId);
        if (customer) {
          await customer.updateStats(order.total);
        }
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
}));

// @desc    Create new order (for testing or admin purposes)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, requireVerified, [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').matches(/^[0-9]{6}$/).withMessage('Valid pincode is required'),
  body('shippingAddress.phone').matches(/^[0-9]{10,15}$/).withMessage('Valid phone number is required'),
  body('paymentMethod').isIn(['cod', 'card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be positive')
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
    // Verify customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify all products exist and belong to the seller
    const productIds = req.body.items.map(item => item.product);
    const products = await Product.find({
      _id: { $in: productIds },
      sellerId: req.seller._id,
      status: 'active'
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found or not available'
      });
    }

    // Check stock availability
    for (const item of req.body.items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }
    }

    // Create order items with product snapshots
    const orderItems = req.body.items.map(item => {
      const product = products.find(p => p._id.toString() === item.product);
      return {
        ...item,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.image,
          sku: product.sku
        },
        sellerId: req.seller._id
      };
    });

    // Calculate estimated delivery date
    const maxDeliveryDays = Math.max(...products.map(p => p.deliveryDays));
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + maxDeliveryDays);

    // Create order
    const orderData = {
      ...req.body,
      items: orderItems,
      sellerId: req.seller._id,
      customerInfo: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      estimatedDelivery,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created',
        updatedBy: req.seller.storeName
      }]
    };

    const order = await Order.create(orderData);

    // Update product stock
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: -item.quantity,
          orders: 1
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
}));

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private
router.get('/analytics', protect, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], asyncHandler(async (req, res) => {
  const { period = '30d', startDate, endDate } = req.query;

  try {
    // Calculate date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (period !== 'all') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      dateFilter = {
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };
    }

    const matchQuery = { sellerId: req.seller._id, ...dateFilter };

    // Get comprehensive analytics
    const analytics = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: { $size: '$items' } },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get daily/weekly trends
    const trendPeriod = period === '7d' ? '$dayOfYear' : '$week';
    const trends = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            period: { [trendPeriod]: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.period': 1 } }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          productName: { $first: '$items.productSnapshot.name' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get payment method distribution
    const paymentMethods = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalItems: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        },
        trends,
        topProducts,
        paymentMethods
      }
    });

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics'
    });
  }
}));

export default router;
