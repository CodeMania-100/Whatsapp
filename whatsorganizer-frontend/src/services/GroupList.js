import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get('http://localhost:8000/api/groups/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                console.log("API response:", response.data);
                setGroups(response.data);
            } catch (error) {
                console.error("Error fetching groups:", error);
                setError('Failed to load groups.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    if (loading) return <div>Loading groups...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Groups</h2>
            {groups.length === 0 ? (
                <p>No groups found.</p>
            ) : (
                <ul>
                    {groups.map(group => (
                    <li key={group.id}>
                        {DOMPurify.sanitize(group.name)}
                        {group.is_member ? " (Member)" : " (Not a member)"}
                        <Link to={`/groups/edit/${group.id}`}>Edit</Link>
                    </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupList;