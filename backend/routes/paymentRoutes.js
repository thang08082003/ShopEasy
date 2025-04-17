const express = require('express');
const {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus
} = require('../controllers/paymentController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

// Special middleware to get raw body for stripe webhook
const stripeWebhookMiddleware = express.raw({ type: 'application/json' });

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/webhook', stripeWebhookMiddleware, handleWebhook);
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;
