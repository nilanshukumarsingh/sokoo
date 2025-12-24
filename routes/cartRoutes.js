const express = require('express');
const router = express.Router();
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCart);
router.post('/', addItemToCart);
router.delete('/:itemId', removeItemFromCart);
router.delete('/', clearCart);

module.exports = router;
