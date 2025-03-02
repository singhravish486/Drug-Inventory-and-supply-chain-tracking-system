import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Export drugService
export const drugService = {
    getAllDrugs: async () => {
        try {
            const response = await axios.get(`${API_URL}/drugs`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch drugs');
        }
    },
    addDrug: async (drugData) => {
        try {
            const response = await axios.post(`${API_URL}/drugs`, drugData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add drug');
        }
    }
};