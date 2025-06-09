import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import MyBookings from './pages/MyBookings';
import Navbar from './components/Navbar';
import AddProduct from './pages/admin/AddProduct';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </div>
  );
}

export default App;
