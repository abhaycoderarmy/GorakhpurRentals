import { useEffect, useState } from "react";
import { ShoppingCart, Search, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

// In your actual application, uncomment these imports:
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";



export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [zoomedProduct, setZoomedProduct] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${BACKEND_URL}/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products);
        setFiltered(data.products);
        
        // Initialize image indices for slideshow
        const indices = {};
        data.products.forEach(product => {
          if (product.images && product.images.length > 0) {
            indices[product._id] = 0;
          }
        });
        setCurrentImageIndices(indices);
        
        setError("");
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (category !== "All") {
      result = result.filter((product) => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      result = result.filter((product) =>
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, category, products]);

  // Auto slideshow effect for all products
  useEffect(() => {
    const intervals = {};
    
    filtered.forEach(product => {
      if (product.images && product.images.length > 1) {
        intervals[product._id] = setInterval(() => {
          setCurrentImageIndices(prev => ({
            ...prev,
            [product._id]: (prev[product._id] + 1) % product.images.length
          }));
        }, 2000); // 2 seconds
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [filtered]);

  const categories = ["All", "Bridal", "Party", "Designer", "Traditional", "Lehenga"];

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // addToCart(product);
    addToCart(product._id);
  };

  const goToPreviousImage = (e, productId, images) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: prev[productId] === 0 ? images.length - 1 : prev[productId] - 1
    }));
  };

  const goToNextImage = (e, productId, images) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % images.length
    }));
  };

  const handleZoom = (e, product) => {
    e.stopPropagation();
    setZoomedProduct(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 border-t-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading beautiful products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm border border-pink-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="text-pink-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-pink-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* Header Section */}
      <div className="bg-white/30 backdrop-blur-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            ✨ Discover Beautiful Products ✨
          </h1>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for your perfect outfit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 placeholder-pink-400"
              />
            </div>
            <div className="lg:w-64">
              <select
                className="w-full py-4 px-4 bg-white/70 backdrop-blur-sm border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 text-gray-700"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((product) => {
            const currentImageIndex = currentImageIndices[product._id] || 0;
            const currentImage = product.images && product.images.length > 0 
              ? product.images[currentImageIndex] 
              : "/placeholder-image.jpg";
            
            return (
              <div 
                key={product._id} 
                className="group bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/80 transition-all duration-500 cursor-pointer overflow-hidden transform hover:scale-105 hover:-translate-y-2"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative overflow-hidden rounded-t-3xl">
                  {/* Image Container */}
                  <div className="relative" style={{ paddingBottom: '125%' }}>
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Navigation Arrows */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => goToPreviousImage(e, product._id, product.images)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-pink-500/80 hover:bg-pink-600/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => goToNextImage(e, product._id, product.images)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-pink-500/80 hover:bg-pink-600/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Zoom Button */}
                    <button
                      onClick={(e) => handleZoom(e, product)}
                      className="absolute top-3 right-3 bg-pink-500/80 hover:bg-pink-600/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Slideshow Indicators */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndices(prev => ({
                                ...prev,
                                [product._id]: index
                              }));
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex 
                                ? "bg-pink-500 scale-125" 
                                : "bg-white/60 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Availability Badge */}
                    {!product.availability && (
                      <div className="absolute top-3 left-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              
                <div className="p-6">
                  <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors duration-200">
                    {product.name}
                  </h2>
                  
                  <p className="text-sm text-pink-500 font-medium mb-2 capitalize">
                    {product.category}
                  </p>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-pink-600">
                      ₹{product.price}
                    </p>
                    {/* {product.rentDuration && product.rentDuration.length > 0 && (
                      <p className="text-xs text-gray-500 bg-pink-50 px-2 py-1 rounded-full">
                        from {product.rentDuration[0]}
                      </p>
                    )} */}
                  </div>

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Available Sizes:</p>
                      <div className="flex gap-1 flex-wrap">
                        {product.sizes.slice(0, 4).map((size, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium"
                          >
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 4 && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                            +{product.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!product.availability}
                    className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      product.availability
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.availability ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Products Found */}
        {filtered.length === 0 && !loading && (
          <div className="text-center mt-16 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="text-pink-400 mb-6">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m15 0H3m0 0h2m11 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria to discover more beautiful items.</p>
            </div>
          </div>
        )}

        {/* Products Count */}
        {/* {filtered.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-pink-200">
              <span className="text-pink-600 font-medium">
                Showing {filtered.length} of {products.length} beautiful products
              </span>
            </div>
          </div>
        )} */}
      </div>

      {/* Zoom Modal */}
      {zoomedProduct && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setZoomedProduct(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={zoomedProduct.images && zoomedProduct.images.length > 0 
                ? zoomedProduct.images[currentImageIndices[zoomedProduct._id] || 0]
                : "/placeholder-image.jpg"}
              alt={zoomedProduct.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setZoomedProduct(null)}
              className="absolute top-4 right-4 bg-pink-500/80 hover:bg-pink-600/90 text-white p-3 rounded-full transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              <h3 className="font-semibold">{zoomedProduct.name}</h3>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}