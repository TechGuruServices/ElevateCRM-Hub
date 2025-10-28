'use client';

import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Start fade out after video ends
    setTimeout(() => {
      setIsHidden(true);
      // Call onComplete after fade transition
      setTimeout(() => {
        onComplete();
      }, 1000); // Match the transition duration
    }, 500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${
        isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src="/splash.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}