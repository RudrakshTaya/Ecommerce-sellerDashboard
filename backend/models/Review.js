import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v * 2); // Allow half ratings (1, 1.5, 2, 2.5, etc.)
      },
      message: 'Rating must be in increments of 0.5'
    }
  },
  title: {
    type: String,
    required: true,
    maxLength: 100,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    maxLength: 1000,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: String,
    alt: String
  }],
  pros: [{
    type: String,
    maxLength: 200
  }],
  cons: [{
    type: String,
    maxLength: 200
  }],
  verified: {
    type: Boolean,
    default: false // Set to true if review is from verified purchase
  },
  helpful: {
    type: Number,
    default: 0 // Count of users who found this review helpful
  },
  helpfulVotes: [{
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    helpful: {
      type: Boolean,
      required: true
    }
  }],
  sellerResponse: {
    message: {
      type: String,
      maxLength: 500
    },
    respondedAt: {
      type: Date
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Auto-approve in demo, but can be moderated
  },
  flagged: {
    count: {
      type: Number,
      default: 0
    },
    reasons: [{
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    }],
    flaggedBy: [{
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      reason: String,
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  moderationNotes: {
    type: String,
    maxLength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1, createdAt: -1 });
ReviewSchema.index({ sellerId: 1, createdAt: -1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ verified: 1 });

// Compound index for preventing duplicate reviews
ReviewSchema.index({ productId: 1, customerId: 1, orderId: 1 }, { unique: true });

// Virtual for helpful percentage
ReviewSchema.virtual('helpfulPercentage').get(function() {
  const totalVotes = this.helpfulVotes.length;
  if (totalVotes === 0) return 0;
  const helpfulCount = this.helpfulVotes.filter(vote => vote.helpful).length;
  return Math.round((helpfulCount / totalVotes) * 100);
});

// Method to check if customer found review helpful
ReviewSchema.methods.isHelpfulToCustomer = function(customerId) {
  const vote = this.helpfulVotes.find(vote => vote.customerId.toString() === customerId.toString());
  return vote ? vote.helpful : null;
};

// Static method to get product rating summary
ReviewSchema.statics.getProductRatingSummary = async function(productId) {
  const summary = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingBreakdown: {
          5: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ]);

  return summary[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
};

// Pre-save middleware to update product rating
ReviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await updateProductRating(this.productId);
  }
});

ReviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'approved') {
    await updateProductRating(doc.productId);
  }
});

ReviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateProductRating(doc.productId);
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const Product = mongoose.model('Product');
    const Review = mongoose.model('Review');
    
    const ratingData = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const { averageRating = 0, reviewCount = 0 } = ratingData[0] || {};

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviewCount
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

export default mongoose.model('Review', ReviewSchema);
