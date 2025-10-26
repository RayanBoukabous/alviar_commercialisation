import React from 'react';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';

interface SyncIndicatorProps {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  timeSinceLastRefresh: string;
  isOnline: boolean;
  isRTL: boolean;
  className?: string;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isRefreshing,
  lastRefresh,
  timeSinceLastRefresh,
  isOnline,
  isRTL,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} ${className}`}>
      {/* Indicateur de statut de connexion - Ultra Pro */}
      <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
        isOnline 
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-sm' 
          : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-700 shadow-sm'
      }`}>
        {isOnline ? (
          <Wifi className={`h-3.5 w-3.5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        ) : (
          <WifiOff className={`h-3.5 w-3.5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        )}
        <span className="text-sm font-semibold">
          {isOnline 
            ? (isRTL ? 'متصل' : 'En ligne') 
            : (isRTL ? 'غير متصل' : 'Hors ligne')
          }
        </span>
      </div>

      {/* Indicateur de synchronisation - Ultra Pro */}
      <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
        isRefreshing
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm'
          : lastRefresh
            ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm'
            : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm'
      }`}>
        {isRefreshing ? (
          <RefreshCw className={`h-3.5 w-3.5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
        ) : (
          <Clock className={`h-3.5 w-3.5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        )}
        <span className="text-sm font-semibold">
          {isRefreshing 
            ? (isRTL ? 'جاري المزامنة...' : 'Synchronisation...')
            : lastRefresh
              ? (isRTL ? `مزامن منذ ${timeSinceLastRefresh}` : `Synchronisé il y a ${timeSinceLastRefresh}`)
              : (isRTL ? 'لم يتم المزامنة' : 'Non synchronisé')
          }
        </span>
      </div>
    </div>
  );
};
