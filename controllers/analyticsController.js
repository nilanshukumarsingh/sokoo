const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get vendor analytics
// @route   GET /api/analytics/vendor
// @access  Private (Vendor)
exports.getVendorAnalytics = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }

    const subOrders = await SubOrder.find({ shop: shop._id });
    const productsCount = await Product.countDocuments({ shop: shop._id });

    let totalRevenue = 0;
    let totalItemsSold = 0;

    subOrders.forEach(order => {
        if (order.status !== 'cancelled') {
            totalRevenue += order.totalAmount;
            order.items.forEach(item => {
                totalItemsSold += item.quantity;
            });
        }
    });

    res.status(200).json({
        success: true,
        data: {
            totalProducts: productsCount,
            totalOrders: subOrders.length,
            totalItemsSold,
            totalRevenue
        }
    });
});

// @desc    Get admin analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = asyncHandler(async (req, res, next) => {
    const totalOrders = await Order.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.status(200).json({
        success: true,
        data: {
            totalRevenue,
            totalOrders,
            totalShops,
            totalProducts
        }
    });
});
