import api from './axiosConfig';

const authAPI = {
  // User registration
  register: (userData) => {
    return api.post('/api/auth/register', userData);
  },
  
  // User login
  login: (credentials) => {
    return api.post('/api/auth/login', credentials);
  },
  
  // Get current user profile
  getProfile: () => {
    return api.get('/api/auth/profile');
  },
  
  // Update user profile
  updateProfile: (userData) => {
    return api.put('/api/auth/profile', userData);
  },
  
  // Change password
  changePassword: (passwordData) => {
    return api.put('/api/auth/change-password', passwordData);
  },
  
  // Forgot password
  forgotPassword: (email) => {
    return api.post('/api/auth/forgot-password', { email });
  },
  
  // Reset password
  resetPassword: (resetData) => {
    return api.put('/api/auth/reset-password', resetData);
  }
};

export default authAPI;
