import api from './axiosConfig';

const wishlistAPI = {
  getWishlist: () => api.get('/api/wishlist'),
  addToWishlist: (productId) => api.post(`/api/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/api/wishlist/${productId}`),
  updateWishlist: (productIds) => api.put('/api/wishlist', { products: productIds })
};

export default wishlistAPI;
