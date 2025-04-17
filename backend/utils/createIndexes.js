const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Create indexes for performance optimization
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // Product indexes for search and filtering
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ 'ratings.average': -1 });
    await Product.collection.createIndex({ stock: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    // Order indexes
    await Order.collection.createIndex({ user: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ orderStatus: 1 });
    await Order.collection.createIndex({ paymentStatus: 1 });
    
    console.log('Indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error creating indexes: ${error.message}`);
    process.exit(1);
  }
};

// Execute the function
connectDB().then(() => {
  createIndexes();
});
