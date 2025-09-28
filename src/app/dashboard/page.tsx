'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Layout } from '@/components/layout';
import { ThemeCard } from '@/lib/theme/ThemeProvider';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useDashboardData, useLivenessMetrics, useDetailedStats } from '@/lib/hooks/useDashboardData';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { DashboardCharts } from '@/components/charts/DashboardCharts';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Shield, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { metrics, advancedMetrics, chartData, refreshData } = useDashboardData();
  const livenessMetrics = useLivenessMetrics();
  const detailedStats = useDetailedStats();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Gestion RTL/LTR
  const isRTL = currentLocale === 'ar';
  const textDirection = isRTL ? 'rtl' : 'ltr';

  // Si les traductions sont en cours de chargement, afficher un loader
  if (translationLoading) {
    return (
      <ThemeProvider>
        <Layout>
          <div className="space-y-6">
            <div className="animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded mb-2"></div>
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-64 rounded"></div>
                </div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Layout>
      </ThemeProvider>
    );
  }

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen theme-bg-primary flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
      name: t('dashboard', 'users'),
      value: metrics.totalUsers.toLocaleString(),
      change: detailedStats.users.active > 0 ? `+${Math.round((detailedStats.users.active / metrics.totalUsers) * 100)}%` : '0%',
      changeType: 'positive',
      icon: Users,
      color: 'from-red-500 to-red-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-600 dark:text-red-400',
      isLoading: metrics.isLoading,
      description: t('dashboard', 'users_description') as string,
    },
    {
      name: t('dashboard', 'admins'),
      value: metrics.totalAdmins.toLocaleString(),
      change: '+2%',
      changeType: 'positive',
      icon: Shield,
      color: 'from-red-600 to-red-700',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-700 dark:text-red-500',
      isLoading: metrics.isLoading,
      description: t('dashboard', 'admins_description') as string,
    },
    {
      name: t('dashboard', 'clients'),
      value: metrics.totalClients.toLocaleString(),
      change: detailedStats.clients.active > 0 ? `+${Math.round((detailedStats.clients.active / metrics.totalClients) * 100)}%` : '0%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-red-700 to-red-800',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-800 dark:text-red-600',
      isLoading: metrics.isLoading,
      description: t('dashboard', 'clients_description') as string,
    },
    {
      name: t('dashboard', 'config_count'),
      value: metrics.totalConfigs.toLocaleString(),
      change: '+22%',
      changeType: 'positive',
      icon: Settings,
      color: 'from-red-800 to-red-900',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-900 dark:text-red-700',
      isLoading: metrics.isLoading,
      description: t('dashboard', 'config_count_description') as string,
    },
  ];

  return (
    <ThemeProvider>
      <Layout>
        <div className="space-y-6" dir={textDirection}>
          {/* Header */}
          <div className="animate-fade-in">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              {isRTL ? (
                <>
                  {/* Bouton refresh à droite en RTL */}
                  <button
                    onClick={refreshData}
                    disabled={metrics.isLoading}
                    className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: '1px solid #dc2626'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }}
                  >
                    <RefreshCw className={`w-4 h-4 ${metrics.isLoading ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
                    <span className="font-medium" style={{ color: 'white' }}>{t('dashboard', 'refresh') as string}</span>
                  </button>
                  
                  {/* Titres alignés à droite en RTL */}
                  <div className="text-right">
                    <h1 className="text-3xl font-bold theme-text-primary bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent text-right">
                      {t('dashboard', 'title') as string}
                    </h1>
                    <p className="mt-2 text-lg theme-text-secondary text-right">
                      {t('dashboard', 'subtitle') as string}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Titres alignés à gauche en LTR */}
                  <div className="text-left">
                    <h1 className="text-3xl font-bold theme-text-primary bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent text-left">
                      {t('dashboard', 'title') as string}
                    </h1>
                    <p className="mt-2 text-lg theme-text-secondary text-left">
                      {t('dashboard', 'subtitle') as string}
                    </p>
                  </div>
                  
                  {/* Bouton refresh à droite en LTR */}
                  <button
                    onClick={refreshData}
                    disabled={metrics.isLoading}
                    className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: '1px solid #dc2626'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }}
                  >
                    <RefreshCw className={`w-4 h-4 ${metrics.isLoading ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
                    <span className="font-medium" style={{ color: 'white' }}>{t('dashboard', 'refresh') as string}</span>
                  </button>
                </>
              )}
            </div>
            
            {/* Indicateur d'erreur */}
            {metrics.error && (
              <div className={`mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className={`text-red-700 dark:text-red-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('dashboard', 'error_message') as string}
                </span>
              </div>
            )}
          </div>

          {/* 4 Cartes Principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mainStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ThemeCard 
                  key={stat.name as string} 
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                >
                  <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-between'}`}>
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 ml-auto' : 'space-x-4'}`}>
                      {/* En RTL: icône puis texte, tout aligné à droite */}
                      {isRTL ? (
                        <>
                          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className={`text-sm font-medium theme-text-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                              {stat.name as string}
                            </p>
                            <div className={`flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'} mt-1`}>
                              <p className={`text-2xl font-bold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                                {stat.isLoading ? (
                                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>...</span>
                                  </div>
                                ) : (
                                  stat.value
                                )}
                              </p>
                              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'} px-2 py-1 rounded-full text-xs font-semibold ${
                                stat.changeType === 'positive' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {isRTL ? (
                                  <>
                                    <span>{stat.change}</span>
                                    {stat.changeType === 'positive' ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {stat.changeType === 'positive' ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    <span>{stat.change}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className={`text-xs theme-text-tertiary mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {stat.description}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className={`text-sm font-medium theme-text-secondary ${isRTL ? 'text-right' : 'text-left'}`}>
                              {stat.name as string}
                            </p>
                            <div className={`flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'} mt-1`}>
                              <p className={`text-2xl font-bold theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                                {stat.isLoading ? (
                                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>...</span>
                                  </div>
                                ) : (
                                  stat.value
                                )}
                              </p>
                              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'} px-2 py-1 rounded-full text-xs font-semibold ${
                                stat.changeType === 'positive' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {isRTL ? (
                                  <>
                                    <span>{stat.change}</span>
                                    {stat.changeType === 'positive' ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {stat.changeType === 'positive' ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    <span>{stat.change}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className={`text-xs theme-text-tertiary mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {stat.description}
                            </p>
                          </div>
                        </>
                      )}
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



        </div>
      </Layout>
    </ThemeProvider>
  );
}
