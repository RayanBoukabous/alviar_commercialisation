'use client';

import { memo, useCallback } from 'react';
import { RefreshCw, Activity, AlertCircle } from 'lucide-react';

interface DashboardHeaderProps {
  isRTL: boolean;
  textDirection: 'rtl' | 'ltr';
  isRefreshing: boolean;
  onRefresh: () => void;
  dashboardStats: any;
  realStats: any;
  error: any;
  t: any;
}

const DashboardHeader = memo(({
  isRTL,
  textDirection,
  isRefreshing,
  onRefresh,
  dashboardStats,
  realStats,
  error,
  t
}: DashboardHeaderProps) => {
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="animate-fade-in">
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
        {isRTL ? (
          <>
            {/* Bouton refresh à droite en RTL */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: '1px solid #dc2626'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
              aria-label="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
              <span className="font-medium" style={{ color: 'white' }}>{(t('dashboard', 'refresh') as string) || 'Actualiser'}</span>
            </button>
            
            {/* Titres alignés à droite en RTL */}
            <div className="text-right">
              <h1 className="text-3xl font-bold theme-text-primary bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent text-right">
                {(t('dashboard', 'title') as string) || 'Dashboard'}
              </h1>
              <p className="mt-2 text-lg theme-text-secondary text-right">
                {(t('dashboard', 'subtitle') as string) || 'Tableau de bord principal'}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Titres alignés à gauche en LTR */}
            <div className="text-left">
              <h1 className="text-3xl font-bold theme-text-primary bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent text-left">
                {(t('dashboard', 'title') as string) || 'Dashboard'}
              </h1>
              <p className="mt-2 text-lg theme-text-secondary text-left">
                {(t('dashboard', 'subtitle') as string) || 'Tableau de bord principal'}
              </p>
            </div>
            
            {/* Bouton refresh à droite en LTR */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: '1px solid #dc2626'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
              aria-label="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
              <span className="font-medium" style={{ color: 'white' }}>{(t('dashboard', 'refresh') as string) || 'Actualiser'}</span>
            </button>
          </>
        )}
      </div>
      
      {/* Indicateur d'abattoir */}
      {(dashboardStats || realStats) && (
        <div className={`mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} transition-all duration-300 hover:shadow-md`}>
          <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className={`text-sm font-medium text-blue-800 dark:text-blue-200 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'البيانات في الوقت الفعلي' : 'Données en temps réel'}
            </p>
            <p className={`text-blue-700 dark:text-blue-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              <strong>{realStats?.abattoir_nom || dashboardStats?.abattoir_name}</strong> - {realStats?.abattoir_location || dashboardStats?.abattoir_location}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {isRTL ? 'متصل' : 'En ligne'}
            </span>
          </div>
        </div>
      )}
      
      {/* Indicateur d'erreur */}
      {error && (
        <div className={`mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} transition-all duration-300 hover:shadow-md`}>
          <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className={`text-sm font-medium text-red-800 dark:text-red-200 ${isRTL ? 'text-right' : 'text-left'}`}>
              Erreur de chargement
            </p>
            <p className={`text-red-700 dark:text-red-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              Impossible de récupérer les données du dashboard
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
            aria-label="Réessayer le chargement"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
