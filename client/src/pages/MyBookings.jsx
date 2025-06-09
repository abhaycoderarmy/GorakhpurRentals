import React, { useEffect, useState } from "react";
import api from "../services/api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data);
      } catch (err) {
        setError("Failed to fetch your bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading your bookings...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">You haven't booked any lehengas yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition bg-white"
            >
              <img
                src={booking.product?.image}
                alt={booking.product?.name}
                className="w-full h-56 object-cover rounded"
              />
              <h2 className="text-xl font-semibold mt-4">{booking.product?.name}</h2>
              <p className="text-gray-700 mt-1">₹{booking.product?.pricePerDay} / day</p>
              <p className="text-gray-500 mt-1 text-sm">
                Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
              <p className="text-sm mt-1">
                Status: <span className="font-medium">{booking.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
