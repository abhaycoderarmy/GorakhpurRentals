import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="your-google-client-id">
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <App />
        </CartProvider>

      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
)
