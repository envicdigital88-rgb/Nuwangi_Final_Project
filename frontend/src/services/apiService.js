import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const adminLogin = async (email, password) => {
  const response = await api.post('/auth/admin/login', { email, password });
  return response.data;
};

export const customerLogin = async (email, password) => {
  const response = await api.post('/auth/customer/login', { email, password });
  return response.data;
};

// Dashboard APIs
export const getDashboardStats = async () => {
  console.log('getDashboardStats called');
  console.log('API_BASE_URL:', API_BASE_URL);
  const token = localStorage.getItem('admin_token');
  console.log('Token in getDashboardStats:', token ? 'exists' : 'missing');
  const response = await api.get('/analytics/dashboard');
  console.log('Dashboard response:', response.data);
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await api.get('/analytics/recent-activities');
  return response.data;
};

// Product APIs
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Customer APIs
export const getCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// Admin APIs
export const getAdmins = async () => {
  const response = await api.get('/admins');
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await api.post('/admins', adminData);
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await api.put(`/admins/${id}`, adminData);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await api.delete(`/admins/${id}`);
  return response.data;
};

export default api;
