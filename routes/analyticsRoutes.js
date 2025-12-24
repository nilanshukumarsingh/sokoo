const express = require('express');
const router = express.Router();
const { getVendorAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
