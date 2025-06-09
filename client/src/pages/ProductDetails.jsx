import React, { useContext, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (!user) {
    // Redirect to login if user not logged in
    return <Navigate to="/login" />;
  }

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!bookingDate) {
      setError("Please select a booking date");
      return;
    }

    try {
      await api.post("/bookings", {
        productId: id,
        userId: user._id,
        bookingDate,
      });
      setMessage("Booking successful!");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-96 object-cover rounded"
      />
      <h1 className="text-3xl font-bold mt-4 text-pink-600">{product.name}</h1>
      <p className="mt-2 text-gray-700">{product.description}</p>
      <p className="mt-2 text-xl font-semibold">₹ {product.pricePerDay} / day</p>

      <form onSubmit={handleBooking} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-gray-700 font-medium">Select Booking Date:</span>
          <input
            type="date"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>

        <button
          type="submit"
          className="bg-pink-600 text-white py-2 px-6 rounded hover:bg-pink-700"
        >
          Book Now
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default ProductDetails;
