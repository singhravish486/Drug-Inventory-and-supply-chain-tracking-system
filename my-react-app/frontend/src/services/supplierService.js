import api from './api.js';

export const supplierService = {
  // Get all inventory
  getInventory: async () => {
    const response = await api.get('/supplier/inventory');
    return response.data;
  },

  // Add new inventory item
  addInventoryItem: async (itemData) => {
    const response = await api.post('/supplier/inventory', itemData);
    return response.data;
  },

  // Update inventory item
  updateInventoryItem: async (id, itemData) => {
    const response = await api.put(`/supplier/inventory/${id}`, itemData);
    return response.data;
  },

  // Delete inventory item
  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/supplier/inventory/${id}`);
    return response.data;
  },

  // Create sale record
  createSale: async (saleData) => {
    const response = await api.post('/supplier/sales', saleData);
    return response.data;
  },

  // Get sales history
  getSales: async () => {
    const response = await api.get('/supplier/sales');
    return response.data;
  }
}; 