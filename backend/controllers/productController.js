const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products with advanced filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'price_min', 'price_max', 'rating', 'in_stock'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Parse the query
  let filterQuery = JSON.parse(queryStr);

  // Add price range filter if provided
  if (req.query.price_min || req.query.price_max) {
    filterQuery.price = {};
    if (req.query.price_min) filterQuery.price.$gte = Number(req.query.price_min);
    if (req.query.price_max) filterQuery.price.$lte = Number(req.query.price_max);
  }

  // Add rating filter if provided
  if (req.query.rating) {
    filterQuery['ratings.average'] = { $gte: Number(req.query.rating) };
  }

  // Add in-stock filter if provided
  if (req.query.in_stock === 'true') {
    filterQuery.stock = { $gt: 0 };
  }

  // Finding resource
  let query = Product.find(filterQuery);

  // Search functionality (text index search)
  if (req.query.search) {
    // Use text index if available 
    if (Product.schema.indexes().some(index => index[0]._id && index[0]._id.text)) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    } else {
      // Fallback to regex search if text index not available
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      });
    }
  }

  // Add relationship data
  query = query.populate('category');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(filterQuery);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    total,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
