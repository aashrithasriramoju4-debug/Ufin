import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const produceApi = {
  getAll: (status = 'available') => api.get(`/produce/all?status=${status}`),
  add: (data) => api.post('/produce/add', data),
  updateStatus: (id, status) => api.put(`/produce/${id}/status`, { status }),
  match: (produceId) => api.post('/produce/match', { produceId }),
};

export const orderApi = {
  create: (data) => api.post('/orders/create', data),
  getUserOrders: () => api.get('/orders'),
  getFarmerOrders: () => api.get('/orders/farmer'),
};

export const paymentApi = {
  processPayment: (data) => api.post('/payment/process', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const aiApi = {
  predictPrice: (data) => api.post('/ai/predict', data),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export default api;
