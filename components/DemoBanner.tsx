'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if demo mode is enabled
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);

    // Listen for demo mode changes
    const handleDemoModeChange = (e: CustomEvent) => {
      setIsDemoMode(e.detail.isDemoMode);
      setIsVisible(true); // Show banner when mode changes
    };

    window.addEventListener('demoModeChange', handleDemoModeChange as EventListener);

    return () => {
      window.removeEventListener('demoModeChange', handleDemoModeChange as EventListener);
    };
  }, []);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5" />
            <div>
              <p className="font-semibold">You're in Demo Mode</p>
              <p className="text-sm text-purple-100">
                Exploring with sample data. Changes won't be saved.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/auth/register">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Start Free Trial
              </Button>
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-purple-100 transition-colors"
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
