'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  Server,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { logsService, LogStats } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function LogsStatsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading } = useTranslation('logs');
  const router = useRouter();
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔄 Début du chargement des statistiques des logs...');
        
        const response = await logsService.getLogStats({});
        console.log('📊 Statistiques récupérées:', response);
        
        setStats(response);
        console.log('✅ Statistiques chargées avec succès');
      } catch (err) {
        console.error('❌ Erreur lors du chargement des statistiques:', err);
        setError(t('loading_error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await logsService.getLogStats({});
      setStats(response);
      console.log('Statistiques rafraîchies:', response);
    } catch (err) {
      setError(t('refresh_error'));
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warn':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition">
      {/* Header */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                <BarChart3 className="h-7 w-7 mr-3 text-primary-600" />
                {t('stats.title')}
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">{t('stats.description')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Statistiques par niveau */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 theme-text-primary" />
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">
                    {t('stats.levels')}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.levels.map((level: any) => (
                    <div key={level.key} className="theme-bg-secondary rounded-lg p-4 theme-transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getLevelIcon(level.key)}
                          <div>
                            <div className="font-medium theme-text-primary theme-transition">
                              {level.key.toUpperCase()}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {level.doc_count} {level.doc_count === 1 ? t('stats.log_count') : t('stats.logs_count')}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelBadgeColor(level.key)}`}>
                          {level.doc_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistiques par service */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 theme-text-primary" />
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">
                    {t('stats.services')}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.services.map((service: any) => (
                    <div key={service.key} className="theme-bg-secondary rounded-lg p-4 theme-transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Server className="h-4 w-4 theme-text-tertiary theme-transition" />
                          <div>
                            <div className="font-mono text-sm font-medium theme-text-primary theme-transition">
                              {service.key}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {service.doc_count} {service.doc_count === 1 ? t('stats.log_count') : t('stats.logs_count')}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-sm bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-900 px-3 py-1.5 rounded-full font-semibold shadow-sm">
                          {service.doc_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 theme-text-primary" />
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">
                    {t('stats.timeline')}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.timeline.map((time: any) => (
                    <div key={time.key} className="theme-bg-secondary rounded-lg p-4 theme-transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 theme-text-tertiary theme-transition" />
                          <div>
                            <div className="font-medium theme-text-primary theme-transition">
                              {formatDate(time.key_as_string)}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {new Date(time.key_as_string).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-xs theme-text-tertiary theme-transition">
                              Timestamp: {time.key}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold theme-text-primary theme-transition">
                            {time.doc_count}
                          </div>
                          <div className="text-sm theme-text-secondary theme-transition">
                            {time.doc_count === 1 ? t('stats.log_count') : t('stats.logs_count')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('no_logs')}</h3>
            <p className="theme-text-secondary theme-transition">{t('stats.description')}</p>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
