import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Modal from "react-modal";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './services/AuthProvider';

Modal.setAppElement("#root");

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>    
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
