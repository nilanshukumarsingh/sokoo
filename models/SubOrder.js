const mongoose = require('mongoose');

const SubOrderSchema = new mongoose.Schema({
    parentOrder: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: true,
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SubOrder', SubOrderSchema);
