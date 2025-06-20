import React from "react";
import { Link } from "react-router-dom";
import { 
  Crown,
  BarChart3,
  Package,
  Plus,
  Users,
  ShoppingBag,
  Mail,
  Home
} from "lucide-react";

const Sidebar = ({ role }) => {
  const routes = [
    { path: "/admin/dashboard", label: "Dashboard", icon: Home, color: "text-blue-400" },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3, color: "text-green-400" },
    { path: "/admin/products", label: "Manage Products", icon: Package, color: "text-purple-400" },
    { path: "/admin/add-product", label: "Add Products", icon: Plus, color: "text-pink-400" },
    { path: "/admin/users", label: "Manage Users", icon: Users, color: "text-indigo-400" },
    { path: "/admin/orders", label: "Manage Orders", icon: ShoppingBag, color: "text-orange-400" },
    { path: "/admin/newsletter", label: "Send Newsletter", icon: Mail, color: "text-teal-400" },
  ];

  return (
    <div className="w-80 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl border-r border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-400 text-sm">Manage your rental business</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {routes.map((route, index) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className="group flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:translate-x-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 ${route.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                    {route.label}
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-white/30 transition-all duration-300"></div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm text-center">
              Admin Dashboard v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;