const express = require('express');
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, require('../controllers/stripeController').verifyPayment);

module.exports = router;
