import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="block border rounded shadow hover:shadow-lg transition overflow-hidden bg-white">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-pink-700">{product.name}</h2>
        <p className="text-gray-600 mt-1">₹ {product.pricePerDay} / day</p>
      </div>
    </Link>
  );
};

export default ProductCard;
