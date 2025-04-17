import api from './axiosConfig';

const productAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  getProductReviews: (productId) => api.get(`/api/products/${productId}/reviews`),
  addProductReview: (productId, reviewData) => api.post(`/api/products/${productId}/reviews`, reviewData),
  updateProductReview: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
  deleteProductReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`)
};

export default productAPI;
