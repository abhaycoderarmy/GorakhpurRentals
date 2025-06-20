import React from 'react';

const InstagramFollowBanner = () => {
  const handleInstagramClick = () => {
    // Replace with your actual Instagram handle
    window.open('https://www.instagram.com/your_handle/', '_blank');
  };

  return (
    <div className="w-full bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="cursor-pointer transition-transform hover:scale-[1.02] duration-300">
          <img
            src="https://res.cloudinary.com/dpzagdlky/image/upload/v1750064574/kkncplwem31ouezdqnr7.png"
            alt="Follow us on Instagram"
            onClick={handleInstagramClick}
            className="w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default InstagramFollowBanner;