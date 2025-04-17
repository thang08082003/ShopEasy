const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlist
} = require('../controllers/wishlistController');

const router = express.Router();

const { protect } = require('../middlewares/auth');

// All wishlist routes require authentication
router.use(protect);

router.route('/')
  .get(getWishlist)
  .put(updateWishlist);

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

module.exports = router;
