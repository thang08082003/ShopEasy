const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query;
  
  // If admin, get all orders, else just user's orders
  if (req.user.role === 'admin') {
    query = Order.find().populate({
      path: 'user',
      select: 'name email'
    });
  } else {
    query = Order.find({ user: req.user.id });
  }

  const orders = await query.sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'items.product',
    select: 'name images'
  });

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is order owner or admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this order`, 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    shippingAddress,
    paymentMethod,
    shippingFee,
    tax
  } = req.body;

  // Get user cart
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse(`Cart is empty`, 400));
  }

  // Create order with items from cart
  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    totalAmount: cart.totalAmount,
    discountAmount: cart.coupon ? (cart.totalAmount - cart.discountedAmount) : 0,
    couponCode: cart.coupon ? cart.coupon.code : null,
    // If coupon exists in cart and it has an _id, use it, otherwise leave it undefined
    coupon: cart.coupon && cart.coupon._id ? cart.coupon._id : undefined,
    shippingFee: shippingFee || 0,
    tax: tax || 0,
    grandTotal: (cart.discountedAmount || cart.totalAmount) + (shippingFee || 0) + (tax || 0)
  });

  // Update product stock
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock -= item.quantity;
      await product.save();
    }
  }

  // Clear user's cart
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update status fields if provided
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  
  order.updatedAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check ownership
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to cancel this order`, 401));
  }

  // Only allow cancellation if order is pending
  if (order.orderStatus !== 'pending') {
    return next(new ErrorResponse(`Cannot cancel order that has been processed`, 400));
  }

  // Return products to stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.orderStatus = 'cancelled';
  order.updatedAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});
