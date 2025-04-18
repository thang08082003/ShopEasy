import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

// MUI components
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Button,
  Skeleton,
  useTheme
} from '@mui/material';

// MUI icons
import {
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

// React charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/summary');
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Prepare chart data
  const salesChartData = dashboardData?.dailyRevenue ? {
    labels: dashboardData.dailyRevenue.map(item => item.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: dashboardData.dailyRevenue.map(item => item.revenue),
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Orders (paid)',
        data: dashboardData.dailyRevenue.map(item => item.orders), // Remove scaling factor
        backgroundColor: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
        tension: 0.4,
        yAxisID: 'y1',
        type: 'line'
      }
    ]
  } : null;
  
  const orderStatusChartData = dashboardData?.orderStatusBreakdown ? {
    labels: dashboardData.orderStatusBreakdown.map(item => item.status),
    datasets: [
      {
        data: dashboardData.orderStatusBreakdown.map(item => item.count),
        backgroundColor: [
          theme.palette.warning.main,  // pending
          theme.palette.info.main,     // processing
          theme.palette.secondary.main, // shipped
          theme.palette.success.main,  // delivered
          theme.palette.error.main,    // cancelled
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  // Dashboard metrics (summary cards)
  const renderMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} lg={4}>
        <Card sx={{ 
          bgcolor: theme.palette.primary.light, 
          color: theme.palette.primary.contrastText,
          boxShadow: 3,
          height: '100%'
        }}>
          <CardContent>
            <MoneyIcon sx={{ fontSize: 40, opacity: 0.7 }} />
            <Typography variant="h5" component="div" sx={{ mt: 1 }}>
              {loading ? (
                <Skeleton width={100} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                `$${dashboardData?.metrics?.totalRevenue?.toFixed(2) || '0.00'}`
              )}
            </Typography>
            <Typography variant="body2">Total Revenue</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} lg={4}>
        <Card sx={{ 
          bgcolor: theme.palette.success.light, 
          color: theme.palette.success.contrastText,
          boxShadow: 3,
          height: '100%'
        }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 40, opacity: 0.7 }} />
            <Typography variant="h5" component="div" sx={{ mt: 1 }}>
              {loading ? (
                <Skeleton width={100} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                dashboardData?.metrics?.totalOrders || '0'
              )}
            </Typography>
            <Typography variant="body2">Total Orders</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} lg={4}>
        <Card sx={{ 
          bgcolor: theme.palette.warning.light, 
          color: theme.palette.warning.contrastText,
          boxShadow: 3,
          height: '100%'
        }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 40, opacity: 0.7 }} />
            <Typography variant="h5" component="div" sx={{ mt: 1 }}>
              {loading ? (
                <Skeleton width={100} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                dashboardData?.metrics?.totalProducts || '0'
              )}
            </Typography>
            <Typography variant="body2">Products</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  const renderSalesChart = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Sales Overview (Last 7 Days)
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
       
      </Typography>
      {loading ? (
        <Skeleton variant="rectangular" height={300} />
      ) : salesChartData ? (
        <Box sx={{ height: 300 }}>
          <Line
            data={salesChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Revenue ($)'
                  }
                },
                y1: {
                  beginAtZero: true,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false // Only show grid lines for revenue
                  },
                  title: {
                    display: true,
                    text: 'Order Count'
                  },
                  // Set the maximum to make orders more visible
                  max: Math.max(...dashboardData.dailyRevenue.map(item => item.orders)) * 1.5 || 5,
                  ticks: {
                    stepSize: 1, // Ensure whole numbers for order counts
                    precision: 0
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.dataset.yAxisID === 'y') {
                        label += '$' + context.parsed.y.toFixed(2);
                      } else {
                        label += context.parsed.y + ' orders';
                      }
                      return label;
                    }
                  }
                }
              }
            }}
          />
        </Box>
      ) : (
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      )}
    </Paper>
  );
  
  const renderOrderStatusChart = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Order Status
      </Typography>
      {loading ? (
        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
      ) : orderStatusChartData ? (
        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          <Pie
            data={orderStatusChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right'
                }
              }
            }}
          />
        </Box>
      ) : (
        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      )}
    </Paper>
  );
  
  const renderRecentOrders = () => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Orders</Typography>
        <Button 
          size="small" 
          onClick={() => navigate('/admin/orders')}
        >
          View All
        </Button>
      </Box>
      {loading ? (
        Array(5).fill().map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton height={20} />
            <Skeleton height={20} width="60%" />
          </Box>
        ))
      ) : dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
        <List disablePadding>
          {dashboardData.recentOrders.map((order, index) => (
            <React.Fragment key={order._id}>
              {index > 0 && <Divider />}
              <ListItem
                button
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                sx={{ py: 1.5 }}
              >
                <ListItemText
                  primary={`Order #${order._id.substring(order._id.length - 8).toUpperCase()}`}
                  secondary={`${new Date(order.createdAt).toLocaleDateString()} | $${order.grandTotal.toFixed(2)}`}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textTransform: 'capitalize',
                      bgcolor: 
                        order.orderStatus === 'delivered' ? 'success.main' :
                        order.orderStatus === 'processing' ? 'info.main' :
                        order.orderStatus === 'cancelled' ? 'error.main' :
                        'warning.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {order.orderStatus}
                  </Typography>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
          No recent orders
        </Typography>
      )}
    </Paper>
  );
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Box>
    );
  }
  
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Metrics */}
      {renderMetrics()}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          {renderSalesChart()}
        </Grid>
        
        {/* Order Status Chart */}
        <Grid item xs={12} lg={4}>
          {renderOrderStatusChart()}
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12}>
          {renderRecentOrders()}
        </Grid>
      </Grid>
    </>
  );
};

export default AdminDashboard;
