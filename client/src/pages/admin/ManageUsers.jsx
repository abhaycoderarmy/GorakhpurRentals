
import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Mail, Phone, MapPin, Calendar, Package, DollarSign, Filter, ChevronDown, ChevronUp, User, Shield, Clock, CheckCircle, Star, AlertCircle, TrendingUp, UserCheck, UserX } from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    adminUsers: 0
  });

  // In a real app, you'd get this from your auth context
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; 
  const getAuthToken = () => localStorage.getItem('token'); // Adjust based on your auth implementation

  // Calculate stats from users data
  const calculateStats = (usersData) => {
    const totalUsers = usersData.length;
    const verifiedUsers = usersData.filter(user => user.isVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;
    const adminUsers = usersData.filter(user => user.isAdmin).length;
    
    setStats({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers
    });
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      const usersData = data.users || data || [];
      setUsers(usersData);
      calculateStats(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please check if the admin users endpoint exists.');
      // For demo purposes if endpoint doesn't exist yet
      setUsers([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user orders
  const fetchUserOrders = async (userId, email) => {
    try {
      setOrdersLoading(true);
      let url = '';
      
      if (userId && userId !== 'guest') {
        url = `${API_BASE_URL}/orders/user/${userId}`;
      } else if (email) {
        url = `${API_BASE_URL}/orders/email/${email}`;
      } else {
        setUserOrders([]);
        return;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setUserOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and verification status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVerified === 'all' || 
                         (filterVerified === 'verified' && user.isVerified) ||
                         (filterVerified === 'unverified' && !user.isVerified);
    return matchesSearch && matchesFilter;
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    fetchUserOrders(user._id, user.email);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = {
      order: {
        placed: { bg: 'bg-blue-500', text: 'text-gray-800', icon: Clock },
        confirmed: { bg: 'bg-yellow-500', text: 'text-gray-800', icon: CheckCircle },
        processing: { bg: 'bg-orange-500', text: 'text-gray-800', icon: Package },
        shipped: { bg: 'bg-purple-500', text: 'text-gray-800', icon: TrendingUp },
        delivered: { bg: 'bg-green-500', text: 'text-gray-800', icon: CheckCircle },
        cancelled: { bg: 'bg-red-500', text: 'text-gray-800', icon: AlertCircle }
      },
      payment: {
        pending: { bg: 'bg-yellow-500', text: 'text-gray-800', icon: Clock },
        paid: { bg: 'bg-green-500', text: 'text-gray-800', icon: CheckCircle },
        failed: { bg: 'bg-red-500', text: 'text-gray-800', icon: AlertCircle },
        refunded: { bg: 'bg-gray-500', text: 'text-gray-800', icon: DollarSign }
      }
    };

    const config = statusConfig[type]?.[status] || { bg: 'bg-gray-500', text: 'text-gray-800', icon: AlertCircle };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-sm`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status?.toUpperCase()}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg ttext-gray-800`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-gray-800/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-800 text-lg font-medium">Loading users...</p>
          <p className="text-gray-600 text-sm">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="from-blue-500 to-blue-600"
            subtitle="All registered users"
          />
          <StatCard
            title="Verified Users"
            value={stats.verifiedUsers}
            icon={UserCheck}
            color="from-green-500 to-green-600"
            subtitle="Email verified accounts"
          />
          <StatCard
            title="Unverified Users"
            value={stats.unverifiedUsers}
            icon={UserX}
            color="from-yellow-500 to-yellow-600"
            subtitle="Pending verification"
          />
          <StatCard
            title="Admin Users"
            value={stats.adminUsers}
            icon={Shield}
            color="from-purple-500 to-purple-600"
            subtitle="Administrative accounts"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="xl:col-span-2 flex flex-col max-h-[600px]">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex flex-col h-full">
              {/* Search and Filter */}
              <div className="p-6 border-b border-white/20">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-800 placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                    <select
                      className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none backdrop-blur-sm"
                      value={filterVerified}
                      onChange={(e) => setFilterVerified(e.target.value)}
                    >
                      <option value="all" className="bg-slate-800">All Users</option>
                      <option value="verified" className="bg-slate-800">Verified</option>
                      <option value="unverified" className="bg-slate-800">Unverified</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center text-gray-600">
                    {users.length === 0 ? (
                      <div>
                        <Users className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm">Admin users endpoint not implemented yet</p>
                      </div>
                    ) : (
                      <div>
                        <Search className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                        <p className="text-lg font-medium">No users match your search</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`p-6 hover:bg-white/5 cursor-pointer transition-all duration-200 ${
                          selectedUser?._id === user._id ? 'bg-purple-500/20 border-r-4 border-purple-400' : ''
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative flex-shrink-0">
                              {user.profilePhoto ? (
                                <img
                                  className="h-14 w-14 rounded-full object-cover ring-2 ring-purple-400 shadow-lg"
                                  src={user.profilePhoto}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                                  <User className="h-7 w-7 text-gray-800" />
                                </div>
                              )}
                              {user.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                  <CheckCircle className="h-3 w-3 text-gray-800" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-lg font-semibold text-gray-800 truncate">
                                  {user.name}
                                </p>
                                {user.isAdmin && (
                                  <div className="bg-orange-500 rounded-full p-1">
                                    <Shield className="h-4 w-4 text-gray-800" />
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 truncate flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                {user.email}
                              </p>
                              {user.contactNumber && (
                                <p className="text-gray-600 text-sm flex items-center mt-1">
                                  <Phone className="h-3 w-3 mr-2" />
                                  {user.contactNumber}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Joined</p>
                              <p className="text-sm text-gray-800 font-medium">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Eye className="h-5 w-5 text-purple-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details Panel */}
          <div className="xl:col-span-1 flex flex-col">
            {selectedUser ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex-1 flex flex-col">
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      {selectedUser.profilePhoto ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover ring-4 ring-purple-400 shadow-xl"
                          src={selectedUser.profilePhoto}
                          alt={selectedUser.name}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-xl">
                          <User className="h-10 w-10 text-gray-800" />
                        </div>
                      )}
                      {selectedUser.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2">
                          <CheckCircle className="h-4 w-4 text-gray-800" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                        {selectedUser.isAdmin && (
                          <div className="bg-orange-500 rounded-full p-1">
                            <Shield className="h-4 w-4 text-gray-800" />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{selectedUser.email}</p>
                      <div>
                        {selectedUser.isVerified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-gray-800 shadow-sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-gray-800 shadow-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-4">
                    {selectedUser.contactNumber && (
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <Phone className="h-5 w-5 text-purple-400" />
                        <span className="text-gray-800">{selectedUser.contactNumber}</span>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div className="text-gray-800">
                          <p>{selectedUser.address}</p>
                          {selectedUser.pincode && (
                            <p className="text-gray-600 text-sm mt-1">PIN: {selectedUser.pincode}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-800">
                        Joined {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders Section */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-purple-400" />
                      Order History
                    </h4>
                    {ordersLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading orders...</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                        <p className="text-gray-600">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <div key={order._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-800 font-semibold">
                                {order.orderNumber || `ORD-${order._id.slice(-8).toUpperCase()}`}
                              </span>
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                className="text-purple-400 hover:text-gray-600 transition-colors"
                              >
                                {expandedOrder === order._id ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-gray-600">{formatDate(order.orderDate)}</span>
                              <span className="font-semibold text-gray-800 text-lg">{formatCurrency(order.total)}</span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              {getStatusBadge(order.orderStatus, 'order')}
                              {getStatusBadge(order.paymentStatus, 'payment')}
                            </div>

                            {expandedOrder === order._id && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold text-gray-800 flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    Order Items:
                                  </h5>
                                  {order.items.map((item, index) => (
                                    <div key={index} className="bg-white/5 p-3 rounded-lg">
                                      <div className="flex items-start space-x-3">
                                        {/* Product Image */}
                                        {item.ProductId?.images && item.ProductId.images.length > 0 ? (
                                          <img
                                            src={item.ProductId.images[0]}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-6 w-6 text-gray-800" />
                                          </div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="text-gray-800 font-medium text-sm truncate">{item.name}</span>
                                            <span className="text-gray-600 text-xs ml-2">Qty: {item.qty}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-green-400 font-semibold">{formatCurrency(item.price)}</span>
                                          </div>
                                          <div className="flex items-center text-xs text-gray-600 mt-1">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>
                                              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Customer Details */}
                                  <div className="mt-4 pt-3 border-t border-white/10">
                                    <h6 className="text-sm font-semibold text-gray-800 mb-2">Customer Details:</h6>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <p><strong>Name:</strong> {order.customerDetails?.name}</p>
                                      <p><strong>Phone:</strong> {order.customerDetails?.phone}</p>
                                      <p><strong>Address:</strong> {order.customerDetails?.address?.street}, {order.customerDetails?.address?.city}, {order.customerDetails?.address?.state} - {order.customerDetails?.address?.pincode}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-800" />
                  </div>
                  <p className="text-gray-800 text-lg font-medium mb-2">Select a user to view details</p>
                  <p className="text-gray-600 text-sm">Click on any user from the list to see their profile and order history</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
