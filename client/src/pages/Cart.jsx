
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Calendar } from "lucide-react";
import Footer from "../components/Footer";
import { useState } from "react";

export default function CartPage() {
  // Fix: Use 'items' instead of 'cart' and provide fallback
  const { items = [], removeFromCart, updateQuantity, updateRentalDates, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  

  // Use 'items' instead of 'cart'
  const cart = items;
  
  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || p.quantity || 0), 0);
  const totalItems = cart.reduce((sum, p) => sum + (p.qty || p.quantity || 0), 0);

  const handleCheckout = () => {
    // Check if all items have rental dates selected
    const itemsWithoutDates = cart.filter(item => !item.startDate || !item.endDate);
    
    if (itemsWithoutDates.length > 0) {
      alert('Please select rental dates for all items before checkout');
      return;
    }

    if (!user) {
      return navigate("/login");
    }
    navigate("/checkout");
  };

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQty);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleDateChange = async (productId, field, value) => {
    setIsUpdatingDates(true);
    setUpdatingItemId(productId);
    
    try {
      // Find the current item to get existing dates
      const currentItem = cart.find(item => item._id === productId);
      if (!currentItem) return;

      // Prepare the updated dates
      const updatedDates = {
        startDate: field === 'startDate' ? value : currentItem.startDate,
        endDate: field === 'endDate' ? value : currentItem.endDate
      };

      // Validate dates before updating
      if (updatedDates.startDate && updatedDates.endDate) {
        const startDate = new Date(updatedDates.startDate);
        const endDate = new Date(updatedDates.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
          alert('Start date cannot be in the past');
          return;
        }

        if (endDate <= startDate) {
          alert('End date must be after start date');
          return;
        }
      }

      // Call the context method to update rental dates
      const result = await updateRentalDates(productId, updatedDates.startDate, updatedDates.endDate);
      
      if (!result.success) {
        alert(result.message || 'Failed to update rental dates');
      }
      
    } catch (error) {
      console.error('Error updating rental dates:', error);
      alert('Failed to update rental dates. Please try again.');
    } finally {
      setIsUpdatingDates(false);
      setUpdatingItemId(null);
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalWithDuration = (item) => {
    const days = calculateDays(item.startDate, item.endDate);
    const price = item.price || 0;
    const quantity = item.qty || item.quantity || 0;
    return price * quantity * Math.max(days, 1);
  };

  const grandTotal = cart.reduce((sum, item) => sum + getTotalWithDuration(item), 0);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle different date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get minimum end date (day after start date)
  const getMinEndDate = (startDate) => {
    if (!startDate) return getMinDate();
    
    try {
      const start = new Date(startDate);
      start.setDate(start.getDate() + 1);
      return start.toISOString().split('T')[0];
    } catch (error) {
      return getMinDate();
    }
  };

  // Helper function to get a proper placeholder image
  const getPlaceholderImage = (width = 120, height = 120) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E`;
};

  // Helper function to handle image errors
  const handleImageError = (e) => {
    e.target.src = getPlaceholderImage(120, 120);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cart.length === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="mb-8">
              <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {!user ? (
                "Please log in to view your cart items or start shopping to add new items!"
              ) : (
                "Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
              )}
            </p>
            {!user ? (
              <div className="space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Login to View Cart
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    // Ensure we have a valid unique key
                    const itemKey = item._id || item.id || `item-${Math.random()}`;
                    const isCurrentlyUpdating = updatingItemId === item._id;
                    const quantity = item.qty || item.quantity || 1;
                    
                    return (
                      <div key={itemKey} className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Product Image - Clickable */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image || item.images?.[0] || getPlaceholderImage(120, 120)}
                              alt={item.name || 'Product'}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleProductClick(item._id)}
                              onError={handleImageError}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="pr-4">
                                <h3 
                                  className="text-lg font-medium text-gray-900 mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                                  onClick={() => handleProductClick(item._id)}
                                >
                                  {item.name || 'Unnamed Product'}
                                </h3>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                                {item.category && (
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Remove item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Rental Date Selection */}
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center mb-3">
                                <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-blue-900">Select Rental Period</span>
                                {isCurrentlyUpdating && (
                                  <span className="ml-2 text-xs text-blue-600">Updating...</span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    min={getMinDate()}
                                    value={formatDateForInput(item.startDate)}
                                    onChange={(e) => handleDateChange(item._id, 'startDate', e.target.value)}
                                    disabled={isCurrentlyUpdating}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    min={getMinEndDate(item.startDate)}
                                    value={formatDateForInput(item.endDate)}
                                    onChange={(e) => handleDateChange(item._id, 'endDate', e.target.value)}
                                    disabled={isCurrentlyUpdating}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              {item.startDate && item.endDate && (
                                <div className="mt-2 text-sm text-blue-700">
                                  Duration: {calculateDays(item.startDate, item.endDate)} day(s)
                                </div>
                              )}
                              {(!item.startDate || !item.endDate) && (
                                <div className="mt-2 text-sm text-red-600">
                                  Please select both start and end dates
                                </div>
                              )}
                            </div>

                            {/* Quantity and Price */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Qty:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => handleQuantityChange(item._id, quantity - 1)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item._id, quantity + 1)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  ₹{getTotalWithDuration(item).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ₹{(item.price || 0).toLocaleString()} × {quantity} × {calculateDays(item.startDate, item.endDate) || 1} day(s)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-900">₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Date validation warning */}
                  {cart.some(item => !item.startDate || !item.endDate) && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Please select rental dates for all items to proceed
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCheckout}
                    disabled={cart.some(item => !item.startDate || !item.endDate) || isUpdatingDates}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      cart.some(item => !item.startDate || !item.endDate) || isUpdatingDates
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      You'll be redirected to login before checkout
                    </p>
                  )}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}