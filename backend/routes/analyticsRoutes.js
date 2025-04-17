const express = require('express');
const {
  getSalesAnalytics,
  getUserAnalytics,
  getInventoryAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// All analytics routes require admin access
router.use(protect, authorize('admin'));

router.get('/sales', getSalesAnalytics);
router.get('/users', getUserAnalytics);
router.get('/inventory', getInventoryAnalytics);

module.exports = router;
