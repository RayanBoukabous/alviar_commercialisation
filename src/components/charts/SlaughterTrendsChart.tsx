'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { mockTimeSeriesData, speciesColors, speciesLabels } from '@/lib/data/mockSlaughterData';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SlaughterTrendsChartProps {
  isLoading?: boolean;
}

const SlaughterTrendsChart = memo(({ isLoading = false }: SlaughterTrendsChartProps) => {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Données pour le graphique de tendances
  const trendsData = useMemo(() => {
    const species = ['BOVIN', 'OVIN', 'CAPRIN', 'AUTRE'] as const;
    
    const datasets = species.map(specie => ({
      label: speciesLabels[specie][isRTL ? 'ar' : 'fr'],
      data: mockTimeSeriesData.map(day => day[specie]),
      borderColor: speciesColors[specie].primary,
      backgroundColor: speciesColors[specie].primary + '20',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: speciesColors[specie].primary,
      pointBorderColor: speciesColors[specie].secondary,
      pointBorderWidth: 2,
      pointRadius: 6,
      hoverBackgroundColor: speciesColors[specie].secondary,
      hoverBorderWidth: 4,
    }));

    return {
      labels: mockTimeSeriesData.map(day => 
        new Date(day.date).toLocaleDateString('fr-FR', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets
    };
  }, [isRTL]);

  // Options pour le graphique de tendances
  const trendsOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#f5f5f5' : '#0f172a',
          font: {
            size: 12,
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} animaux`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: theme === 'dark' ? '#d4d4d4' : '#475569',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 8,
          callback: function(value: any) {
            return value + ' animaux';
          }
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'dark' ? '#d4d4d4' : '#475569',
          mirror: isRTL,
          font: {
            size: 11,
            weight: '500',
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  }), [theme, isRTL]);

  // Calculer les tendances
  const trends = useMemo(() => {
    const firstDay = mockTimeSeriesData[0];
    const lastDay = mockTimeSeriesData[mockTimeSeriesData.length - 1];
    
    const totalGrowth = lastDay.total - firstDay.total;
    const growthPercentage = ((totalGrowth / firstDay.total) * 100).toFixed(1);
    
    const mostGrowingSpecies = Object.entries(speciesLabels).reduce((a, b) => {
      const aGrowth = lastDay[a[0] as keyof typeof lastDay] - firstDay[a[0] as keyof typeof firstDay];
      const bGrowth = lastDay[b[0] as keyof typeof lastDay] - firstDay[b[0] as keyof typeof firstDay];
      return aGrowth > bGrowth ? a : b;
    });

    return {
      totalGrowth,
      growthPercentage,
      mostGrowingSpecies: mostGrowingSpecies[0],
      mostGrowingCount: lastDay[mostGrowingSpecies[0] as keyof typeof lastDay] - firstDay[mostGrowingSpecies[0] as keyof typeof firstDay]
    };
  }, []);

  if (isLoading || translationLoading) {
    return (
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">Chargement des tendances...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
      {/* Header */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-6`}>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-red-600" />
          <h3 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'اتجاهات الذبح الأسبوعية' : 'Tendances d\'abattage hebdomadaires'}
          </h3>
        </div>
        
        {/* Filtres de période */}
        <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeRange === 'week'
                ? 'bg-red-600 text-white shadow-md'
                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
            }`}
          >
            {isRTL ? 'أسبوع' : 'Semaine'}
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeRange === 'month'
                ? 'bg-red-600 text-white shadow-md'
                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
            }`}
          >
            {isRTL ? 'شهر' : 'Mois'}
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeRange === 'quarter'
                ? 'bg-red-600 text-white shadow-md'
                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
            }`}
          >
            {isRTL ? 'ربع' : 'Trimestre'}
          </button>
        </div>
      </div>

      {/* Graphique de tendances */}
      <div className="h-80 mb-6">
        <Line data={trendsData} options={trendsOptions} />
      </div>

      {/* Statistiques de tendances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'النمو الإجمالي' : 'Croissance totale'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${trends.totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trends.totalGrowth >= 0 ? '+' : ''}{trends.totalGrowth}
          </div>
          <div className="text-sm theme-text-tertiary">
            {trends.growthPercentage}% cette semaine
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'النوع الأسرع نمواً' : 'Espèce en croissance'}
            </span>
          </div>
          <div className="text-lg font-bold theme-text-primary">
            {speciesLabels[trends.mostGrowingSpecies as keyof typeof speciesLabels][isRTL ? 'ar' : 'fr']}
          </div>
          <div className="text-sm theme-text-tertiary">
            +{trends.mostGrowingCount} animaux
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'متوسط يومي' : 'Moyenne quotidienne'}
            </span>
          </div>
          <div className="text-2xl font-bold theme-text-primary">
            {Math.round(mockTimeSeriesData.reduce((sum, day) => sum + day.total, 0) / mockTimeSeriesData.length)}
          </div>
          <div className="text-sm theme-text-tertiary">
            animaux/jour
          </div>
        </div>
      </div>
    </div>
  );
});

SlaughterTrendsChart.displayName = 'SlaughterTrendsChart';

export default SlaughterTrendsChart;
