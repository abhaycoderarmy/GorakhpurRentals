import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  // Use CartContext instead of separate cart state
  const { items: cartItems = [], loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  // Helper function to decode JWT and extract userId
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Helper function to calculate days between dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1; // Default to 1 day if dates not set
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  };

  // Calculate total with rental duration
  const getTotalWithDuration = (item) => {
    const days = calculateDays(item.startDate, item.endDate);
    const price = item.price || 0;
    const quantity = item.qty || item.quantity || 1;
    return price * quantity * days;
  };

  // Calculate cart totals
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + getTotalWithDuration(item),
    0
  );
  const grandTotal = cartSubtotal - discount;

  // Helper function to get placeholder image
  const getPlaceholderImage = (width = 80, height = 80) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E`;
  };

  // Helper function to handle image errors
  const handleImageError = (e) => {
    e.target.src = getPlaceholderImage(80, 80);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  useEffect(() => {
    // Check authentication
    if (!user) {
      alert("Please login to continue with checkout");
      navigate("/login");
      return;
    }

    // Extract userId from token
    const extractedUserId = getUserIdFromToken();
    setUserId(extractedUserId);

    if (!extractedUserId) {
      alert("Please login to continue with checkout");
      navigate("/login");
      return;
    }

    // Pre-fill email if available from user context
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user, navigate]);

  // Validate that all items have rental dates
  useEffect(() => {
    const itemsWithoutDates = cartItems.filter(
      (item) => !item.startDate || !item.endDate
    );
    if (itemsWithoutDates.length > 0) {
      alert(
        "Please select rental dates for all items in your cart before checkout"
      );
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Debug: Check environment variables
  useEffect(() => {
    console.log(
      "Frontend Razorpay Key ID:",
      import.meta.env.VITE_RAZORPAY_KEY_ID
    );
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
    console.log("User ID:", userId);

    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      console.error(
        "❌ VITE_RAZORPAY_KEY_ID is missing from environment variables"
      );
    }
  }, [userId]);

  const verifyGiftCode = async () => {
  if (!giftCode.trim()) {
    alert("Please enter a gift code");
    return;
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/giftcards/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: giftCode, // ✅ Use the same variable
          orderAmount: cartSubtotal,
        }),
      }
    );
    
    const data = await res.json(); // ✅ Parse JSON response
    
    if (!res.ok) {
      throw new Error(data.error || "Invalid gift code");
    }
    
    setDiscount(data.data.discountAmount); // ✅ Use discountAmount from response
    alert(`Gift code applied! ₹${data.data.discountAmount} off`);
  } catch (err) {
    alert(err.message || "Invalid gift code");
  }
};

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setCustomerDetails((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setCustomerDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = () => {
    const required = [
      "name",
      "phone",
      "address.street",
      "address.city",
      "address.state",
      "address.pincode",
    ];

    for (let field of required) {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (!customerDetails[parent][child]) {
          alert(`Please fill ${child} field`);
          return false;
        }
      } else {
        if (!customerDetails[field]) {
          alert(`Please fill ${field} field`);
          return false;
        }
      }
    }

    if (!email) {
      alert("Please enter email");
      return false;
    }

    if (!userId) {
      alert("User session invalid. Please login again.");
      return false;
    }

    // Validate that all items have rental dates
    const itemsWithoutDates = cartItems.filter(
      (item) => !item.startDate || !item.endDate
    );
    if (itemsWithoutDates.length > 0) {
      alert("Please select rental dates for all items before checkout");
      return false;
    }

    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return;

    // Check if Razorpay key is available
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      alert(
        "Payment configuration error: Razorpay key is missing. Please contact support."
      );
      console.error(
        "VITE_RAZORPAY_KEY_ID is not defined in environment variables"
      );
      return;
    }

    // Check if Razorpay script is loaded
    if (!window.Razorpay) {
      alert(
        "Payment service is not available. Please refresh the page and try again."
      );
      console.error("Razorpay script is not loaded");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order with updated cart data
      console.log("Cart items being sent:", JSON.stringify(cartItems, null, 2));
      // Make sure each cart item has the required fields
      const validatedItems = cartItems.map((item) => ({
        ProductId: item._id || item.id || item.ProductId,
        name: item.name,
        price: item.price,
        qty: item.qty || item.quantity || 1,
        startDate: item.startDate,
        endDate: item.endDate,
      }));

      console.log("Validated items:", JSON.stringify(validatedItems, null, 2));
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/create-order`,
        {
          amount: grandTotal,
          items: cartItems, // Use cartItems from context
          customerDetails,
          email,
          discount,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { order, key_id } = orderResponse.data;
      const keyToUse = key_id || razorpayKeyId;

      console.log("Using Razorpay Key:", keyToUse);

      if (!keyToUse) {
        throw new Error("No valid Razorpay key available");
      }

      const options = {
        key: keyToUse,
        amount: order.amount,
        currency: order.currency,
        name: "Gorakhpur Rentals",
        description: "Rent Wear Return",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment and create order
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: cartItems, // Use cartItems from context
                total: grandTotal,
                customerDetails,
                email,
                discount,
                userId: userId,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              if (discount > 0 && giftCode) {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/giftcards/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: giftCode,
          orderAmount: cartSubtotal,
        }),
      });
    } catch (error) {
      console.error("Failed to apply gift card:", error);
    }
  }

              alert("Payment successful! Order placed.");

              // Clear cart from localStorage and redirect
              localStorage.removeItem("cart");
              window.location.href = `/order-confirmation/${verifyResponse.data.orderId}`;
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: email,
          contact: customerDetails.phone,
        },
        notes: {
          address: `${customerDetails.address.street}, ${customerDetails.address.city}`,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
            setLoading(false);
          },
        },
      };

      const razor = new window.Razorpay(options);

      razor.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razor.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  // Show loading state while cart is loading or userId is being resolved
  if (cartLoading || userId === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          <p>Your cart is empty.</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Cart
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="mb-6 max-h-96 overflow-y-auto">
              {cartItems.map((item, i) => {
                const itemKey = item._id || item.id || `item-${i}`;
                const quantity = item.qty || item.quantity || 1;
                const days = calculateDays(item.startDate, item.endDate);
                const itemTotal = getTotalWithDuration(item);

                return (
                  <div
                    key={itemKey}
                    className="flex items-start space-x-4 border-b py-4 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.image ||
                          item.images?.[0] ||
                          getPlaceholderImage(80, 80)
                        }
                        alt={item.name || "Product"}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                        onError={handleImageError}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.name || "Unnamed Product"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity: {quantity}
                      </p>

                      {/* Rental Dates */}
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            From: {formatDate(item.startDate)}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            To: {formatDate(item.endDate)}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {days} day{days !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="text-sm text-gray-500">
                        ₹{(item.price || 0).toLocaleString()} × {quantity} ×{" "}
                        {days} day{days !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gift Code Section */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Gift Code</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow border p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  placeholder="Enter gift code"
                />
                <button
                  onClick={verifyGiftCode}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-r transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Email *</label>
                <input
                  type="email"
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={customerDetails.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={customerDetails.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Street Address *
                </label>
                <input
                  type="text"
                  className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={customerDetails.address.street}
                  onChange={(e) =>
                    handleInputChange("address.street", e.target.value)
                  }
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={customerDetails.address.city}
                    onChange={(e) =>
                      handleInputChange("address.city", e.target.value)
                    }
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">State *</label>
                  <input
                    type="text"
                    className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={customerDetails.address.state}
                    onChange={(e) =>
                      handleInputChange("address.state", e.target.value)
                    }
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Pincode *</label>
                  <input
                    type="text"
                    className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={customerDetails.address.pincode}
                    onChange={(e) =>
                      handleInputChange("address.pincode", e.target.value)
                    }
                    placeholder="Pincode"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Country</label>
                  <input
                    type="text"
                    className="w-full border p-3 rounded bg-gray-100"
                    value={customerDetails.address.country}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={loading}
              className={`w-full mt-6 py-3 rounded font-semibold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading
                ? "Processing..."
                : `Pay ₹${grandTotal.toLocaleString()} with Razorpay`}
            </button>
          </div>
        </div>
      )}

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default Checkout;
