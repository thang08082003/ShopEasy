const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find()
    .populate('appliedCategories', 'name')
    .populate('appliedProducts', 'name');

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('appliedCategories', 'name')
    .populate('appliedProducts', 'name');

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    data: coupon
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  
  // Find coupon by code (case insensitive)
  const coupon = await Coupon.findOne({ 
    code: { $regex: new RegExp(`^${code}$`, 'i') }
  });
  
  if (!coupon) {
    return next(new ErrorResponse(`Invalid coupon code`, 404));
  }
  
  // Get user cart
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse(`Cart is empty`, 400));
  }
  
  // Check if coupon is valid
  if (!coupon.isValid(cart.totalAmount)) {
    return next(new ErrorResponse(`Coupon is expired or invalid for this order`, 400));
  }
  
  // Calculate discount
  const discount = coupon.calculateDiscount(cart.totalAmount);
  
  // Save coupon info to cart
  cart.coupon = {
    code: coupon.code,
    discountAmount: discount
  };
  
  // Recalculate cart total
  cart.discountedAmount = cart.totalAmount - discount;
  await cart.save();
  
  // Return cart with applied discount
  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images'
  });
  
  res.status(200).json({
    success: true,
    data: populatedCart,
    message: `Coupon applied successfully. You saved $${discount.toFixed(2)}!`
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/coupons/remove
// @access  Private
exports.removeCoupon = asyncHandler(async (req, res, next) => {
  // Get user cart
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }
  
  // Remove coupon info
  cart.coupon = undefined;
  cart.discountedAmount = undefined;
  await cart.save();
  
  // Return updated cart
  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images'
  });
  
  res.status(200).json({
    success: true,
    data: populatedCart,
    message: 'Coupon removed successfully'
  });
});
