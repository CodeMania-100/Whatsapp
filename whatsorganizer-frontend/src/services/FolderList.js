// src/components/FolderList.js
import React, { useState, useEffect } from 'react';
import { fetchFolders } from './api';

const FolderList = () => {
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        fetchFolders().then(response => {
            setFolders(response.data);
        }).catch(error => {
            console.error("There was an error fetching the folders!", error);
        });
    }, []);

    return (
        <div>
            <h2>Folders</h2>
            <ul>
                {folders.map(folder => (
                    <li key={folder.id}>{folder.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FolderList;
