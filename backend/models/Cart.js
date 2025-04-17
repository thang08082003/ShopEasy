const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less than 1'],
        default: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  coupon: {
    code: String,
    discountAmount: Number
  },
  discountedAmount: {
    type: Number
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate total amount
CartSchema.methods.calculateTotal = function() {
  const total = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  this.totalAmount = total;
  
  // Recalculate discounted amount if coupon exists
  if (this.coupon && this.coupon.discountAmount) {
    this.discountedAmount = total - this.coupon.discountAmount;
  }
  
  return total;
};

// Calculate total before saving
CartSchema.pre('save', function(next) {
  this.calculateTotal();
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
