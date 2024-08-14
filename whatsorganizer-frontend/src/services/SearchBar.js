// src/components/SearchBar.js
import React, { useState } from 'react';
import { searchConversations } from '../services/api';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = () => {
        searchConversations(query).then(response => {
            setResults(response.data);
        }).catch(error => {
            console.error("There was an error performing the search!", error);
        });
    };

    return (
        <div>
            <h2>Search Conversations</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
            />
            <button onClick={handleSearch}>Search</button>

            <ul>
                {results.map(result => (
                    <li key={result.id}>{result.title}: {result.content}</li>
                ))}
            </ul>
        </div>
    );
};

export default SearchBar;
