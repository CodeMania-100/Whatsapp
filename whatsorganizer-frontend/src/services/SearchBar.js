import React, { useState } from 'react';
import { searchConversations } from './api';

const highlightText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <mark key={index}>{part}</mark> 
        : part
    );
  };

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
                        <h3>{highlightText(conversation.title, query)}</h3>
                        <p>{highlightText(conversation.content, query)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Similar changes for folders and groups if needed */}
              {results.folders && results.folders.length > 0 && (
                <div>
                  <h2>Folders</h2>
                  <ul>
                    {results.folders.map((folder) => (
                      <li key={folder.id}>{highlightText(folder.name, query)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.groups && results.groups.length > 0 && (
                <div>
                  <h2>Groups</h2>
                  <ul>
                    {results.groups.map((group) => (
                      <li key={group.id}>{highlightText(group.name, query)}</li>
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