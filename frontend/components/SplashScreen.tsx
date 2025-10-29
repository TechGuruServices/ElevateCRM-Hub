'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export default function SplashScreen({ onComplete, onError, timeout = 10000 }: SplashScreenProps) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSkip = () => {
    setIsHidden(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => {
      setIsHidden(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 500);
  };

  const handleVideoError = (error: any) => {
    console.error('Splash video error:', error);
    setHasError(true);
    const errorObj = new Error('Failed to load splash video');
    onError?.(errorObj);
    handleSkip();
  };

  useEffect(() => {
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (!videoEnded && !isHidden) {
          console.warn('Splash screen timeout reached');
          handleSkip();
        }
      }, timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout, videoEnded, isHidden]);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${
        isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Loading splash screen"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      >
        <source src="/splash.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Skip splash screen"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
        Press ESC or click X to skip
      </div>
    </div>
  );
}
