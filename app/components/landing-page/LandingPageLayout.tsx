'use client';
import React, { useEffect } from 'react';
import Header from './sections/Header';
import Hero from './sections/Hero';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import CallToAction from './sections/CallToAction';
import Footer from './sections/Footer';
import AIToolsShowcase from './sections/AIToolsShowcase';


export default function LandingPageLayout() {
  useEffect(() => {
    // Apply scrolling behavior through class instead of direct style manipulation
    document.documentElement.classList.add('landing-page-active');
    
    return () => {
      document.documentElement.classList.remove('landing-page-active');
    };
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Promotional Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#1d1f89] text-white shadow-md">
        <div className="flex items-center justify-center px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <i className="fas fa-gift text-sm sm:text-base animate-pulse"></i>
            <span className="font-semibold text-[10px] sm:text-xs md:text-sm tracking-wide uppercase">
              🎉 Limited Time: Access ALL Premium Features FREE for 14 Days
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content Wrapper with proper padding for the sticky banner */}
      <div className="relative pt-10 sm:pt-11">
        <Header />
        <main className="relative pt-4">
          <Hero />
          <div id="features">
            <Features />
          </div>
          <div id="tools">
            <AIToolsShowcase/>
          </div>
          <div id="pricing">
            <Pricing />
          </div>
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  );
}
