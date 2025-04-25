const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrdersByPaymentStatus,
  getOrdersByDeliveryStatus,
  getOrdersByDate
} = require('../controllers/orderController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

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

router.get('/payment/:status', getOrdersByPaymentStatus);
router.get('/status/:status', getOrdersByDeliveryStatus);
router.get('/date/:startDate/:endDate', getOrdersByDate);

module.exports = router;
