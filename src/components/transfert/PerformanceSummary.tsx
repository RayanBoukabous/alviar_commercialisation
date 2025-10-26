'use client';

import React, { useMemo } from 'react';
import { 
  Clock, 
  Zap, 
  Database, 
  TrendingUp, 
  Activity,
  BarChart3
} from 'lucide-react';

interface PerformanceSummaryProps {
  transferts: any[];
  loading: boolean;
  lastRefresh: Date;
  isRTL: boolean;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = React.memo(({
  transferts,
  loading,
  lastRefresh,
  isRTL
}) => {
  const stats = useMemo(() => {
    const total = transferts.length;
    const enCours = transferts.filter(t => t.statut === 'EN_COURS').length;
    const enLivraison = transferts.filter(t => t.statut === 'EN_LIVRAISON').length;
    const livres = transferts.filter(t => t.statut === 'LIVRE').length;
    const annules = transferts.filter(t => t.statut === 'ANNULE').length;
    
    const tauxLivraison = total > 0 ? ((livres / total) * 100).toFixed(1) : '0';
    const tauxActif = total > 0 ? (((enCours + enLivraison) / total) * 100).toFixed(1) : '0';
    
    return {
      total,
      enCours,
      enLivraison,
      livres,
      annules,
      tauxLivraison,
      tauxActif
    };
  }, [transferts]);

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return isRTL ? 'الآن' : 'Maintenant';
    } else if (minutes < 60) {
      return isRTL ? `${minutes} دقيقة` : `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      return isRTL ? `${hours} ساعة` : `${hours}h`;
    }
  };

  return (
    <div className="px-6 py-4 border-b theme-border-primary theme-bg-elevated">
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Performance générale */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {isRTL ? 'الأداء العام' : 'Performance générale'}
              </p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {stats.tauxActif}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Taux de livraison */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {isRTL ? 'معدل التسليم' : 'Taux de livraison'}
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {stats.tauxLivraison}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Temps de réponse */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {isRTL ? 'وقت الاستجابة' : 'Temps de réponse'}
              </p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {loading ? '...' : '< 1s'}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Dernière mise à jour */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}
              </p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {formatLastRefresh(lastRefresh)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium theme-text-primary theme-transition">
            {isRTL ? 'تقدم العمليات' : 'Progression des opérations'}
          </span>
          <span className="text-sm theme-text-secondary theme-transition">
            {stats.enCours + stats.enLivraison} / {stats.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${stats.total > 0 ? ((stats.enCours + stats.enLivraison) / stats.total) * 100 : 0}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
});

PerformanceSummary.displayName = 'PerformanceSummary';
