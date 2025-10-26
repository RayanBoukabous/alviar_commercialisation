'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Heart,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useLivestockStats, livestockKeys } from '@/lib/hooks/useLivestock';
import LiveLivestockTab from '@/components/livestock/LiveLivestockTab';


export default function LivestockPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // Récupérer les statistiques des bêtes
  const { data: livestockStats, isLoading: statsLoading, error: statsError, refetch: refreshStats } = useLivestockStats();

  // Détection RTL - mémorisé pour éviter les recalculs
  const isRTL = useMemo(() => currentLocale === 'ar', [currentLocale]);

  // Optimisation: useCallback pour éviter les re-créations de fonction
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // Invalider toutes les requêtes de livestock pour forcer le refetch
      await queryClient.invalidateQueries({ queryKey: livestockKeys.all });
      console.log('Données livestock rafraîchies');
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Optimisation: mémoriser l'état de chargement
  const isPageLoading = useMemo(() => isLoading || translationLoading, [isLoading, translationLoading]);

  if (isPageLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" role="status" aria-label="Chargement des données">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="sr-only">Chargement en cours...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Activity className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الماشية الحية' : 'Bêtes vivantes'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة الماشية الحية' : 'Gestion des bêtes vivantes'}
                </p>
                {livestockStats && (
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="theme-text-tertiary">
                      {isRTL ? 'المجموع:' : 'Total:'} <strong className="text-green-600 dark:text-green-400">{livestockStats.statistics.live_count}</strong>
                    </span>
                    <span className="theme-text-tertiary">
                      {isRTL ? 'من:' : 'De:'} <strong className="theme-text-primary">{livestockStats.abattoir_name}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label={isRTL ? 'تحديث البيانات' : 'Actualiser les données'}
                  title={isRTL ? 'تحديث البيانات' : 'Actualiser les données'}
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <LiveLivestockTab isRTL={isRTL} />
        </div>
      </div>
    </Layout>
  );
}
