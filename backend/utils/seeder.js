const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@shopeasy.com',  // Use a consistent email for admin
    password: 'admin123',         // Remember to change in production
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  }
];

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic items including laptops, phones and accessories'
  },
  {
    name: 'Clothing',
    description: 'All types of clothing items for men, women and children'
  },
  {
    name: 'Books',
    description: 'Fiction and non-fiction books'
  }
];

// Function to import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    // Create users
    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0]._id;

    // Create categories
    const createdCategories = await Category.create(categories);
    
    // Create some sample products
    const products = [
      {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        category: createdCategories[0]._id,
        stock: 10
      },
      {
        name: 'T-shirt Basic',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        category: createdCategories[1]._id,
        stock: 50
      },
      {
        name: 'Programming Guide',
        description: 'Comprehensive guide to modern programming',
        price: 34.99,
        category: createdCategories[2]._id,
        stock: 20
      }
    ];

    await Product.create(products);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Function to destroy data
const destroyData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Call appropriate function based on command line args
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
