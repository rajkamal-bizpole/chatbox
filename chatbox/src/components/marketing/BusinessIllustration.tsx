// components/BusinessIllustration.tsx
import React from 'react';

const BusinessIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl h-96 lg:h-[500px]">
      {/* Background with subtle #e76458 gradient */}
      <div className="absolute inset-0">
        {/* Large background shape with accent color */}
        <div className="absolute w-96 h-96 rounded-full bg-accent/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 via-transparent to-accent/2"></div>
        
        {/* Floating subtle shapes */}
        <div className="absolute w-64 h-64 rounded-full bg-accent/3 blur-xl top-10 left-10"></div>
        <div className="absolute w-48 h-48 rounded-full bg-accent/4 blur-xl bottom-16 right-16"></div>
      </div>

      {/* Main Professional Image Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Large Professional Image with enhanced shadow and glow */}
          <div className="relative">
            <img 
              src="manpre.png"
              alt="Business Professional"
              className="w-80 h-80 lg:w-[400px] lg:h-[400px] object-contain drop-shadow-2xl"
            />
            
            {/* Subtle glow effect using #e76458 */}
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-2xl transform scale-110 -z-10"></div>
            
            {/* Professional border accent */}
            <div className="absolute -inset-4 border-2 border-accent/10 rounded-3xl pointer-events-none"></div>
          </div>
          
          {/* Professional corner accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-accent/30 rounded-tl-lg"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-accent/30 rounded-tr-lg"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-accent/30 rounded-bl-lg"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-accent/30 rounded-br-lg"></div>
        </div>
      </div>

      {/* Professional Labels with black text */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-12">
        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-gray-200">
          <span className="text-sm font-semibold text-gray-800">
            Entrepreneur Success
          </span>
        </div>
        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-gray-200">
          <span className="text-sm font-semibold text-gray-800">
            Business Growth
          </span>
        </div>
      </div>

      {/* Subtle floating particles with accent color */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-2 h-2 bg-accent/20 rounded-full top-1/4 left-1/3 animate-pulse"></div>
        <div className="absolute w-1 h-1 bg-accent/30 rounded-full top-1/3 right-1/4 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1.5 h-1.5 bg-accent/25 rounded-full bottom-1/3 left-1/5 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-1 h-1 bg-accent/20 rounded-full bottom-1/4 right-1/3 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
    </div>
  );
};

export default BusinessIllustration;