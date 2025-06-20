import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag, Calendar, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import Footer from "../components/Footer"
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!user) {
        setError("Please login to view your orders");
        return;
      }
      const token=localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/orders/user/${user._id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "placed":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case "placed": return "20%";
      case "confirmed": return "40%";
      case "processing": return "60%";
      case "shipped": return "80%";
      case "delivered": return "100%";
      case "cancelled": return "0%";
      default: return "0%";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-2">{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.orderStatus !== "cancelled" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Placed</span>
                        <span>Confirmed</span>
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: getProgressWidth(order.orderStatus) }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={item._id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.ProductId?.images?.[0] ? (
                                <img 
                                  src={item.ProductId.images[0]} 
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                              <p className="text-sm font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary & Details */}
                    <div className="space-y-6">
                      {/* Total */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{(order.total - (order.discount || 0)).toLocaleString()}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-₹{order.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span>₹{order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Delivery Details
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{order.customerDetails.name}</p>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {order.customerDetails.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {order.email}
                          </div>
                          <div className="mt-2">
                            <p>{order.customerDetails.address.street}</p>
                            <p>{order.customerDetails.address.city}, {order.customerDetails.address.state}</p>
                            <p>{order.customerDetails.address.pincode}, {order.customerDetails.address.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {order.paymentDetails && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Details
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            {order.paymentDetails.razorpay_payment_id && (
                              <p>Payment ID: {order.paymentDetails.razorpay_payment_id}</p>
                            )}
                            {order.deliveredAt && (
                              <p>Delivered: {formatDate(order.deliveredAt)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                      <p className="text-sm text-gray-700">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}