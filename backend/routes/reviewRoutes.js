const express = require('express');
const {
  getReviews,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middlewares/auth');

router
  .route('/')
  .get(getReviews)
  .post(protect, addReview);

router
  .route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
