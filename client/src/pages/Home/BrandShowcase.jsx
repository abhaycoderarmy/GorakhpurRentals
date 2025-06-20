import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BrandShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
    const handleNavigation = () => {
    navigate('/product');
  };

  // Brand showcase images
  const showcaseImages = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dpzagdlky/image/upload/v1749993876/gorakhpur_rentals/gy4tpm3shutk5yijfzjn.jpg",
      title: "Craftsmanship Excellence"
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dpzagdlky/image/upload/v1749993713/gorakhpur_rentals/mmstlqztrkusfpgc2an6.jpg",
      title: "Elegant Designs"
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dpzagdlky/image/upload/v1749993711/gorakhpur_rentals/vetkogdfwnf4acdon2f3.jpg",
      title: "Bridal Perfection"
    },
    {
      id: 4,
      image: "https://res.cloudinary.com/dpzagdlky/image/upload/v1749993711/gorakhpur_rentals/vetkogdfwnf4acdon2f3.jpg",
      title: "Premium Quality"
    },
    {
      id: 5,
      image: "https://res.cloudinary.com/dpzagdlky/image/upload/v1749994315/x8ivdargtry7ogtn7hqu.jpg",
      title: "Timeless Beauty"
    }
  ];

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [showcaseImages.length]);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800">
      {/* Split Layout */}
      <div className="flex h-full">
        {/* Left Side - Image Carousel */}
        <div className="relative w-full md:w-1/2 h-full overflow-hidden">
          {showcaseImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark Overlay for better contrast */}
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Bottom Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
              </div>
            </div>
          ))}

          {/* Image Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {showcaseImages.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="hidden md:flex md:w-1/2 h-full items-center justify-center bg-gradient-to-br from-teal-600 via-blue-700 to-indigo-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>
          
          <div className="relative z-10 text-center px-8 lg:px-12">
            <div className="mb-4">
              <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">
                New Arrival
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Quality Is A Habit
            </h2>
            
            <p className="text-base lg:text-lg text-white/90 mb-8 leading-relaxed max-w-md mx-auto">
              Every outfit we onboard goes through a rigorous screening process to make sure that you 
              get nothing but the best craftsmanship from the most innovative and sought after designers.
            </p>
            
            {/* Arrow Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 border border-white/30 rounded-full hover:border-white/50 transition-colors duration-300">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <button 
             onClick={handleNavigation}
             className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
              RENT NOW
            </button>
          </div>
        </div>

        {/* Mobile Content Overlay */}
        <div className="md:hidden absolute inset-0 flex items-end justify-center pb-16 z-10">
          <div className="text-center px-6 bg-black/60 backdrop-blur-sm rounded-2xl p-6 mx-4">
            <div className="mb-2">
              <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">
                New Arrival
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Quality Is A Habit
            </h2>
            
            <p className="text-sm text-white/90 mb-4 leading-relaxed">
              Every outfit goes through rigorous screening for the best craftsmanship.
            </p>
            
            <button className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all duration-300">
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}