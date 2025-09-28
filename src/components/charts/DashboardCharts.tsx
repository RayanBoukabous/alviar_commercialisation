'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth?: number;
  }[];
}

interface DashboardChartsProps {
  usersData: number;
  adminsData: number;
  clientsData: number;
  sessionsData: number;
  rolesData: number;
  permissionsData: number;
  isLoading?: boolean;
}

export function DashboardCharts({
  usersData,
  adminsData,
  clientsData,
  sessionsData,
  rolesData,
  permissionsData,
  isLoading = false,
}: DashboardChartsProps) {
  const { theme } = useTheme();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  // Données pour le graphique en barres avec dégradés
  const barChartData = {
    labels: [t('dashboard', 'users') as string, t('dashboard', 'admins') as string, t('dashboard', 'clients') as string, 'Sessions', 'Rôles', 'Permissions'],
    datasets: [
      {
        label: t('dashboard', 'total_number') as string,
        data: [usersData, adminsData, clientsData, sessionsData, rolesData, permissionsData],
        backgroundColor: [
          'rgba(239, 68, 68, 0.9)',   // Rouge vif
          'rgba(220, 38, 38, 0.9)',   // Rouge moyen
          'rgba(185, 28, 28, 0.9)',   // Rouge foncé
          'rgba(153, 27, 27, 0.9)',   // Rouge très foncé
          'rgba(127, 29, 29, 0.9)',   // Rouge bordeaux
          'rgba(248, 113, 113, 0.9)', // Rouge clair
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(153, 27, 27, 1)',
          'rgba(127, 29, 29, 1)',
          'rgba(248, 113, 113, 1)',
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
        ],
        hoverBorderWidth: 4,
      },
    ],
  };

  // Données pour le graphique en donut (Users vs Admins) avec dégradés
  const donutChartData = {
    labels: [t('dashboard', 'users') as string, t('dashboard', 'admins') as string],
    datasets: [
      {
        data: [usersData, adminsData],
        backgroundColor: [
          'rgba(239, 68, 68, 0.9)',   // Rouge vif pour Users
          'rgba(220, 38, 38, 0.9)',   // Rouge moyen pour Admins
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 4,
        hoverBackgroundColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        hoverBorderWidth: 6,
        cutout: '60%',
        spacing: 2,
      },
    ],
  };

  // Données pour le graphique linéaire (simulation de tendance)
  const lineChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: t('dashboard', 'sessions_liveness'),
        data: [sessionsData * 0.8, sessionsData * 0.9, sessionsData * 1.1, sessionsData * 1.2, sessionsData * 1.0, sessionsData],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: t('dashboard', 'users'),
        data: [usersData * 0.7, usersData * 0.8, usersData * 0.9, usersData * 1.1, usersData * 1.0, usersData],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
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
            size: 12,
            weight: '500',
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const donutOptions = {
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
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  if (isLoading || translationLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">{t('dashboard', 'loading_charts') as string}</div>
        </div>
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">{t('dashboard', 'loading_charts') as string}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Graphique en barres */}
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('dashboard', 'data_distribution') as string}</h3>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Graphique en donut */}
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('dashboard', 'users_admins') as string}</h3>
        <div className="h-64">
          <Doughnut data={donutChartData} options={donutOptions} />
        </div>
      </div>
    </div>
  );
}
