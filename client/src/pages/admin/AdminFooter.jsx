import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Package,
  Users,
  ShoppingBag,
  Mail,
  LogOut,
  Home,
  Phone,
  UserCircle,
  MapPin,
  Clock,
  Shield,
  Award,
  Crown,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Headphones,
  TrendingUp,
} from "lucide-react";

export default function AdminFooter() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const adminMenuItems = [
    { to: "/admin/dashboard", label: "DASHBOARD", icon: BarChart3 },
    { to: "/admin/analytics", label: "ANALYTICS", icon: TrendingUp },
    { to: "/admin/products", label: "MANAGE PRODUCTS", icon: Package },
    { to: "/admin/users", label: "MANAGE USERS", icon: Users },
    { to: "/admin/orders", label: "MANAGE ORDERS", icon: ShoppingBag },
    { to: "/admin/newsletters", label: "SEND NEWSLETTERS", icon: Mail },
  ];



  return (
    <footer className="w-full bg-gradient-to-r from-rose-100 via-amber-50 to-rose-100 border-t-2 border-amber-200 shadow-lg">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Admin Logo & Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center lg:items-start">
              {/* Logo with same animations as navbar */}
              <div className="flex items-center gap-4 mb-6 group">
                <div className="relative transition-all duration-500 group-hover:rotate-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl">
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
                
                <div className="flex flex-col transition-all duration-300 group-hover:translate-x-2">
                  <span className="text-xl font-bold text-amber-800 leading-none tracking-wide transition-all duration-300 group-hover:text-amber-900 group-hover:scale-105">
                    GORAKHPUR
                  </span>
                  <span className="text-xs text-amber-600 font-semibold tracking-widest transition-all duration-300 group-hover:text-amber-700 group-hover:tracking-wider">
                    RENTALS
                  </span>
                  <span className="text-xs text-amber-500 font-medium italic transition-all duration-300 group-hover:text-amber-600 group-hover:translate-x-1">
                    Admin Panel
                  </span>
                </div>
              </div>

              {/* Admin Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full border border-amber-300 mb-4">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Administrator</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                <UserCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {user?.user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-green-600">
                    {user?.user?.email || "admin@gorakhpurrentals.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Navigation Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-amber-800 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Admin Tools
            </h4>
            <ul className="space-y-3">
              {adminMenuItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 uppercase tracking-wide group ${
                      location.pathname === to
                        ? "bg-amber-200 text-amber-900"
                        : "text-amber-700 hover:text-amber-900 hover:bg-amber-100 hover:translate-x-1"
                    }`}
                  >
                    <Icon size={16} className="transition-transform duration-200 group-hover:scale-110" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Quick Actions */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-amber-800 mb-6 flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              Support & Actions
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 hover:translate-x-1 group"
                >
                  <Home size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  Back to Website
                </Link>
              </li>
              <li>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-all duration-200 hover:translate-x-1 group"
                >
                  <Phone size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  Emergency Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@gorakhpurrentals.com"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-md transition-all duration-200 hover:translate-x-1 group"
                >
                  <Mail size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  Admin Email
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 hover:translate-x-1 group w-full text-left"
                >
                  <LogOut size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  LOGOUT
                </button>
              </li>
            </ul>

            {/* System Status */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-800">System Status</span>
              </div>
              <div className="space-y-1 text-xs text-green-700">
                <p>✓ All Services Online</p>
                <p>✓ Database Connected</p>
                <p>✓ Security Active</p>
              </div>
            </div>
          </div>

          {/* Contact & Business Info */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-amber-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Business Info
            </h4>
            
            {/* Contact Information */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">Main Store</p>
                  <p className="text-xs text-gray-600">
                    Civil Lines, Gorakhpur<br />
                    Uttar Pradesh, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">+91 XXXXX XXXXX</p>
                  <p className="text-xs text-gray-600">Business Line</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">Open Daily</p>
                  <p className="text-xs text-gray-600">10:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            {/* Business Features */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: Shield, text: "Secure Admin" },
                { icon: Award, text: "Premium Service" },
                { icon: Users, text: "User Management" },
                { icon: BarChart3, text: "Analytics" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                  <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-3">
              <span className="text-sm text-gray-700 font-medium">Follow Business:</span>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, href: "#", color: "hover:bg-blue-100 hover:text-blue-600" },
                  { icon: Instagram, href: "#", color: "hover:bg-pink-100 hover:text-pink-600" },
                  { icon: Twitter, href: "#", color: "hover:bg-sky-100 hover:text-sky-600" },
                  { icon: Youtube, href: "#", color: "hover:bg-red-100 hover:text-red-600" },
                ].map(({ icon: Icon, href, color }) => (
                  <a
                    key={href}
                    href={href}
                    className={`w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group ${color}`}
                  >
                    <Icon className="w-4 h-4 text-amber-600 transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-amber-300 mt-8 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <p className="text-gray-600 text-sm">
                © 2024 Gorakhpur Rentals Admin Panel. Secure & Professional Management.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Secure Access
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Premium Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}