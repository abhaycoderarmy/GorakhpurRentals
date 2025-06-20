import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/product");
  };

  // Placeholder hero images - replace with your actual API data
  const heroImages = [
    {
      id: 1,
      image:
        "https://res.cloudinary.com/dpzagdlky/image/upload/v1750005468/fdiqr0ufwl0594q3gqmi.png",
      title: "Exquisite Lehengas",
      subtitle: "Discover our stunning collection of traditional lehengas",
    },
    {
      id: 2,
      image:
        "https://res.cloudinary.com/dpzagdlky/image/upload/v1750006189/cwqyxeujm5hljckcgwue.png",
      title: "Elegant Gowns",
      subtitle: "Perfect for special occasions and celebrations",
    },
    {
      id: 3,
      image:
        "https://res.cloudinary.com/dpzagdlky/image/upload/v1750005468/fdiqr0ufwl0594q3gqmi.png",
      title: "Bridal Collection",
      subtitle: "Make your special day unforgettable",
    },
    {
      id: 4,
      image:
        "https://res.cloudinary.com/dpzagdlky/image/upload/v1750006189/cwqyxeujm5hljckcgwue.png",
      title: "Designer Wear",
      subtitle: "Curated pieces from renowned designers",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Image Carousel */}
      <div className="relative w-full h-full">
        {heroImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-start">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-xl lg:max-w-2xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                      <button
                        onClick={handleNavigation}
                        className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-rose-600 text-white rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:bg-rose-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Shop Lehengas
                      </button>
                      <button
                        onClick={handleNavigation}
                        className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
                      >
                        Shop Gowns
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-10"
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-10"
      >
        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-4 lg:bottom-8 right-4 lg:right-8 text-white animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-xs lg:text-sm mb-2">Scroll Down</span>
          <div className="w-5 lg:w-6 h-8 lg:h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 lg:h-3 bg-white rounded-full mt-1 lg:mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
