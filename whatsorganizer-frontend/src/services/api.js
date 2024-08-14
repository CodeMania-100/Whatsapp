// src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

// Fetch all folders
export const fetchFolders = () => axios.get(`${API_URL}folders/`);

// Fetch all conversations
export const fetchConversations = () => axios.get(`${API_URL}conversations/`);

// Search conversations
export const searchConversations = (query) => axios.get(`${API_URL}conversations/search/`, {
    params: { q: query },
});
