const express = require('express');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { upload } = require('../middlewares/fileUpload');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// @desc    Upload product images
// @route   POST /api/upload/product
// @access  Private/Admin
router.post(
  '/product',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  asyncHandler(async (req, res) => {
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const files = req.files.map(file => {
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      data: files
    });
  })
);

// @desc    Upload user profile image
// @route   POST /api/upload/profile
// @access  Private
router.post(
  '/profile',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: file
    });
  })
);

module.exports = router;
