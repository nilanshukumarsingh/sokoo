const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
    },
    images: {
        type: [String],
        default: [],
    },
    tags: {
        type: [String],
        default: [],
    },
    variants: [
        {
            type: { type: String }, // e.g., 'Size', 'Color'
            value: String,         // e.g., 'XL', 'Red'
            priceModifier: {
                type: Number,
                default: 0
            }
        }
    ],
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', ProductSchema);
