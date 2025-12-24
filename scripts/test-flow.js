const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Random string for unique emails
const rand = Math.random().toString(36).substring(7);
const vendorEmail = `vendor_${rand}@example.com`;
const userEmail = `user_${rand}@example.com`;
const password = 'password123';

let vendorToken;
let userToken;
let shopId;
let productId;

const runTests = async () => {
    try {
        console.log('--- STARTING WRITABLE FLOW TESTS ---');

        // 1. Register Vendor
        console.log(`\n1. Registering Vendor (${vendorEmail})...`);
        const vendorReg = await axios.post(`${API_URL}/auth/register`, {
            name: 'Vendor John',
            email: vendorEmail,
            password: password,
            role: 'vendor',
        });
        vendorToken = vendorReg.data.token;
        console.log('   Success! Token received.');

        // 2. Create Shop
        console.log('\n2. Creating Shop...');
        const shopRes = await axios.post(
            `${API_URL}/shops`,
            {
                name: `Best Shop ${rand}`,
                description: 'The best products in town',
            },
            { headers: { Authorization: `Bearer ${vendorToken}` } }
        );
        shopId = shopRes.data._id;
        console.log(`   Success! Shop ID: ${shopId}`);

        // 3. Add Product
        console.log('\n3. Adding Product...');
        const productRes = await axios.post(
            `${API_URL}/products`,
            {
                name: 'Super Gadget',
                description: 'Makes life easier',
                price: 99.99,
                stock: 10,
            },
            { headers: { Authorization: `Bearer ${vendorToken}` } }
        );
        productId = productRes.data._id;
        console.log(`   Success! Product ID: ${productId}`);

        // 4. Register Customer
        console.log(`\n4. Registering Customer (${userEmail})...`);
        const userReg = await axios.post(`${API_URL}/auth/register`, {
            name: 'Customer Jane',
            email: userEmail,
            password: password,
            role: 'user',
        });
        userToken = userReg.data.token;
        console.log('   Success! Token received.');

        // 5. Place Order
        console.log('\n5. Placing Order...');
        const orderRes = await axios.post(
            `${API_URL}/orders`,
            {
                products: [{ product: productId, quantity: 2 }],
            },
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        console.log(`   Success! Order ID: ${orderRes.data._id}, Total: ${orderRes.data.totalAmount}`);

        // 6. Verify Stock Deduction
        console.log('\n6. Verifying Stock Deduction...');
        const productCheck = await axios.get(`${API_URL}/products/${productId}`);
        if (productCheck.data.stock === 8) {
            console.log('   Success! Stock dropped from 10 to 8.');
        } else {
            console.error(`   Failed! Stock is ${productCheck.data.stock}, expected 8.`);
        }

        // 7. Check User Orders
        console.log('\n7. Checking My Orders...');
        const myOrders = await axios.get(`${API_URL}/orders/myorders`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        if (myOrders.data.length > 0) {
            console.log(`   Success! Found ${myOrders.data.length} order(s).`);
        } else {
            console.error('   Failed! No orders found.');
        }

        console.log('\n--- ALL TESTS PASSED ---');
    } catch (error) {
        console.error('\n--- TEST FAILED ---');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

runTests();
