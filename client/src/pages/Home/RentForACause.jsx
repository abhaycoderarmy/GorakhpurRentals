import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RentForACause() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate("/product");
  };

  useEffect(() => {
    setLoading(true);
    // Fetch all products for the "Rent for a Cause" section
    fetch(`${import.meta.env.VITE_BACKEND_URL}/products?cause=true`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        //made changes here changed 
        // Initialize image indices for each product
        const initialIndices = {};
        data.forEach(product => {
          initialIndices[product._id] = 0;
        });
        setCurrentImageIndex(initialIndices);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Slideshow effect - change image every 5 seconds
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newIndices = { ...prev };
        products.forEach(product => {
          const images = product.images || [product.image];
          if (images.length > 1) {
            newIndices[product._id] = (prev[product._id] + 1) % images.length;
          }
        });
        return newIndices;
      });
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [products]);

  const handleProductClick = (productId) => {
    // Navigate to product details page
    window.location.href = `/product/${productId}`;
    // Or if using React Router: navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 bg-white rounded-lg mb-4 mx-auto w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 tracking-wide">
            RENT FOR A CAUSE
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(-4).map((product, index) => {
            const images = product.images || [product.image];
            const currentImg = images[currentImageIndex[product._id] || 0] || '/api/placeholder/300/400';
            
            return (
              <div 
                key={product._id} 
                onClick={() => handleProductClick(product._id)}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  index % 4 === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-50' :
                  index % 4 === 1 ? 'bg-gradient-to-br from-purple-100 to-purple-50' :
                  index % 4 === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-50' :
                  'bg-gradient-to-br from-pink-100 to-pink-50'
                }`}
              >
                {/* Product Image with Slideshow */}
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img 
                    src={currentImg} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Image Indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {images.map((_, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            imgIndex === (currentImageIndex[product._id] || 0)
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.price?.toLocaleString() || product.rentPrice?.toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic
                      }}
                      className="p-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product._id);
                      }}
                      className="flex-1 ml-3 bg-gray-800 text-white py-2 px-4 rounded-full hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Rent Now
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // More options logic
                      }}
                      className="p-2 ml-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cause Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    For Cause
                  </span>
                </div>

                {/* Heart Icon - Top Right */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Wishlist toggle logic
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* No Products Message */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No cause products available</h3>
            <p className="text-gray-500">Check back later for new rental options supporting causes</p>
          </div>
        )}

        {/* View All Button */}
        {products.length > 4 && (
          <div className="text-center mt-12">
            <button 
            onClick={handleNavigation}
            className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-colors font-medium">
              View All Cause Rentals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}