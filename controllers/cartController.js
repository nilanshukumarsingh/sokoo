const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity, variant } = req.body;
    console.log('AddItemToCart:', { productId, quantity, variant, userId: req.user.id });

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart with same variant
    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        (!variant || (item.variant && item.variant.value === variant.value))
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity || 1;
    } else {
        cart.items.push({
            product: productId,
            quantity: quantity || 1,
            variant,
            price: product.price
        });
    }

    await cart.save();

    res.status(200).json({ success: true, data: cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return next(new ErrorResponse('Cart not found', 404));
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    await cart.save();

    res.status(200).json({ success: true, data: cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.status(200).json({ success: true, data: {} });
});
