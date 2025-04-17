const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
    path: 'products',
    select: 'name price images description'
  });

  if (!wishlist) {
    // Create empty wishlist if not exists
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
  }

  // Find user wishlist or create new
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  // Check if product is already in wishlist
  if (wishlist.products.includes(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      data: wishlist
    });
  }

  // Add product to wishlist
  wishlist.products.push(productId);
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  // Return updated wishlist with populated product data
  wishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'products',
    select: 'name price images description'
  });

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  
  // Find user wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    return next(new ErrorResponse(`Wishlist not found`, 404));
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    product => product.toString() !== productId
  );
  
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  // Return updated wishlist with populated product data
  wishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'products',
    select: 'name price images description'
  });

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Update entire wishlist
// @route   PUT /api/wishlist
// @access  Private
exports.updateWishlist = asyncHandler(async (req, res, next) => {
  const { products } = req.body;
  
  if (!Array.isArray(products)) {
    return next(new ErrorResponse('Products must be an array of product IDs', 400));
  }

  // Validate that all products exist
  for (const productId of products) {
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }
  }

  // Find user's wishlist or create new one
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  // Update wishlist products
  wishlist.products = products;
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  // Return updated wishlist with populated product data
  wishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'products',
    select: 'name price images description'
  });

  res.status(200).json({
    success: true,
    data: wishlist
  });
});
