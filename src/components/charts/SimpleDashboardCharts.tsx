'use client';

import React from 'react';
import SpeciesSlaughterChart from './SpeciesSlaughterChart';
import RealSpeciesSlaughterChart from './RealSpeciesSlaughterChart';
import SlaughterTrendsChart from './SlaughterTrendsChart';

interface SimpleDashboardChartsProps {
  usersData: number;
  adminsData: number;
  clientsData: number;
  sessionsData: number;
  rolesData: number;
  permissionsData: number;
  isLoading?: boolean;
}

export function SimpleDashboardCharts({
  usersData,
  adminsData,
  clientsData,
  sessionsData,
  rolesData,
  permissionsData,
  isLoading = false,
}: SimpleDashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Graphique de répartition par espèce et abattoir - DONNÉES RÉELLES */}
      <RealSpeciesSlaughterChart isLoading={isLoading} />

      {/* Graphique des tendances temporelles */}
      <SlaughterTrendsChart isLoading={isLoading} />
    </div>
  );
}
