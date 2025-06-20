import { useEffect, useState } from "react";
import { Edit, Trash2, Calendar, Eye, Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`);
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`, {
          method: 'DELETE'
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page - replace with your actual navigation logic
    window.location.href = `/admin/edit-product/${id}`;
  };

  const handleAddProduct = () => {
    // Navigate to add product page - replace with your actual navigation logic
    window.location.href = '/admin/add-product';
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterProducts(term, filterCategory);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
    filterProducts(searchTerm, category);
  };

  const filterProducts = (search, category) => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return [...new Set(categories)].filter(Boolean);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getAvailabilityStatus = (product) => {
    if (!product.availability) return "Unavailable";
    const today = new Date();
    const availableDates = product.availableDates || [];
    const hasUpcomingDates = availableDates.some(date => new Date(date) >= today);
    return hasUpcomingDates ? "Available" : "No upcoming dates";
  };

  // Auto slideshow for product images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newIndex = { ...prev };
        filteredProducts.forEach(product => {
          if (product.images && product.images.length > 1) {
            const currentIdx = newIndex[product._id] || 0;
            newIndex[product._id] = (currentIdx + 1) % product.images.length;
          }
        });
        return newIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredProducts]);

  const nextImage = (productId, imageCount) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imageCount
    }));
  };

  const prevImage = (productId, imageCount) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imageCount) % imageCount
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Manage Products
            </h1>
            <p className="text-gray-600">Organize and manage your product inventory</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/50"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/50 min-w-[180px]"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Total Products</h3>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Available</h3>
            <p className="text-3xl font-bold">
              {products.filter(p => p.availability).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Categories</h3>
            <p className="text-3xl font-bold">{getUniqueCategories().length}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Filtered Results</h3>
            <p className="text-3xl font-bold">{filteredProducts.length}</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const currentIdx = currentImageIndex[product._id] || 0;
            const hasImages = product.images && product.images.length > 0;
            const imageCount = hasImages ? product.images.length : 0;
            
            return (
              <div key={product._id} className="group bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="relative h-64 overflow-hidden">
                  {hasImages ? (
                    <>
                      <img
                        src={product.images[currentIdx]}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                      {imageCount > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage(product._id, imageCount);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage(product._id, imageCount);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {product.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  idx === currentIdx ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">No Image</span>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                      getAvailabilityStatus(product) === 'Available' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {getAvailabilityStatus(product)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-purple-600 font-medium mb-3 uppercase tracking-wide">{product.category}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    ₹{product.price}/day
                  </p>
                  
                  {product.color && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Color:</span> {product.color}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {product.availableDates?.length || 0} available dates
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(product)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-300"
                      title="View Details"
                    >
                      <Eye size={16} />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors duration-300"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-4">
              <Search size={64} className="mx-auto text-gray-300" />
            </div>
            <p className="text-gray-500 text-xl mb-2">No products found</p>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Product Details Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedProduct.name}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProduct.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              className="w-full h-40 object-cover rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                          <span className="text-gray-500 text-lg">No images available</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedProduct.description || 'No description available'}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                      <h3 className="font-semibold text-gray-700 mb-2">Price</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{selectedProduct.price}/day
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl">
                        <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                        <p className="text-blue-600 font-medium">{selectedProduct.category}</p>
                      </div>
                      
                      {selectedProduct.color && (
                        <div className="bg-green-50 p-4 rounded-2xl">
                          <h3 className="font-semibold text-gray-700 mb-2">Color</h3>
                          <p className="text-green-600 font-medium">{selectedProduct.color}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedProduct.rentDuration && selectedProduct.rentDuration.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-2xl">
                        <h3 className="font-semibold text-gray-700 mb-3">Rent Durations</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.rentDuration.map((duration, index) => (
                            <span key={index} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                              {duration}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-green-50 p-4 rounded-2xl">
                      <h3 className="font-semibold text-gray-700 mb-3">Available Dates</h3>
                      <div className="max-h-32 overflow-y-auto">
                        {selectedProduct.availableDates && selectedProduct.availableDates.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedProduct.availableDates.map((date, index) => (
                              <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-lg text-xs text-center">
                                {formatDate(date)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No available dates set</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedProduct.bookedDates && selectedProduct.bookedDates.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-2xl">
                        <h3 className="font-semibold text-gray-700 mb-3">Booked Dates</h3>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {selectedProduct.bookedDates.map((booking, index) => (
                            <div key={index} className="bg-red-200 text-red-800 p-2 rounded-lg text-sm">
                              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleEdit(selectedProduct._id);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;