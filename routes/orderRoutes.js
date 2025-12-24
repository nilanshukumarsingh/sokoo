const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getVendorOrders,
    getOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorOrders);
router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
