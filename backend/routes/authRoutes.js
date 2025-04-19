const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middlewares/validation');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

// Ensure this route is properly defined
router.put('/change-password', protect, authController.changePassword);

// Admin routes
router.put('/promote/:id', protect, authorize('admin'), authController.promoteToAdmin);

module.exports = router;
