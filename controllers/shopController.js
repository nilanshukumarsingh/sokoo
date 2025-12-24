const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
exports.getShops = asyncHandler(async (req, res, next) => {
    const shops = await Shop.find({ status: 'active' });
    res.status(200).json({ success: true, count: shops.length, data: shops });
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
exports.getShop = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        return next(new ErrorResponse(`Shop not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: shop });
});

// @desc    Create new shop
// @route   POST /api/shops
// @access  Private (Vendor/Admin)
exports.createShop = asyncHandler(async (req, res, next) => {
    // Check if user already has a shop
    const publishedShop = await Shop.findOne({ owner: req.user.id });

    // If the user is not an admin, they can only add one shop
    if (publishedShop && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} has already published a shop`, 400));
    }

    req.body.owner = req.user.id;

    const shop = await Shop.create(req.body);

    res.status(201).json({ success: true, data: shop });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Vendor/Admin)
exports.updateShop = asyncHandler(async (req, res, next) => {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
        return next(new ErrorResponse(`Shop not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this shop`, 403));
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: shop });
});
