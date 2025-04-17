const express = require('express');
const { healthCheck, systemInfo } = require('../controllers/systemController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/health', healthCheck);
router.get('/info', protect, authorize('admin'), systemInfo);

module.exports = router;
