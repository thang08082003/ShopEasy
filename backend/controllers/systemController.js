const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const os = require('os');

// @desc    API Health Check
// @route   GET /api/system/health
// @access  Public
exports.healthCheck = asyncHandler(async (req, res, next) => {
  // Check database connection
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const healthData = {
    status: 'ok',
    timestamp: new Date(),
    uptime: Math.floor(process.uptime()) + ' seconds',
    database: {
      status: dbStatus
    },
    server: {
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpu: os.cpus().length + ' cores'
    }
  };

  res.status(200).json(healthData);
});

// @desc    Get system info (admin only)
// @route   GET /api/system/info
// @access  Private/Admin
exports.systemInfo = asyncHandler(async (req, res, next) => {
  // For admin, return detailed system diagnostics
  const systemInfo = {
    server: {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: `${Math.floor(os.uptime() / 3600)} hours, ${Math.floor((os.uptime() % 3600) / 60)} minutes`,
      loadAverage: os.loadavg(),
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpus: os.cpus().length
    },
    process: {
      pid: process.pid,
      version: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: `${Math.floor(process.uptime() / 3600)} hours, ${Math.floor((process.uptime() % 3600) / 60)} minutes`
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    }
  };

  res.status(200).json({
    success: true,
    data: systemInfo
  });
});
