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
  const { t, loading: translationLoading } = useLanguage();
  // Données pour le graphique en barres
  const barChartData = {
    labels: [t('dashboard', 'users'), t('dashboard', 'admins'), t('dashboard', 'clients'), 'Sessions', 'Rôles', 'Permissions'],
    datasets: [
      {
        label: t('dashboard', 'total_number'),
        data: [usersData, adminsData, clientsData, sessionsData, rolesData, permissionsData],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique en donut (Users vs Admins)
  const donutChartData = {
    labels: [t('dashboard', 'users'), t('dashboard', 'admins')],
    datasets: [
      {
        data: [usersData, adminsData],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
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
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#f5f5f5' : '#0f172a',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#d4d4d4' : '#475569',
        },
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#d4d4d4' : '#475569',
        },
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#f5f5f5' : '#0f172a',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (isLoading || translationLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">{t('dashboard', 'loading_charts')}</div>
        </div>
        <div className="h-64 theme-bg-tertiary rounded-lg animate-pulse flex items-center justify-center">
          <div className="theme-text-tertiary">{t('dashboard', 'loading_charts')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Graphique en barres */}
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('dashboard', 'data_distribution')}</h3>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Graphique en donut */}
      <div className="theme-bg-elevated rounded-lg p-6 shadow-sm theme-border-primary border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('dashboard', 'users_admins')}</h3>
        <div className="h-64">
          <Doughnut data={donutChartData} options={donutOptions} />
        </div>
      </div>
    </div>
  );
}
