const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const errorHandler = require('../middleware/error');

let mongoServer;
let app;

// Setup in-memory database and express app for testing
beforeAll(async () => {
    jest.setTimeout(30000); // 30s timeout
    process.env.JWT_SECRET = 'testsecret';
    process.env.NODE_ENV = 'test';

    // Mock sendEmail to avoid SMTP overhead/failures
    jest.mock('../utils/sendEmail', () => jest.fn(() => Promise.resolve()));

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    app = express();
    app.use(express.json());

    // Connect to in-memory DB
    await mongoose.connect(uri);

    // Load routes
    app.use('/api/auth', require('../routes/authRoutes'));
    app.use('/api/products', require('../routes/productRoutes'));
    app.use('/api/shops', require('../routes/shopRoutes'));
    app.use('/api/orders', require('../routes/orderRoutes'));
    app.use('/api/cart', require('../routes/cartRoutes'));
    app.use('/api/analytics', require('../routes/analyticsRoutes'));

    app.use(errorHandler);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Authentication API', () => {
    let token;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });
        expect(res.statusCode).toEqual(201);
    });

    it('should fail to register user with existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Duplicate',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should login successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(res.statusCode).toEqual(200);
        token = res.body.token;
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrong' });
        expect(res.statusCode).toEqual(401);
    });
});

describe('Product & Search (RBAC included)', () => {
    let vendorToken;
    let productId;

    beforeAll(async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Vendor',
            email: 'vendor@example.com',
            password: 'password123',
            role: 'vendor'
        });
        vendorToken = res.body.token;
    });

    it('should allow vendor to create product with tags', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({
                name: 'Super Gadget',
                description: 'Awesome',
                price: 100,
                stock: 5,
                tags: ['electronics', 'cool']
            });
        expect(res.statusCode).toEqual(201);
        productId = res.body.data._id;
    });

    it('should prevent regular user from creating product', async () => {
        const userRes = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password123' });
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userRes.body.token}`)
            .send({ name: 'Hack' });
        expect(res.statusCode).toEqual(403);
    });

    it('should find product by tag search', async () => {
        const res = await request(app).get('/api/products?search=cool');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data[0].name).toEqual('Super Gadget');
    });
});

describe('Cart & Orders (Edge Cases included)', () => {
    let userToken;
    let productId;

    beforeAll(async () => {
        const userRes = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password123' });
        userToken = userRes.body.token;
        const prodRes = await request(app).get('/api/products');
        productId = prodRes.body.data[0]._id;
    });

    it('should add item to cart', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId, quantity: 1 });
        expect(res.statusCode).toEqual(200);
    });

    it('should fail to order more than stock', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                products: [{ product: productId, quantity: 10 }],
                shippingAddress: { street: 's', city: 'c', state: 's', zipCode: '1', country: 'I' }
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should place order successfully and deduct stock', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                products: [{ product: productId, quantity: 2 }],
                shippingAddress: { street: 's', city: 'c', state: 's', zipCode: '1', country: 'I' }
            });
        expect(res.statusCode).toEqual(201);

        const Product = require('../models/Product');
        const product = await Product.findById(productId);
        expect(product.stock).toEqual(3); // 5 - 2 = 3
    });
});

describe('Analytics API', () => {
    let adminToken;
    let vendorToken;

    beforeAll(async () => {
        const adminRes = await request(app).post('/api/auth/register').send({
            name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin'
        });
        adminToken = adminRes.body.token;

        const vendorRes = await request(app).post('/api/auth/login').send({
            email: 'vendor@example.com', password: 'password123'
        });
        vendorToken = vendorRes.body.token;
    });

    it('should fetch admin analytics', async () => {
        const res = await request(app)
            .get('/api/analytics/admin')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('totalRevenue');
    });

    it('should fetch vendor analytics', async () => {
        const res = await request(app)
            .get('/api/analytics/vendor')
            .set('Authorization', `Bearer ${vendorToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('totalItemsSold');
    });
});
