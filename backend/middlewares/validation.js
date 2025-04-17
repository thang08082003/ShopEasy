const { validationResult, check } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

// User validation rules
exports.registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Product validation rules
exports.productValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price must be a positive number').isFloat({ min: 0 }),
  check('category', 'Category is required').not().isEmpty(),
  check('stock', 'Stock must be a non-negative number').isInt({ min: 0 })
];

// Category validation rules
exports.categoryValidation = [
  check('name', 'Name is required').not().isEmpty()
];

// Review validation rules
exports.reviewValidation = [
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment is required').not().isEmpty()
];

// Order validation rules
exports.orderValidation = [
  check('shippingAddress', 'Shipping address is required').not().isEmpty(),
  check('shippingAddress.street', 'Street is required').not().isEmpty(),
  check('shippingAddress.city', 'City is required').not().isEmpty(),
  check('shippingAddress.state', 'State is required').not().isEmpty(),
  check('shippingAddress.zipCode', 'Zip code is required').not().isEmpty(),
  check('shippingAddress.country', 'Country is required').not().isEmpty(),
  check('paymentMethod', 'Payment method is required').not().isEmpty()
];
