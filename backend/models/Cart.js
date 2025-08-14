import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  selectedVariant: {
    color: String,
    size: String,
    material: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Index for better query performance
CartSchema.index({ customerId: 1 });
CartSchema.index({ lastModified: -1 });

// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastModified = new Date();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset expiry
  next();
});

// Method to add item to cart
CartSchema.methods.addItem = function(productId, quantity, price, selectedVariant = {}) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString() && 
    JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity,
      price,
      selectedVariant
    });
  }
};

// Method to update item quantity
CartSchema.methods.updateItemQuantity = function(productId, quantity, selectedVariant = {}) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString() && 
    JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return true;
  }
  return false;
};

// Method to remove item from cart
CartSchema.methods.removeItem = function(productId, selectedVariant = {}) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString() && 
    JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
  );

  if (itemIndex >= 0) {
    this.items.splice(itemIndex, 1);
    return true;
  }
  return false;
};

// Method to clear entire cart
CartSchema.methods.clear = function() {
  this.items = [];
};

// Method to check if item exists in cart
CartSchema.methods.hasItem = function(productId, selectedVariant = {}) {
  return this.items.some(
    item => item.productId.toString() === productId.toString() && 
    JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
  );
};

// Static method to get or create cart for customer
CartSchema.statics.getOrCreateCart = async function(customerId) {
  let cart = await this.findOne({ customerId }).populate('items.productId', 'name price image stock status');
  
  if (!cart) {
    cart = new this({ customerId });
    await cart.save();
    // Populate after creation
    cart = await this.findById(cart._id).populate('items.productId', 'name price image stock status');
  }
  
  return cart;
};

export default mongoose.model('Cart', CartSchema);
