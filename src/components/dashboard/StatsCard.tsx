'use client';

import { memo } from 'react';
import { ThemeCard } from '@/lib/theme/ThemeProvider';

interface StatsCardProps {
  stat: {
    name: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    bgColor: string;
    iconColor: string;
    isLoading: boolean;
    description: string;
  };
  isRTL: boolean;
}

const StatsCard = memo(({ stat, isRTL }: StatsCardProps) => {
  const Icon = stat.icon;
  
  return (
    <ThemeCard 
      className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
    >
      <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-between'}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 ml-auto' : 'space-x-4'}`}>
          {/* En RTL: icône puis texte, tout aligné à droite */}
          {isRTL ? (
            <>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <p className={`text-sm font-medium theme-text-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                  {stat.name}
                </p>
                <div className={`flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'} mt-1`}>
                  <p className={`text-2xl font-bold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                    {stat.isLoading ? (
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>...</span>
                      </div>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'} px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className={`text-xs theme-text-tertiary mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {stat.description}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className={`text-sm font-medium theme-text-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                  {stat.name}
                </p>
                <div className={`flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'} mt-1`}>
                  <p className={`text-2xl font-bold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                    {stat.isLoading ? (
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>...</span>
                      </div>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'} px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className={`text-xs theme-text-tertiary mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {stat.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeCard>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
