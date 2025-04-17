const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// All dashboard routes require admin access
router.use(protect, authorize('admin'));

router.get('/summary', getDashboardSummary);

module.exports = router;
