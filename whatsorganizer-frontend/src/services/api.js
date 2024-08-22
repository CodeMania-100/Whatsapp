import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost:8000/api';

const token = getAuthToken();
console.log('Retrieved token:', token);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Consolidated request interceptor
api.interceptors.request.use(
  config => {
    const token = getAuthToken(); // Use the getAuthToken function from authService
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchConversations = () => api.get('conversations/');
export const fetchFolders = () => api.get('folders/');
export const fetchGroups = () => api.get('groups/');
export const fetchGroup = (id) => api.get(`groups/${id}/`);
export const searchConversations = async (query) => {
  try {
    const response = await api.get(`conversations/search/`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};


// Update group by ID
export const updateGroup = async (id, data) => {
    const token = getAuthToken();
    console.log('Updating group with token:', token);
    console.log('Update data:', data);
    try {
      const response = await api.put(`groups/${id}/`, data);
      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error.response?.data || error.message);
      console.error('Full error object:', error);
      throw error;
    }
  };

// Update conversation by ID
export const updateConversation = (id, data) => api.put(`conversations/${id}/`, data);

// Update folder by ID
export const updateFolder = (id, data) => api.put(`folders/${id}/`, data);

export default api;