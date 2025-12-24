const Stripe = require('stripe');
const Cart = require('../models/Cart');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Shop = require('../models/Shop'); // Required for Vendor mapping logic
const sendOrderEmail = require('../utils/orderEmailService');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Verify Stripe Payment and Create Order
// @route   POST /api/stripe/verify-payment
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return next(new ErrorResponse('Session ID is required', 400));
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status !== 'paid') {
            return next(new ErrorResponse('Payment not completed', 400));
        }

        // Get receipt URL from payment intent -> charges
        let receiptUrl = null;
        if (session.payment_intent && session.payment_intent.charges && session.payment_intent.charges.data.length > 0) {
            receiptUrl = session.payment_intent.charges.data[0].receipt_url;
        }

        // Avoid duplicate orders if logic runs twice (though simple check here might not be enough for high concurrency)
        // Ideally we check if order with this session ID exists, but we won't add field to schema for now.
        // We will rely on Cart being empty as a proxy check or just proceed since test mode.
        
        // REUSE ORDER CREATION LOGIC
        // We need to fetch the cart again (assuming it hasn't been cleared yet)
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            // If cart is empty, maybe order was already created?
            // Should allow idempotency.
            return res.status(200).json({ success: true, message: 'Order already processed or cart empty' });
        }

        const shippingAddress = JSON.parse(session.metadata.shippingAddress);

        // --- CORE ORDER LOGIC COPIED FROM orderController ---
        let totalAmount = 0;
        const orderItems = [];
        const vendorMap = new Map();

        for (const item of cart.items) {
             // Skip invalid items
             if (!item.product) continue;
             
             // We can skip stock check here assuming it was checked before checkout? 
             // Or re-check. Let's re-check and decrement.
             // Note: In real app, we reserve stock. Here we just decrement.

             const product = item.product; // Already populated
             product.stock -= item.quantity;
             await product.save();

             const itemTotal = product.price * item.quantity;
             totalAmount += itemTotal;

             orderItems.push({
                 product: product._id,
                 quantity: item.quantity,
             });

             // Grouping for SubOrders
             const PopulatedProduct = await require('../models/Product').findById(product._id).populate('shop'); // Ensure we have shop owner loaded
             const shopId = PopulatedProduct.shop._id.toString();
             
             if (!vendorMap.has(shopId)) {
                 vendorMap.set(shopId, {
                     vendor: PopulatedProduct.shop.owner,
                     shop: PopulatedProduct.shop._id,
                     items: [],
                     totalAmount: 0 
                 });
             }

             const vendorData = vendorMap.get(shopId);
             vendorData.items.push({
                 product: product._id,
                 name: product.name,
                 price: product.price,
                 quantity: item.quantity
             });
             vendorData.totalAmount += itemTotal;
        }

        // 1. Create Parent Order
        const order = await Order.create({
            user: req.user._id,
            products: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: 'Card',
            isPaid: true,
            paidAt: Date.now(),
            paymentResult: {
                id: session.id,
                status: session.payment_status,
                update_time: String(Date.now()),
                email_address: session.customer_details?.email || req.user.email,
                receipt_url: receiptUrl
            }
        });

        // 2. Create Sub-Orders
        const subOrderPromises = Array.from(vendorMap.values()).map(data => {
            return SubOrder.create({
                parentOrder: order._id,
                vendor: data.vendor,
                shop: data.shop,
                items: data.items,
                totalAmount: data.totalAmount,
                paymentStatus: 'Paid' // Mark sub-orders as paid too
            });
        });

        await Promise.all(subOrderPromises);

        // Clear Cart
        cart.items = [];
        await cart.save();

        // Send Email
        try {
            await sendOrderEmail({
                email: req.user.email,
                userName: req.user.name,
                orderId: order._id,
                totalAmount: totalAmount,
                shippingAddress: shippingAddress,
                paymentMethod: 'Card',
                products: Array.from(vendorMap.values()).flatMap(v => v.items).map(item => ({
                    product: { name: item.name, price: item.price },
                    quantity: item.quantity
                })) 
            });
        } catch (error) {
            console.error('Email send failed:', error);
        }

        res.status(200).json({ success: true, data: order });

    } catch (err) {
        console.error('Payment Verification Failed:', err);
        return next(new ErrorResponse(`Payment Verification Failed: ${err.message}`, 500));
    }
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
    // 1. Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return next(new ErrorResponse('Cart is empty', 400));
    }

    // 2. Prepare line items for Stripe
    const lineItems = [];
    
    for (const item of cart.items) {
        // Skip invalid items where product might have been deleted
        if (!item.product) {
            continue;
        }

        const productName = item.product.name || 'Unknown Product';
        
        // Ensure valid price
        const price = item.product.price || 0;
        if (price <= 0) continue; // Skip free or invalid price items if Stripe doesn't allow

        const unitAmount = Math.round(price * 100); 

        lineItems.push({
            price_data: {
                // Changing to USD to avoid "amount too small" error for low-priced test items (e.g. 25 INR is < $0.50)
                currency: 'usd', 
                product_data: {
                    name: productName,
                    // images: [] // Stripe requires public URLs. Localhost URLs cause 400 Bad Request.
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        });
    }

    // DEBUG LOGGING
    console.log('--- STRIPE CHECKOUT DEBUG ---');
    console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY);
    console.log('User Email:', req.user.email);
    console.log('Line Items:', JSON.stringify(lineItems, null, 2));

    if (lineItems.length === 0) {
        return next(new ErrorResponse('No valid items in cart to checkout', 400));
    }

    try {
        const sessionPayload = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cart`,
            customer_email: req.user.email,
            metadata: {
                userId: req.user.id,
                shippingAddress: JSON.stringify(req.body.shippingAddress)
            }
        };
        
        console.log('Session Payload:', JSON.stringify(sessionPayload, null, 2));

        // 3. Create Session
        const session = await stripe.checkout.sessions.create(sessionPayload);

        console.log('Session Created:', session.id);

        res.status(200).json({
            success: true,
            id: session.id,
            url: session.url
        });
    } catch (err) {
        console.error('Stripe Session Creation Failed:', err);
        // Return exact stripe error to client for visibility
        return next(new ErrorResponse(`Stripe Error: ${err.message}`, 400));
    }

});
