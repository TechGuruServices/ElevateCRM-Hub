"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoToggle } from "@/components/DemoToggle";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/techguru-logo.png"
              alt="TECHGURU Logo"
              width={40}
              height={40}
              className="rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ElevateCRM</span>
              <span className="text-xs text-muted-foreground">by TECHGURU</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Dashboard
            </Link>
            <Link 
              href="/customers" 
              className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Customers
            </Link>
            <Link 
              href="/inventory" 
              className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Inventory
            </Link>
            <Link 
              href="/connectors" 
              className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Connectors
            </Link>
            
            {/* Right section */}
            <div className="flex items-center space-x-2 ml-4">
              <DemoToggle />
              <ThemeToggle />
              <Link 
                href="/auth/login" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Sign In
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen ? "true" : "false"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between mb-2">
                <DemoToggle />
                <ThemeToggle />
              </div>
              <Link 
                href="/dashboard" 
                className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/customers" 
                className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Customers
              </Link>
              <Link 
                href="/inventory" 
                className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inventory
              </Link>
              <Link 
                href="/connectors" 
                className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connectors
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
