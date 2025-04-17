const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Include review router
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { productValidation, validate } = require('../middlewares/validation');

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), productValidation, validate, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
