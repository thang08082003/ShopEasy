const express = require('express');
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  removeCoupon
} = require('../controllers/couponController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.post('/apply', protect, applyCoupon);
router.delete('/remove', protect, removeCoupon);

// Admin only routes
router
  .route('/')
  .get(protect, authorize('admin'), getCoupons)
  .post(protect, authorize('admin'), createCoupon);

router
  .route('/:id')
  .get(protect, authorize('admin'), getCoupon)
  .put(protect, authorize('admin'), updateCoupon)
  .delete(protect, authorize('admin'), deleteCoupon);

module.exports = router;
