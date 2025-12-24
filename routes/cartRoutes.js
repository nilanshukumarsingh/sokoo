const express = require('express');
const router = express.Router();
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    updateCartItemQty
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCart);
router.post('/', addItemToCart);
router.delete('/:itemId', removeItemFromCart);
router.put('/:itemId', updateCartItemQty); // Added update route
router.delete('/', clearCart);

module.exports = router;
