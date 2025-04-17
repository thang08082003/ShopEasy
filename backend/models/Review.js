const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and update product
ReviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': stats.length > 0 ? stats[0].avgRating : 0,
      'ratings.count': stats.length > 0 ? stats[0].numReviews : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call calculateAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating before remove
ReviewSchema.pre('deleteOne', { document: true }, function() {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
