import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { EventProvider } from './context/EventContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RegistrationProvider>
            <BookmarkProvider>
              <EventProvider>
                <App />
              </EventProvider>
            </BookmarkProvider>
          </RegistrationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
