const express = require('express'); // Server entry point - schema updated
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
// Load env vars
dotenv.config();

// Connect to database
connectDB();



const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { limiter } = require('./middleware/securityMiddleware');

const errorHandler = require('./middleware/error');

const app = express();

// Middleware
app.use(cors()); // CORS at the top
app.use(express.json());
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xss()); // Prevent XSS
app.use(limiter); // Rate Limiting
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow images to be loaded from our server
}));
// app.use(morgan('dev'));

// Static folder
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/stripe', require('./routes/stripeRoutes'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
