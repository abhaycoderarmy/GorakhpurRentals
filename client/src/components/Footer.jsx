import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  Home,
  LogOut,
  User,
  Crown,
  Users,
  Package,
  ShoppingBag,
  Mail,
  Phone,
  FileText,
  UserCircle,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Heart,
  Star,
  Award,
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
  Headphones,
} from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.user?.role === "admin" || user?.user?.isAdmin;
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Admin Footer
  if (isAdminRoute) {
    return (
      <footer className="bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 text-gray-800 border-t border-pink-300">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Admin Logo Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3">
                    <Crown className="w-8 h-8 text-white transition-all duration-500 group-hover:scale-110" />
                  </div>
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500 -z-10 animate-pulse"></div>
                  {/* Floating particles */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                  <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
                </div>
                <div className="transition-all duration-300 group-hover:translate-x-2">
                  <h3 className="text-2xl font-bold text-gray-800 transition-all duration-300 group-hover:text-pink-700">Admin Panel</h3>
                  <p className="text-gray-600 text-sm transition-all duration-300 group-hover:text-pink-600">Gorakhpur Rentals Management</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Comprehensive admin dashboard for managing premium lehenga rentals, 
                user accounts, orders, and business operations with powerful analytics and insights.
              </p>
              <div className="flex items-center gap-2 text-gray-700">
                <Shield className="w-4 h-4 text-pink-500" />
                <span className="text-sm">Secure Admin Access</span>
              </div>
            </div>

            {/* Admin Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Admin Tools</h4>
              <ul className="space-y-3">
                {[
                  { to: "/admin/users", label: "Manage Users", icon: Users },
                  { to: "/admin/product", label: "Products", icon: Package },
                  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
                  { to: "/admin/newsletters", label: "Newsletter", icon: Mail },
                ].map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200"
                    >
                      <Icon size={16} className="text-pink-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Support */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200"
                  >
                    <Home size={16} className="text-pink-500" />
                    Back to Website
                  </Link>
                </li>
                <li>
                  <a
                    href="tel:+91XXXXXXXXXX"
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200"
                  >
                    <Phone size={16} className="text-pink-500" />
                    Emergency Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:admin@gorakhpurrentals.com"
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200"
                  >
                    <Mail size={16} className="text-pink-500" />
                    Admin Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-pink-300 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                © 2024 Gorakhpur Rentals Admin Panel. All rights reserved.
              </p>
              <p className="text-pink-600 text-sm mt-2 md:mt-0">
                Secure • Reliable • Professional
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Main Footer for Users
  return (
    <footer className="bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 text-gray-800">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo and Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 group">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-xl transition-all duration-700 group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6">
                  <img
                    src="https://res.cloudinary.com/dpzagdlky/image/upload/v1750013431/hz34pwkz89ep5xwg73ue.png"
                    alt="Gorakhpur Rentals Logo"
                    className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110"
                  />
                </div>
                {/* Animated border ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-400 transition-all duration-700 group-hover:animate-pulse"></div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-500 opacity-0 group-hover:opacity-20 blur-sm transition-all duration-700 -z-10"></div>
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
                <div className="absolute -top-1 -left-3 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-600"></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-rose-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-800"></div>
              </div>
              <div className="text-center sm:text-left transition-all duration-500 group-hover:translate-x-2">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-none transition-all duration-500 group-hover:text-pink-700 group-hover:scale-105">
                  GORAKHPUR
                </h3>
                <p className="text-gray-600 font-semibold tracking-widest transition-all duration-500 group-hover:text-pink-600 group-hover:tracking-wider">RENTALS</p>
                <p className="text-gray-500 text-sm italic transition-all duration-500 group-hover:text-pink-500 group-hover:translate-x-1">Premium Lehanga Rental</p>
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-6 text-center sm:text-left">
              Experience the elegance of premium lehengas for your special occasions. 
              We provide exquisite traditional wear rentals with unmatched quality and service in Gorakhpur.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              {[
                { icon: Award, text: "Premium Quality" },
                { icon: Shield, text: "Trusted Service" },
                { icon: Truck, text: "Home Delivery" },
                { icon: RefreshCw, text: "Easy Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 group hover:scale-105 transition-all duration-300">
                  <Icon className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-gray-600 text-sm">Follow Us:</span>
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Youtube, href: "#" },
                ].map(({ icon: Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="w-10 h-10 bg-pink-200 hover:bg-pink-300 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group"
                  >
                    <Icon className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Links - Different for each user type */}
          <div className="sm:col-span-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center sm:text-left">Quick Links</h4>
            <ul className="space-y-3">
              {!user ? (
                // Not logged in links
                <>
                  <li>
                    <Link
                      to="/"
                      className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Home size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/product"
                      className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Package size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Mail size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <UserCircle size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <User size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Login
                    </Link>
                  </li>
                </>
              ) : isAdmin ? (
                // Admin links
                <>
                  <li>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Home size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Crown size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Admin Panel
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Users size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Manage Users
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Package size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Manage Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/orders"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <ShoppingBag size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      All Orders
                    </Link>
                  </li>
                </>
              ) : (
                // Regular user links
                <>
                  <li>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Home size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/product"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <Package size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <ShoppingCart size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      My Cart
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <FileText size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-700 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <UserCircle size={16} className="text-pink-500 transition-colors duration-200 group-hover:text-pink-600" />
                      My Profile
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Services */}
          <div className="sm:col-span-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center sm:text-left">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <Star className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">Premium Lehenga Rental</span>
                </div>
              </li>
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <Truck className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">Home Delivery & Pickup</span>
                </div>
              </li>
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <RefreshCw className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">Easy Returns & Exchange</span>
                </div>
              </li>
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <Shield className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">Quality Assurance</span>
                </div>
              </li>
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <Headphones className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">24/7 Customer Support</span>
                </div>
              </li>
              <li className="text-gray-600 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 group hover:scale-105 transition-all duration-300">
                  <CreditCard className="w-4 h-4 text-pink-500 group-hover:text-pink-600 transition-colors duration-300" />
                  <span className="text-sm">Flexible Payment Options</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center sm:text-left">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start justify-center sm:justify-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                  <div className="text-center sm:text-left">
                    <p className="text-gray-600 text-sm">
                      Main Store Address<br />
                      Civil Lines, Gorakhpur<br />
                      Uttar Pradesh, India
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 hover:text-pink-700 transition-colors duration-200"
                >
                  <Phone className="w-5 h-5 text-pink-500" />
                  <div className="text-center sm:text-left">
                    <p className="font-medium">+91 XXXXX XXXXX</p>
                    <p className="text-xs text-gray-500">Call for bookings</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@gorakhpurrentals.com"
                  className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 hover:text-pink-700 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 text-pink-500" />
                  <div className="text-center sm:text-left">
                    <p className="font-medium">info@gorakhpurrentals.com</p>
                    <p className="text-xs text-gray-500">Send us an email</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-pink-500" />
                  <div className="text-center sm:text-left">
                    <p className="font-medium">Open Daily</p>
                    <p className="text-xs text-gray-500">10:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-pink-300 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <p className="text-gray-600 text-sm">
                © 2024 Gorakhpur Rentals. Made with love for your special moments.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-pink-700 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-pink-700 transition-colors">
                Terms of Service
              </Link>
              <Link to="/refund" className="hover:text-pink-700 transition-colors">
                Refund Policy
              </Link>
              <Link to="/faq" className="hover:text-pink-700 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}