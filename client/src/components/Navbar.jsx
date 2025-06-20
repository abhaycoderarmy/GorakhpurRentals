import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  Home,
  LogOut,
  Menu,
  X,
  User,
  Crown,
  Users,
  Package,
  ShoppingBag,
  Mail,
  Phone,
  FileText,
  UserCircle,
} from "lucide-react";


export default function Navbar() {
  const { user, logout } = useAuth();
   const { items: cart } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate cart count - total quantity of all items
  const cartCount = cart?.reduce((total, item) => total + (item.qty || 0), 0) || 0;

  const isAdmin = user?.user?.role === "admin" || user?.user?.isAdmin;
  const isAdminRoute = location.pathname.startsWith("/admin");
  

  if (isAdminRoute) {
    return (
      <nav className="w-full bg-gradient-to-r from-amber-50 via-white to-amber-50 shadow-lg border-b border-amber-200">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-amber-800">
                Admin Panel
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {[
                { to: "/admin/users", label: "Users", icon: Users },
                { to: "/admin/product", label: "Products", icon: Package },
                { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
                { to: "/admin/newsletters", label: "Newsletter", icon: Mail },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}

              <div className="w-px h-6 bg-amber-300 mx-3"></div>

              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200"
              >
                <Home size={16} />
                Home
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
                
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-amber-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {[
                  { to: "/admin/users", label: "Users", icon: Users },
                  { to: "/admin/product", label: "Products", icon: Package },
                  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
                  { to: "/admin/newsletters", label: "Newsletter", icon: Mail },
                  { to: "/", label: "Home", icon: Home },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 w-full text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Main navbar for users
  return (
    <nav className="w-full bg-gradient-to-r from-rose-100 via-amber-50 to-rose-100 shadow-lg">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Cloudinary Image */}
          <Link to="/" className="flex items-center gap-4 group">
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
                Premium Lehanga Rental
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!user ? (
              // Not logged in menu
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  HOME
                </Link>
                <Link
                  to="/product"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PRODUCTS
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  CONTACT US
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  LOGIN
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-medium rounded-md hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-md"
                >
                  <ShoppingCart size={16} />
                  <span className="hidden xl:inline">CART</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : isAdmin ? (
              // Admin user menu
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  HOME
                </Link>
                <Link
                  to="/admin"
                  className="px-6 py-2 text-sm font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  ADMIN PANEL
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-medium rounded-md hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-md"
                >
                  <ShoppingCart size={16} />
                  <span className="hidden xl:inline">CART</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-md">
                  <UserCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {user.user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                >
                  LOGOUT
              
                </button>
              </>
            ) : (
              // Regular user menu
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  HOME
                </Link>
                <Link
                  to="/product"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PRODUCTS
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-medium rounded-md hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-md"
                >
                  <ShoppingCart size={16} />
                  <span className="hidden xl:inline">CART</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  MY ORDERS
                </Link>
                <Link
                  to="/profile"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PROFILE
                </Link>
                <div >
                  {/* <UserCircle className="w-5 h-5 text-green-600" /> */}
                  <span className="text-sm font-medium text-green-800">
                    {user.user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                >
                  LOGOUT
                 
                </button>
              </>
            )}

            {/* Call Us Button */}
            <Link
              to="tel:+919721288881"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold rounded-md hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 shadow-md ml-4"
            >
              <Phone size={16} />
              CALL US
            </Link>
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
              {!user ? (
                // Not logged in mobile menu
                <>
                  {[
                    { to: "/", label: "HOME", icon: Home },
                    { to: "/product", label: "PRODUCTS", icon: Package },
                    { to: "/contact", label: "CONTACT US", icon: Mail },
                    { to: "/signup", label: "SIGN IN", icon: UserCircle },
                    { to: "/login", label: "LOGIN", icon: User },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    CART
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : isAdmin ? (
                // Admin mobile menu
                <>
                  <div className="px-3 py-2 bg-green-50 rounded-md mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Welcome, {user.user?.name}
                    </span>
                  </div>
                  {[
                    { to: "/", label: "HOME", icon: Home },
                    { to: "/admin", label: "ADMIN PANEL", icon: Crown },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    CART
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={18} />
                    LOGOUT

                  </button>
                </>
              ) : (
                // Regular user mobile menu
                <>
                  <div className="px-3 py-2 bg-green-50 rounded-md mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Welcome, {user.user?.name}
                    </span>
                  </div>
                  {[
                    { to: "/", label: "HOME", icon: Home },
                    { to: "/product", label: "PRODUCTS", icon: Package },
                    { to: "/orders", label: "MY ORDERS", icon: FileText },
                    { to: "/profile", label: "PROFILE", icon: UserCircle },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    CART
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={18} />
                    LOGOUT
                  </button>
                </>
              )}

              {/* Mobile Call Us */}
              <Link
                to="tel:+91XXXXXXXXXX"
                className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold rounded-md mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Phone size={18} />
                CALL US
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}