const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = asyncHandler(async (req, res, next) => {
  // Get query parameters
  const period = req.query.period || 'monthly'; // daily, weekly, monthly
  const limit = parseInt(req.query.limit) || 6; // Number of periods to return
  
  // Calculate date range
  const now = new Date();
  let dateFormat;
  let groupIdFormat;
  
  if (period === 'daily') {
    dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    groupIdFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    dateFormat = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
    groupIdFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    groupIdFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  // Calculate sales data
  const salesData = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: {
        _id: groupIdFormat,
        date: { $first: dateFormat },
        totalSales: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
        averageOrder: { $avg: '$grandTotal' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1, '_id.week': -1 } },
    { $limit: limit },
    { $project: {
        _id: 0,
        period: '$date',
        totalSales: 1,
        orderCount: 1,
        averageOrder: { $round: ['$averageOrder', 2] }
      }
    }
  ]);
  
  // Get total revenue
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);
  
  // Get top selling products
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $unwind: '$items' },
    { $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $project: {
        _id: 0,
        product: { $arrayElemAt: ['$productInfo.name', 0] },
        totalQuantity: 1,
        totalRevenue: 1
      }
    }
  ]);
  
  // Get total metrics
  const totalOrders = await Order.countDocuments({ paymentStatus: 'completed' });
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
  
  res.status(200).json({
    success: true,
    data: {
      salesData,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      topProducts,
      metrics: {
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockProducts
      }
    }
  });
});

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = asyncHandler(async (req, res, next) => {
  // User registration over time
  const userRegistrationData = await User.aggregate([
    { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
    { $project: { _id: 0, period: '$_id', count: 1 } }
  ]);
  
  // User activity - users with orders
  const userActivity = await Order.aggregate([
    { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$grandTotal' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
    { $unwind: '$userInfo' },
    { $project: {
        _id: 0,
        userId: '$_id',
        name: '$userInfo.name',
        email: '$userInfo.email',
        orderCount: 1,
        totalSpent: 1
      }
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      registrationTrend: userRegistrationData,
      activeUsers: userActivity
    }
  });
});

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private/Admin
exports.getInventoryAnalytics = asyncHandler(async (req, res, next) => {
  // Low stock items
  const lowStockItems = await Product.find({ stock: { $lt: 10 } })
    .select('name stock category price')
    .populate('category', 'name')
    .sort('stock')
    .limit(20);
  
  // Stock by category
  const stockByCategory = await Product.aggregate([
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
    { $unwind: '$categoryInfo' },
    { $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' }
      }
    },
    { $project: {
        _id: 0,
        category: '$categoryName',
        totalProducts: 1,
        totalStock: 1,
        averagePrice: { $round: ['$averagePrice', 2] }
      }
    },
    { $sort: { totalProducts: -1 } }
  ]);

  // Out of stock percentage
  const outOfStockStats = await Product.aggregate([
    { $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', 10] }] }, 1, 0] } }
      }
    },
    { $project: {
        _id: 0,
        totalProducts: 1,
        outOfStock: 1,
        lowStock: 1,
        outOfStockPercentage: { $multiply: [{ $divide: ['$outOfStock', '$totalProducts'] }, 100] }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      lowStockItems,
      stockByCategory,
      stockStats: outOfStockStats.length > 0 ? outOfStockStats[0] : {}
    }
  });
});
