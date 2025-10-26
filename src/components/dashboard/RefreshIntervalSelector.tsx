'use client';

import React from 'react';
import { Clock, RefreshCw, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { RefreshInterval } from '@/lib/hooks/useDashboardCache';

interface RefreshIntervalSelectorProps {
  currentInterval: RefreshInterval;
  onIntervalChange: (interval: RefreshInterval) => void;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  getTimeUntilNextRefresh: () => string;
  getTimeSinceLastRefresh: () => string;
  onManualRefresh: () => void;
  isRTL?: boolean;
}

export const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({
  currentInterval,
  onIntervalChange,
  isRefreshing,
  lastRefresh,
  nextRefresh,
  getTimeUntilNextRefresh,
  getTimeSinceLastRefresh,
  onManualRefresh,
  isRTL = false
}) => {
  const intervals: { value: RefreshInterval; label: string; description: string }[] = [
    { value: '5min', label: '5 minutes', description: 'Mise à jour très fréquente' },
    { value: '10min', label: '10 minutes', description: 'Équilibre performance/actualité' },
    { value: '15min', label: '15 minutes', description: 'Mise à jour modérée' },
    { value: '30min', label: '30 minutes', description: 'Mise à jour économique' },
    { value: '1hour', label: '1 heure', description: 'Mise à jour occasionnelle' },
    { value: 'manual', label: 'Manuel uniquement', description: 'Contrôle total' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'إعدادات التحديث' : 'Paramètres de Mise à Jour'}
          </h3>
        </div>
        
        {/* Bouton de refresh manuel */}
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            isRefreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRTL ? 'تحديث يدوي' : 'Refresh Manuel'}</span>
        </button>
      </div>

      {/* Sélecteur d'intervalle */}
      <div className="mb-4">
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 'فترة التحديث التلقائي' : 'Intervalle de Mise à Jour'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {intervals.map((interval) => (
            <button
              key={interval.value}
              onClick={() => onIntervalChange(interval.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                currentInterval === interval.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {interval.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {interval.description}
                  </div>
                </div>
                {currentInterval === interval.value && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Statut actuel */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${
              isRefreshing ? 'bg-yellow-500 animate-pulse' : 
              currentInterval === 'manual' ? 'bg-gray-400' : 
              'bg-green-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRefreshing 
                ? (isRTL ? 'جاري التحديث...' : 'Mise à jour en cours...')
                : currentInterval === 'manual'
                  ? (isRTL ? 'وضع يدوي' : 'Mode manuel')
                  : (isRTL ? 'تحديث تلقائي' : 'Mise à jour automatique')
              }
            </span>
          </div>
          
          {currentInterval !== 'manual' && nextRefresh && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isRTL ? 'التحديث التالي' : 'Prochain'}: {getTimeUntilNextRefresh()}
            </div>
          )}
        </div>

        {/* Dernière mise à jour */}
        {lastRefresh && (
          <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}: {getTimeSinceLastRefresh()}
          </div>
        )}

        {/* Indicateur de statut détaillé */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div className={`flex items-center space-x-1 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {isRTL ? 'الفترة المحددة' : 'Intervalle'}: {intervals.find(i => i.value === currentInterval)?.label}
            </span>
          </div>
          
          <div className={`flex items-center space-x-1 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {isRefreshing ? (
              <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3 text-green-500" />
            )}
            <span className="text-gray-600 dark:text-gray-400">
              {isRefreshing 
                ? (isRTL ? 'جاري المعالجة' : 'En traitement')
                : (isRTL ? 'جاهز' : 'Prêt')
              }
            </span>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className={`flex items-start space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className={`text-xs text-blue-800 dark:text-blue-200 ${isRTL ? 'text-right' : 'text-left'}`}>
            <strong>{isRTL ? 'نصيحة' : 'Conseil'}:</strong> {isRTL 
              ? 'اختر فترة أقصر للحصول على بيانات أكثر حداثة، أو فترة أطول لتوفير موارد الخادم.'
              : 'Choisissez une période plus courte pour des données plus récentes, ou plus longue pour économiser les ressources serveur.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

