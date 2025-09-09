'use client';

import React from 'react';
import { Settings, Eye, Users, Volume2 } from 'lucide-react';
import { ThemeCard } from '@/lib/theme/ThemeProvider';

interface ConfigsMetricsProps {
  livenessConfigs: number;
  matchingConfigs: number;
  silentLivenessConfigs: number;
  totalConfigs: number;
  isLoading?: boolean;
}

export function ConfigsMetrics({
  livenessConfigs,
  matchingConfigs,
  silentLivenessConfigs,
  totalConfigs,
  isLoading = false,
}: ConfigsMetricsProps) {
  if (isLoading) {
    return (
      <ThemeCard className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold theme-text-primary flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-500" />
            <span>Configurations</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm theme-text-secondary">Chargement...</span>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ThemeCard>
    );
  }

  const configTypes = [
    {
      name: 'Liveness',
      count: livenessConfigs,
      icon: Eye,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Vérification de présence',
    },
    {
      name: 'Matching',
      count: matchingConfigs,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Correspondance faciale',
    },
    {
      name: 'Silent Liveness',
      count: silentLivenessConfigs,
      icon: Volume2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Détection silencieuse',
    },
  ];

  return (
    <ThemeCard className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold theme-text-primary flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>Configurations</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm theme-text-secondary">Temps réel</span>
        </div>
      </div>
      
      {/* Total des configurations */}
      <div className="mb-6 p-4 theme-bg-tertiary rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium theme-text-secondary">Total des configurations</p>
            <p className="text-2xl font-bold theme-text-primary">{totalConfigs}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>


      {/* Types de configurations */}
      <div className="grid grid-cols-1 gap-4">
        {configTypes.map((config, index) => {
          const Icon = config.icon;
          const percentage = totalConfigs > 0 ? Math.round((config.count / totalConfigs) * 100) : 0;
          
          return (
            <div key={config.name} className="p-4 theme-bg-tertiary rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium theme-text-primary">{config.name}</p>
                    <p className="text-xs theme-text-tertiary">{config.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold theme-text-primary">{config.count}</p>
                  <p className="text-xs theme-text-secondary">{percentage}%</p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full theme-bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques globales */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 theme-bg-tertiary rounded-lg">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{livenessConfigs}</p>
          <p className="text-xs theme-text-secondary">Liveness</p>
        </div>
        <div className="text-center p-3 theme-bg-tertiary rounded-lg">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{matchingConfigs}</p>
          <p className="text-xs theme-text-secondary">Matching</p>
        </div>
        <div className="text-center p-3 theme-bg-tertiary rounded-lg">
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{silentLivenessConfigs}</p>
          <p className="text-xs theme-text-secondary">Silent</p>
        </div>
      </div>
    </ThemeCard>
  );
}
