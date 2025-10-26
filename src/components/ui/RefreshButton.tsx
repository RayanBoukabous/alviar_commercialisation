import React from 'react';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  timeSinceLastRefresh: string;
  isOnline: boolean;
  isRTL: boolean;
  className?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isRefreshing,
  lastRefresh,
  timeSinceLastRefresh,
  isOnline,
  isRTL,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} ${className}`}>
      {/* Indicateur de synchronisation avec thème */}
      <div className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-700' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-700'
      }`}>
        {isOnline ? (
          <Wifi className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        ) : (
          <WifiOff className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        )}
        <span>
          {isOnline 
            ? (isRTL ? 'مزامن' : 'Synchronisé') 
            : (isRTL ? 'غير متصل' : 'Hors ligne')
          }
        </span>
      </div>

      {/* Dernière actualisation avec thème */}
      {lastRefresh && (
        <div className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium theme-bg-secondary theme-text-secondary border theme-border-primary transition-all duration-300`}>
          <Clock className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span>{timeSinceLastRefresh}</span>
        </div>
      )}

          {/* Bouton actualiser ultra pro */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing || !isOnline}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              isRefreshing || !isOnline
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl border border-primary-500 hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform hover:scale-105'
            }`}
            title={isOnline ? 'Actualiser les données' : 'Connexion requise'}
          >
        <RefreshCw 
          className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${
            isRefreshing ? 'animate-spin' : ''
          }`} 
        />
        <span>
          {isRefreshing 
            ? (isRTL ? 'جاري التحديث...' : 'Actualisation...') 
            : (isRTL ? 'تحديث' : 'Actualiser')
          }
        </span>
      </button>
    </div>
  );
};
