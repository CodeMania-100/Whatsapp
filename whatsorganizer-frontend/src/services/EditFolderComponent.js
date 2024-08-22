import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditFolderComponent = () => {
    const [folder, setFolder] = useState(null);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchFolder();
    }, [id]);

    const fetchFolder = async () => {
        try {
            const response = await axios.get(`/api/folders/${id}/`);
            setFolder(response.data);
            setNewName(response.data.name);
            setLoading(false);
        } catch (err) {
            setError('Failed to load folder. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        try {
            await axios.put(`/api/folders/${id}/`, { name: newName });
            setFolder({ ...folder, name: newName });
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000); // Clear success message after 3 seconds
        } catch (err) {
            setError('Failed to update folder. Please try again.');
        }
        setUpdating(false);
    };

    if (loading) return <div>Loading...</div>;
    if (!folder) return <div>Folder not found.</div>;

    return (
        <div>
            <h2>Edit Folder: {folder.name}</h2>
            {error && <div className="error">{error}</div>}
            {updateSuccess && <div className="success">Folder updated successfully!</div>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={updating}
                />
                <button type="submit" disabled={updating || newName === folder.name}>
                    {updating ? 'Updating...' : 'Update Folder Name'}
                </button>
            </form>
            <div className="navigation-buttons">
                <button onClick={() => navigate('/folders')}>Back to Folders</button>
                <button onClick={() => navigate('/')}>Back to Homepage</button>
            </div>
        </div>
    );
};

export default EditFolderComponent;