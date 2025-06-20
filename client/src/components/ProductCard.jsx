import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Clock } from "lucide-react";

export default function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide images every 3 seconds when hovered
  useEffect(() => {
    if (!isHovered || !product.images || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, product.images]);

  const handleImageNavigation = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add wishlist functionality here
  };

  const averageRating = product.ratings?.length > 0 
    ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length 
    : 0;

  return (
    <Link 
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img 
          src={product.images?.[currentImageIndex] || product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.availability 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.availability ? 'Available' : 'Rented'}
          </span>
        </div>

        {/* Image Indicators */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleImageNavigation(index, e)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100 cursor-pointer">
            Quick View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {product.category || 'Lehenga'}
          </span>
          {averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          <span className="text-sm text-gray-500">/ rent</span>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{product.rentDuration?.[0] || '2 days'}</span>
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <span>Sizes: {product.sizes.slice(0, 3).join(', ')}</span>
          )}
        </div>

        {/* Color indicator */}
        {product.color && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Color:</span>
            <div className="flex items-center space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: product.color.toLowerCase() }}
              />
              <span className="text-xs font-medium">{product.color}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4">
        <span className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] block text-center cursor-pointer">
          View Details
        </span>
      </div>
    </Link>
  );
}