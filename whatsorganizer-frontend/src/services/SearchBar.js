import React, { useState } from 'react';
import { searchConversations } from './api';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await searchConversations(query);
            setResults(response.results || {});
            setError(null);
        } catch (err) {
            console.error('Error performing search:', err);
            setResults({});
            setError('An error occurred while searching. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                />
                <button type="submit">Search</button>
            </form>
            {error && <p>{error}</p>}
            {Object.keys(results).length > 0 ? (
                <div>
                    {results.conversations && results.conversations.length > 0 && (
                        <div>
                            <h2>Conversations</h2>
                            <ul>
                                {results.conversations.map((conversation) => (
                                    <li key={conversation.id}>
                                        <h3>{conversation.title}</h3>
                                        <p>{conversation.content}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {results.folders && results.folders.length > 0 && (
                        <div>
                            <h2>Folders</h2>
                            <ul>
                                {results.folders.map((folder) => (
                                    <li key={folder.id}>{folder.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {results.groups && results.groups.length > 0 && (
                        <div>
                            <h2>Groups</h2>
                            <ul>
                                {results.groups.map((group) => (
                                    <li key={group.id}>{group.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default SearchBar;