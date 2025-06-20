import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Package, Truck, CreditCard, MapPin, Mail, Phone, Calendar, Clock, Info } from "lucide-react";
import Footer from "../components/Footer";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute for live duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view order details");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 404) {
          setError("Order not found");
        } else {
          setError("Failed to load order details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError("Invalid order ID");
      setLoading(false);
    }
  }, [orderId]);

  // Calculate time since order was placed
  const getTimeSinceOrder = (orderDate) => {
    const orderTime = new Date(orderDate);
    const now = new Date(currentTime);
    const diffMs = now - orderTime;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Calculate estimated delivery time
  const getEstimatedDelivery = (orderDate) => {
    const orderTime = new Date(orderDate);
    const estimatedDelivery = new Date(orderTime);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // Add 7 days
    
    return estimatedDelivery.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate delivery countdown
  const getDeliveryCountdown = (orderDate) => {
    const orderTime = new Date(orderDate);
    const estimatedDelivery = new Date(orderTime);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    
    const now = new Date(currentTime);
    const diffMs = estimatedDelivery - now;
    
    if (diffMs <= 0) return "Delivery window passed";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} and ${diffHours} hour${diffHours === 1 ? '' : 's'} remaining`;
    } else {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} remaining`;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
      case 'delivered':
        return <Truck className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error.includes("login") ? "Authentication Required" : "Order Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            {error.includes("login") ? (
              <Link 
                to="/login" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            ) : (
              <Link 
                to="/orders" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Orders
              </Link>
            )}
            <Link 
              to="/" 
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No order data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold">Order ID: #{order._id}</p>
            <p className="text-green-600 text-sm mt-1">
              <Clock className="inline w-4 h-4 mr-1" />
              Placed {getTimeSinceOrder(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Order Duration & Delivery Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Order Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Order Duration</span>
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{getTimeSinceOrder(order.orderDate)}</p>
                  <p className="text-sm text-gray-600">
                    Since {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>
                    <Truck className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.deliveredAt ? 'Delivered' : getEstimatedDelivery(order.orderDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.deliveredAt 
                      ? `On ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}` 
                      : getDeliveryCountdown(order.orderDate)
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                        {item.ProductId?.images?.[0] ? (
                          <img 
                            src={item.ProductId.images[0]} 
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: item.ProductId?.images?.[0] ? 'none' : 'flex' }}>
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Qty: {item.qty}
                        </span>
                        <span>₹{item.price} each</span>
                      </div>
                      {item.ProductId?.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{item.ProductId.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-xl text-gray-900">₹{item.price * item.qty}</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{order.total + (order.discount || 0)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-2">
                  <span>Total:</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status & Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <span className="text-sm text-gray-500">{getTimeSinceOrder(order.orderDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {order.orderStatus !== 'placed' && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-600">Your order is being processed</p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">Delivered</p>
                        <span className="text-sm text-gray-500">
                          {Math.floor((new Date(order.deliveredAt) - new Date(order.orderDate)) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Payment Details */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.customerDetails?.name}</p>
                <p>{order.customerDetails?.address?.street}</p>
                <p>{order.customerDetails?.address?.city}, {order.customerDetails?.address?.state}</p>
                <p>{order.customerDetails?.address?.pincode}</p>
                <p>{order.customerDetails?.address?.country}</p>
                <div className="flex items-center gap-1 mt-3">
                  <Phone className="w-4 h-4" />
                  <span>{order.customerDetails?.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{order.email}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">
                    {order.paymentDetails?.payment_method || 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-xs">{order.paymentDetails?.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">₹{order.total}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Transaction Time:</span>
                  <span className="text-xs">{getTimeSinceOrder(order.orderDate)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/orders"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center block"
              >
                View All Orders
              </Link>
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;