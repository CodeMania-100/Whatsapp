import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './services/Login';
import GroupList from './services/GroupList';
import EditGroupComponent from './services/EditGroupComponent';
import EditFolderComponent from './services/EditFolderComponent';
import EditConversationComponent from './services/EditConversationComponent';
import SearchBar from './services/SearchBar';
import FolderList from './services/FolderList';
import ConversationList from './services/ConversationList';

const HomePage = ({ conversations, loading, error }) => (
  <div>
    <h1>Welcome to the Home Page</h1>
    <SearchBar />
    <GroupList />
    <FolderList />
    <ConversationList conversations={conversations} loading={loading} error={error} />
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchConversations(); // Ensure this fetches data when the token is set
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/conversations/');
      setConversations(response.data.results); // Adjust based on your API response structure
      setLoading(false);
    } catch (err) {
      setError('Failed to load conversations.');
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchConversations(); // Fetch conversations after successful login
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />
          } />
          <Route path="/" element={
            isAuthenticated ? <HomePage conversations={conversations} loading={loading} error={error} /> : <Navigate to="/login" replace />
          } />
          <Route path="/groups" element={
            isAuthenticated ? <GroupList /> : <Navigate to="/login" replace />
          } />
          <Route path="/groups/edit/:id" element={
            isAuthenticated ? <EditGroupComponent /> : <Navigate to="/login" replace />
          } />
          <Route path="/folders/edit/:id" element={
            isAuthenticated ? <EditFolderComponent /> : <Navigate to="/login" replace />
          } />
          <Route path="/conversations/edit/:id" element={
            isAuthenticated ? <EditConversationComponent /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;