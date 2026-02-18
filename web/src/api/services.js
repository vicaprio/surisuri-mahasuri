import apiClient from './client';

export const servicesAPI = {
  getAll: (params) => apiClient.get('/services', { params }),
  getById: (id) => apiClient.get(`/services/${id}`),
  getByCategory: (category) => apiClient.get('/services', { params: { category } }),
};

export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data) =>
    apiClient.post('/auth/register', data),
  loginTechnician: (email, password) =>
    apiClient.post('/auth/technician/login', { email, password }),
};

export const serviceRequestAPI = {
  create: (data) => apiClient.post('/service-requests', data),
  getAll: (params) => apiClient.get('/service-requests', { params }),
  getById: (id) => apiClient.get(`/service-requests/${id}`),
  cancel: (id) => apiClient.post(`/service-requests/${id}/cancel`),
};

export const uploadAPI = {
  single: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  multiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const chatAPI = {
  getMessages: (roomId) => apiClient.get(`/chat/${roomId}`),
  sendMessage: (roomId, data) => apiClient.post(`/chat/${roomId}`, data),
};

export const aiAPI = {
  analyzeEstimate: (data) => apiClient.post('/ai/estimate', data),
};

export const technicianAPI = {
  getAll: (params) => apiClient.get('/technicians', { params }),
  getById: (id) => apiClient.get(`/technicians/${id}`),
};

export const supportAPI = {
  chat: (messages) => apiClient.post('/support/chat', { messages }),
};

export const reviewAPI = {
  create: (data) => apiClient.post('/reviews', data),
  getByServiceRequest: (serviceRequestId) => apiClient.get(`/reviews/service-request/${serviceRequestId}`),
  getByTechnician: (technicianId, params) => apiClient.get(`/reviews/technician/${technicianId}`, { params }),
  getStatistics: (technicianId) => apiClient.get(`/reviews/technician/${technicianId}/statistics`),
  markHelpful: (id) => apiClient.post(`/reviews/${id}/helpful`),
};
