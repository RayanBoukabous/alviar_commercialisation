'use client';

import { memo, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggle = memo(({ isDark, onToggle }: ThemeToggleProps) => {
  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDark ? 'bg-red-500/30' : 'bg-red-400/30'
        }`}></div>
        
        {/* Main button */}
        <button
          onClick={handleToggle}
          className={`relative px-4 py-3 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
            isDark 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-500/50 text-red-400 hover:border-red-400/70 hover:shadow-red-500/20' 
              : 'bg-gradient-to-br from-white/90 to-red-50/90 border-red-300/50 text-red-600 hover:border-red-500/70 hover:shadow-red-400/20'
          }`}
          aria-label="Toggle theme"
          type="button"
        >
          <div className="flex items-center space-x-2">
            {/* Icon with animation */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full animate-pulse ${
                isDark ? 'bg-red-400/20' : 'bg-red-500/20'
              }`}></div>
              {isDark ? (
                <Sun size={20} className="relative animate-spin-slow" />
              ) : (
                <Moon size={20} className="relative" />
              )}
            </div>
            
            {/* Text label */}
            <span className={`text-sm font-medium transition-all duration-300 ${
              isDark ? 'text-slate-200' : 'text-gray-700'
            }`}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </div>
          
          {/* Hover effect overlay */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-red-500/10 to-transparent' 
              : 'bg-gradient-to-r from-red-400/10 to-transparent'
          }`}></div>
        </button>
      </div>
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
