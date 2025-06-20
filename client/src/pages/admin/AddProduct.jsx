

import React, { useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { 
  Upload,
  Image,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  Calendar,
  X
} from "lucide-react";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Lehenga",
    rentDuration: [],
    color: "",
    availability: true,
  });
  const [images, setImages] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [excludedDates, setExcludedDates] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMode, setSelectedMode] = useState("individual"); // "individual" or "range"
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRentDurationsChange = (e) => {
    setForm({ ...form, rentDuration: e.target.value.split(",").map(item => item.trim()) });
  };

  const handleImagesChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleDateSelect = (e) => {
    e.preventDefault();
    console.log("Selected date:", selectedDate);
    console.log("Current available dates:", availableDates);
    
    if (selectedDate && !availableDates.includes(selectedDate)) {
      const updatedDates = [...availableDates, selectedDate];
      console.log("Updated available dates:", updatedDates);
      setAvailableDates(updatedDates);
      setSelectedDate("");
      setError(""); // Clear any previous errors
    } else if (!selectedDate) {
      setError("Please select a date");
    } else {
      setError("Date already selected");
    }
  };

  const handleDateRangeGenerate = () => {
    console.log("Generating date range:", dateRange);
    
    if (!dateRange.startDate || !dateRange.endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const dates = [];
    
    if (start > end) {
      setError("Start date must be before end date");
      return;
    }
    
    // Generate all dates in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      console.log("Processing date:", dateString);
      
      // Only add if not excluded and not already in available dates
      if (!excludedDates.includes(dateString) && !availableDates.includes(dateString)) {
        dates.push(dateString);
        console.log("Added date to range:", dateString);
      } else {
        console.log("Skipped date (excluded or already exists):", dateString);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log("Generated dates:", dates);
    const updatedAvailableDates = [...availableDates, ...dates];
    console.log("Final available dates:", updatedAvailableDates);
    
    setAvailableDates(updatedAvailableDates);
    setError("");
    
    if (dates.length > 0) {
      setSuccess(`Added ${dates.length} dates to available dates`);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleExcludeDateFromRange = () => {
    console.log("Excluding date:", selectedDate);
    console.log("Date range:", dateRange);
    
    if (!selectedDate) {
      setError("Please select a date to exclude");
      return;
    }
    
    if (selectedDate && dateRange.startDate && dateRange.endDate) {
      const selectedDateObj = new Date(selectedDate);
      const startDateObj = new Date(dateRange.startDate);
      const endDateObj = new Date(dateRange.endDate);
      
      if (selectedDateObj >= startDateObj && selectedDateObj <= endDateObj) {
        if (!excludedDates.includes(selectedDate)) {
          const updatedExcludedDates = [...excludedDates, selectedDate];
          console.log("Updated excluded dates:", updatedExcludedDates);
          setExcludedDates(updatedExcludedDates);
          
          // Remove from available dates if it exists
          const filteredAvailableDates = availableDates.filter(date => date !== selectedDate);
          console.log("Filtered available dates:", filteredAvailableDates);
          setAvailableDates(filteredAvailableDates);
          setError("");
        } else {
          setError("Date is already excluded");
        }
      } else {
        setError("Selected date is not within the date range");
      }
    } else {
      setError("Please set start and end dates first");
    }
    setSelectedDate("");
  };

  const removeExcludedDate = (dateToRemove) => {
    console.log("Removing excluded date:", dateToRemove);
    const updatedExcludedDates = excludedDates.filter(date => date !== dateToRemove);
    console.log("Updated excluded dates:", updatedExcludedDates);
    setExcludedDates(updatedExcludedDates);
  };

  const removeDateFromAvailable = (dateToRemove) => {
    console.log("Removing available date:", dateToRemove);
    const updatedAvailableDates = availableDates.filter(date => date !== dateToRemove);
    console.log("Updated available dates:", updatedAvailableDates);
    setAvailableDates(updatedAvailableDates);
  };

  const formatDateForDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Debug: Log what we have before sending
    console.log("Available dates state:", availableDates);
    console.log("Excluded dates state:", excludedDates);

    // Validation
    if (availableDates.length === 0) {
      setError("Please add at least one available date");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    
    // Add all form fields
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => data.append(key, val));
      } else {
        data.append(key, value);
      }
    });

    // Add available dates - ensure they're properly formatted
    if (availableDates && availableDates.length > 0) {
      availableDates.forEach((date) => {
        // Ensure date is in YYYY-MM-DD format
        const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        data.append("availableDates", formattedDate);
        console.log("Appending available date:", formattedDate);
      });
    } else {
      console.log("No available dates to append");
    }

    // Add excluded dates for reference (optional, mainly for logging)
    if (excludedDates && excludedDates.length > 0) {
      excludedDates.forEach((date) => {
        // Ensure date is in YYYY-MM-DD format
        const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        data.append("excludedDates", formattedDate);
        console.log("Appending excluded date:", formattedDate);
      });
    }

    // Add images
    images.forEach((img) => data.append("images", img));

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
      const token = localStorage.getItem("token"); // Replace "token" with your actual key if different

const response = await api.post(
  "/products/create",
  data,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
      console.log("Product created successfully:", response.data);
      setSuccess("Product added successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Add New Lehenga
          </h1>
          <p className="text-gray-600">Create a stunning product listing for your collection</p>
        </div>

        {/* Debug Button - Remove this in production */}
        <div className="mb-4 text-center">
          <button 
            type="button" 
            onClick={() => {
              console.log("=== DEBUG STATE ===");
              console.log("availableDates:", availableDates);
              console.log("excludedDates:", excludedDates);
              console.log("selectedDate:", selectedDate);
              console.log("dateRange:", dateRange);
              console.log("selectedMode:", selectedMode);
              console.log("=================");
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Debug State (Remove in Production)
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="p-8 sm:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Elegant Bridal Lehenga"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      placeholder="Describe the beauty and elegance of this lehenga..."
                      value={form.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300 resize-none"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Day (₹)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="2500"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      name="color"
                      placeholder="Red, Gold, Maroon"
                      value={form.color}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300"
                    >
                      <option value="Lehenga">Lehenga</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Festive">Festive</option>
                      <option value="Party">Party</option>
                      <option value="Designer">Designer</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rent Duration Options</label>
                    <input
                      type="text"
                      placeholder="2 days, 5 days, 1 week"
                      onChange={handleRentDurationsChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 group-hover:border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple options with commas</p>
                  </div>

                  {/* Available Dates Section */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Available Dates *
                      {availableDates.length > 0 && (
                        <span className="text-green-600 font-normal text-xs ml-2">
                          ({availableDates.length} dates selected)
                        </span>
                      )}
                    </label>
                    
                    {/* Mode Selection */}
                    <div className="mb-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="dateMode"
                            value="individual"
                            checked={selectedMode === "individual"}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-4 h-4 text-pink-600"
                          />
                          <span className="text-sm text-gray-700">Individual Dates</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="dateMode"
                            value="range"
                            checked={selectedMode === "range"}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-4 h-4 text-pink-600"
                          />
                          <span className="text-sm text-gray-700">Date Range</span>
                        </label>
                      </div>
                    </div>

                    {/* Individual Date Selection */}
                    {selectedMode === "individual" && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={today}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={handleDateSelect}
                            disabled={!selectedDate || availableDates.includes(selectedDate)}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Date Range Selection */}
                    {selectedMode === "range" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={dateRange.startDate}
                              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                              min={today}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={dateRange.endDate}
                              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                              min={dateRange.startDate || today}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                            />
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleDateRangeGenerate}
                          disabled={!dateRange.startDate || !dateRange.endDate}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          Generate Available Dates from Range
                        </button>

                        {/* Exclude Dates Section */}
                        {dateRange.startDate && dateRange.endDate && (
                          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Exclude Dates from Range</h4>
                            <div className="flex gap-2 mb-3">
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={dateRange.startDate}
                                max={dateRange.endDate}
                                className="flex-1 px-3 py-2 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={handleExcludeDateFromRange}
                                disabled={!selectedDate || excludedDates.includes(selectedDate)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Excluded Dates Display */}
                            {excludedDates.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-600 mb-2">Excluded Dates:</p>
                                <div className="flex flex-wrap gap-2">
                                  {excludedDates.map((date, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs border border-red-200"
                                    >
                                      {formatDateForDisplay(date)}
                                      <button
                                        type="button"
                                        onClick={() => removeExcludedDate(date)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Selected Available Dates Display */}
                    {availableDates.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Available Dates ({availableDates.length}):</p>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {availableDates.sort().map((date, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-green-200"
                            >
                              {formatDateForDisplay(date)}
                              <button
                                type="button"
                                onClick={() => removeDateFromAvailable(date)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Width Sections */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={form.availability}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <label className="text-gray-700 font-medium">Mark as Available for Rent</label>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Product Images *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center group-hover:border-pink-400 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
                      <Image className="w-8 h-8 text-pink-600" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagesChange}
                      multiple
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Images
                    </label>
                    <p className="text-gray-500 mt-2">Upload multiple high-quality images</p>
                    {images.length > 0 && (
                      <p className="text-green-600 mt-2 font-medium">{images.length} files selected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || availableDates.length === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Product...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add Product {availableDates.length === 0 && "(Please add dates first)"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;