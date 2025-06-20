import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload, X, Calendar, Save, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "./Footer";

// Custom Calendar Component
const InteractiveCalendar = ({ 
  availableDates = [], 
  bookedDates = [], 
  excludedDates = [], 
  onDateClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const getDateStatus = (date) => {
    const dateStr = formatDateForComparison(date);
    
    if (bookedDates.includes(dateStr)) return 'booked';
    if (excludedDates.includes(dateStr)) return 'excluded';
    if (availableDates.includes(dateStr)) return 'available';
    return 'default';
  };
  
  const getDateClasses = (date, status) => {
    const baseClasses = "w-8 h-8 flex items-center justify-center text-sm cursor-pointer border rounded transition-all duration-200";
    const isToday = formatDateForComparison(date) === formatDateForComparison(today);
    const isPast = date < today;
    
    if (isPast && status === 'default') {
      return `${baseClasses} text-gray-300 bg-gray-50 cursor-not-allowed`;
    }
    
    switch (status) {
      case 'booked':
        return `${baseClasses} bg-red-500 text-white border-red-500 cursor-not-allowed`;
      case 'excluded':
        return `${baseClasses} bg-gray-500 text-white border-gray-500`;
      case 'available':
        return `${baseClasses} bg-green-500 text-white border-green-500`;
      default:
        return `${baseClasses} ${isToday ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`;
    }
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  const handleDateClick = (date) => {
    const dateStr = formatDateForComparison(date);
    const status = getDateStatus(date);
    const isPast = date < today;
    
    if (isPast && status === 'default') return;
    if (status === 'booked') return; // Can't modify booked dates
    
    onDateClick(dateStr, status);
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const status = getDateStatus(date);
      
      days.push(
        <div
          key={day}
          className={getDateClasses(date, status)}
          onClick={() => handleDateClick(date)}
          title={`${formatDateForComparison(date)} - ${status}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white border rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-pink-500 bg-pink-50 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    color: "",
    availability: true,
    rentDuration: [],
    availableDates: [],
    images: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [availableDatesInput, setAvailableDatesInput] = useState("");
  const [excludedDatesInput, setExcludedDatesInput] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [calendarAvailableDates, setCalendarAvailableDates] = useState([]);
  const [calendarExcludedDates, setCalendarExcludedDates] = useState([]);

  const categories = [
    "Lehenga",
    "Saree",
    "Gown",
    "Suit",
    "Sharara",
    "Gharara",
    "Anarkali",
    "Crop Top Set",
    "Indo-Western",
    "Traditional",
  ];

  const rentDurationOptions = [
    "1 day",
    "2 days",
    "3 days",
    "5 days",
    "1 week",
    "2 weeks",
    "1 month",
  ];

  // Fetch product data and booked dates
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        const productData = productResponse.data;
        setProduct(productData);

        // Format available dates for input field and calendar
        if (productData.availableDates && productData.availableDates.length > 0) {
          const formattedDates = productData.availableDates
            .map(date => new Date(date).toISOString().split('T')[0]);
          
          setAvailableDatesInput(formattedDates.join(', '));
          setCalendarAvailableDates(formattedDates);
        }

        // Format excluded dates
        if (productData.excludedDates && productData.excludedDates.length > 0) {
          const formattedExcluded = productData.excludedDates
            .map(date => new Date(date).toISOString().split('T')[0]);
          
          setExcludedDatesInput(formattedExcluded.join(', '));
          setCalendarExcludedDates(formattedExcluded);
        }

        // Fetch booked dates for this product
        try {
         const bookedResponse = await axios.get(
  `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }
);

// Extract booked dates from product data
const bookedDatesFormatted = [];
if (bookedResponse.data.bookedDates && bookedResponse.data.bookedDates.length > 0) {
  bookedResponse.data.bookedDates.forEach(booking => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    // Generate all dates in the booking range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDatesFormatted.push(d.toISOString().split('T')[0]);
    }
  });
}
          
          setBookedDates(bookedDatesFormatted);
        } catch (bookedError) {
          console.warn("Could not fetch booked dates:", bookedError);
          // Continue without booked dates if endpoint doesn't exist
        }

      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Error loading product data");
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRentDurationChange = (duration) => {
    setProduct((prev) => ({
      ...prev,
      rentDuration: prev.rentDuration.includes(duration)
        ? prev.rentDuration.filter((d) => d !== duration)
        : [...prev.rentDuration, duration],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
  };

  // Handle calendar date clicks
  const handleCalendarDateClick = (dateStr, currentStatus) => {
    if (currentStatus === 'available') {
      // Move from available to excluded
      setCalendarAvailableDates(prev => prev.filter(d => d !== dateStr));
      setCalendarExcludedDates(prev => [...prev, dateStr]);
    } else if (currentStatus === 'excluded') {
      // Move from excluded back to available
      setCalendarExcludedDates(prev => prev.filter(d => d !== dateStr));
      setCalendarAvailableDates(prev => [...prev, dateStr]);
    } else if (currentStatus === 'default') {
      // Add to available dates
      setCalendarAvailableDates(prev => [...prev, dateStr]);
    }
    
    // Update input fields
    setAvailableDatesInput(calendarAvailableDates.join(', '));
    setExcludedDatesInput(calendarExcludedDates.join(', '));
  };

  // Sync text inputs with calendar
  const handleAvailableDatesInputChange = (e) => {
    const value = e.target.value;
    setAvailableDatesInput(value);
    
    if (value.trim()) {
      const dates = value.split(',').map(d => d.trim()).filter(d => d);
      setCalendarAvailableDates(dates);
    } else {
      setCalendarAvailableDates([]);
    }
  };

  const handleExcludedDatesInputChange = (e) => {
    const value = e.target.value;
    setExcludedDatesInput(value);
    
    if (value.trim()) {
      const dates = value.split(',').map(d => d.trim()).filter(d => d);
      setCalendarExcludedDates(dates);
    } else {
      setCalendarExcludedDates([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name.trim() || !product.price || !product.category) {
      alert("Please fill in all required fields");
      return;
    }

    if (product.rentDuration.length === 0) {
      alert("Please select at least one rent duration");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      // Add basic product data
      formData.append("name", product.name.trim());
      formData.append("description", product.description.trim());
      formData.append("price", product.price);
      formData.append("category", product.category);
      formData.append("color", product.color.trim());
      formData.append("availability", product.availability);

      // Add rent durations
      product.rentDuration.forEach((duration) => {
        formData.append("rentDuration", duration);
      });

      // Add available dates from calendar
      if (calendarAvailableDates.length > 0) {
        formData.append("availableDates", calendarAvailableDates.join(', '));
      }

      // Add excluded dates from calendar
      if (calendarExcludedDates.length > 0) {
        formData.append("excludedDates", calendarExcludedDates.join(', '));
      }

      // Add images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach((imageUrl) => {
          formData.append("imagesToDelete", imageUrl);
        });
      }

      // Add new images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.error || "Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Day (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={product.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="availability"
                  checked={product.availability}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Product is available for rent
                </label>
              </div>

              {/* Rent Duration Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Duration Options *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {rentDurationOptions.map((duration) => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.rentDuration.includes(duration)}
                        onChange={() => handleRentDurationChange(duration)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {duration}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Management */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Date Management
              </h2>

              {/* Booked Dates Display */}
              {bookedDates.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Currently Booked Dates ({bookedDates.length})
                  </h3>
                  <div className="text-xs text-red-700 max-h-20 overflow-y-auto">
                    {bookedDates.join(', ')}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Available Dates (comma-separated, YYYY-MM-DD format)
                </label>
                <textarea
                  value={availableDatesInput}
                  onChange={handleAvailableDatesInputChange}
                  placeholder="2024-01-15, 2024-01-16, 2024-01-20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter dates when this product will be available for rent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <X className="inline w-4 h-4 mr-1" />
                  Excluded Dates (comma-separated, YYYY-MM-DD format)
                </label>
                <textarea
                  value={excludedDatesInput}
                  onChange={handleExcludedDatesInputChange}
                  placeholder="2024-01-17, 2024-01-18"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dates to exclude from available dates
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>💡 Tip:</strong> Use the calendar on the right to visually manage dates. 
                  Click on dates to toggle between available and unavailable. Booked dates cannot be modified.
                </p>
              </div>
            </div>

            {/* Interactive Calendar */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Interactive Calendar
              </h2>
              
              <InteractiveCalendar
                availableDates={calendarAvailableDates}
                bookedDates={bookedDates}
                excludedDates={calendarExcludedDates}
                onDateClick={handleCalendarDateClick}
              />

              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>How to use:</strong></p>
                <p>• Click on empty dates to make them available</p>
                <p>• Click on available (green) dates to mark as unavailable</p>
                <p>• Click on unavailable (gray) dates to make them available</p>
                <p>• Booked (red) dates cannot be modified</p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Product Images
            </h2>

            {/* Existing Images */}
            {product.images && product.images.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-contain rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  New Images to Add
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-contain rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Add more images
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB each
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={20} />
              {submitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditProduct;