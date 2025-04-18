import api from './axiosConfig';

const productAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`);
      
      // Normalize response format
      let reviews = [];
      if (response.data && Array.isArray(response.data)) {
        reviews = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        reviews = response.data.data;
      } else if (response.data && response.data.reviews) {
        reviews = response.data.reviews;
      }
      
      return { reviews };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },
  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  updateProductReview: async (productId, reviewId, reviewData) => {
    try {
      const response = await api.put(`/api/products/${productId}/reviews/${reviewId}`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
  deleteProductReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
  getUserReview: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews/me`);
      
      // Extract review data from response
      let reviewData = null;
      if (response.data && response.data.data) {
        reviewData = response.data.data;
      } else if (response.data && response.data.review) {
        reviewData = response.data.review;
      } else if (response.data && !Array.isArray(response.data)) {
        reviewData = response.data;
      }
      
      return reviewData;
    } catch (error) {
      console.error('Error getting user review:', error);
      throw error;
    }
  },
  createReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  updateReview: async (productId, reviewId, reviewData) => {
    try {
      const response = await api.put(`/api/products/${productId}/reviews/${reviewId}`, reviewData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }
};

export default productAPI;
