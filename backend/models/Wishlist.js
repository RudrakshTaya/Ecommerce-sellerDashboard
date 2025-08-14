import mongoose from 'mongoose';

const WishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notifyOnSale: {
    type: Boolean,
    default: false
  },
  notifyOnRestock: {
    type: Boolean,
    default: false
  },
  priceWhenAdded: {
    type: Number,
    required: true
  }
});

const WishlistSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  items: [WishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
WishlistSchema.index({ customerId: 1 });
WishlistSchema.index({ lastModified: -1 });
WishlistSchema.index({ 'items.productId': 1 });

// Pre-save middleware to calculate totals
WishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.lastModified = new Date();
  next();
});

// Method to add item to wishlist
WishlistSchema.methods.addItem = function(productId, price, notifyOnSale = false, notifyOnRestock = false) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    // Item already exists, update notification preferences
    this.items[existingItemIndex].notifyOnSale = notifyOnSale;
    this.items[existingItemIndex].notifyOnRestock = notifyOnRestock;
    return false; // Not added, already exists
  } else {
    // Add new item
    this.items.push({
      productId,
      priceWhenAdded: price,
      notifyOnSale,
      notifyOnRestock
    });
    return true; // Added successfully
  }
};

// Method to remove item from wishlist
WishlistSchema.methods.removeItem = function(productId) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );

  if (itemIndex >= 0) {
    this.items.splice(itemIndex, 1);
    return true;
  }
  return false;
};

// Method to check if item exists in wishlist
WishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(
    item => item.productId.toString() === productId.toString()
  );
};

// Method to clear entire wishlist
WishlistSchema.methods.clear = function() {
  this.items = [];
};

// Method to toggle item in wishlist
WishlistSchema.methods.toggleItem = function(productId, price, notifyOnSale = false, notifyOnRestock = false) {
  if (this.hasItem(productId)) {
    this.removeItem(productId);
    return { action: 'removed', inWishlist: false };
  } else {
    this.addItem(productId, price, notifyOnSale, notifyOnRestock);
    return { action: 'added', inWishlist: true };
  }
};

// Static method to get or create wishlist for customer
WishlistSchema.statics.getOrCreateWishlist = async function(customerId) {
  let wishlist = await this.findOne({ customerId }).populate({
    path: 'items.productId',
    select: 'name price originalPrice image stock status rating reviewCount sellerId',
    populate: {
      path: 'sellerId',
      select: 'storeName'
    }
  });
  
  if (!wishlist) {
    wishlist = new this({ customerId });
    await wishlist.save();
    // Populate after creation
    wishlist = await this.findById(wishlist._id).populate({
      path: 'items.productId',
      select: 'name price originalPrice image stock status rating reviewCount sellerId',
      populate: {
        path: 'sellerId',
        select: 'storeName'
      }
    });
  }
  
  return wishlist;
};

// Static method to get items that went on sale
WishlistSchema.statics.getItemsOnSale = async function() {
  const wishlists = await this.find({
    'items.notifyOnSale': true
  }).populate('customerId', 'name email phone notificationPreferences')
    .populate('items.productId', 'name price originalPrice');

  const saleNotifications = [];

  wishlists.forEach(wishlist => {
    wishlist.items.forEach(item => {
      if (item.notifyOnSale && item.productId.price < item.priceWhenAdded) {
        saleNotifications.push({
          customer: wishlist.customerId,
          product: item.productId,
          originalPrice: item.priceWhenAdded,
          salePrice: item.productId.price,
          discount: ((item.priceWhenAdded - item.productId.price) / item.priceWhenAdded) * 100
        });
      }
    });
  });

  return saleNotifications;
};

// Static method to get items that are back in stock
WishlistSchema.statics.getItemsBackInStock = async function() {
  const wishlists = await this.find({
    'items.notifyOnRestock': true
  }).populate('customerId', 'name email phone notificationPreferences')
    .populate('items.productId', 'name stock status');

  const restockNotifications = [];

  wishlists.forEach(wishlist => {
    wishlist.items.forEach(item => {
      if (item.notifyOnRestock && item.productId.stock > 0 && item.productId.status === 'active') {
        restockNotifications.push({
          customer: wishlist.customerId,
          product: item.productId
        });
      }
    });
  });

  return restockNotifications;
};

export default mongoose.model('Wishlist', WishlistSchema);
