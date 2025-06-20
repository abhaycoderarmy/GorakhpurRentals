import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/wishlist/${user.user._id}`)
        .then(res => setWishlist(res.data));
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map(product => (
          <div key={product._id} className="border p-4 rounded">
            <img src={product.images[0]} className="h-48 w-full object-cover mb-2" />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p>₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
