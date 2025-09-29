import './global-shim.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './ThemeContext.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './App.css';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/embed/:sessionId', element: <App embedMode={true} /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);