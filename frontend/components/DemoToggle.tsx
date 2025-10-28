'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function DemoToggle() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled in localStorage
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    localStorage.setItem('demoMode', String(newMode));
    
    // Emit custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('demoModeChange', { detail: { isDemoMode: newMode } }));
  };

  return (
    <Button
      onClick={toggleDemoMode}
      variant={isDemoMode ? "default" : "outline"}
      size="sm"
      className={isDemoMode ? "bg-purple-600 hover:bg-purple-700" : ""}
    >
      {isDemoMode ? "🎭 Demo Mode ON" : "Demo Mode"}
    </Button>
  );
}
