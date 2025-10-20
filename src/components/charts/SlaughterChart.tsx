'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useProfile } from '@/lib/hooks/useDjangoAuth';
import { useAbattoirsForCharts } from '@/lib/hooks/useAbattoirStats';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SlaughterData {
  abattoir: string;
  today: number;
  week: number;
  month: number;
}

interface SlaughterChartProps {
  isLoading?: boolean;
}

export function SlaughterChart({ isLoading = false }: SlaughterChartProps) {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const { data: userProfile } = useProfile();
  const { data: abattoirsData, isLoading: abattoirsLoading } = useAbattoirsForCharts();

  // Fonction pour générer des données mock d'abattage (mémorisée)
  const generateMockSlaughterData = React.useMemo(() => {
    if (!abattoirsData?.abattoirs) return [];
    
    return abattoirsData.abattoirs.map((abattoir, index) => {
      // Utiliser l'index pour avoir des données cohérentes
      const seed = abattoir.id || index;
      return {
        abattoir: abattoir.nom,
        today: (seed * 7) % 50 + 20, // 20-70 animaux (cohérent)
        week: (seed * 11) % 200 + 150, // 150-350 animaux (cohérent)
        month: (seed * 13) % 800 + 600, // 600-1400 animaux (cohérent)
      };
    });
  }, [abattoirsData?.abattoirs]);

  const mockSlaughterData = generateMockSlaughterData;

  const timeFilters = [
    { key: 'today', label: 'Aujourd\'hui' },
    { key: 'week', label: 'Cette semaine' },
    { key: 'month', label: 'Ce mois' },
  ];

  const currentData = React.useMemo(() => {
    return mockSlaughterData.map(item => ({
      abattoir: item.abattoir,
      value: item[timeFilter]
    }));
  }, [mockSlaughterData, timeFilter]);

  const chartData = React.useMemo(() => ({
    labels: currentData.map(item => item.abattoir),
    datasets: [
      {
        label: `Animaux abattus (${timeFilters.find(f => f.key === timeFilter)?.label})`,
        data: currentData.map(item => item.value),
        backgroundColor: [
          'rgba(239, 68, 68, 0.9)',   // Rouge vif
          'rgba(220, 38, 38, 0.9)',   // Rouge moyen
          'rgba(185, 28, 28, 0.9)',   // Rouge foncé
          'rgba(153, 27, 27, 0.9)',   // Rouge très foncé
          'rgba(127, 29, 29, 0.9)',   // Rouge bordeaux
          'rgba(248, 113, 113, 0.9)', // Rouge clair
          'rgba(239, 68, 68, 0.7)',   // Rouge vif transparent
          'rgba(220, 38, 38, 0.7)',   // Rouge moyen transparent
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(127, 29, 29, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(127, 29, 29, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        hoverBorderWidth: 4,
      },
    ],
  }), [currentData, timeFilter, timeFilters]);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
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
            size: 13,
            weight: '600',
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      title: {
        display: false,
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
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          display: false,
        },
      },
    },
  }), [theme, isRTL, timeFilter, timeFilters]);

  if (isLoading || translationLoading || abattoirsLoading) {
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
      {/* Header avec filtres */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
        <h3 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {abattoirsData?.user_type === 'superuser' 
            ? "Répartition des animaux abattus par abattoir" 
            : `Animaux abattus - ${abattoirsData?.abattoirs[0]?.nom || "Votre Abattoir"}`
          }
        </h3>
        
        {/* Filtres de temps */}
        <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          {timeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as 'today' | 'week' | 'month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                timeFilter === filter.key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Statistiques rapides */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold theme-text-primary">
            {currentData.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-sm theme-text-secondary">
            {abattoirsData?.user_type === 'superuser' ? "Total abattu" : "Total abattu"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold theme-text-primary">
            {abattoirsData?.user_type === 'superuser' 
              ? Math.round(currentData.reduce((sum, item) => sum + item.value, 0) / currentData.length)
              : currentData[0]?.value || 0
            }
          </div>
          <div className="text-sm theme-text-secondary">
            {abattoirsData?.user_type === 'superuser' ? "Moyenne/abattoir" : "Animaux abattus"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold theme-text-primary">
            {abattoirsData?.user_type === 'superuser' 
              ? (currentData.find(item => item.value === Math.max(...currentData.map(d => d.value)))?.abattoir.split(' ')[1] || 'N/A')
              : (timeFilters.find(f => f.key === timeFilter)?.label || 'N/A')
            }
          </div>
          <div className="text-sm theme-text-secondary">
            {abattoirsData?.user_type === 'superuser' ? "Plus actif" : "Période"}
          </div>
        </div>
      </div>
    </div>
  );
}
