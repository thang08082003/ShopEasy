const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  // Get order details
  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${orderId}`, 404));
  }
  
  // Check if user is authorized to pay for this order
  if (order.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to process this payment', 401));
  }
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.grandTotal * 100), // Stripe expects amount in cents
    currency: 'usd',
    metadata: {
      orderId: order._id.toString(),
      userId: req.user.id
    }
  });

  // Update order with payment intent id
  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret
  });
});

// @desc    Handle payment webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return next(new ErrorResponse(`Webhook signature verification failed: ${err.message}`, 400));
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    
    // Update order status
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'completed';
      order.orderStatus = 'processing';
      order.updatedAt = Date.now();
      await order.save();
    }
  }

  res.status(200).json({ received: true });
});

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private
exports.getPaymentStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404));
  }
  
  // Ensure user has access to this order
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }
  
  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentIntentId: order.paymentIntentId || null
    }
  });
});
