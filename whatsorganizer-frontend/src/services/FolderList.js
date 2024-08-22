import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FolderList = () => {
    const [folders, setFolders] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFolders = () => {
        const token = localStorage.getItem('auth_token');
        axios.get('http://localhost:8000/api/folders/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(response => {
            console.log('API Response:', response.data); // Log the response
            if (Array.isArray(response.data)) {
                setFolders(response.data);
            } else if (response.data && Array.isArray(response.data.results)) {
                setFolders(response.data.results);
            } else {
                setError('Unexpected data format received from the server');
            }
        })
        .catch(error => {
            setError(error.message);
            console.error('Error fetching folders:', error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    if (isLoading) return <div>Loading folders...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Folders</h2>
            {folders.length === 0 ? (
                <p>No folders found.</p>
            ) : (
                <ul>
                {folders.map(folder => (
                    <li key={folder.id}>
                        {folder.name}
                        <Link to={`/folders/edit/${folder.id}`}>Edit</Link>
                    </li>
                ))}
            </ul>
            )}
        </div>
    );
};

export default FolderList;