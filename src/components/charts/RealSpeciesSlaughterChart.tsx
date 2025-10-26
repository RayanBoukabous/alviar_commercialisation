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
import { useRealDashboardDataSimple } from '@/lib/hooks/useRealDashboardDataSimple';
import { useSlaughterDataByPeriod } from '@/lib/hooks/useSlaughterDataByPeriod';
import { useAbattoirs } from '@/lib/hooks/useAbattoirs';
import { djangoAuthService } from '@/lib/api/djangoAuthService';
import { speciesColors, speciesLabels } from '@/lib/data/mockSlaughterData';
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

interface RealSpeciesSlaughterChartProps {
  isLoading?: boolean;
}

const RealSpeciesSlaughterChart = memo(({ isLoading = false }: RealSpeciesSlaughterChartProps) => {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  const [viewMode, setViewMode] = useState<'bar' | 'doughnut'>('bar');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  // Utiliser les vraies données
  const {
    slaughterData,
    dashboardStats,
    isLoading: dataLoading,
    error
  } = useRealDashboardDataSimple();

  // Utiliser les données filtrées par période
  const {
    data: periodData,
    isLoading: periodLoading,
    error: periodError
  } = useSlaughterDataByPeriod(timeFilter);

  // Vérifier si l'utilisateur est un super utilisateur
  const currentUser = djangoAuthService.getCurrentUser();
  const isSuperUser = currentUser?.is_superuser || false;

  // Récupérer tous les abattoirs pour les super utilisateurs
  const [allAbattoirsData, setAllAbattoirsData] = React.useState(null);
  const [allAbattoirsLoading, setAllAbattoirsLoading] = React.useState(false);
  const [allAbattoirsError, setAllAbattoirsError] = React.useState(null);

  // Récupérer tous les abattoirs via fetch direct
  React.useEffect(() => {
    if (isSuperUser) {
      setAllAbattoirsLoading(true);
      setAllAbattoirsError(null);
      
      fetch('http://localhost:8000/api/abattoirs/abattoirs-for-management/?page_size=100', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('django_token')}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log('🔍 Direct API Response:', data);
        setAllAbattoirsData(data);
      })
      .catch(error => {
        console.error('❌ Error fetching abattoirs:', error);
        setAllAbattoirsError(error);
      })
      .finally(() => {
        setAllAbattoirsLoading(false);
      });
    }
  }, [isSuperUser]);

  // Filtres temporels
  const timeFilters = [
    { key: 'today', label: isRTL ? 'اليوم' : 'Aujourd\'hui' },
    { key: 'week', label: isRTL ? 'هذه الأسبوع' : 'Cette semaine' },
    { key: 'month', label: isRTL ? 'هذا الشهر' : 'Ce mois' }
  ];

  // Utiliser les données filtrées par période depuis l'API
  const getFilteredSlaughterData = useMemo(() => {
    if (!periodData || !periodData.abattoirs_data) return [];
    return periodData.abattoirs_data;
  }, [periodData]);

  // Pour les super utilisateurs : combiner les données d'abattage avec tous les abattoirs
  const getCombinedAbattoirData = useMemo(() => {
    // Si pas super utilisateur, utiliser les données normales
    if (!isSuperUser || !allAbattoirsData?.abattoirs) {
      return getFilteredSlaughterData;
    }

    const slaughterDataMap = new Map();
    getFilteredSlaughterData.forEach(abattoir => {
      slaughterDataMap.set(abattoir.abattoir_nom, abattoir);
    });

    // Combiner tous les abattoirs avec leurs données d'abattage
    return allAbattoirsData.abattoirs.map(abattoir => {
      const slaughterData = slaughterDataMap.get(abattoir.nom);
      if (slaughterData) {
        // Abattoir avec abattage - retourner les données
        return slaughterData;
      } else {
        // Abattoir sans abattage - retourner avec des zéros
        return {
          abattoir_nom: abattoir.nom,
          Bovin: 0,
          Ovin: 0,
          Caprin: 0,
          Autre: 0,
          hasSlaughter: false
        };
      }
    });
  }, [isSuperUser, allAbattoirsData, getFilteredSlaughterData]);

  // Debug pour voir les données
  React.useEffect(() => {
    console.log('🔍 Debug Chart Data:');
    console.log('- isSuperUser:', isSuperUser);
    console.log('- allAbattoirsData:', allAbattoirsData);
    console.log('- getFilteredSlaughterData:', getFilteredSlaughterData);
    console.log('- getCombinedAbattoirData:', getCombinedAbattoirData);
  }, [isSuperUser, allAbattoirsData, getFilteredSlaughterData, getCombinedAbattoirData]);

  // Calculer les totaux par espèce à partir des données combinées
  const speciesTotals = useMemo(() => {
    const totals = {
      Bovin: 0,
      Ovin: 0,
      Caprin: 0,
      Autre: 0
    };
    
    getCombinedAbattoirData.forEach(abattoir => {
      totals.Bovin += abattoir.Bovin;
      totals.Ovin += abattoir.Ovin;
      totals.Caprin += abattoir.Caprin;
      totals.Autre += abattoir.Autre;
    });
    
    return totals;
  }, [getCombinedAbattoirData]);

  // Données pour le graphique en barres groupées
  const barChartData = useMemo(() => {
    const species = ['Bovin', 'Ovin', 'Caprin', 'Autre'] as const;
    const labels = getCombinedAbattoirData.map(abattoir => abattoir.abattoir_nom);
    
    const datasets = species.map(specie => ({
      label: speciesLabels[specie][isRTL ? 'ar' : 'fr'],
      data: getCombinedAbattoirData.map(abattoir => abattoir[specie]),
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
  }, [getCombinedAbattoirData, isRTL]);

  // Données pour le graphique en donut
  const doughnutChartData = useMemo(() => {
    const species = ['Bovin', 'Ovin', 'Caprin', 'Autre'] as const;
    
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
            const total = speciesTotals[context.dataset.label as keyof typeof speciesTotals];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} animaux (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false, // Barres groupées
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
        stacked: false, // Barres groupées
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
    const averagePerAbattoir = getFilteredSlaughterData.length > 0 ? totalAnimals / getFilteredSlaughterData.length : 0;
    
    return {
      totalAnimals,
      mostAbundantSpecies: mostAbundantSpecies[0],
      mostAbundantCount: mostAbundantSpecies[1],
      averagePerAbattoir: Math.round(averagePerAbattoir)
    };
  }, [speciesTotals, getFilteredSlaughterData]);

  if (isLoading || dataLoading || periodLoading || translationLoading) {
    return (
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">Chargement des données réelles...</div>
        </div>
      </div>
    );
  }

  if (error || periodError) {
    return (
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <div className="h-64 theme-bg-red-50 dark:theme-bg-red-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
            </div>
            <div className="text-red-500 dark:text-red-300 text-sm">
              {error || periodError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si aucune donnée d'abattage
  if (!isLoading && !dataLoading && slaughterData.length === 0) {
    return (
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <div className="h-64 theme-bg-blue-50 dark:theme-bg-blue-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-blue-600 dark:text-blue-400 text-lg font-semibold mb-2">
              {isRTL ? 'لا توجد بيانات إنتاج' : 'Aucune donnée d\'abattage'}
            </div>
            <div className="text-blue-500 dark:text-blue-300 text-sm mb-4">
              {isRTL ? 
                'لم يتم تسجيل أي عمليات ذبح في النظام بعد' : 
                'Aucune bête n\'a encore été enregistrée comme abattue dans le système'
              }
            </div>
            <div className="text-blue-400 dark:text-blue-200 text-xs">
              {isRTL ? 
                'تأكد من أن البقاء في النظام لديها حالة "مذبوح"' : 
                'Vérifiez que les bêtes dans le système ont le statut "ABATTU"'
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
      {/* Header avec contrôles */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-6`}>
        <div className="flex items-center space-x-3">
          <div>
            <h3 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'البيانات الحقيقية - توزيع الحيوانات المذبوحة' : 'Données Réelles - Répartition des animaux abattus'}
            </h3>
            {periodData && (
              <p className={`text-sm theme-text-secondary mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 
                  `الفترة: ${new Date(periodData.start_date).toLocaleDateString('ar-DZ')} - ${new Date(periodData.end_date).toLocaleDateString('ar-DZ')}` :
                  `Période: ${new Date(periodData.start_date).toLocaleDateString('fr-FR')} - ${new Date(periodData.end_date).toLocaleDateString('fr-FR')}`
                }
              </p>
            )}
          </div>
        </div>
        
        {/* Contrôles de vue et filtres temporels */}
        <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-end'} space-y-3`}>
          {/* Filtres temporels */}
          <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            {timeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key as 'today' | 'week' | 'month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
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
          <div className="text-xs theme-text-tertiary mt-1">
            {timeFilter === 'today' ? (isRTL ? 'اليوم' : 'Aujourd\'hui') :
             timeFilter === 'week' ? (isRTL ? 'هذه الأسبوع' : 'Cette semaine') :
             (isRTL ? 'هذا الشهر' : 'Ce mois')}
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
            {slaughterData.length}
          </div>
        </div>
      </div>

      {/* Section spéciale pour les super utilisateurs : Abattoirs sans abattage */}
      {isSuperUser && getCombinedAbattoirData.some(abattoir => abattoir.hasSlaughter === false) && (
        <div className="mt-6 p-4 rounded-lg theme-bg-yellow-50 dark:theme-bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {isRTL ? 'المسالخ بدون ذبح' : 'Abattoirs sans abattage'}
            </span>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              {isRTL ? 
                'المسالخ التالية لم تسجل أي عمليات ذبح في الفترة المحددة:' :
                'Les abattoirs suivants n\'ont enregistré aucun abattage pour la période sélectionnée:'
              }
            </p>
            <div className="flex flex-wrap gap-2">
              {getCombinedAbattoirData
                .filter(abattoir => abattoir.hasSlaughter === false)
                .map((abattoir, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200"
                  >
                    {abattoir.abattoir_nom}
                  </span>
                ))
              }
            </div>
          </div>
        </div>
      )}


      {/* Informations sur les données réelles */}
      {dashboardStats && (
        <div className="mt-6 p-4 rounded-lg theme-bg-blue-50 dark:theme-bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {isRTL ? 'معلومات البيانات الحقيقية' : 'Informations sur les données réelles'}
            </span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p>
              {isRTL ? 
                `آخر تحديث: ${new Date(dashboardStats.date_actualisation).toLocaleString('ar-DZ')}` :
                `Dernière mise à jour: ${new Date(dashboardStats.date_actualisation).toLocaleString('fr-FR')}`
              }
            </p>
            <p>
              {isRTL ? 
                `المصدر: ${dashboardStats.abattoir_nom} - ${dashboardStats.abattoir_location}` :
                `Source: ${dashboardStats.abattoir_nom} - ${dashboardStats.abattoir_location}`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

RealSpeciesSlaughterChart.displayName = 'RealSpeciesSlaughterChart';

export default RealSpeciesSlaughterChart;
