import api from './axiosConfig';

const orderAPI = {
  getOrders: (params = {}) => api.get('/api/orders', { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  createOrder: (orderData) => api.post('/api/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/api/orders/${id}`, statusData),
  cancelOrder: (id) => api.delete(`/api/orders/${id}`)
};

export default orderAPI;
