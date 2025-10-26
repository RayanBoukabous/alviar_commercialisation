'use client';

import { memo, useMemo } from 'react';
import { CheckCircle, Clock, Pause, Play } from 'lucide-react';

interface RefreshIndicatorProps {
  isRTL: boolean;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

const RefreshIndicator = memo(({
  isRTL,
  isRefreshing,
  lastRefresh,
  nextRefresh,
  isPaused,
  onPause,
  onResume
}: RefreshIndicatorProps) => {
  const formatTime = useMemo(() => {
    return (date: Date | null) => {
      if (!date) return 'N/A';
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };
  }, []);

  const getTimeUntilNext = useMemo(() => {
    if (!nextRefresh) return 'N/A';
    
    const now = new Date();
    const diff = nextRefresh.getTime() - now.getTime();
    
    if (diff <= 0) return 'Maintenant';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [nextRefresh]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold theme-text-primary">
          {isRTL ? 'إحصائيات النظام' : 'Statistiques du système'}
        </h3>
        
        {/* Contrôles de refresh */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isRTL ? 'البيانات الحقيقية متاحة' : 'Données réelles disponibles'}
            </span>
          </div>
          
          <button
            onClick={isPaused ? onResume : onPause}
            className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isPaused 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
            aria-label={isPaused ? 'Reprendre le refresh automatique' : 'Pause le refresh automatique'}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isRTL ? 'استئناف' : 'Reprendre'}
                </span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isRTL ? 'إيقاف مؤقت' : 'Pause'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Informations de refresh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'آخر تحديث:' : 'Dernière mise à jour:'}
            </p>
            <p className="text-lg font-semibold theme-text-primary">
              {formatTime(lastRefresh)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isRefreshing 
              ? 'bg-orange-100 dark:bg-orange-900/30' 
              : isPaused 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : 'bg-green-100 dark:bg-green-900/30'
          }`}>
            <div className={`w-5 h-5 ${
              isRefreshing 
                ? 'text-orange-600 dark:text-orange-400 animate-spin' 
                : isPaused 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-green-600 dark:text-green-400'
            }`}>
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : isPaused ? (
                <Pause className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'الحالة:' : 'Statut:'}
            </p>
            <p className="text-lg font-semibold theme-text-primary">
              {isRefreshing 
                ? (isRTL ? 'جاري التحديث...' : 'Actualisation...') 
                : isPaused 
                  ? (isRTL ? 'متوقف' : 'En pause') 
                  : (isRTL ? 'نشط' : 'Actif')
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'التحديث التالي:' : 'Prochain refresh:'}
            </p>
            <p className="text-lg font-semibold theme-text-primary">
              {isPaused ? (isRTL ? 'متوقف' : 'En pause') : getTimeUntilNext}
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        {isRTL ? 
          'هذه الصفحة تعرض الإحصائيات الحقيقية من قاعدة البيانات. جميع البيانات محدثة في الوقت الفعلي.' :
          'Cette page affiche les statistiques réelles de la base de données. Toutes les données sont mises à jour en temps réel.'
        }
      </p>
    </div>
  );
});

RefreshIndicator.displayName = 'RefreshIndicator';

export default RefreshIndicator;
