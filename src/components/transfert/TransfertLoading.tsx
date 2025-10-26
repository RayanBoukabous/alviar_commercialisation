'use client';

import React from 'react';
import { Loader2, ArrowRightLeft } from 'lucide-react';

interface TransfertLoadingProps {
  isRTL: boolean;
  message?: string;
}

export const TransfertLoading: React.FC<TransfertLoadingProps> = React.memo(({ 
  isRTL, 
  message 
}) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="h-8 w-8 text-primary-600 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium theme-text-primary theme-transition">
          {message || (isRTL ? 'جاري التحميل...' : 'Chargement...')}
        </p>
        <p className="text-sm theme-text-secondary theme-transition">
          {isRTL ? 'يرجى الانتظار' : 'Veuillez patienter'}
        </p>
      </div>
    </div>
  </div>
));

TransfertLoading.displayName = 'TransfertLoading';
