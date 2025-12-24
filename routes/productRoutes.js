const express = require('express');
const router = express.Router();
const {
    getProducts,
    getVendorProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('vendor', 'admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

router.post('/:id/review', protect, createProductReview);

module.exports = router;
