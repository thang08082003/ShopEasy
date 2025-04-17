const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// All order routes require authentication
router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router
  .route('/:id')
  .get(getOrder)
  .put(authorize('admin'), updateOrderStatus)
  .delete(cancelOrder);

module.exports = router;
