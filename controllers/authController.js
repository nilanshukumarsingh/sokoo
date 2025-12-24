const crypto = require('crypto');
const User = require('../models/User');
const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new ErrorResponse('User already exists', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    // If user is a vendor, create a default shop
    if (user.role === 'vendor') {
        await Shop.create({
            owner: user._id,
            name: `${user.name}'s Shop`,
            description: 'Default shop description. Please update.',
        });
    }

    // Send welcome email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to MultiVendor Platform',
            message: `Hi ${user.name},\n\nWelcome to the platform! We are glad to have you.\n\nBest,\nTeam`,
        });
    } catch (error) {
        console.error('Email send failed:', error);
    }

    res.status(201).json({
        success: true,
        data: 'User registered successfully. Please login.'
    });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } else {
        return next(new ErrorResponse('Invalid email or password', 401));
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        return next(new ErrorResponse('User not found', 404));
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message,
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        token: generateToken(user._id),
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    user.addresses.push(req.body);

    if (req.body.isDefault) {
        user.addresses.forEach(addr => {
            if (addr._id.toString() !== user.addresses[user.addresses.length - 1]._id.toString()) {
                addr.isDefault = false;
            }
        });
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user.addresses,
    });
});

// @desc    Toggle Wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
        user.wishlist.splice(index, 1);
    } else {
        user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user.wishlist,
    });
});
