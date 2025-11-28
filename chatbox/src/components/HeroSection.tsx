// components/HeroSection.tsx
import React from 'react';
import BusinessIllustration from './BusinessIllustration.tsx';

const HeroSection: React.FC = () => {
  const stats = [
    { value: '12000+', label: 'Customers served' },
    { value: '75%', label: 'Customers recommend us' },
    { value: '50+', label: 'Cities across India' },
    { value: '4.6+', label: 'Google Rating' }
  ];

  return (
    <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-12 lg:py-20">
      {/* Left Content */}
      <div className="flex-1">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight">
          Made easy –{' '}
          <span className="text-accent">Start, run and grow</span> your business with ease.
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-bold text-accent">
                {stat.value}
              </span>
              <span className="text-gray-600 text-sm lg:text-base mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Illustration */}
      <div className="flex-1 flex justify-center">
        <BusinessIllustration />
      </div>
    </section>
  );
};

export default HeroSection;