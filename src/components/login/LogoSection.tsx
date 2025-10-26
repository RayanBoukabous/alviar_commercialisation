'use client';

import { memo } from 'react';
import { Shield, Zap } from 'lucide-react';

interface LogoSectionProps {
  isDark: boolean;
  isAnimating: boolean;
}

const LogoSection = memo(({ isDark, isAnimating }: LogoSectionProps) => {
  return (
    <div className="text-center mb-12">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
        <div className={`relative backdrop-blur-sm rounded-full p-4 border shadow-lg ${
          isDark 
            ? 'bg-slate-800/90 border-slate-600' 
            : 'bg-white/90 border-red-200'
        }`}>
          <img
            src="/alviar_logo.jpg"
            alt="ALVIAR Logo"
            width={80}
            height={40}
            className="mx-auto"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent mb-2">
        ALVIAR
      </h1>
      <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
        Dashboard Commercialisation
      </p>
      <div className="flex justify-center items-center mt-4 space-x-2">
        <Shield className="w-5 h-5 text-red-500" />
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Secure Authentication
        </span>
        <Zap className="w-5 h-5 text-red-600" />
      </div>
    </div>
  );
});

LogoSection.displayName = 'LogoSection';

export default LogoSection;
