import React ,{ useEffect, useState } from "react";
import axios from "axios";
import { 
  Eye, 
  Edit3, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Star,
  Download,
  RefreshCw
} from "lucide-react";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    search: ""
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const statusConfig = {
    placed: { 
      color: "bg-blue-50 text-blue-700 border-blue-200", 
      icon: Clock, 
      bg: "bg-blue-500" 
    },
    confirmed: { 
      color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      icon: CheckCircle, 
      bg: "bg-emerald-500" 
    },
    processing: { 
      color: "bg-amber-50 text-amber-700 border-amber-200", 
      icon: Package, 
      bg: "bg-amber-500" 
    },
    shipped: { 
      color: "bg-purple-50 text-purple-700 border-purple-200", 
      icon: Truck, 
      bg: "bg-purple-500" 
    },
    delivered: { 
      color: "bg-green-50 text-green-700 border-green-200", 
      icon: CheckCircle, 
      bg: "bg-green-500" 
    },
    cancelled: { 
      color: "bg-red-50 text-red-700 border-red-200", 
      icon: XCircle, 
      bg: "bg-red-500" 
    }
  };

  const paymentStatusConfig = {
    pending: { 
      color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
      icon: Clock,
      bg: "bg-yellow-500"
    },
    paid: { 
      color: "bg-green-50 text-green-700 border-green-200", 
      icon: CheckCircle,
      bg: "bg-green-500"
    },
    failed: { 
      color: "bg-red-50 text-red-700 border-red-200", 
      icon: XCircle,
      bg: "bg-red-500"
    },
    refunded: { 
      color: "bg-gray-50 text-gray-700 border-gray-200", 
      icon: RefreshCw,
      bg: "bg-gray-500"
    }
  };

  const orderStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });
      
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        let filteredOrders = response.data.orders;
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.customerDetails.name.toLowerCase().includes(searchTerm) ||
            order.email.toLowerCase().includes(searchTerm) ||
            order._id.includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm))
          );
        }

        setOrders(filteredOrders);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      
      if (err.response?.status === 403) {
        setError("Access denied. Please check your admin permissions.");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters.status, filters.paymentStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleStatusUpdate = async (orderId, newStatus, notes = "") => {
    try {
      setUpdateLoading(true);
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}/status`,
        { orderStatus: newStatus, notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: newStatus, notes }
            : order
        ));
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error updating order:", err);
      
      if (err.response?.status === 403) {
        setError("Access denied. Cannot update order status.");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Failed to update order status");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const StatusUpdateModal = () => {
    const [newStatus, setNewStatus] = useState(selectedOrder?.orderStatus || "");
    const [notes, setNotes] = useState(selectedOrder?.notes || "");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Update Order Status</h3>
            <p className="text-gray-500 text-sm mt-1">Change the status of this order</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {orderStatuses.map(status => {
                  const StatusIcon = statusConfig[status].icon;
                  return (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows="3"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => handleStatusUpdate(selectedOrder._id, newStatus, notes)}
              disabled={updateLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all transform hover:scale-105"
            >
              {updateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Update Status
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedOrder(null);
              }}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrderDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-500 mt-1">Order ID: #{selectedOrder?._id.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <XCircle size={24} />
          </button>
        </div>

        {selectedOrder && (
          <div className="space-y-8">
            {/* Order Status & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-900">
                  <Package className="h-5 w-5" />
                  Order Status
                </h4>
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${statusConfig[selectedOrder.orderStatus].color}`}>
                    {React.createElement(statusConfig[selectedOrder.orderStatus].icon, { size: 16 })}
                    {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar size={14} />
                      Ordered: {formatDate(selectedOrder.orderDate)}
                    </p>
                    {selectedOrder.deliveredAt && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <CheckCircle size={14} />
                        Delivered: {formatDate(selectedOrder.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-900">
                  <CreditCard className="h-5 w-5" />
                  Payment Status
                </h4>
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${paymentStatusConfig[selectedOrder.paymentStatus].color}`}>
                    {React.createElement(paymentStatusConfig[selectedOrder.paymentStatus].icon, { size: 16 })}
                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                      <IndianRupee size={14} />
                      ₹{selectedOrder.total}
                    </p>
                    {selectedOrder.discount > 0 && (
                      <p className="text-green-600 font-medium">
                        Discount: ₹{selectedOrder.discount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-purple-900">
                <User className="h-5 w-5" />
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.customerDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail size={12} />
                      Email
                    </p>
                    <p className="font-medium text-gray-900">{selectedOrder.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone size={12} />
                      Phone
                    </p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      Address
                    </p>
                    <p className="font-medium text-gray-900">{formatAddress(selectedOrder.customerDetails.address)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-6 flex items-center gap-2 text-gray-900">
                <ShoppingBag className="h-5 w-5" />
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="grid gap-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images && item.images[0] ? item.images[0] : ''}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZINTBDNTMuMzEzNyAyNiA1NiAyOC42ODYzIDU2IDMyVjQ4QzU2IDUxLjMxMzcgNTMuMzEzNyA1NCA1MCA1NEgzMEMyNi42ODYzIDU0IDI0IDUxLjMxMzcgMjQgNDhWMzJaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIzNCIgY3k9IjM2IiByPSIzIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNDQgNDZMMzkgNDFMMzUgNDVMMzEgNDEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <Package size={14} />
                                Quantity: <span className="font-medium">{item.qty}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar size={14} />
                                {formatDate(item.startDate)} to {formatDate(item.endDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                            <p className="text-sm text-gray-500">per item</p>
                            <p className="text-lg font-semibold text-blue-600 mt-1">
                              Total: ₹{(item.price * item.qty).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {selectedOrder.paymentDetails && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-900">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.paymentDetails.razorpay_payment_id && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                      <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border">
                        {selectedOrder.paymentDetails.razorpay_payment_id}
                      </p>
                    </div>
                  )}
                  {selectedOrder.paymentDetails.payment_method && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-medium bg-white px-3 py-2 rounded-lg border">
                        {selectedOrder.paymentDetails.payment_method}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-900">
                  <Edit3 className="h-5 w-5" />
                  Notes
                </h4>
                <p className="text-gray-700 bg-white p-4 rounded-lg border">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600 text-lg">Monitor and manage all customer orders</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{pagination.totalOrders}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, email, or order ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Order Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Statuses</option>
                {orderStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: "", paymentStatus: "", search: "" });
                  fetchOrders(1);
                }}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[order.orderStatus].color}`}>
                          {React.createElement(statusConfig[order.orderStatus].icon, { size: 14 })}
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${paymentStatusConfig[order.paymentStatus].color}`}>
                          {React.createElement(paymentStatusConfig[order.paymentStatus].icon, { size: 14 })}
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{order.customerDetails.name}</h4>
                          <p className="text-sm text-gray-600">{order.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          {order.customerDetails.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={14} />
                          {order.customerDetails.address.city}, {order.customerDetails.address.state}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:w-80">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingBag size={16} />
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.images && item.images[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNiAxOC44OTU0IDE2Ljg5NTQgMTggMTggMThIMzBDMzEuMTA0NiAxOCAzMiAxOC44OTU0IDMyIDIwVjI4QzMyIDI5LjEwNDYgMzEuMTA0NiAzMCAzMCAzMEgxOEMxNi44OTU0IDMwIDE2IDI5LjEwNDYgMTYgMjhWMjBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxjaXJjbGUgY3g9IjIxIiBjeT0iMjIiIHI9IjEuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8cGF0aCBkPSJNMjYgMjZMMjMuNSAyMy41TDIxIDI1TDE4LjUgMjIuNSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                            <p className="text-sm font-semibold text-blue-600">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="lg:w-48 flex flex-col justify-between">
                    <div className="text-center lg:text-right mb-4">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                      {order.discount > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Saved ₹{order.discount}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-medium"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium"
                      >
                        <Edit3 size={16} />
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.paymentStatus 
                ? "Try adjusting your filters to see more orders" 
                : "Orders will appear here when customers place them"}
            </p>
            {(filters.search || filters.status || filters.paymentStatus) && (
              <button
                onClick={() => {
                  setFilters({ status: "", paymentStatus: "", search: "" });
                  fetchOrders(1);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span>
                {' '}({pagination.totalOrders} total orders)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchOrders(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => fetchOrders(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedOrder && !showModal && <OrderDetailsModal />}
        {showModal && selectedOrder && <StatusUpdateModal />}
      </div>
    </div>
  );
};

export default ManageOrders;