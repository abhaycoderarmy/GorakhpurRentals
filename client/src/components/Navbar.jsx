import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-pink-600">
        Gorakhpur Rentals
      </Link>

      <div className="flex items-center space-x-6 text-gray-700">
        {!user && (
          <>
            <Link to="/login" className="hover:text-pink-600">Login</Link>
            <Link to="/register" className="hover:text-pink-600">Register</Link>
          </>
        )}

        {user && !user.isAdmin && (
          <>
            <Link to="/my-bookings" className="hover:text-pink-600">My Bookings</Link>
            <button onClick={handleLogout} className="text-red-600 hover:underline">
              Logout
            </button>
          </>
        )}

        {user?.isAdmin && (
          <>
            <Link to="/admin" className="hover:text-pink-600">Admin Dashboard</Link>
            <Link to="/admin/add-product" className="hover:text-pink-600">Add Product</Link>
            <button onClick={handleLogout} className="text-red-600 hover:underline">
              Logout button
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
