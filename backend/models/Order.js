import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    // Store product details at time of order to handle product changes
    name: String,
    price: Number,
    image: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  customization: {
    text: String,
    color: String,
    size: String,
    image: String,
    additionalCost: {
      type: Number,
      default: 0
    }
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  }
});

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  // Items
  items: [orderItemSchema],
  
  // Seller (main seller for this order)
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  
  // Order status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed', 
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded'
    ],
    default: 'pending'
  },
  
  // Status history
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: String
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  
  // Addresses
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: addressSchema,
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: String,
  
  // Delivery
  deliveryMethod: {
    type: String,
    enum: ['standard', 'express', 'same_day'],
    default: 'standard'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Shipping
  trackingNumber: String,
  shippingPartner: String,
  
  // Cancellation/Return
  cancellationReason: String,
  returnReason: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  
  // Special instructions
  specialInstructions: String,
  giftMessage: String,
  
  // Ratings and reviews
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: String,
  
  // Analytics
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin'],
    default: 'web'
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Virtual for order ID
orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for full customer name
orderSchema.virtual('customerName').get(function() {
  if (this.customerInfo && this.customerInfo.name) {
    return this.customerInfo.name;
  }
  if (this.shippingAddress) {
    return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
  }
  return 'Unknown Customer';
});

// Virtual for days since order
orderSchema.virtual('daysSinceOrder').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order ID
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    // Generate order ID: ORD + timestamp + random 4 digits
    const timestamp = Date.now().toString();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `ORD${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Static method to get orders by seller with filters
orderSchema.statics.getBySellerWithFilters = function(sellerId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    search,
    sort = '-createdAt'
  } = options;

  const query = { sellerId };
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
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

  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('items.product', 'name price image sku')
    .populate('sellerId', 'storeName email')
    .exec();
};

// Method to update order status with history
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = 'system') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status changed from ${oldStatus} to ${newStatus}`,
    updatedBy
  });
  
  return this.save();
};

export default mongoose.model('Order', orderSchema);
