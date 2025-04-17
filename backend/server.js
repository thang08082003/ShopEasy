const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const { accessLogger, errorLogger, devLogger } = require('./middlewares/logger');
const { apiLimiter, authLimiter } = require('./middlewares/security');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares
app.use(cors());
app.use(helmet()); // Security headers

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(accessLogger);
  app.use(errorLogger);
} else {
  app.use(devLogger);
}

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ShopEasy API',
    documentation: '/api-docs',
    health: '/api/system/health'
  });
});

// Error handler middleware
app.use(errorHandler);

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
