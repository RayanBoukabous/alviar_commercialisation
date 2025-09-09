'use client';

import React from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { ThemeCard } from '@/lib/theme/ThemeProvider';

interface LivenessMetricsProps {
  activeSessions: number;
  completedToday: number;
  failedToday: number;
  averageResponseTime: number;
  successRate: number;
  totalSessions: number;
  isLoading?: boolean;
}

export function LivenessMetrics({
  activeSessions,
  completedToday,
  failedToday,
  averageResponseTime,
  successRate,
  totalSessions,
  isLoading = false,
}: LivenessMetricsProps) {
  if (isLoading) {
    return (
      <ThemeCard className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold theme-text-primary flex items-center space-x-2">
            <Activity className="w-6 h-6 text-green-500" />
            <span>Métriques Liveness</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm theme-text-secondary">Chargement...</span>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ThemeCard>
    );
  }

  const successPercentage = totalSessions > 0 ? Math.round((completedToday / totalSessions) * 100) : 0;
  const failurePercentage = totalSessions > 0 ? Math.round((failedToday / totalSessions) * 100) : 0;

  return (
    <ThemeCard className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold theme-text-primary flex items-center space-x-2">
          <Activity className="w-6 h-6 text-green-500" />
          <span>Métriques Liveness</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm theme-text-secondary">Temps réel</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Sessions actives */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium theme-text-secondary">Sessions actives</p>
              <p className="text-2xl font-bold theme-text-primary">{activeSessions}</p>
            </div>
          </div>
        </div>

        {/* Taux de succès */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium theme-text-secondary">Taux de succès</p>
              <p className="text-2xl font-bold theme-text-primary">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium theme-text-primary">Terminées aujourd'hui</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">{completedToday}</span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(successPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium theme-text-primary">Échouées aujourd'hui</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{failedToday}</span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(failurePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium theme-text-primary">Temps de réponse moyen</span>
          </div>
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{averageResponseTime}ms</span>
        </div>
      </div>

      {/* Indicateur de performance global */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium theme-text-primary">Performance globale</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">{successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${successRate}%` }}
          ></div>
        </div>
      </div>
    </ThemeCard>
  );
}
