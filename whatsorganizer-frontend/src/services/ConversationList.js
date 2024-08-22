import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ConversationList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const fetchConversations = async () => {
        try {
          const response = await axios.get('/api/conversations/');
          console.log('API Response:', response.data); // Check structure
          if (response.data && response.data.results) {
            setConversations(response.data.results);
          } else {
            setError('Unexpected data format');
          }
          setLoading(false);
        } catch (error) {
          setError('Failed to load conversations.');
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchConversations();
      }, []); // Empty dependency array ensures this only runs once when the component mounts
    
      if (loading) return <div>Loading...</div>;
      if (error) return <div>{error}</div>;
    
      return (
        <div>
          <h2>Conversations</h2>
          <ul>
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                {conversation.title}
                <Link to={`/conversations/edit/${conversation.id}`}>Edit</Link>
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    export default ConversationList;