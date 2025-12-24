const express = require('express');
const router = express.Router();
const {
    getShops,
    getShop,
    createShop,
    updateShop,
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(getShops)
    .post(protect, authorize('vendor', 'admin'), createShop);

router
    .route('/:id')
    .get(getShop)
    .put(protect, authorize('vendor', 'admin'), updateShop);

module.exports = router;
