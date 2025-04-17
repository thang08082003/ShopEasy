import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

// MUI components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Menu,
  Tooltip
} from '@mui/material';

// MUI icons
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Order status chip colors
const statusColors = {
  'pending': 'warning',
  'processing': 'info',
  'shipped': 'secondary',
  'delivered': 'success',
  'cancelled': 'error'
};

// Payment status chip colors
const paymentStatusColors = {
  'pending': 'warning',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'info'
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Action menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Update status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Add new state for payment status dialog
  const [paymentStatusDialog, setPaymentStatusDialog] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [paymentStatusUpdateLoading, setPaymentStatusUpdateLoading] = useState(false);
  
  // Define fetchOrders with useCallback to prevent infinite loops
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.orderStatus = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      
      // Use the real API endpoint
      const response = await api.get('/api/orders', { params });
      setOrders(response.data.data || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, paymentFilter, dateFilter]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle action menu
  const handleOpenMenu = (event, order) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle status update dialog
  const handleOpenStatusDialog = () => {
    if (selectedOrder) {
      setNewStatus(selectedOrder.orderStatus);
      setStatusDialogOpen(true);
      handleCloseMenu();
    }
  };
  
  const handleUpdateStatus = async () => {
    if (selectedOrder && newStatus) {
      setStatusUpdateLoading(true);
      try {
        await api.put(`/api/orders/${selectedOrder._id}`, {
          orderStatus: newStatus
        });
        
        // Refresh the data after update
        fetchOrders();
        setStatusDialogOpen(false);
        setSelectedOrder(null);
      } catch (err) {
        setError('Failed to update order status: ' + (err.response?.data?.error || err.message));
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };
  
  // Handle payment status update dialog
  const handleOpenPaymentStatusDialog = () => {
    if (selectedOrder) {
      setNewPaymentStatus(selectedOrder.paymentStatus);
      setPaymentStatusDialog(true);
      handleCloseMenu();
    }
  };
  
  const handleUpdatePaymentStatus = async () => {
    if (selectedOrder && newPaymentStatus) {
      setPaymentStatusUpdateLoading(true);
      try {
        // Use the same endpoint as order status updates, but with paymentStatus field
        await api.put(`/api/orders/${selectedOrder._id}`, {
          paymentStatus: newPaymentStatus
        });
        
        // Update local state
        setOrders(orders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, paymentStatus: newPaymentStatus }
            : order
        ));
        
        setPaymentStatusDialog(false);
        setSelectedOrder(null);
      } catch (err) {
        setError('Failed to update payment status: ' + (err.response?.data?.error || err.message));
      } finally {
        setPaymentStatusUpdateLoading(false);
      }
    }
  };
  
  // Calculate order summary
  const getOrderSummary = (order) => {
    if (!order || !order.orderItems) {
      return 'No items';
    }
    const itemCount = order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                label="Order Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(0);
                }}
                label="Payment Status"
              >
                <MenuItem value="">All Payments</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              size="small"
              value={dateFilter.startDate}
              onChange={(e) => {
                setDateFilter({ ...dateFilter, startDate: e.target.value });
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              size="small"
              value={dateFilter.endDate}
              onChange={(e) => {
                setDateFilter({ ...dateFilter, endDate: e.target.value });
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
                setDateFilter({ startDate: '', endDate: '' });
                setPage(0);
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array(rowsPerPage).fill().map((_, index) => (
                <TableRow key={index}>
                  <TableCell><CircularProgress size={20} /></TableCell>
                  <TableCell colSpan={7}><CircularProgress size={20} /></TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getOrderSummary(order)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${order.grandTotal.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.orderStatus}
                      color={statusColors[order.orderStatus] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.paymentStatus}
                      color={paymentStatusColors[order.paymentStatus] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, order)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => navigate(`/admin/orders/${selectedOrder?._id}`)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleOpenStatusDialog}>
          <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={handleOpenPaymentStatusDialog}>
          <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
          Update Payment Status
        </MenuItem>
      </Menu>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Order #{selectedOrder?._id.substring(selectedOrder?._id.length - 8).toUpperCase()}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={paymentStatusDialog} onClose={() => setPaymentStatusDialog(false)}>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Order #{selectedOrder?._id.substring(selectedOrder?._id.length - 8).toUpperCase()}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              label="Payment Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdatePaymentStatus}
            disabled={paymentStatusUpdateLoading}
          >
            {paymentStatusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminOrders;
