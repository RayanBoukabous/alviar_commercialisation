'use client';

import React, { memo } from 'react';
import { Heart, Scale, Activity } from 'lucide-react';

interface StatisticsCardsProps {
  statistics: {
    globalTotalCount: number;
    liveCount: number;
    globalTotalWeight: number;
    globalAverageWeight: number;
  };
  isRTL: boolean;
}

const StatisticsCards = memo(function StatisticsCards({ 
  statistics, 
  isRTL 
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'إجمالي الرؤوس' : 'Total têtes'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">{statistics.globalTotalCount}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">{statistics.globalTotalWeight} kg</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Scale className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'متوسط الوزن' : 'Poids moyen'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">{statistics.globalAverageWeight} kg</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'حي' : 'Vivantes'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {statistics.liveCount}
            </p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatisticsCards;
