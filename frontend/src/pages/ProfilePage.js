import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/slices/authSlice';

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

// MUI components
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [success, setSuccess] = useState(false);
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string(),
    street: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    zipCode: Yup.string(),
    country: Yup.string()
  });
  
  // Form handling
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    },
    validationSchema,
    onSubmit: (values) => {
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country
        }
      };
      
      dispatch(updateUserProfile(userData))
        .unwrap()
        .then(() => {
          setSuccess(true);
        })
        .catch(() => {
          // Error is handled in the reducer
        });
    }
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile" />
          <Tab label="Address" />
          <Tab label="Password" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {activeTab === 0 ? 'My Profile' : activeTab === 1 ? 'My Address' : 'Change Password'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit}>
            {activeTab === 0 && (
              // Profile Information
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              // Address Information
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="street"
                    name="street"
                    label="Street Address"
                    value={formik.values.street}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.street && Boolean(formik.errors.street)}
                    helperText={formik.touched.street && formik.errors.street}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="city"
                    name="city"
                    label="City"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="state"
                    name="state"
                    label="State/Province"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    helperText={formik.touched.state && formik.errors.state}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="zipCode"
                    name="zipCode"
                    label="ZIP / Postal Code"
                    value={formik.values.zipCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                    helperText={formik.touched.zipCode && formik.errors.zipCode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="country"
                    name="country"
                    label="Country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                    helperText={formik.touched.country && formik.errors.country}
                  />
                </Grid>
              </Grid>
            )}
            
            {activeTab === 2 && (
              // Password Change Form - This would typically be a separate component/form
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            )}
            
            {activeTab !== 2 && (
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Account Information Summary Card */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={3}>
              <Typography variant="body1" color="textSecondary">
                Member Since:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={4} sm={3}>
              <Typography variant="body1" color="textSecondary">
                Account Type:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {user?.role || 'User'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
