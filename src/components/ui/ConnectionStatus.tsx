'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isRTL?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isRTL = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      // Simuler une synchronisation
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSync(new Date());
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mettre à jour le statut de synchronisation périodiquement
    const syncInterval = setInterval(() => {
      if (isOnline) {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSyncStatus('synced');
          setLastSync(new Date());
        }, 500);
      }
    }, 15000); // Toutes les 15 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [isOnline]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return isRTL ? 'غير متصل' : 'Hors ligne';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return isRTL ? 'جاري المزامنة...' : 'Synchronisation...';
      case 'synced':
        return isRTL ? 'مزامن' : 'Synchronisé';
      case 'error':
        return isRTL ? 'خطأ في المزامنة' : 'Erreur de synchronisation';
      default:
        return isRTL ? 'متصل' : 'En ligne';
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return '';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
    
    if (diff < 60) {
      return isRTL ? `منذ ${diff} ثانية` : `Il y a ${diff}s`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return isRTL ? `منذ ${minutes} دقيقة` : `Il y a ${minutes}min`;
    } else {
      const hours = Math.floor(diff / 3600);
      return isRTL ? `منذ ${hours} ساعة` : `Il y a ${hours}h`;
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {getStatusIcon()}
      <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {getStatusText()}
        </div>
        {lastSync && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatLastSync()}
          </div>
        )}
      </div>
    </div>
  );
};
