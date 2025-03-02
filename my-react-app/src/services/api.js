import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Add request interceptor to include auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor to handle errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

// User Service
export const userService = {
	getAllUsers: async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/users`);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Failed to fetch users');
		}
	},

	getUsersByRole: async (role) => {
		try {
			const response = await api.get(`/users/role/${role}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching ${role}s:`, error);
			throw error;
		}
	},

	getManufacturers: async () => {
		try {
			const response = await api.get('/users/manufacturers');
			return response.data;
		} catch (error) {
			if (!error.response) {
				throw new Error('Network error - Please check if the server is running');
			}
			throw error;
		}
	},

	getAllUsersWithStats: async () => {
		try {
			const response = await api.get('/users/stats');
			if (!response.data.success) {
				throw new Error(response.data.message || 'Failed to fetch users');
			}
			return response.data;
		} catch (error) {
			console.error('Error fetching user stats:', error);
			throw error;
		}
	}
};

// Request Service
export const requestService = {
	getAllRequests: async () => {
		try {
			const response = await api.get('/requests');
			if (!response.data.success) {
				throw new Error(response.data.message || 'Failed to fetch requests');
			}
			return response.data.requests;
		} catch (error) {
			console.error('Error fetching requests:', error);
			throw new Error(error.response?.data?.message || 'Failed to fetch requests');
		}
	}
};

// Auth Service
export const authService = {
	register: async (userData) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Registration failed');
		}
	},

	login: async (credentials) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Login failed');
		}
	}
};

// Drug Service
export const drugService = {
	createDrug: async (drugData) => {
		try {
			const response = await api.post('/drugs', drugData);
			return response.data;
		} catch (error) {
			console.error('Drug creation error:', error.response?.data || error);
			throw error;
		}
	},

	getAllDrugs: async () => {
		try {
			const response = await api.get('/drugs');
			return response.data;
		} catch (error) {
			console.error('Error fetching drugs:', error.response?.data || error);
			throw error;
		}
	}
};

// Raw Material Service
export const rawMaterialService = {
	addMaterial: async (materialData) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			console.log('API endpoint:', `${API_BASE_URL}/raw-materials`);
			console.log('Sending material data:', materialData);

			const response = await axios.post(
				`${API_BASE_URL}/raw-materials`,
				materialData,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				}
			);

			if (!response.data.success) {
				throw new Error(response.data.message || 'Failed to add material');
			}

			return response.data;
		} catch (error) {
			console.error('API Error:', error.response || error);
			throw new Error(
				error.response?.data?.message || 
				error.message || 
				'Failed to add material'
			);
		}
	},

	getMaterialsBySupplier: async (supplierId) => {
		try {
			const response = await api.get(`/raw-materials/supplier/${supplierId}`);
			return response.data;
		} catch (error) {
			if (!error.response) {
				throw new Error('Network error - Please check if the server is running');
			}
			throw error;
		}
	},

	sellMaterial: async (saleData) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const response = await axios.post(
				`${API_BASE_URL}/raw-materials/sell`,
				saleData,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				}
			);

			if (!response.data.success) {
				throw new Error(response.data.message || 'Failed to sell material');
			}

			return response.data;
		} catch (error) {
			console.error('API Error:', error.response || error);
			throw new Error(
				error.response?.data?.message || 
				error.message || 
				'Failed to sell material'
			);
		}
	},

	getSalesReports: async (dateRange) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const params = new URLSearchParams();
			if (dateRange.startDate) params.append('startDate', dateRange.startDate);
			if (dateRange.endDate) params.append('endDate', dateRange.endDate);

			const response = await axios.get(
				`${API_BASE_URL}/raw-materials/sales-reports?${params.toString()}`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			return response.data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}
};

// Material Request Service
export const materialRequestService = {
	createRequest: async (requestData) => {
		try {
			// Ensure all required fields are present and properly formatted
			const formattedData = {
				supplierId: requestData.supplierId,
				materialName: requestData.materialName,
				quantity: Number(requestData.quantity),
				requiredBy: requestData.requiredBy,
				notes: requestData.notes || ''
			};

			console.log('Sending material request:', formattedData);

			const response = await api.post('/material-requests', formattedData);
			return response.data;
		} catch (error) {
			console.error('Material request error:', error.response?.data || error);
			throw error;
		}
	},

	getManufacturerRequests: async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const response = await axios.get(
				`${API_BASE_URL}/material-requests/manufacturer`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			return response.data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	},

	getSupplierRequests: async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const response = await axios.get(
				`${API_BASE_URL}/material-requests/supplier`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			return response.data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	},

	updateRequestStatus: async (requestId, status) => {
		try {
			// Validate status
			const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
			if (!validStatuses.includes(status)) {
				throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
			}

			const response = await api.patch(
				`/material-requests/${requestId}/status`,
				{ 
					status,
					updatedAt: new Date().toISOString()
				}
			);

			if (!response.data.success) {
				throw new Error(response.data.message || 'Failed to update status');
			}

			return response.data;
		} catch (error) {
			console.error('Error updating request status:', error);
			throw new Error(error.response?.data?.message || 'Failed to update request status');
		}
	}
};

// Drug Category Service
export const drugCategoryService = {
	createCategory: async (categoryData) => {
		try {
			const response = await api.post('/drug-categories', categoryData);
			return response.data;
		} catch (error) {
			console.error('Drug category error:', error.response?.data || error);
			throw error;
		}
	},

	getAllCategories: async () => {
		try {
			const response = await api.get('/drug-categories');
			return response.data;
		} catch (error) {
			console.error('Error fetching categories:', error.response?.data || error);
			throw error;
		}
	}
};

// Batch Service
export const batchService = {
	createBatch: async (batchData) => {
		try {
			const response = await api.post('/batches', batchData);
			return response.data;
		} catch (error) {
			console.error('Batch creation error:', error.response?.data || error);
			throw error;
		}
	},

	getManufacturerBatches: async () => {
		try {
			const response = await api.get('/batches/manufacturer');
			return response.data;
		} catch (error) {
			console.error('Error fetching batches:', error.response?.data || error);
			throw error;
		}
	},

	transferBatch: async (transferData) => {
		try {
			const response = await api.post('/batches/transfer', transferData);
			return response.data;
		} catch (error) {
			console.error('Batch transfer error:', error.response?.data || error);
			throw error;
		}
	},

	getDistributorBatches: async () => {
		try {
			const response = await api.get('/batches/distributor');
			return response.data;
		} catch (error) {
			console.error('Error fetching distributor batches:', error);
			throw error;
		}
	},

	receiveBatch: async (batchId) => {
		try {
			const response = await api.post(`/batches/${batchId}/receive`);
			return response.data;
		} catch (error) {
			console.error('Error receiving batch:', error);
			throw error;
		}
	},

	getDistributorReceivedBatches: async () => {
		try {
			const response = await api.get('/batches/distributor/received');
			return response.data;
		} catch (error) {
			console.error('Error fetching received batches:', error);
			throw error;
		}
	},

	transferToPharmacy: async (transferData) => {
		try {
			// Ensure quantity is a number and greater than 0
			const quantity = Number(transferData.quantity);
			if (isNaN(quantity) || quantity <= 0) {
				throw new Error('Invalid quantity');
			}

			const response = await api.post('/batches/transfer-to-pharmacy', {
				...transferData,
				quantity: quantity
			});
			return response.data;
		} catch (error) {
			console.error('Error transferring to pharmacy:', error);
			throw error;
		}
	},

	getPharmacyReceivedDrugs: async () => {
		try {
			const response = await api.get('/batches/pharmacy/received');
			return response.data;
		} catch (error) {
			console.error('Error fetching pharmacy received drugs:', error);
			throw error;
		}
	},

	receivePharmacyDrug: async (drugId) => {
		try {
			const response = await api.post(`/batches/pharmacy/${drugId}/receive`);
			return response.data;
		} catch (error) {
			console.error('Error receiving drug:', error);
			throw error;
		}
	},

	getPharmacyStock: async () => {
		try {
			const response = await api.get('/batches/pharmacy/stock');
			return response.data;
		} catch (error) {
			console.error('Error fetching pharmacy stock:', error);
			throw error;
		}
	}
};

export const drugRequestService = {
	getManufacturerRequests: async () => {
		try {
			const response = await api.get('/drug-requests/manufacturer');
			if (!response.data.success) {
				throw new Error(response.data.message);
			}
			return response.data;
		} catch (error) {
			console.error('Error fetching manufacturer requests:', error);
			throw error.response?.data || error;
		}
	},

	getDistributorRequests: async () => {
		try {
			const response = await api.get('/drug-requests/distributor');
			return response.data;
		} catch (error) {
			console.error('Error fetching distributor requests:', error);
			throw error;
		}
	},

	createRequest: async (requestData) => {
		try {
			console.log('Sending request data:', requestData);
			const response = await api.post('/drug-requests', {
				manufacturerId: requestData.manufacturerId,
				drugName: requestData.drugName,
				quantity: requestData.quantity,
				requiredBy: requestData.requiredBy,
				notes: requestData.notes,
				requestType: 'distributor_request'
			});
			
			if (!response.data.success) {
				throw new Error(response.data.message);
			}
			return response.data;
		} catch (error) {
			console.error('Drug request error:', error.response?.data || error);
			throw error.response?.data || error;
		}
	},

	getPharmacyRequests: async () => {
		try {
			const response = await api.get('/drug-requests/pharmacy');
			return response.data;
		} catch (error) {
			console.error('Error fetching pharmacy requests:', error);
			throw error;
		}
	},

	updateRequestStatus: async (requestId, status) => {
		try {
			const response = await api.patch(`/drug-requests/${requestId}/status`, { 
				status,
				requestType: 'distributor_request'
			});
			
			if (!response.data.success) {
				throw new Error(response.data.message);
			}
			return response.data;
		} catch (error) {
			if (error.response?.status === 403) {
				throw new Error('Not authorized to update this request');
			}
			console.error('Error updating request status:', error);
			throw error.response?.data || error;
		}
	}
};

// Add request interceptor to handle timeouts
api.interceptors.request.use((config) => {
	config.timeout = config.timeout || 5000;
	return config;
});

// Add response interceptor to handle network errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (!error.response) {
			// Network error
			console.error('Network Error:', error);
			return Promise.reject(new Error('Network error - Please check your connection'));
		}
		return Promise.reject(error);
	}
);
