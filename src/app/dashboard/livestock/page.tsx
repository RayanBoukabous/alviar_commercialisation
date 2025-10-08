'use client';

import React, { useState } from 'react';
import { 
  Heart,
  RefreshCw,
  Activity,
  Skull
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';
import LiveLivestockTab from '@/components/livestock/LiveLivestockTab';
import CarcassLivestockTab from '@/components/livestock/CarcassLivestockTab';


export default function LivestockPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Données livestock rafraîchies');
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
                  <Heart className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الماشية' : 'Bêtes'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة الماشية الحية والذبائح' : 'Gestion des bêtes vivantes et carcasses'}
                </p>
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
          <Tabs
            tabs={[
              {
                id: 'live',
                label: isRTL ? 'الماشية الحية' : 'Bêtes vivantes',
                icon: <Activity className="h-4 w-4" />,
                content: <LiveLivestockTab isRTL={isRTL} />
              },
              {
                id: 'carcass',
                label: isRTL ? 'الذبائح' : 'Carcasses',
                icon: <Skull className="h-4 w-4" />,
                content: <CarcassLivestockTab isRTL={isRTL} />
              }
            ]}
            defaultTab="live"
            isRTL={isRTL}
          />
        </div>
      </div>
    </Layout>
  );
}
