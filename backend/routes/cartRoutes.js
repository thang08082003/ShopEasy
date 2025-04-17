const express = require('express');
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

// All cart routes require authentication
router.use(protect);

router.route('/')
  .get(getCart);

router.route('/items')
  .post(addItemToCart);

router.route('/items/:id')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
