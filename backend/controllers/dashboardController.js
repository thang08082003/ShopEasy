const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private/Admin
exports.getDashboardSummary = asyncHandler(async (req, res, next) => {
  // Get total revenue, orders, users and products
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);
  
  // Recent orders
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name email');
  
  // Recent users
  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(5)
    .select('name email createdAt');
  
  // Count metrics
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  
  // Order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);
  
  // Revenue by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyRevenue = await Order.aggregate([
    { $match: { 
        createdAt: { $gte: sevenDaysAgo },
        paymentStatus: 'completed'
      } 
    },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', revenue: 1, orders: 1, _id: 0 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        totalOrders,
        totalUsers,
        totalProducts
      },
      recentOrders,
      recentUsers,
      orderStatusBreakdown,
      dailyRevenue
    }
  });
});
