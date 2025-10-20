'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Layout } from '@/components/layout';
import { ThemeCard } from '@/lib/theme/ThemeProvider';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useClientSide } from '@/lib/hooks/useClientSide';
import { useDashboardStats } from '@/lib/hooks/useAbattoirStats';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { DashboardCharts } from '@/components/charts/DashboardCharts';
import { StatsCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Shield, Settings, Activity } from 'lucide-react';

export default function DashboardPage() {
  // TEMPORAIRE : Désactiver les vérifications d'authentification pour le dashboard
  // const { isAuthenticated, isLoading } = useRequireAuth();
  // const isClient = useClientSide();
  // Utiliser les nouvelles statistiques d'abattoir
  const { data: dashboardStats, isLoading: statsLoading, error: statsError, refetch: refreshStats } = useDashboardStats();
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

  // TEMPORAIRE : Pas de vérification d'authentification
  // if (!isClient || isLoading) {
  //   return (
  //     <ThemeProvider>
  //       <div className="min-h-screen theme-bg-primary flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
  //           <p className="text-gray-600">Vérification de l'authentification...</p>
  //         </div>
  //       </div>
  //     </ThemeProvider>
  //   );
  // }

  // TEMPORAIRE : Pas de vérification d'authentification
  // if (!isAuthenticated) {
  //   return (
  //     <ThemeProvider>
  //       <div className="min-h-screen theme-bg-primary flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
  //           <p className="text-gray-600">Redirection vers la page de connexion...</p>
  //         </div>
  //       </div>
  //     </ThemeProvider>
  //   );
  // }

  // 4 cartes principales importantes
  const mainStats = [
    {
      name: 'Utilisateurs',
      value: dashboardStats?.users_count?.toLocaleString() || '0',
      change: '+15%',
      changeType: 'positive',
      icon: Users,
      color: 'from-red-500 to-red-600',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-600 dark:text-red-400',
      isLoading: statsLoading,
      description: `Utilisateurs de ${dashboardStats?.abattoir_name || 'l\'abattoir'}`,
    },
    {
      name: 'Superviseurs',
      value: dashboardStats?.superusers_count?.toLocaleString() || '0',
      change: '+2%',
      changeType: 'positive',
      icon: Shield,
      color: 'from-red-600 to-red-700',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-700 dark:text-red-500',
      isLoading: statsLoading,
      description: `Superviseurs de ${dashboardStats?.abattoir_name || 'l\'abattoir'}`,
    },
    {
      name: 'Clients',
      value: dashboardStats?.clients_count?.toLocaleString() || '0',
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-red-700 to-red-800',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-800 dark:text-red-600',
      isLoading: statsLoading,
      description: dashboardStats?.abattoir_name === 'Tous les abattoirs' ? 'Total des clients' : 'Clients (non assignés)',
    },
    {
      name: 'Bêtes',
      value: dashboardStats?.betes_count?.toLocaleString() || '0',
      change: '+22%',
      changeType: 'positive',
      icon: Settings,
      color: 'from-red-800 to-red-900',
      bgColor: 'theme-bg-tertiary',
      iconColor: 'text-red-900 dark:text-red-700',
      isLoading: statsLoading,
      description: `Bêtes de ${dashboardStats?.abattoir_name || 'l\'abattoir'}`,
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
                    onClick={() => refreshStats()}
                    disabled={statsLoading}
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
                    <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
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
                    onClick={() => refreshStats()}
                    disabled={statsLoading}
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
                    <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} style={{ color: 'white' }} />
                    <span className="font-medium" style={{ color: 'white' }}>{t('dashboard', 'refresh') as string}</span>
                  </button>
                </>
              )}
            </div>
            
            {/* Indicateur d'abattoir */}
            {dashboardStats && (
              <div className={`mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} transition-all duration-300 hover:shadow-md`}>
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`text-sm font-medium text-blue-800 dark:text-blue-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                    Données en temps réel
                  </p>
                  <p className={`text-blue-700 dark:text-blue-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <strong>{dashboardStats.abattoir_name}</strong> - {dashboardStats.abattoir_location}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">En ligne</span>
                </div>
              </div>
            )}
            
            {/* Indicateur d'erreur */}
            {statsError && (
              <div className={`mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} transition-all duration-300 hover:shadow-md`}>
                <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`text-sm font-medium text-red-800 dark:text-red-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                    Erreur de chargement
                  </p>
                  <p className={`text-red-700 dark:text-red-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                    Impossible de récupérer les données du dashboard
                  </p>
                </div>
                <button
                  onClick={() => refreshStats()}
                  className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>

          {/* 4 Cartes Principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              // Skeleton pour les cartes en chargement
              Array.from({ length: 4 }).map((_, index) => (
                <StatsCardSkeleton key={index} />
              ))
            ) : (
              mainStats.map((stat, index) => {
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
            })
            )}
          </div>




          {/* Graphiques Professionnels */}
          {statsLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <DashboardCharts
              usersData={dashboardStats?.users_count || 0}
              adminsData={dashboardStats?.superusers_count || 0}
              clientsData={dashboardStats?.clients_count || 0}
              sessionsData={0} // Pas de données de sessions pour l'instant
              rolesData={0} // Pas de données de rôles pour l'instant
              permissionsData={0} // Pas de données de permissions pour l'instant
              isLoading={statsLoading}
            />
          )}



        </div>
      </Layout>
    </ThemeProvider>
  );
}
