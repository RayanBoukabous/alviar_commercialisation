'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Layout } from '@/components/layout';
import { ThemeCard } from '@/lib/theme/ThemeProvider';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

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

  const stats = [
    {
      name: 'Utilisateurs actifs',
      value: '2,345',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Sessions liveness',
      value: '1,234',
      change: '+8%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Taux de conversion',
      value: '89.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Revenus',
      value: '€45,678',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
    },
  ];

  return (
    <ThemeProvider>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">Dashboard</h1>
            <p className="mt-1 text-sm theme-text-secondary">
              Vue d'ensemble de votre activité liveness
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <ThemeCard key={stat.name} className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium theme-text-secondary truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold theme-text-primary">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </ThemeCard>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ThemeCard className="p-6">
              <h3 className="text-lg font-medium theme-text-primary mb-4">
                Activité récente
              </h3>
              <div className="h-64 flex items-center justify-center theme-text-secondary">
                <p>Graphique d'activité à venir...</p>
              </div>
            </ThemeCard>

            <ThemeCard className="p-6">
              <h3 className="text-lg font-medium theme-text-primary mb-4">
                Sessions par heure
              </h3>
              <div className="h-64 flex items-center justify-center theme-text-secondary">
                <p>Graphique des sessions à venir...</p>
              </div>
            </ThemeCard>
          </div>

          {/* Recent Activity */}
          <ThemeCard className="p-6">
            <h3 className="text-lg font-medium theme-text-primary mb-4">
              Activité récente
            </h3>
            <div className="space-y-4">
              {[
                { action: 'Nouvelle session liveness', user: 'John Doe', time: '2 min ago' },
                { action: 'Vérification terminée', user: 'Jane Smith', time: '5 min ago' },
                { action: 'Session échouée', user: 'Bob Johnson', time: '10 min ago' },
                { action: 'Nouvelle session liveness', user: 'Alice Brown', time: '15 min ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm theme-text-primary">
                      {activity.action} par {activity.user}
                    </p>
                    <p className="text-sm theme-text-secondary">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ThemeCard>
        </div>
      </Layout>
    </ThemeProvider>
  );
}
