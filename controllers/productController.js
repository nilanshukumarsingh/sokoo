const Product = require('../models/Product');
const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all products (with filters & search)
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    let parsedQuery = JSON.parse(queryStr);

    // Search by name or tags
    if (req.query.search) {
        parsedQuery.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ];
    }

    query = Product.find(parsedQuery).populate({
        path: 'shop',
        select: 'name description',
    });

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(parsedQuery);

    query = query.skip(startIndex).limit(limit);
    const products = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products,
    });
});

// @desc    Get products for logged in vendor
// @route   GET /api/products/vendor
// @access  Private (Vendor)
exports.getVendorProducts = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
        return next(new ErrorResponse('No shop found for this vendor', 404));
    }

    const products = await Product.find({ shop: shop._id });
    res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('shop');

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: product });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} does not have a shop`, 400));
    }

    // If vendor, force shop to be theirs
    if (req.user.role !== 'admin') {
        req.body.shop = shop._id;
    }

    // Handle file upload
    if (req.file) {
        req.body.images = [`/uploads/${req.file.filename}`];
    }

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    const shop = await Shop.findById(product.shop);

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 403));
    }

    // Handle file upload
    if (req.file) {
        req.body.images = [`/uploads/${req.file.filename}`];
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    const shop = await Shop.findById(product.shop);

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 403));
    }

    await product.deleteOne();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Add review to product
// @route   POST /api/products/:id/review
// @access  Private
exports.createProductReview = asyncHandler(async (req, res, next) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        return next(new ErrorResponse('Product already reviewed', 400));
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.averageRating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
});
