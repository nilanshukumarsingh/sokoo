const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    updateDetails,
    addAddress,
    toggleWishlist
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.post('/address', protect, addAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
