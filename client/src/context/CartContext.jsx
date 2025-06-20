import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Cart action types
const CART_ACTIONS = {
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_RENTAL_DATES: 'UPDATE_RENTAL_DATES',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};


// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.ADD_TO_CART:
      // For guest users, we need to handle local state
      if (action.payload.isGuest) {
        const existingItem = state.items.find(item => 
          item._id === action.payload.productId
        );
        
        if (existingItem) {
          return {
            ...state,
            items: state.items.map(item => 
              item._id === action.payload.productId 
                ? { ...item, qty: item.qty + action.payload.quantity }
                : item
            ),
            loading: false,
            error: null
          };
        } else {
          return {
            ...state,
            items: [...state.items, action.payload.item],
            loading: false,
            error: null
          };
        }
      }
      
      // For logged-in users, use server response
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.UPDATE_RENTAL_DATES:
      return {
        ...state,
        items: state.items.map(item => 
          item._id === action.payload.productId 
            ? { 
                ...item, 
                startDate: action.payload.startDate || item.startDate,
                endDate: action.payload.endDate || item.endDate
              }
            : item
        ),
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, token } = useAuth();

  // Guest cart state
  const [guestCart, setGuestCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  });

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && guestCart.length >= 0) {
      try {
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      } catch (error) {
        console.error('Error saving guest cart:', error);
      }
    }
  }, [guestCart, user]);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ;

  // Helper function to make authenticated API calls
  const makeApiCall = async (url, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  };

  // Load cart on user login/logout
  useEffect(() => {
    if (user && token) {
      loadCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [user, token]);

  // Load cart from API
  const loadCart = async () => {
    if (!user || !token) return;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const data = await makeApiCall('/cart');
      dispatch({ type: CART_ACTIONS.SET_CART, payload: data.cart || [] });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add item to cart with enhanced date validation
  const addToCart = async (productId, quantity = 1, startDate = null, endDate = null) => {
    // Validate and sanitize productId
    if (!productId) {
      return { success: false, message: "Product ID is required" };
    }
    
    // Convert to string if it's an ObjectId or other object
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;
    
    // Validate it's a proper MongoDB ObjectId format (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(sanitizedProductId)) {
      console.error('Invalid product ID format:', productId);
      return { success: false, message: "Invalid product ID format" };
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      if (!user || !token) {
        // Guest user - fetch product details first
        try {
          // Use sanitized product ID
          const productData = await makeApiCall(`/products/${sanitizedProductId}`, {
            method: 'GET'
          });
          
          const newItem = {
             _id: sanitizedProductId,
    productId: sanitizedProductId,
    product: productData.product || productData, // Keep nested structure
    quantity: Number(quantity),
    qty: Number(quantity), // Add qty for consistency
    startDate,
    endDate,
    price: productData.product?.price || productData.price,
    // Add direct properties for CartPage compatibility
    name: productData.product?.name || productData.name,
    image: productData.product?.image || productData.image || productData.product?.images?.[0] || productData.images?.[0],
    images: productData.product?.images || productData.images,
    description: productData.product?.description || productData.description,
    category: productData.product?.category || productData.category,
          };
          
          setGuestCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === sanitizedProductId);
            if (existingItem) {
              return prevCart.map(item => 
                item._id === sanitizedProductId 
                  ? { ...item, quantity: item.quantity + Number(quantity) }
                  : item
              );
            }
            return [...prevCart, newItem];
          });
          
          dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
          return { success: true, message: "Item added to cart" };
        } catch (error) {
          console.error('Failed to fetch product details:', error);
          dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
          return { success: false, message: error.message };
        }
      }
      
      // Authenticated user - existing API logic
      const requestBody = {
        productId: sanitizedProductId,
        quantity: Number(quantity)
      };

      // Add dates if provided
      if (startDate) requestBody.startDate = startDate;
      if (endDate) requestBody.endDate = endDate;

      const data = await makeApiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

     dispatch({ type: CART_ACTIONS.ADD_TO_CART, payload: data.cart || [] });
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    // Sanitize productId
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      if (!user || !token) {
  // Guest user - handle locally
  setGuestCart(prevCart => 
    prevCart.map(item => 
      item._id === sanitizedProductId 
        ? { ...item, quantity: Number(quantity), qty: Number(quantity) }
        : item
    )
  );
  
  dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
  return { success: true, message: "Quantity updated" };
}
      
      // Authenticated user - existing API logic
      const data = await makeApiCall('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({
          productId: sanitizedProductId,
          quantity: Number(quantity)
        })
      });

      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: data.cart || [] });
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Update rental dates with enhanced validation
  const updateRentalDates = async (productId, startDate, endDate) => {
    // Sanitize productId
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      if (!user || !token) {
  // Guest user - handle locally
  setGuestCart(prevCart => 
    prevCart.map(item => 
      item._id === sanitizedProductId 
        ? { 
            ...item, 
            startDate: startDate || item.startDate,
            endDate: endDate || item.endDate
          }
        : item
    )
  );
  
  dispatch({ 
    type: CART_ACTIONS.UPDATE_RENTAL_DATES, 
    payload: { productId: sanitizedProductId, startDate, endDate } 
  });
  
  dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
  return { success: true, message: "Rental dates updated" };
}
      
      const data = await makeApiCall('/cart/update-dates', {
        method: 'PUT',
        body: JSON.stringify({
          productId: sanitizedProductId,
          startDate,
          endDate
        })
      });

      // Update local state immediately for better UX
      dispatch({ 
        type: CART_ACTIONS.UPDATE_RENTAL_DATES, 
        payload: { productId: sanitizedProductId, startDate, endDate } 
      });

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Failed to update rental dates:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      
      // Reload cart to revert changes on error (only for authenticated users)
      if (user && token) {
        await loadCart();
      }
      
      return { success: false, message: error.message };
    }
  };

  // Check availability for specific dates
  const checkAvailability = async (productId, startDate, endDate) => {
    // Sanitize productId
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;

    try {
      const data = await makeApiCall('/cart/check-availability', {
        method: 'POST',
        body: JSON.stringify({
          productId: sanitizedProductId,
          startDate,
          endDate
        })
      });

      return { 
        success: true, 
        available: data.available, 
        message: data.message,
        conflicts: data.conflicts || []
      };
    } catch (error) {
      console.error('Failed to check availability:', error);
      return { 
        success: false, 
        available: false, 
        message: error.message 
      };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    // Sanitize productId
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      if (!user || !token) {
  // Guest user - handle locally
  setGuestCart(prevCart => 
    prevCart.filter(item => item._id !== sanitizedProductId)
  );
  
  dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
  return { success: true, message: "Item removed from cart" };
}
      
      // Authenticated user - existing API logic
      const data = await makeApiCall(`/cart/remove/${sanitizedProductId}`, {
  method: 'DELETE'
});

      dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: data.cart || [] });
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      if (!user || !token) {
        // Guest user - handle locally
        setGuestCart([]);
        localStorage.removeItem('guestCart');
        
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
        return { success: true, message: 'Cart cleared successfully' };
      }
      
      // Authenticated user - existing API logic
      await makeApiCall('/cart/clear', {
        method: 'DELETE'
      });

      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const items = user ? (Array.isArray(state.items) ? state.items : []) : guestCart;
    
    const subtotal = items.reduce((total, item) => {
      const itemPrice = item.product?.price || item.price || 0;
      const itemQuantity = item.quantity || 0;
      return total + (itemPrice * itemQuantity);
    }, 0);

    const totalItems = items.reduce((total, item) => total + (item.quantity || 0), 0);

    // Calculate rental days if applicable
    const totalRentalDays = items.reduce((total, item) => {
      if (item.startDate && item.endDate) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return total + (days * item.quantity);
      }
      return total;
    }, 0);

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItems,
      totalRentalDays,
      itemCount: items.length
    };
  };

  // Get item by product ID
  const getCartItem = (productId) => {
    const sanitizedProductId = typeof productId === 'object' ? productId.toString() : productId;
    const items = user ? (Array.isArray(state.items) ? state.items : []) : guestCart;
    
    return items.find(item => 
      item.product?._id === sanitizedProductId || 
      item.productId === sanitizedProductId || 
      item._id === sanitizedProductId
    );
  };

  // Check if item exists in cart
  const isInCart = (productId) => {
    return !!getCartItem(productId);
  };

  // Get cart item count for a specific product
  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Validate cart before checkout
  const validateCart = async () => {
    try {
      const data = await makeApiCall('/cart/validate', {
        method: 'POST'
      });

      return {
        success: true,
        valid: data.valid,
        errors: data.errors || [],
        warnings: data.warnings || []
      };
    } catch (error) {
      console.error('Failed to validate cart:', error);
      return {
        success: false,
        valid: false,
        errors: [error.message]
      };
    }
  };

  // Sync cart with server (useful for handling concurrent sessions)
  const syncCart = async () => {
    if (!user || !token) return;

    try {
      const data = await makeApiCall('/cart/sync', {
        method: 'POST'
      });

      dispatch({ type: CART_ACTIONS.SET_CART, payload: data.cart || [] });
      return { success: true, message: 'Cart synced successfully' };
    } catch (error) {
      console.error('Failed to sync cart:', error);
      return { success: false, message: error.message };
    }
  };

  // Transfer guest cart to user cart on login
  const transferGuestCartToUser = async () => {
    if (!user || !token || guestCart.length === 0) return;

    try {
      // Add each guest cart item to user cart
      for (const item of guestCart) {
        await addToCart(
          item._id || item.productId,
          item.quantity,
          item.startDate,
          item.endDate
        );
      }

      // Clear guest cart after successful transfer
      setGuestCart([]);
      localStorage.removeItem('guestCart');
      
      return { success: true, message: 'Guest cart transferred successfully' };
    } catch (error) {
      console.error('Failed to transfer guest cart:', error);
      return { success: false, message: error.message };
    }
  };

  // Auto-transfer guest cart when user logs in
  useEffect(() => {
    if (user && token && guestCart.length > 0) {
      transferGuestCartToUser();
    }
  }, [user, token]);

  // Context value
  const value = {
    // State
  items: user ? (Array.isArray(state.items) ? state.items : []) : (Array.isArray(guestCart) ? guestCart : []),
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadCart,
    addToCart,
    updateQuantity,
    updateRentalDates,
    removeFromCart,
    clearCart,
    checkAvailability,
    validateCart,
    syncCart,
    transferGuestCartToUser,
    
    // Utilities
    getCartTotals,
    getCartItem,
    isInCart,
    getItemQuantity,
    
    // Clear error
    clearError: () => dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Export context for advanced usage
export { CartContext };

export default CartProvider;

