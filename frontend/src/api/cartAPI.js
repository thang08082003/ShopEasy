import api from './axiosConfig';

const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (productId, quantity = 1) => api.post('/api/cart/items', { 
    product: productId, 
    quantity 
  }),
  updateCartItem: (itemId, quantity) => api.put(`/api/cart/items/${itemId}`, { 
    quantity 
  }),
  removeCartItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  applyCoupon: (code) => api.post('/api/coupons/apply', { code }),
  removeCoupon: () => api.delete('/api/coupons/remove')
};

export default cartAPI;
