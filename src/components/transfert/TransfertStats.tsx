'use client';

import React from 'react';
import { 
  ArrowRightLeft, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

interface TransfertStatsProps {
  stats: {
    total: number;
    en_cours: number;
    en_livraison: number;
    livres: number;
    annules: number;
  };
  isRTL: boolean;
}

export const TransfertStats: React.FC<TransfertStatsProps> = React.memo(({ stats, isRTL }) => {
  const statCards = [
    {
      title: isRTL ? 'إجمالي النقل' : 'Total des transferts',
      value: stats.total,
      icon: ArrowRightLeft,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: isRTL ? 'قيد التنفيذ' : 'En cours',
      value: stats.en_cours,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: isRTL ? 'في الطريق' : 'En livraison',
      value: stats.en_livraison,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: isRTL ? 'تم التسليم' : 'Livrés',
      value: stats.livres,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: isRTL ? 'ملغاة' : 'Annulés',
      value: stats.annules,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  const tauxLivraison = stats.total > 0 ? ((stats.livres / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="px-6 py-4 border-b theme-border-primary theme-bg-elevated">
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${card.bgColor} ${card.borderColor} theme-transition`}
            >
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary theme-transition">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Taux de livraison */}
      <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {isRTL ? 'معدل التسليم' : 'Taux de livraison'}
            </p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {tauxLivraison}%
            </p>
          </div>
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="mt-2 w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${tauxLivraison}%` }}
          />
        </div>
      </div>
    </div>
  );
});

TransfertStats.displayName = 'TransfertStats';
