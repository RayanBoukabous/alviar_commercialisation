'use client';

import { memo } from 'react';

interface VisualElementsProps {
  isDark: boolean;
}

const VisualElements = memo(({ isDark }: VisualElementsProps) => {
  return (
    <div className="hidden lg:flex flex-1 relative items-center justify-center">
      <div className="relative w-full h-full">
        {/* Main Visual Element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer Ring */}
            <div className={`w-96 h-96 border rounded-full animate-spin-slow ${
              isDark ? 'border-red-600/30' : 'border-red-200/30'
            }`}>
              <div className={`w-full h-full border rounded-full animate-pulse ${
                isDark ? 'border-red-400/40' : 'border-red-400/40'
              }`}></div>
            </div>
            
            {/* Middle Ring */}
            <div className={`absolute inset-8 border rounded-full animate-spin-reverse ${
              isDark ? 'border-red-700/40' : 'border-red-300/40'
            }`}>
              <div className={`w-full h-full border rounded-full animate-pulse ${
                isDark ? 'border-red-500/40' : 'border-red-500/40'
              }`}></div>
            </div>
            
            {/* Inner Ring */}
            <div className={`absolute inset-16 border rounded-full animate-spin-slow ${
              isDark ? 'border-red-800/50' : 'border-red-400/50'
            }`}>
              <div className={`w-full h-full border rounded-full animate-pulse ${
                isDark ? 'border-red-600/40' : 'border-red-600/40'
              }`}></div>
            </div>
            
            {/* Center Logo */}
            <div className={`absolute inset-24 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-600/50' 
                : 'bg-gradient-to-br from-red-100/80 to-red-200/80 border-red-200/50'
            }`}>
              <img
                src="/logo_complet.png"
                alt="ALVIAR"
                width={120}
                height={60}
                className="opacity-90"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-red-400 rounded-full animate-bounce shadow-lg"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 left-32 w-5 h-5 bg-red-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-red-300 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1.5s'}}></div>
      </div>
    </div>
  );
});

VisualElements.displayName = 'VisualElements';

export default VisualElements;
