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
  
  const { search, orderStatus, paymentStatus, page, limit } = req.query;
  
  const queryObj = {};
  
  if (req.user.role !== 'admin') {
    queryObj.user = req.user.id;
  }
  
  if (orderStatus) {
    queryObj.orderStatus = orderStatus;
  }
  
  if (paymentStatus) {
    queryObj.paymentStatus = paymentStatus;
  }
  
  if (search) {
    if (search.startsWith('#') && search.length > 1) {
      const orderId = search.substring(1);
      queryObj._id = { $regex: orderId, $options: 'i' };
    } else {
      queryObj._id = { $regex: search, $options: 'i' };
    }
  }
  
  query = Order.find(queryObj).populate({
    path: 'user',
    select: 'name email'
  });
  
  const currentPage = parseInt(page, 10) || 1;
  const limitPerPage = parseInt(limit, 10) || 10;
  const startIndex = (currentPage - 1) * limitPerPage;
  
  const total = await Order.countDocuments(queryObj);
  query = query.skip(startIndex).limit(limitPerPage).sort('-createdAt');
  
  const orders = await query;

  res.status(200).json({
    success: true,
    total,
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
  // Extract order data from request body
  const {
    shippingAddress,
    paymentMethod,
    shippingMethod,
    shippingFee,
    tax,
    discountAmount,
    coupon,
    couponCode,
    originalAmount,
    finalAmount
  } = req.body;

  // Get user's cart to get items
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  // Validate and prepare the discount amount - ensure it's a valid number
  const validDiscountAmount = typeof discountAmount === 'number' && !isNaN(discountAmount) 
    ? discountAmount 
    : 0;

  // Calculate total amount
  const totalAmount = cart.totalAmount;
  const grandTotal = Math.max(0, totalAmount - validDiscountAmount + tax + shippingFee);

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price
    })),
    shippingAddress,
    paymentMethod,
    shippingFee,
    tax,
    totalAmount,
    discountAmount: validDiscountAmount, // Use validated discount amount
    coupon,
    couponCode,
    grandTotal
  });

  // Empty user's cart
  cart.items = [];
  cart.totalAmount = 0;
  cart.discountedAmount = undefined;
  cart.coupon = undefined;
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

// @desc    Get orders by payment status
// @route   GET /api/orders/payment/:status
// @access  Private
exports.getOrdersByPaymentStatus = asyncHandler(async (req, res, next) => {
  const paymentStatus = req.params.status;
  
  // Validate payment status
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return next(new ErrorResponse(`Invalid payment status: ${paymentStatus}`, 400));
  }
  
  const queryObj = { paymentStatus };
  
  // If not admin, only get user's orders
  if (req.user.role !== 'admin') {
    queryObj.user = req.user.id;
  }
  
  const { page, limit } = req.query;
  const currentPage = parseInt(page, 10) || 1;
  const limitPerPage = parseInt(limit, 10) || 10;
  const startIndex = (currentPage - 1) * limitPerPage;
  
  const total = await Order.countDocuments(queryObj);
  
  const orders = await Order.find(queryObj)
    .populate({
      path: 'user',
      select: 'name email'
    })
    .skip(startIndex)
    .limit(limitPerPage)
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    total,
    count: orders.length,
    data: orders
  });
});

// @desc    Get orders by delivery status
// @route   GET /api/orders/status/:status
// @access  Private
exports.getOrdersByDeliveryStatus = asyncHandler(async (req, res, next) => {
  const orderStatus = req.params.status;
  
  // Validate order status
  const validOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validOrderStatuses.includes(orderStatus)) {
    return next(new ErrorResponse(`Invalid order status: ${orderStatus}`, 400));
  }
  
  const queryObj = { orderStatus };
  
  // If not admin, only get user's orders
  if (req.user.role !== 'admin') {
    queryObj.user = req.user.id;
  }
  
  const { page, limit } = req.query;
  const currentPage = parseInt(page, 10) || 1;
  const limitPerPage = parseInt(limit, 10) || 10;
  const startIndex = (currentPage - 1) * limitPerPage;
  
  const total = await Order.countDocuments(queryObj);
  
  const orders = await Order.find(queryObj)
    .populate({
      path: 'user',
      select: 'name email'
    })
    .skip(startIndex)
    .limit(limitPerPage)
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    total,
    count: orders.length,
    data: orders
  });
});

// @desc    Get orders by date range
// @route   GET /api/orders/date/:startDate/:endDate
// @access  Private
exports.getOrdersByDate = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.params;
  
  if (!startDate || !endDate) {
    return next(new ErrorResponse('Please provide both start and end dates', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Set to end of day
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new ErrorResponse('Invalid date format. Use YYYY-MM-DD', 400));
  }
  
  const queryObj = {
    createdAt: {
      $gte: start,
      $lte: end
    }
  };
  
  if (req.user.role !== 'admin') {
    queryObj.user = req.user.id;
  }
  
  const { page, limit } = req.query;
  const currentPage = parseInt(page, 10) || 1;
  const limitPerPage = parseInt(limit, 10) || 10;
  const startIndex = (currentPage - 1) * limitPerPage;
  
  const total = await Order.countDocuments(queryObj);
  
  const orders = await Order.find(queryObj)
    .populate({
      path: 'user',
      select: 'name email'
    })
    .skip(startIndex)
    .limit(limitPerPage)
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    total,
    count: orders.length,
    data: orders
  });
});
