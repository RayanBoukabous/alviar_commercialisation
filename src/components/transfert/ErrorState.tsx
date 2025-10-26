'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
  isRTL: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ 
  error, 
  onRetry, 
  isRTL 
}) => (
  <div className="text-center py-12">
    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
    <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
      {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
    </h3>
    <p className="text-red-600 mb-4">
      {error.message || (isRTL ? 'حدث خطأ أثناء تحميل النقل' : 'Erreur lors du chargement des transferts')}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
    </button>
  </div>
));

ErrorState.displayName = 'ErrorState';
