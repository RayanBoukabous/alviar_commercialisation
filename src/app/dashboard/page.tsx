'use client';

import React, { memo, Suspense } from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Layout } from '@/components/layout';
import { SimpleDashboardCharts } from '@/components/charts/SimpleDashboardCharts';
import { useDashboardDataSimple } from '@/lib/hooks/useDashboardDataSimple';
import { useDebugRenders } from '@/lib/hooks/useDebugRenders';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Optimized Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCard from '@/components/dashboard/StatsCard';

// Loading Component
const DashboardLoader = memo(() => (
  <div className="space-y-6">
    <div className="animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-64 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
      ))}
    </div>
  </div>
));

DashboardLoader.displayName = 'DashboardLoader';

// Main Dashboard Component
const DashboardPageContent = memo(() => {
  // Debug renders en développement
  useDebugRenders({ componentName: 'DashboardPageContent' });

  // Hook de traduction
  const { t } = useLanguage();

  const {
    // Data
    dashboardStats,
    realStats,
    mainStats,
    
    // Loading states
    isLoading,
    statsLoading,
    translationLoading,
    
    // Errors
    error,
    
    // RTL/LTR
    isRTL,
    textDirection,
    
    // Actions
    refetch,
    refetchStats
  } = useDashboardDataSimple();

  // Si les traductions sont en cours de chargement, afficher un loader
  if (translationLoading) {
    return (
      <Layout>
        <DashboardLoader />
      </Layout>
    );
  }

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
    refetchStats();
  };

  return (
    <Layout>
      <div className="space-y-6" dir={textDirection}>
        {/* Header */}
        <DashboardHeader
          isRTL={isRTL}
          textDirection={textDirection}
          isRefreshing={isLoading || statsLoading}
          onRefresh={handleRefresh}
          dashboardStats={dashboardStats}
          realStats={realStats}
          error={error}
          t={t as any} // Vraie fonction de traduction
        />

        {/* 4 Cartes Principales */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(isLoading || statsLoading) ? (
            // Skeleton pour les cartes en chargement
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
            ))
          ) : (
            mainStats.map((stat, index) => (
              <StatsCard
                key={`${stat.name}-${index}`}
                stat={stat}
                isRTL={isRTL}
              />
            ))
          )}
        </div>

        {/* Graphiques Professionnels */}
        {(isLoading || statsLoading) ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
          </div>
        ) : (
          <SimpleDashboardCharts
            usersData={realStats?.nombre_betes || dashboardStats?.users_count || 0}
            adminsData={realStats?.nombre_carcasses || dashboardStats?.superusers_count || 0}
            clientsData={realStats?.transferts_aujourdhui || dashboardStats?.clients_count || 0}
            sessionsData={realStats?.animaux_stabulation || 0}
            rolesData={realStats?.stats_supplementaires?.betes_ajoutees_aujourdhui || 0}
            permissionsData={realStats?.stats_supplementaires?.transferts_7_derniers_jours || 0}
            isLoading={isLoading || statsLoading}
          />
        )}

        {/* Section d'information simple */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-4">
            {isRTL ? 'إحصائيات النظام' : 'Statistiques du système'}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <span className="text-sm font-medium">
                {isRTL ? 'البيانات الحقيقية متاحة' : 'Données réelles disponibles'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading || statsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {(isLoading || statsLoading) ? 
                (isRTL ? 'جاري التحديث...' : 'Actualisation...') : 
                (isRTL ? 'تحديث البيانات' : 'Actualiser les données')
              }
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {isRTL ? 
              'هذه الصفحة تعرض الإحصائيات الحقيقية من قاعدة البيانات. جميع البيانات محدثة في الوقت الفعلي.' :
              'Cette page affiche les statistiques réelles de la base de données. Toutes les données sont mises à jour en temps réel.'
            }
          </p>
        </div>
      </div>
    </Layout>
  );
});

DashboardPageContent.displayName = 'DashboardPageContent';

// Main Dashboard Page Component
const DashboardPage = memo(() => {
  useDebugRenders({ componentName: 'DashboardPage' });
  
  return (
    <ThemeProvider>
      <Suspense fallback={<DashboardLoader />}>
        <DashboardPageContent />
      </Suspense>
    </ThemeProvider>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;