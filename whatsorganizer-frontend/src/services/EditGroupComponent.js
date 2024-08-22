import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditGroupComponent = () => {
    const [group, setGroup] = useState(null);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroup();
    }, [id]);

    const fetchGroup = async () => {
        try {
            const response = await axios.get(`/api/groups/${id}/`);
            setGroup(response.data);
            setNewName(response.data.name);
            setLoading(false);
        } catch (err) {
            setError('Failed to load group. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        try {
            await axios.put(`/api/groups/${id}/`, { name: newName });
            setGroup({ ...group, name: newName });
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000); // Clear success message after 3 seconds
        } catch (err) {
            setError('Failed to update group. Please try again.');
        }
        setUpdating(false);
    };

    if (loading) return <div>Loading...</div>;
    if (!group) return <div>Group not found.</div>;

    return (
        <div>
            <h2>Edit Group: {group.name}</h2>
            {error && <div className="error">{error}</div>}
            {updateSuccess && <div className="success">Group updated successfully!</div>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={updating}
                />
                <button type="submit" disabled={updating || newName === group.name}>
                    {updating ? 'Updating...' : 'Update Group Name'}
                </button>
            </form>
            <div className="navigation-buttons">
                <button onClick={() => navigate('/groups')}>Back to Groups</button>
                <button onClick={() => navigate('/')}>Back to Homepage</button>
            </div>
        </div>
    );
};

export default EditGroupComponent;