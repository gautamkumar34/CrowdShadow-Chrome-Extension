// client/src/sidebar.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './sidebarApp.jsx';
import './index.css'; // Tailwind CSS
import SidebarApp from './sidebarApp.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SidebarApp/>
  </React.StrictMode>,
);