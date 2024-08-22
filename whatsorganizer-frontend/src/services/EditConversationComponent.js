import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditConversationComponent = () => {
    const [conversation, setConversation] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`http://localhost:8000/api/conversations/${id}/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setConversation(response.data);
                setNewTitle(response.data.title);
                setNewContent(response.data.content);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching conversation:', err);
                setError('Failed to load conversation. Please try again.');
                setLoading(false);
            }
        };
        fetchConversation();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem('auth_token');
          const response = await axios.put(`http://localhost:8000/api/conversations/${id}/`, 
            { 
              title: newTitle, 
              content: newContent,
              folder: conversation.folder
            },
            { headers: { 'Authorization': `Token ${token}` } }
          );
          console.log('Conversation updated:', response.data);
      
          // Optionally, you can call a function to refetch conversations here
          // fetchConversations(); // Ensure this function is accessible or use context/state management to update
          navigate('/'); // Navigate after update
        } catch (err) {
          console.error('Error updating conversation:', err);
          setError('Failed to update conversation. Please try again.');
        }
      };
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!conversation) return <div>Conversation not found.</div>;

    return (
        <div>
            <h2>Edit Conversation</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Content:</label>
                    <textarea 
                        value={newContent} 
                        onChange={(e) => setNewContent(e.target.value)} 
                    />
                </div>
                <button type="submit">Update Conversation</button>
            </form>
            <button onClick={() => navigate('/')}>Back to Homepage</button>
        </div>
    );
};

export default EditConversationComponent;