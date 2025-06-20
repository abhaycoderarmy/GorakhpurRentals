import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  BarChart3, 
  Sparkles, 
  Plus,
  Upload,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  Truck,
  Edit3,
  RefreshCw
} from 'lucide-react';

// Main AdminDashboard Component
const AdminDashboard = ({ user, onNavigate }) => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
  const getAuthToken = () => localStorage.getItem('token');

  // Navigation function - either use prop or default
  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Default navigation behavior - you can customize this
      window.location.href = path;
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      // Get auth token from localStorage
      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Initialize stats object
      let totalOrders = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let totalRevenue = 0;
      let uniqueUsers = 0;
      let productsCount = 0;
      let usersCount = 0;

      // Fetch all orders to calculate stats
      try {
        const ordersResponse = await fetch(`${API_BASE_URL}/orders?limit=1000`, { headers });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success) {
            const orders = ordersData.orders || [];
            
            // Calculate order stats
            totalOrders = orders.length;
            completedOrders = orders.filter(order => order.orderStatus === 'delivered').length;
            pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;
            
            // Calculate revenue from completed/paid orders
            totalRevenue = orders
              .filter(order => order.paymentStatus === 'paid' || order.orderStatus === 'delivered')
              .reduce((sum, order) => sum + (order.total || 0), 0);

            // Get unique users count from orders
            uniqueUsers = new Set(orders.map(order => order.userId?._id || order.userId)).size;
          }
        }
      } catch (err) {
        console.log('Could not fetch orders:', err);
      }

      // Fetch products count
      try {
        const productsResponse = await fetch(`${API_BASE_URL}/products`, { 
          headers: { 'Content-Type': 'application/json' }
        });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success || productsData.products) {
            productsCount = productsData.products?.length || 0;
          }
        }
      } catch (err) {
        console.log('Could not fetch products count:', err);
      }

      // Fetch users count (try multiple possible endpoints)
      try {
        // Try admin users endpoint first
        let usersResponse = await fetch(`${API_BASE_URL}/admin/users`, { headers });
        
        if (!usersResponse.ok) {
          // Try alternative users endpoint
          usersResponse = await fetch(`${API_BASE_URL}/users`, { headers });
        }
        
        if (!usersResponse.ok) {
          // Try users with different path
          usersResponse = await fetch(`${API_BASE_URL}/api/users`, { headers });
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.users) {
            usersCount = usersData.users.length;
          } else if (usersData.success && usersData.data) {
            usersCount = usersData.data.length;
          } else if (Array.isArray(usersData)) {
            usersCount = usersData.length;
          }
        }
      } catch (err) {
        console.log('Could not fetch users count:', err);
        // Fallback to unique users from orders if direct user endpoint fails
        usersCount = uniqueUsers;
      }

      // Use the higher count between direct users fetch and unique users from orders
      const finalUsersCount = Math.max(usersCount, uniqueUsers);

      // Build stats data
      const statsData = [
        { 
          label: "Total Orders", 
          value: totalOrders.toString(), 
          icon: ShoppingBag, 
          color: "from-blue-500 to-blue-600", 
          change: `${pendingOrders} pending`,
          loading: false 
        },
        { 
          label: "Active Users", 
          value: finalUsersCount.toString(), 
          icon: Users, 
          color: "from-green-500 to-green-600", 
          change: usersCount > uniqueUsers ? "Total registered" : "From orders",
          loading: false 
        },
        { 
          label: "Products", 
          value: productsCount.toString(), 
          icon: Package, 
          color: "from-purple-500 to-purple-600", 
          change: "In catalog",
          loading: false 
        },
        { 
          label: "Revenue", 
          value: `₹${totalRevenue.toLocaleString('en-IN')}`, 
          icon: IndianRupee, 
          color: "from-orange-500 to-orange-600", 
          change: `${completedOrders} completed`,
          loading: false 
        }
      ];

      setStats(statsData);

      // Generate recent activities from orders (including status updates)
      await fetchRecentActivities(headers);

      setLoading(false);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Enhanced function to fetch recent activities including status updates
  const fetchRecentActivities = async (headers) => {
    try {
      // Fetch recent orders
      const ordersResponse = await fetch(`${API_BASE_URL}/orders?limit=20&sort=-updatedAt`, { headers });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || [];
        
        let allActivities = [];

        // Process each order to create activities
        orders.forEach(order => {
          const customerName = order.userId?.name || order.customerDetails?.name || 'Guest';
          const orderId = order._id?.slice(-6) || 'N/A';
          
          // 1. Order placement activity (based on orderDate/createdAt)
          if (order.orderDate || order.createdAt) {
            allActivities.push({
              action: `New order placed - Order #${orderId}`,
              user: customerName,
              time: order.orderDate || order.createdAt,
              status: 'info',
              type: 'order_placed',
              orderId: order._id
            });
          }

          // 2. Status update activities (if order was recently updated)
          if (order.updatedAt && order.updatedAt !== (order.orderDate || order.createdAt)) {
            const statusActivity = getStatusUpdateActivity(order, customerName, orderId);
            if (statusActivity) {
              allActivities.push({
                ...statusActivity,
                time: order.updatedAt,
                orderId: order._id
              });
            }
          }

          // 3. Payment status activities
          if (order.paymentStatus === 'paid' && order.paymentDate) {
            allActivities.push({
              action: `Payment received - Order #${orderId}`,
              user: customerName,
              time: order.paymentDate,
              status: 'success',
              type: 'payment_received',
              orderId: order._id
            });
          }

          // 4. Delivery confirmation
          if (order.orderStatus === 'delivered' && order.deliveredAt) {
            allActivities.push({
              action: `Order delivered - Order #${orderId}`,
              user: customerName,
              time: order.deliveredAt,
              status: 'success',
              type: 'order_delivered',
              orderId: order._id
            });
          }
        });

        // Sort all activities by time (most recent first)
        allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Take only the most recent 10 activities
        const recentActivities = allActivities.slice(0, 10).map(activity => ({
          ...activity,
          time: formatTime(activity.time)
        }));

        setActivities(recentActivities);
      }
    } catch (err) {
      console.log('Could not fetch recent activities:', err);
    }
  };

  // Helper function to generate status update activity
  const getStatusUpdateActivity = (order, customerName, orderId) => {
    switch (order.orderStatus) {
      case 'confirmed':
        return {
          action: `Order confirmed - Order #${orderId}`,
          user: customerName,
          status: 'success',
          type: 'status_update'
        };
      case 'processing':
        return {
          action: `Order processing started - Order #${orderId}`,
          user: customerName,
          status: 'warning',
          type: 'status_update'
        };
      case 'shipped':
        return {
          action: `Order shipped - Order #${orderId}`,
          user: customerName,
          status: 'info',
          type: 'status_update'
        };
      case 'delivered':
        return {
          action: `Order delivered - Order #${orderId}`,
          user: customerName,
          status: 'success',
          type: 'status_update'
        };
      case 'cancelled':
        return {
          action: `Order cancelled - Order #${orderId}`,
          user: customerName,
          status: 'error',
          type: 'status_update'
        };
      default:
        return null;
    }
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Helper function to get activity icon and styling
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'order_placed':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'status_update':
        switch (activity.status) {
          case 'success':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
          case 'warning':
            return <Clock className="w-4 h-4 text-yellow-500" />;
          case 'info':
            return <Truck className="w-4 h-4 text-blue-500" />;
          case 'error':
            return <X className="w-4 h-4 text-red-500" />;
          default:
            return <Edit3 className="w-4 h-4 text-gray-500" />;
        }
      case 'payment_received':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'order_delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
    }
  };

  // Helper function to get activity background color
  const getActivityBgColor = (activity) => {
    switch (activity.status) {
      case 'success': return 'bg-green-100';
      case 'info': return 'bg-blue-100';
      case 'warning': return 'bg-yellow-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const actions = [
    { 
      title: "Add New Product", 
      description: "Add a new lehenga to your collection", 
      icon: Plus, 
      color: "from-pink-500 to-purple-600",
      action: "/admin/add-product"
    },
    { 
      title: "View Analytics", 
      description: "Check your business performance", 
      icon: BarChart3, 
      color: "from-blue-500 to-indigo-600",
      action: "/admin/analytics"
    },
    { 
      title: "Manage Orders", 
      description: "Process pending orders", 
      icon: ShoppingBag, 
      color: "from-green-500 to-emerald-600",
      action: "/admin/orders"
    }
  ];

  // Default loading states for stats
  const defaultStats = [
    { label: "Total Orders", value: "--", icon: ShoppingBag, color: "from-blue-500 to-blue-600", change: "Loading...", loading: true },
    { label: "Active Users", value: "--", icon: Users, color: "from-green-500 to-green-600", change: "Loading...", loading: true },
    { label: "Products", value: "--", icon: Package, color: "from-purple-500 to-purple-600", change: "Loading...", loading: true },
    { label: "Revenue", value: "--", icon: IndianRupee, color: "from-orange-500 to-orange-600", change: "Loading...", loading: true }
  ];

  const displayStats = loading ? defaultStats : stats;
  const userName = user?.name || user?.user?.name || "Admin";

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex"> 
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Welcome Back, {userName}!</h1>
                <p className="text-gray-600 text-lg">Here's what's happening with your rental business today.</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.loading ? (
                      <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    {stat.loading ? (
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.action)}
                    className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              <button
                onClick={fetchStats}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                // Loading state for activities
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl animate-pulse"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBgColor(activity)}`}>
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.user && `${activity.user} • `}{activity.time}
                      </p>
                    </div>
                    {activity.type === 'status_update' && (
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        Status Update
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No recent activity</p>
                  <p className="text-gray-400 text-sm">Activity will appear here as orders come in and status updates occur</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;