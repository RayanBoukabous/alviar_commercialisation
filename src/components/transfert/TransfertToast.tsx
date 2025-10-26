'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface TransfertToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  isRTL: boolean;
}

export const TransfertToast: React.FC<TransfertToastProps> = React.memo(({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  isRTL
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <div
      className={`fixed ${isRTL ? 'left-4' : 'right-4'} top-4 z-50 transform transition-all duration-300 ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : isLeaving 
            ? (isRTL ? 'translate-x-full' : '-translate-x-full') 
            : (isRTL ? 'translate-x-full' : '-translate-x-full')
      }`}
    >
      <div className={`max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${getColors()} theme-transition`}>
        <div className="p-4">
          <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium theme-text-primary theme-transition">
                {title}
              </h4>
              {message && (
                <p className="mt-1 text-sm theme-text-secondary theme-transition">
                  {message}
                </p>
              )}
            </div>
            <div className={`flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`}>
              <button
                onClick={handleClose}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TransfertToast.displayName = 'TransfertToast';
