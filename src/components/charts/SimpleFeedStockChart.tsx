'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Enregistrer les composants Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface FeedStockData {
  type: 'FOIN' | 'CONCENTRE' | 'CEREALE' | 'COMPLEMENT' | 'AUTRE';
  quantity: number;
  value: number;
  count: number;
}

interface SimpleFeedStockChartProps {
  isLoading?: boolean;
}

export function SimpleFeedStockChart({ isLoading = false }: SimpleFeedStockChartProps) {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';

  // Données mock statiques pour éviter les appels API
  const mockFeedStockData: FeedStockData[] = [
    {
      type: 'FOIN',
      quantity: 4300, // Foin de Luzerne (2500) + Foin de Trèfle (1800)
      value: 188100, // 112500 + 75600
      count: 2
    },
    {
      type: 'CONCENTRE',
      quantity: 800, // Concentré Bovins 18%
      value: 96000,
      count: 1
    },
    {
      type: 'CEREALE',
      quantity: 3200, // Maïs Concassé (Orge = 0, donc pas inclus)
      value: 121600,
      count: 1
    },
    {
      type: 'COMPLEMENT',
      quantity: 120, // Complément Minéral
      value: 10200,
      count: 1
    },
    {
      type: 'AUTRE',
      quantity: 0,
      value: 0,
      count: 0
    }
  ];

  const typeLabels = {
    FOIN: isRTL ? 'فون' : 'Foin',
    CONCENTRE: isRTL ? 'مركز' : 'Concentré',
    CEREALE: isRTL ? 'حبوب' : 'Céréale',
    COMPLEMENT: isRTL ? 'مكمل' : 'Complément',
    AUTRE: isRTL ? 'أخرى' : 'Autre'
  };

  const chartData = {
    labels: mockFeedStockData.map(item => typeLabels[item.type]),
    datasets: [
      {
        data: mockFeedStockData.map(item => item.quantity),
        backgroundColor: [
          'rgba(239, 68, 68, 0.9)',   // Rouge vif pour Foin
          'rgba(220, 38, 38, 0.9)',   // Rouge moyen pour Concentré
          'rgba(185, 28, 28, 0.9)',   // Rouge foncé pour Céréale
          'rgba(153, 27, 27, 0.9)',   // Rouge très foncé pour Complément
          'rgba(127, 29, 29, 0.9)',   // Rouge bordeaux pour Autre
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(127, 29, 29, 1)',
        ],
        borderWidth: 4,
        hoverBackgroundColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(127, 29, 29, 1)',
        ],
        hoverBorderWidth: 6,
        cutout: '60%',
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2500,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#f5f5f5' : '#0f172a',
          font: {
            size: 13,
            weight: '600',
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? '#f5f5f5' : '#0f172a',
        bodyColor: theme === 'dark' ? '#d4d4d4' : '#475569',
        borderColor: '#ef4444',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const stockData = mockFeedStockData[context.dataIndex];
            const stockValue = stockData.value;
            
            return [
              `${label}: ${value.toLocaleString()} kg`,
              `Valeur: ${new Intl.NumberFormat('fr-DZ', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0
              }).format(stockValue)}`,
              `Part: ${percentage}%`
            ];
          }
        }
      },
    },
  };

  const totalQuantity = mockFeedStockData.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = mockFeedStockData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = mockFeedStockData.reduce((sum, item) => sum + item.count, 0);

  if (isLoading || translationLoading) {
    return (
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">Chargement du graphique...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
      {/* Header */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
        <h3 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 'توزيع مخزون الأعلاف' : 'Répartition du stock alimentaire'}
        </h3>
      </div>

      {/* Graphique */}
      <div className="h-64">
        <Doughnut data={chartData} options={chartOptions} />
      </div>

      {/* Statistiques détaillées */}
      <div className="mt-6 space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold theme-text-primary">
              {totalQuantity.toLocaleString()}
            </div>
            <div className="text-sm theme-text-secondary">Total (kg)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold theme-text-primary">
              {new Intl.NumberFormat('fr-DZ', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0
              }).format(totalValue)}
            </div>
            <div className="text-sm theme-text-secondary">Valeur totale</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold theme-text-primary">
              {totalItems}
            </div>
            <div className="text-sm theme-text-secondary">Types de stock</div>
          </div>
        </div>

        {/* Détail par type */}
        <div className="space-y-2">
          <h4 className={`text-sm font-medium theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'تفاصيل حسب النوع' : 'Détail par type'}
          </h4>
          <div className="space-y-1">
            {mockFeedStockData.filter(item => item.quantity > 0).map((item, index) => {
              const percentage = ((item.quantity / totalQuantity) * 100).toFixed(1);
              return (
                <div key={item.type} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                    />
                    <span className="text-sm theme-text-secondary">{typeLabels[item.type]}</span>
                  </div>
                  <div className={`text-sm font-medium theme-text-primary ${isRTL ? 'text-left' : 'text-right'}`}>
                    {item.quantity.toLocaleString()} kg ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
