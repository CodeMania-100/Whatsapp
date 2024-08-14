import React from 'react';
import logo from './logo.svg';
import './App.css';
import FolderList from './services/FolderList.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>WhatsOrganizer</h1>
      </header>
      <main>
        <FolderList />
        {/* Add more components like ConversationList and SearchBar here */}
      </main>
      <footer>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </footer>
    </div>
  );
}

export default App;