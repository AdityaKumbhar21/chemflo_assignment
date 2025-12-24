import api from './api';

export const inventoryService = {
  getAll: (params = {}) => api.get('/inventory', { params }),
  
  getByProductId: (productId) => api.get(`/inventory/${productId}`),
  
  updateStock: (productId, data) => api.post(`/inventory/${productId}/stock`, data),
  
  getMovements: (params = {}) => api.get('/inventory/movements', { params }),
  
  getStats: () => api.get('/inventory/stats'),
};
