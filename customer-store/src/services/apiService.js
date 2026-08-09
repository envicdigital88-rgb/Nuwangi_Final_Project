import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Body Profile API
export const bodyProfileAPI = {
  getUserProfile: (userId) => 
    apiClient.get(`/body-profile/user/${userId}`),
  
  createProfile: (profileData) => 
    apiClient.post('/body-profile/create', profileData),
  
  updateProfile: (id, profileData) => 
    apiClient.put(`/body-profile/${id}`, profileData),
  
  analyzePhoto: (photo, userId) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('userId', userId);
    return apiClient.post('/body-profile/analyze-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadAvatarPhoto: (photo, userId) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('userId', userId);
    return apiClient.post('/body-profile/upload-avatar-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Virtual Try-On API
export const virtualTryOnAPI = {
  performTryOn: (tryOnData) => 
    apiClient.post('/virtual-tryon/try-on', tryOnData),
  
  getSessionResult: (sessionId) => 
    apiClient.get(`/virtual-tryon/session/${sessionId}`)
};

// Products API
export const productsAPI = {
  getAllProducts: () => 
    apiClient.get('/products'),
  
  getProduct: (id) => 
    apiClient.get(`/products/${id}`),
  
  searchProducts: (query) => 
    apiClient.get(`/products/search?q=${query}`),
    
  // Add pagination support
  getProductsPaginated: (page = 0, size = 10) =>
    apiClient.get(`/products?page=${page}&size=${size}`)
};

// Customer API
export const customerAPI = {
  getCustomers: () => 
    apiClient.get('/customers'),
  
  getCustomer: (id) => 
    apiClient.get(`/customers/${id}`),
  
  createCustomer: (customerData) => 
    apiClient.post('/customers', customerData),
  
  updateCustomer: (id, customerData) => 
    apiClient.put(`/customers/${id}`, customerData)
};

export default apiClient;