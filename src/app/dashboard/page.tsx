'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Layout } from '@/components/layout';
import { ThemeCard } from '@/lib/theme/ThemeProvider';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useDashboardData, useLivenessMetrics, useDetailedStats } from '@/lib/hooks/useDashboardData';
import { DashboardCharts } from '@/components/charts/DashboardCharts';
import { ConfigsMetrics } from '@/components/charts/ConfigsMetrics';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Shield, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { metrics, advancedMetrics, chartData, refreshData } = useDashboardData();
  const livenessMetrics = useLivenessMetrics();
  const detailedStats = useDetailedStats();

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen theme-bg-primary flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Si l'utilisateur n'est pas authentifié, il sera redirigé automatiquement
  if (!isAuthenticated) {
    return null;
  }

  // 4 cartes principales importantes
  const mainStats = [
    {
      name: 'Utilisateurs',
      value: metrics.totalUsers.toLocaleString(),
      change: detailedStats.users.active > 0 ? `+${Math.round((detailedStats.users.active / metrics.totalUsers) * 100)}%` : '0%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-blue-600 dark:text-blue-400',
      isLoading: metrics.isLoading,
      description: 'Utilisateurs enregistrés',
    },
    {
      name: 'Admins',
      value: metrics.totalAdmins.toLocaleString(),
      change: '+2%',
      changeType: 'positive',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-600 dark:text-red-400',
      isLoading: metrics.isLoading,
      description: 'Administrateurs système',
    },
    {
      name: 'Clients',
      value: metrics.totalClients.toLocaleString(),
      change: detailedStats.clients.active > 0 ? `+${Math.round((detailedStats.clients.active / metrics.totalClients) * 100)}%` : '0%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-green-600 dark:text-green-500',
      isLoading: metrics.isLoading,
      description: 'Clients actifs',
    },
    {
      name: 'Config Count',
      value: metrics.totalConfigs.toLocaleString(),
      change: '+22%',
      changeType: 'positive',
      icon: Settings,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      isLoading: metrics.isLoading,
      description: 'Configurations totales',
    },
  ];

  return (
    <ThemeProvider>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <div className="flex items-center justify-between">
          <div>
                <h1 className="text-3xl font-bold theme-text-primary bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="mt-2 text-lg theme-text-secondary">
              Vue d'ensemble de votre activité liveness
            </p>
              </div>
              <button
                onClick={refreshData}
                disabled={metrics.isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${metrics.isLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
            
            {/* Indicateur d'erreur */}
            {metrics.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{metrics.error}</span>
              </div>
            )}
          </div>

          {/* 4 Cartes Principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mainStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ThemeCard 
                  key={stat.name} 
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium theme-text-secondary">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-bold theme-text-primary mt-1">
                          {stat.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>...</span>
                            </div>
                          ) : (
                            stat.value
                          )}
                        </p>
                        <p className="text-xs theme-text-tertiary mt-1">
                          {stat.description}
                        </p>
                      </div>
                          </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </ThemeCard>
              );
            })}
          </div>




          {/* Graphiques Professionnels */}
          <DashboardCharts
            usersData={metrics.totalUsers}
            adminsData={metrics.totalAdmins}
            clientsData={metrics.totalClients}
            sessionsData={metrics.activeSessions}
            rolesData={metrics.totalRoles}
            permissionsData={metrics.totalPermissions}
            isLoading={metrics.isLoading}
          />

          {/* Métriques des Configurations */}
          <ConfigsMetrics
            livenessConfigs={metrics.livenessConfigs}
            matchingConfigs={metrics.matchingConfigs}
            silentLivenessConfigs={metrics.silentLivenessConfigs}
            totalConfigs={metrics.totalConfigs}
            isLoading={metrics.isLoading}
          />


        </div>
      </Layout>
    </ThemeProvider>
  );
}
