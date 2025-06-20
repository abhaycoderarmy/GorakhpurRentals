import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OurRentalProcess() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate("/product");
  };
  const steps = [
    {
      id: 1,
      title: "Select a Style",
      description: "Pick your perfect style from our collection of designer outfits and accessories.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Hanger Icon */}
          <path d="M20 25 L80 25 M50 15 L50 25 M15 35 L85 35 C87 35 89 37 89 39 L89 85 C89 87 87 89 85 89 L15 89 C13 89 11 87 11 85 L11 39 C11 37 13 35 15 35 Z" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="50" cy="12" r="3" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Book your Outfit",
      description: "Book your look for 3, 5, 7 or 10 days. Outfit will be altered to your size and dry cleaned before delivery.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Checkmark in circle */}
          <circle cx="50" cy="50" r="35" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M35 50 L45 60 L65 40" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "Flaunt It",
      description: "Flaunt your look with that perfect outfit chosen by you and enjoy the compliments.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Dress/Person Icon */}
          <circle cx="50" cy="20" r="8" fill="currentColor"/>
          <path d="M35 30 L65 30 L60 45 L40 45 Z" fill="currentColor"/>
          <path d="M45 45 L45 85 M55 45 L55 85" strokeLinecap="round"/>
          <path d="M40 85 L50 85 M50 85 L60 85" strokeLinecap="round"/>
          <path d="M35 30 L30 40 M65 30 L70 40" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 4,
      title: "Return It",
      description: "Pack the outfit and we'll pick it up a day after your occasion or the dates chosen by you.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Package/Return Icon */}
          <rect x="25" y="35" width="50" height="40" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25 45 L75 45" strokeLinecap="round"/>
          <path d="M40 35 L40 25 L60 25 L60 35" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M45 55 L50 60 L55 55 M50 60 L50 50" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Rental Process
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-20 left-0 right-0 h-0.5 bg-gray-200 hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-400 to-gray-200"></div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative flex flex-col items-center text-center group cursor-pointer z-10"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Number Circle */}
                <div className={`absolute -top-2 right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 transition-all duration-300 ${
                  hoveredStep === step.id 
                    ? 'bg-yellow-500 scale-110 shadow-lg' 
                    : 'bg-yellow-400'
                }`}>
                  {step.id}
                </div>

                {/* Icon Container */}
                <div className={`mb-6 p-6 rounded-full transition-all duration-300 relative z-20 ${
                  hoveredStep === step.id
                    ? 'bg-yellow-50 text-yellow-600 scale-110 shadow-xl'
                    : 'bg-gray-50 text-gray-600 group-hover:bg-yellow-50 group-hover:text-yellow-600'
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className={`transition-all duration-300 relative z-20 ${
                  hoveredStep === step.id ? 'transform -translate-y-2' : ''
                }`}>
                  <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                    hoveredStep === step.id ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className={`text-gray-600 leading-relaxed max-w-xs mx-auto transition-all duration-300 ${
                    hoveredStep === step.id ? 'text-gray-800 scale-105' : ''
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Hover Highlight Background */}
                <div className={`absolute inset-0 -m-4 rounded-2xl transition-all duration-300 pointer-events-none z-0 ${
                  hoveredStep === step.id 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl scale-105 opacity-100' 
                    : 'bg-transparent opacity-0'
                }`}></div>

                {/* Connection Line for Mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute top-32 left-1/2 w-0.5 h-16 bg-gray-200 -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleNavigation}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
            Start Your Rental Journey
          </button>
        </div>
      </div>
    </div>
  );
}