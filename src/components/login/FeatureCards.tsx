'use client';

import { memo } from 'react';
import { Shield, Zap, Sparkles } from 'lucide-react';

interface FeatureCardsProps {
  isDark: boolean;
}

const FeatureCards = memo(({ isDark }: FeatureCardsProps) => {
  const features = [
    {
      icon: Shield,
      text: 'Secure',
      color: 'text-red-500'
    },
    {
      icon: Zap,
      text: 'Fast',
      color: 'text-red-600'
    },
    {
      icon: Sparkles,
      text: 'Modern',
      color: 'text-red-700'
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div 
            key={index}
            className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600' 
                : 'bg-white/80 border-red-200'
            }`}
          >
            <IconComponent className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
            <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {feature.text}
            </p>
          </div>
        );
      })}
    </div>
  );
});

FeatureCards.displayName = 'FeatureCards';

export default FeatureCards;
