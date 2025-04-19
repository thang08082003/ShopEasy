import api from './axiosConfig';

const wishlistAPI = {
  // Get user's wishlist
  getWishlist: () => {
    return api.get('/api/wishlist');
  },
  
  // Add product to wishlist
  addToWishlist: (productId) => {
    // Fixed: Use URL parameter instead of request body
    return api.post(`/api/wishlist/${productId}`);
  },
  
  // Remove product from wishlist
  removeFromWishlist: (productId) => {
    return api.delete(`/api/wishlist/${productId}`);
  },
  
  // Clear wishlist
  clearWishlist: () => {
    return api.delete('/api/wishlist');
  }
};

export default wishlistAPI;
