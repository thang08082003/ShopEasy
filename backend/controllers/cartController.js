const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price images stock'
    });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { items: [], totalAmount: 0 }
    });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addItemToCart = asyncHandler(async (req, res, next) => {
  const { product: productId, quantity } = req.body;

  // Check if product exists and has enough stock
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse(`Product has insufficient stock`, 400));
  }

  // Get user's cart or create new one
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
      totalAmount: 0
    });
  }

  // Check if product already in cart
  const itemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Product exists in cart, update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Product not in cart, add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.salePrice > 0 ? product.salePrice : product.price
    });
  }

  // Recalculate total and save
  cart.calculateTotal();
  await cart.save();

  // Return cart with populated product details
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images'
  });

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const itemId = req.params.id;

  // Find user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }

  // Find the item in cart
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    return next(new ErrorResponse(`Item not found in cart`, 404));
  }

  // Check product stock
  const product = await Product.findById(cart.items[itemIndex].product);
  
  if (product && quantity > product.stock) {
    return next(new ErrorResponse(`Requested quantity exceeds available stock`, 400));
  }

  // Update quantity or remove if quantity <= 0
  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  // Recalculate and save
  cart.calculateTotal();
  await cart.save();

  // Return updated cart with populated product details
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images'
  });

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;

  // Find user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }

  // Find and remove item
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    return next(new ErrorResponse(`Item not found in cart`, 404));
  }

  cart.items.splice(itemIndex, 1);
  
  // Recalculate and save
  cart.calculateTotal();
  await cart.save();

  // Return updated cart
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images'
  });

  res.status(200).json({
    success: true,
    data: cart
  });
});
