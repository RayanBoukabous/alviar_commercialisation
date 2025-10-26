'use client';

import React, { useState } from 'react';
import { 
  Skull,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useLivestockStats, livestockKeys, useCarcassStatistics } from '@/lib/hooks/useLivestock';
import CarcassLivestockTab from '@/components/livestock/CarcassLivestockTab';


export default function CarcassPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // Récupérer les statistiques des carcasses
  const { data: carcassStats, isLoading: statsLoading, error: statsError, refetch: refreshStats } = useCarcassStatistics();

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Invalider toutes les requêtes de livestock et carcass pour forcer le refetch
      await queryClient.invalidateQueries({ queryKey: livestockKeys.all });
      await queryClient.invalidateQueries({ queryKey: livestockKeys.carcassStats() });
      console.log('Données carcasses rafraîchies');
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                  <Skull className={`h-7 w-7 text-red-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الذبائح' : 'Carcasses'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة الذبائح واللحوم' : 'Gestion des carcasses et viandes'}
                </p>
                {carcassStats && (
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="theme-text-tertiary">
                      {isRTL ? 'المجموع:' : 'Total:'} <strong className="text-red-600 dark:text-red-400">{carcassStats.statistics.total_count}</strong>
                    </span>
                    <span className="theme-text-tertiary">
                      {isRTL ? 'من:' : 'De:'} <strong className="theme-text-primary">{carcassStats.abattoir_name}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <CarcassLivestockTab isRTL={isRTL} />
        </div>
      </div>
    </Layout>
  );
}
