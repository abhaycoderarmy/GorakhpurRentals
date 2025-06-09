import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, productsRes, usersRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/products"),
          api.get("/users"),
        ]);
        setBookings(bookingsRes.data);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError("Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading admin dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-pink-600 mb-8">Admin Dashboard</h1>

      {/* Bookings Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full bg-white">
            <thead className="bg-pink-100">
              <tr>
                <th className="px-4 py-2">Booking ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Booking Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t">
                  <td className="px-4 py-2">{booking._id}</td>
                  <td className="px-4 py-2">{booking.user?.name || "N/A"}</td>
                  <td className="px-4 py-2">{booking.product?.name || "N/A"}</td>
                  <td className="px-4 py-2">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{booking.status || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Products Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="text-lg font-bold mt-2">{product.name}</h3>
              <p className="text-gray-700 mt-1">₹ {product.pricePerDay} / day</p>
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Users Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full bg-white">
            <thead className="bg-pink-100">
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2">{user._id}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.isAdmin ? "Admin" : "User"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
