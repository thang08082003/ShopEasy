const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please specify discount type']
  },
  discountAmount: {
    type: Number,
    required: [true, 'Please add a discount amount']
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  appliedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  appliedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if coupon is valid
CouponSchema.methods.isValid = function(orderAmount) {
  const now = new Date();
  
  // Check if coupon is active and within date range
  if (!this.isActive || now < this.startDate || now > this.endDate) {
    return false;
  }
  
  // Check if usage limit reached
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return false;
  }
  
  // Check minimum purchase amount
  if (orderAmount < this.minPurchase) {
    return false;
  }
  
  return true;
};

// Calculate discount amount
CouponSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid(orderAmount)) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = orderAmount * (this.discountAmount / 100);
    
    // Apply max discount if set
    if (this.maxDiscount !== null && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = this.discountAmount;
    
    // Don't allow discount greater than order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }
  }
  
  return discount;
};

module.exports = mongoose.model('Coupon', CouponSchema);
