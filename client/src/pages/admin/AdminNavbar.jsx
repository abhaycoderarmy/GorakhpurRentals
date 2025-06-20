import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Package,
  Users,
  ShoppingBag,
  Mail,
  LogOut,
  Menu,
  X,
  Home,
  Phone,
  UserCircle,
} from "lucide-react";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Navigate to login page after logout
    window.location.href = "/login";
  };

  const adminMenuItems = [
    { to: "/admin/dashboard", label: "DASHBOARD", icon: BarChart3 },
    { to: "/admin/giftcardmanagement", label: "GIFTCARD", icon: BarChart3 },
    { to: "/admin/products", label: "MANAGE PRODUCTS", icon: Package },
    { to: "/admin/users", label: "MANAGE USERS", icon: Users },
    { to: "/admin/orders", label: "MANAGE ORDERS", icon: ShoppingBag },
    { to: "/admin/newsletters", label: "SEND NEWSLETTERS", icon: Mail },
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-rose-100 via-amber-50 to-rose-100 shadow-lg">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Cloudinary Image */}
          <Link to="/admin/dashboard" className="flex items-center gap-4 group">
            {/* Cloudinary Logo with Hover Effects */}
            <div className="relative transition-all duration-500 group-hover:rotate-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dpzagdlky/image/upload/v1750013431/hz34pwkz89ep5xwg73ue.png"
                  alt="Gorakhpur Rentals Logo"
                  className="w-full h-full object-contain transition-all duration-500"
                />
              </div>

              {/* Animated Border Ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-amber-400 transition-all duration-500 group-hover:animate-pulse"></div>

              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 opacity-0 group-hover:opacity-10 blur-sm transition-all duration-500 -z-10"></div>

              {/* Floating Particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
              <div className="absolute -top-1 -left-3 w-1.5 h-1.5 bg-amber-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-600"></div>
            </div>

            {/* Animated Brand Text */}
            <div className="flex flex-col transition-all duration-300 group-hover:translate-x-2">
              <span className="text-2xl font-bold text-amber-800 leading-none tracking-wide transition-all duration-300 group-hover:text-amber-900 group-hover:scale-105">
                GORAKHPUR
              </span>
              <span className="text-sm text-amber-600 font-semibold tracking-widest transition-all duration-300 group-hover:text-amber-700 group-hover:tracking-wider">
                RENTALS
              </span>
              <span className="text-xs text-amber-500 font-medium italic transition-all duration-300 group-hover:text-amber-600 group-hover:translate-x-1">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {adminMenuItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 uppercase tracking-wide ${
                  location.pathname === to
                    ? "bg-amber-200 text-amber-900"
                    : "text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="hidden xl:inline">{label}</span>
                </div>
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-amber-300 mx-3"></div>

            {/* Home Link */}
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-md transition-all duration-200 uppercase tracking-wide"
            >
              <div className="flex items-center gap-2">
                <Home size={16} />
                <span className="hidden xl:inline">HOME</span>
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-md">
              <UserCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {user?.user?.name || "Admin"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 uppercase tracking-wide"
            >
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                <span className="hidden xl:inline">LOGOUT</span>
              </div>
            </button>

            {/* Call Us Button */}
            
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Welcome */}
              <div className="px-3 py-2 bg-green-50 rounded-md mb-2">
                <span className="text-sm font-medium text-green-800">
                  Welcome, {user?.user?.name || "Admin"}
                </span>
              </div>

              {/* Admin Menu Items */}
              {adminMenuItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                    location.pathname === to
                      ? "bg-amber-100 text-amber-900"
                      : "text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-amber-200 my-2"></div>

              {/* Home Link */}
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={18} />
                HOME
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 w-full text-left"
              >
                <LogOut size={18} />
                LOGOUT
              </button>

              {/* Mobile Call Us */}
              
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}