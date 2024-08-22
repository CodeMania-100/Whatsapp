import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Base URL

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api-token-auth/`, credentials);
        const { token } = response.data;
        localStorage.setItem('auth_token', token);
        // Set the default Authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
};

export const getAuthToken = () => localStorage.getItem('auth_token');
