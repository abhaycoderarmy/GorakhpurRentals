import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import AdminNavbar from "./pages/admin/AdminNavbar";
import Checkout from "./pages/Checkout";
import Signup from "./pages/SignUp";
import Cart from "./pages/Cart";
import Product from "./pages/Product";
import PrivateRoute from "./routes/PrivateRoute";
import Analytics from "./pages/admin/Analytics";
import ManageProducts from "./pages/admin/ManageProducts";
import AddProduct from "./pages/admin/AddProduct";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageOrders from "./pages/admin/ManageOrders";
import NewsletterSend from "./pages/admin/NewsletterSend";
import { ToastContainer } from "react-toastify";
import ProfilePage from "./pages/ProfilePage";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import ContactUs from "./pages/ContactUs";
import EditProduct from "./components/EditProduct";
import AdminFooter from "./pages/admin/AdminFooter";
import GiftCardManagement from "./pages/admin/GiftCardMangement";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Navbar */}
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}

      {/* Routes */}
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Verify />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/product" element={<Product />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/newsletters" element={<NewsletterSend />} />
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
          <Route path="/admin/giftcardmanagement" element={<GiftCardManagement />}/>
        </Routes>
      </main>

      {/* Footer */}
      {isAdminRoute && <AdminFooter />}

      {/* Toast messages */}
      <ToastContainer />
    </div>
  );
}

