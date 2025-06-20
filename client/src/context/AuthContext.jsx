import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // ✅ Hook called inside component
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (data) => {
    if (!data?.token || !data?.user) throw new Error("Invalid login data");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user); // Only user details here
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Get token from localStorage and update when user changes
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Update token when user logs in
  const loginUserWithToken = (data) => {
    if (!data?.token || !data?.user) throw new Error("Invalid login data");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token); // Update token state
  };

  // Clear token when user logs out
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null); // Clear token state
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loginUser: loginUserWithToken, 
      logout: logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook to use in components like Login.jsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};