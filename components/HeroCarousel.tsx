
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface HeroCarouselProps {
  banners: Banner[];
  onBannerClick: (category?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners, onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[180px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl mb-6 group cursor-pointer"
         onClick={() => onBannerClick(banners[currentIndex].targetCategory)}>
      
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-gray-900">
             <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-10 max-w-2xl">
            {banner.targetCategory && (
                <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block shadow-sm self-start uppercase tracking-wider">
                    {banner.targetCategory}
                </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="text-gray-200 text-sm md:text-lg font-medium drop-shadow-sm">
                {banner.subtitle}
              </p>
            )}
            <div className="mt-4">
              <span className="bg-white text-gray-900 text-xs md:text-sm px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block">
                Ver Ofertas
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
