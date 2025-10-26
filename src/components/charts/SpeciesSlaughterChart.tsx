'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  mockSlaughterDataBySpecies, 
  speciesColors, 
  speciesLabels,
  SlaughterDataBySpecies 
} from '@/lib/data/mockSlaughterData';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart } from 'lucide-react';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SpeciesSlaughterChartProps {
  isLoading?: boolean;
}

const SpeciesSlaughterChart = memo(({ isLoading = false }: SpeciesSlaughterChartProps) => {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  const [viewMode, setViewMode] = useState<'bar' | 'doughnut'>('bar');
  const [selectedSpecies, setSelectedSpecies] = useState<string | 'ALL'>('ALL');

  // Calculer les totaux par espèce
  const speciesTotals = useMemo(() => {
    const totals = {
      BOVIN: 0,
      OVIN: 0,
      CAPRIN: 0,
      AUTRE: 0
    };
    
    mockSlaughterDataBySpecies.forEach(abattoir => {
      totals.BOVIN += abattoir.species.BOVIN;
      totals.OVIN += abattoir.species.OVIN;
      totals.CAPRIN += abattoir.species.CAPRIN;
      totals.AUTRE += abattoir.species.AUTRE;
    });
    
    return totals;
  }, []);

  // Données pour le graphique en barres GROUPÉES
  const barChartData = useMemo(() => {
    const species = ['BOVIN', 'OVIN', 'CAPRIN', 'AUTRE'] as const;
    const labels = mockSlaughterDataBySpecies.map(abattoir => abattoir.abattoir);
    
    const datasets = species.map(specie => ({
      label: speciesLabels[specie][isRTL ? 'ar' : 'fr'],
      data: mockSlaughterDataBySpecies.map(abattoir => abattoir.species[specie]),
      backgroundColor: speciesColors[specie].primary,
      borderColor: speciesColors[specie].secondary,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: speciesColors[specie].secondary,
      hoverBorderWidth: 3,
    }));

    return {
      labels,
      datasets
    };
  }, [isRTL]);

  // Données pour le graphique en donut
  const doughnutChartData = useMemo(() => {
    const species = ['BOVIN', 'OVIN', 'CAPRIN', 'AUTRE'] as const;
    
    return {
      labels: species.map(specie => speciesLabels[specie][isRTL ? 'ar' : 'fr']),
      datasets: [{
        data: species.map(specie => speciesTotals[specie]),
        backgroundColor: species.map(specie => speciesColors[specie].primary),
        borderColor: species.map(specie => speciesColors[specie].secondary),
        borderWidth: 3,
        hoverBackgroundColor: species.map(specie => speciesColors[specie].secondary),
        hoverBorderWidth: 4,
      }]
    };
  }, [speciesTotals, isRTL]);

  // Options pour le graphique en barres
  const barChartOptions = useMemo(() => ({
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
            const percentage = ((value / speciesTotals[context.dataset.label as keyof typeof speciesTotals]) * 100).toFixed(1);
            return `${label}: ${value} animaux (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false, // DÉSACTIVÉ pour avoir des barres groupées
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
        stacked: false, // DÉSACTIVÉ pour avoir des barres groupées
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
  }), [theme, isRTL, speciesTotals]);

  // Options pour le graphique en donut
  const doughnutChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
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
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} animaux (${percentage}%)`;
          }
        }
      },
    },
  }), [theme]);

  // Statistiques calculées
  const statistics = useMemo(() => {
    const totalAnimals = Object.values(speciesTotals).reduce((sum, count) => sum + count, 0);
    const mostAbundantSpecies = Object.entries(speciesTotals).reduce((a, b) => 
      speciesTotals[a[0] as keyof typeof speciesTotals] > speciesTotals[b[0] as keyof typeof speciesTotals] ? a : b
    );
    const averagePerAbattoir = totalAnimals / mockSlaughterDataBySpecies.length;
    
    return {
      totalAnimals,
      mostAbundantSpecies: mostAbundantSpecies[0],
      mostAbundantCount: mostAbundantSpecies[1],
      averagePerAbattoir: Math.round(averagePerAbattoir)
    };
  }, [speciesTotals]);

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
      {/* Header avec contrôles */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-6`}>
        <div className="flex items-center space-x-3">
          <h3 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'عدد الحيوانات المذبوحة حسب النوع لكل مسلخ' : 'Nombre d\'animaux abattus par espèce et par abattoir'}
          </h3>
        </div>
        
        {/* Contrôles de vue */}
        <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <button
            onClick={() => setViewMode('bar')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'bar'
                ? 'bg-red-600 text-white shadow-md'
                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{isRTL ? 'أعمدة' : 'Barres'}</span>
          </button>
          
          <button
            onClick={() => setViewMode('doughnut')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'doughnut'
                ? 'bg-red-600 text-white shadow-md'
                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>{isRTL ? 'دائري' : 'Circulaire'}</span>
          </button>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80 mb-6">
        {viewMode === 'bar' ? (
          <Bar data={barChartData} options={barChartOptions} />
        ) : (
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
        )}
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'إجمالي الحيوانات' : 'Total animaux'}
            </span>
          </div>
          <div className="text-2xl font-bold theme-text-primary">
            {statistics.totalAnimals.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'النوع الأكثر' : 'Espèce dominante'}
            </span>
          </div>
          <div className="text-lg font-bold theme-text-primary">
            {speciesLabels[statistics.mostAbundantSpecies as keyof typeof speciesLabels][isRTL ? 'ar' : 'fr']}
          </div>
          <div className="text-sm theme-text-tertiary">
            {statistics.mostAbundantCount} animaux
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'متوسط/مسلخ' : 'Moyenne/abattoir'}
            </span>
          </div>
          <div className="text-2xl font-bold theme-text-primary">
            {statistics.averagePerAbattoir}
          </div>
        </div>
        
        <div className="text-center p-4 rounded-lg theme-bg-secondary">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium theme-text-secondary">
              {isRTL ? 'المسالخ النشطة' : 'Abattoirs actifs'}
            </span>
          </div>
          <div className="text-2xl font-bold theme-text-primary">
            {mockSlaughterDataBySpecies.length}
          </div>
        </div>
      </div>

      {/* Répartition par espèce */}
      <div className="mt-6">
        <h4 className={`text-md font-semibold theme-text-primary mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 'تفصيل حسب النوع' : 'Détail par espèce'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(speciesTotals).map(([species, count]) => {
            const percentage = ((count / statistics.totalAnimals) * 100).toFixed(1);
            const specieKey = species as keyof typeof speciesLabels;
            
            return (
              <div key={species} className="p-4 rounded-lg border" style={{ 
                borderColor: speciesColors[specieKey].primary + '20',
                backgroundColor: speciesColors[specieKey].light + '50'
              }}>
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: speciesColors[specieKey].primary }}
                  ></div>
                  <span className="text-sm font-medium theme-text-secondary">
                    {speciesLabels[specieKey][isRTL ? 'ar' : 'fr']}
                  </span>
                </div>
                <div className="text-2xl font-bold theme-text-primary">
                  {count.toLocaleString()}
                </div>
                <div className="text-sm theme-text-tertiary">
                  {percentage}% du total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

SpeciesSlaughterChart.displayName = 'SpeciesSlaughterChart';

export default SpeciesSlaughterChart;
