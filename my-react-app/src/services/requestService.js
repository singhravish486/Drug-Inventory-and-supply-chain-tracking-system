import api from './api.js';

export const requestService = {
  // Get all requests
  getAllRequests: async () => {
    const response = await api.get('/requests');
    return response.data;
  },

  // Get requests by status
  getRequestsByStatus: async (status) => {
    const response = await api.get(`/requests/status/${status}`);
    return response.data;
  },

  // Create new request
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // Update request status
  updateRequestStatus: async (requestId, status) => {
    const response = await api.patch(`/requests/${requestId}/status`, { status });
    return response.data;
  }
}; 