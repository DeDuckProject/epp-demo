import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global variables and styles first
import App from './components/App'; // Import our custom App component
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
