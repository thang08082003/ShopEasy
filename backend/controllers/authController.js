const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('User not found with that email', 404));
  }

  // Instead of generating and sending a token, we now allow the email to be used for direct reset
  res.status(200).json({
    success: true,
    message: 'Email verified successfully, you can now reset your password',
    verified: true,
    email: req.body.email
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Find user by email instead of token
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new ErrorResponse('Invalid email address', 400));
  }
  
  // Update password
  user.password = password;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  console.log('Change password request received:', { userId: req.user.id });
  
  // Check if both passwords are provided
  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide both current and new password', 400));
  }

  try {
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    console.log('User found:', { userId: user._id, email: user.email });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if current password matches
    const isPasswordMatch = await user.matchPassword(currentPassword);
    
    if (!isPasswordMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // Direct DB update approach - bypassing Mongoose validation
    // Use this if the pre-save middleware isn't working
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly in database
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password updated successfully for user:', user.email);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in password update:', error);
    return next(new ErrorResponse(`Failed to update password: ${error.message}`, 500));
  }
});

// @desc    Promote user to admin role
// @route   PUT /api/auth/promote/:id
// @access  Private/Admin
exports.promoteToAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Update to admin role
  user.role = 'admin';
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.email} has been promoted to admin role`,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Helper function to get token and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};
