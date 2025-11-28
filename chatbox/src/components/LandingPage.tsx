// Update LandingPage.tsx to include ChatBox
import React from 'react';
import Navbar from './Navbar.tsx';
import HeroSection from './HeroSection';
import ChatBox from './ChatBox';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        <Navbar />
        <HeroSection />
      </div>
      <ChatBox />
    </div>
  );
};

export default LandingPage;