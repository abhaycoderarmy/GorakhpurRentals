import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedRentDuration, setSelectedRentDuration] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideInterval, setSlideInterval] = useState(null);

  // New state for date booking
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [dateError, setDateError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products/${id}`
        );
        setProduct(res.data);

        // Set default selections
        if (res.data.sizes && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0]);
        }
        if (res.data.rentDuration && res.data.rentDuration.length > 0) {
          setSelectedRentDuration(res.data.rentDuration[0]);
        }

        setError("");
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Function to get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Function to get minimum rental days from duration
  const getMinRentalDays = (duration) => {
    if (!duration) return 1;

    if (duration.includes("day")) {
      return parseInt(duration.match(/\d+/)[0]);
    } else if (duration.includes("week")) {
      return parseInt(duration.match(/\d+/)[0]) * 7;
    } else if (duration.includes("month")) {
      return parseInt(duration.match(/\d+/)[0]) * 30;
    }
    return 1;
  };

  // Function to calculate minimum end date based on rental duration
  const getMinEndDate = (startDate, duration) => {
    if (!startDate || !duration) return getMinDate();

    const start = new Date(startDate);
    const minDays = getMinRentalDays(duration);
    const minEnd = new Date(start);
    minEnd.setDate(start.getDate() + minDays);

    return minEnd.toISOString().split("T")[0];
  };

  // Validate date selection based on rental duration
  const validateDateSelection = useCallback((start, end, duration) => {
    if (!start || !end || !duration)
      return { valid: false, message: "Please select both dates" };

    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const minDays = getMinRentalDays(duration);

    if (daysDiff < minDays) {
      return {
        valid: false,
        message: `Minimum rental period is ${minDays} days for ${duration}`,
      };
    }

    return { valid: true, message: "" };
  }, []);

  // Auto-validate dates when they change
  useEffect(() => {
    if (startDate && endDate && selectedRentDuration) {
      const validation = validateDateSelection(
        startDate,
        endDate,
        selectedRentDuration
      );
      if (!validation.valid) {
        setDateError(validation.message);
        setAvailabilityStatus(null);
        return;
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate, selectedRentDuration]);

  // Check availability function
  const checkAvailability = useCallback(async () => {
    if (!startDate || !endDate) {
      setDateError("Please select both start and end dates");
      return;
    }

    const validation = validateDateSelection(
      startDate,
      endDate,
      selectedRentDuration
    );
    if (!validation.valid) {
      setDateError(validation.message);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      setDateError("");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products/${id}/check-availability`,
        { startDate, endDate }
      );

      setAvailabilityStatus(response.data);
    } catch (error) {
      console.error("Error checking availability:", error);
      setDateError("Failed to check availability. Please try again.");
      setAvailabilityStatus(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [startDate, endDate, selectedRentDuration, id]);

  // Auto-check availability when dates change
  useEffect(() => {
    if (startDate && endDate && product && !dateError) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, product?.id, dateError]);
  useEffect(() => {
    if (isAutoPlaying && product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % product.images.length
        );
      }, 3000); // 3 seconds

      setSlideInterval(interval);

      return () => clearInterval(interval);
    } else if (slideInterval) {
      clearInterval(slideInterval);
      setSlideInterval(null);
    }
  }, [isAutoPlaying, product?.images?.length]);

  const handleAddToCart = async() => {
    if (!startDate || !endDate) {
      setToastMessage("Please select both start and end dates for rental");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const validation = validateDateSelection(
      startDate,
      endDate,
      selectedRentDuration
    );
    if (!validation.valid) {
      setDateError(validation.message);
      return;
    }

    if (!availabilityStatus || !availabilityStatus.available) {
      setDateError("Product is not available for selected dates");
      return;
    }

    if (product) {
      const cartItem = {
        ...product,
        selectedSize,
        selectedRentDuration,
        quantity,
        startDate,
        endDate,
        rentalDates: {
          start: startDate,
          end: endDate,
        },
      };
      const result = await addToCart(product._id, quantity, startDate, endDate);
if (result.success) {
  toast.message("Added to Cart Successfully");
} else {
  setToastMessage(result.message);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000);
}
    }
  };

  const goToPreviousImage = useCallback(() => {
    if (product && product.images) {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );

      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  }, [product, slideInterval]);

  const goToNextImage = useCallback(() => {
    if (product && product.images) {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % product.images.length
      );

      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  }, [product, slideInterval]);

  const selectImage = useCallback(
    (index) => {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex(index);

      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    [slideInterval]
  );

  const openFullscreen = useCallback(() => {
    setIsFullscreenOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreenOpen) {
        if (e.key === "Escape") {
          closeFullscreen();
        } else if (e.key === "ArrowLeft") {
          goToPreviousImage();
        } else if (e.key === "ArrowRight") {
          goToNextImage();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenOpen, closeFullscreen, goToPreviousImage, goToNextImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-md"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4 shadow-md"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 shadow-md"></div>
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3 shadow-md"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shadow-md"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6 shadow-md"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/6 shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Product Not Found
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentImage =
    product.images && product.images.length > 0
      ? product.images[currentImageIndex]
      : "/placeholder-image.jpg";

  const averageRating =
    product.ratings && product.ratings.length > 0
      ? product.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
        product.ratings.length
      : 0;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Breadcrumb */}
      <div className="bg-gradient-to-r from-purple-900/60 via-blue-900/50 to-indigo-900/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-3 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </button>
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Products
            </button>
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-cyan-300 capitalize font-semibold">
              {product.category}
            </span>
          </nav>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* Image Section - 1/3 of screen */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-24 h-[calc(100vh-160px)]">
              {/* Main Image Container */}
              <div className="relative h-full group bg-transparent rounded-3xl overflow-hidden border border-white/20">
                <div
                  className="h-full flex items-center justify-center p-4 cursor-zoom-in"
                  onClick={openFullscreen}
                >
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-all duration-1000 ease-in-out hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>

                {/* Auto-play indicator */}
                {isAutoPlaying &&
                  product.images &&
                  product.images.length > 1 && (
                    <div className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Auto</span>
                    </div>
                  )}

                {/* Play/Pause button */}
                {product.images && product.images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlaying(!isAutoPlaying);
                    }}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300"
                  >
                    {isAutoPlaying ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Zoom Icon */}
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>

                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPreviousImage();
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 shadow-2xl opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextImage();
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 shadow-2xl opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Progress bar for slideshow */}
                {isAutoPlaying &&
                  product.images &&
                  product.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/20 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full"
                          style={{
                            animation: "slideshow-progress 3s linear infinite",
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                {/* Image Counter */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
{product.images && product.images.length > 1 && (
  <div className="absolute left-4 top-20 bg-black/80 backdrop-blur-sm rounded-2xl p-3 w-32">
    <div className="text-white text-sm font-medium mb-2 text-center">
      Gallery
    </div>
    <div className="flex flex-col gap-2 max-h-screen overflow-y-auto scrollbar-hide">
      {product.images.map((image, index) => (
        <button
          key={index}
          onClick={() => selectImage(index)}
          className={`relative w-28 h-28 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
            index === currentImageIndex
              ? "border-blue-400 shadow-lg scale-105"
              : "border-white/30 hover:border-white/60"
          }`}
        >
          <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </button>
      ))}
    </div>
  </div>
)}
</div>
</div>

          {/* Product Info Section - 2/3 of screen */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-300/20">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-cyan-200 capitalize text-lg font-medium bg-cyan-500/30 px-4 py-2 rounded-full border border-cyan-400/50">
                  {product.category}
                </p>

                {/* Rating */}
                {product.ratings && product.ratings.length > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating)
                              ? "fill-current"
                              : "text-gray-500"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-yellow-400 font-semibold text-sm">
                      {averageRating.toFixed(1)} ({product.ratings.length})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-3xl p-6 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-2">
                ₹{product.price}
                <span className="text-lg font-medium text-green-300 ml-2">
                  / rental
                </span>
              </div>
              <p className="text-green-300 font-medium">
                ✓ Inclusive of all taxes
              </p>
            </div>

            {/* Rental Date Selection */}
            <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-300/20">
              <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Select Rental Dates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={getMinDate()}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/10 text-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={
                      startDate
                        ? getMinEndDate(startDate, selectedRentDuration)
                        : getMinDate()
                    }
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-400/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/90 text-white backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Availability Status */}
              {isCheckingAvailability && (
                <div className="flex items-center space-x-3 text-blue-400 mb-3 bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="font-medium">Checking availability...</span>
                </div>
              )}

              {availabilityStatus && (
                <div
                  className={`flex items-center space-x-3 mb-3 p-3 rounded-lg font-medium border ${
                    availabilityStatus.available
                      ? "text-green-400 bg-green-500/20 border-green-500/30"
                      : "text-red-400 bg-red-500/20 border-red-500/30"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {availabilityStatus.available ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    )}
                  </svg>
                  <span>{availabilityStatus.message}</span>
                </div>
              )}

              {dateError && (
                <div className="flex items-center space-x-3 text-red-400 mb-3 bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{dateError}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Color */}
              {product.color && (
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                      />
                    </svg>
                    Color
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-gradient-to-br from-gray-200 to-gray-400"></div>
                    <span className="text-white capitalize font-medium">
                      {product.color}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-800/30 via-purple-800/25 to-pink-800/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-300/20">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 1v4m0-4h-4m4 4l-5-5"
                    />
                  </svg>
                  Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all duration-300 ${
                        selectedSize === size
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-white/20 bg-white/5 text-gray-300 hover:border-blue-400 hover:bg-blue-500/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Duration */}
            {product.rentDuration && product.rentDuration.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-800/30 via-purple-800/25 to-pink-800/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-300/20">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Rental Duration
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.rentDuration.map((duration, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRentDuration(duration)}
                      className={`p-3 rounded-xl border-2 font-semibold text-center transition-all duration-300 ${
                        selectedRentDuration === duration
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-white/20 bg-white/5 text-gray-300 hover:border-blue-400 hover:bg-blue-500/10"
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-6 pb-6">
              <button
                onClick={handleAddToCart}
                disabled={
                  !product.availability ||
                  !startDate ||
                  !endDate ||
                  !availabilityStatus?.available
                }
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3 ${
                  !product.availability ||
                  !startDate ||
                  !endDate ||
                  !availabilityStatus?.available
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v5a2 2 0 002 2h9a2 2 0 002-2v-5m-9 0V9a2 2 0 012-2h5a2 2 0 012 2v4.01"
                  />
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="flex border-b border-white/20">
                <button
                  onClick={() => {
                    setShowDescription(true);
                    setShowReviews(false);
                  }}
                  className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                    showDescription
                      ? "bg-blue-500/20 text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-blue-400 hover:bg-white/5"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => {
                    setShowDescription(false);
                    setShowReviews(true);
                  }}
                  className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                    showReviews
                      ? "bg-blue-500/20 text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-blue-400 hover:bg-white/5"
                  }`}
                >
                  Reviews ({product.ratings ? product.ratings.length : 0})
                </button>
              </div>

              <div className="p-6">
                {showDescription && (
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {product.description ||
                        "No description available for this product."}
                    </p>
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-3">
                          Key Features:
                        </h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <svg
                                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-gray-100">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {showReviews && (
                  <div className="space-y-6">
                    {product.ratings && product.ratings.length > 0 ? (
                      <>
                        {/* Rating Summary */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl font-bold text-yellow-400">
                                {averageRating.toFixed(1)}
                              </div>
                              <div>
                                <div className="flex text-yellow-400 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < Math.floor(averageRating)
                                          ? "fill-current"
                                          : "text-gray-500"
                                      }`}
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Based on {product.ratings.length} review
                                  {product.ratings.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rating Distribution */}
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = product.ratings.filter(
                                (r) => Math.floor(r.rating) === rating
                              ).length;
                              const percentage =
                                (count / product.ratings.length) * 100;
                              return (
                                <div
                                  key={rating}
                                  className="flex items-center space-x-3 text-sm"
                                >
                                  <span className="text-gray-400 w-8">
                                    {rating}★
                                  </span>
                                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-gray-400 w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="space-y-4">
                          {product.ratings.map((review, index) => (
                            <div
                              key={index}
                              className="bg-white/5 rounded-xl p-4 border border-white/20"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                      {review.user
                                        ? review.user.charAt(0).toUpperCase()
                                        : "A"}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white">
                                      {review.user || "Anonymous User"}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < Math.floor(review.rating)
                                                ? "fill-current"
                                                : "text-gray-500"
                                            }`}
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-400">
                                        {review.date
                                          ? new Date(
                                              review.date
                                            ).toLocaleDateString()
                                          : "Recent"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {review.comment && (
                                <p className="text-gray-100 leading-relaxed">
                                  {review.comment}
                                </p>
                              )}

                              {/* Helpful buttons */}
                              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-white/20">
                                <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                    />
                                  </svg>
                                  <span>Helpful</span>
                                </button>
                                <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                                    />
                                  </svg>
                                  <span>Report</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Review Button */}
                        <div className="text-center">
                          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span>Write a Review</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-16 h-16 text-gray-500 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                          />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                          No Reviews Yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Be the first to review this product!
                        </p>
                        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Write the First Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Fullscreen Image Modal */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Thumbnail sidebar in fullscreen */}
            {product.images && product.images.length > 1 && (
              <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-xl p-3 z-60">
                <div className="text-white text-xs font-medium mb-2 text-center">
                  Gallery
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectImage(index);
                      }}
                      className={`block w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex
                          ? "border-blue-400 shadow-lg ring-2 ring-blue-400/50"
                          : "border-white/30 hover:border-white/60"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image counter in fullscreen */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
      @keyframes slideshow-progress {
        from { width: 0%; }
        to { width: 100%; }
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.6);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.8);
      }
        .scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
    `}</style>
    </div>
  );
}
