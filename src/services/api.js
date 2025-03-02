import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// User Service
export const userService = {
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
    }
};

// Request Service
export const requestService = {
    getAllRequests: async () => {
        try {
            const response = await axios.get(`${API_URL}/requests`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch requests');
        }
    },
    updateRequestStatus: async (requestId, status) => {
        try {
            const response = await axios.put(`${API_URL}/requests/${requestId}`, { status });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update request');
        }
    }
};
