const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  promoteToAdmin
} = require('../controllers/authController');

const { protect, authorize } = require('../middlewares/auth');
const { registerValidation, loginValidation, validate } = require('../middlewares/validation');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

// Admin routes
router.put('/promote/:id', protect, authorize('admin'), promoteToAdmin);

module.exports = router;
