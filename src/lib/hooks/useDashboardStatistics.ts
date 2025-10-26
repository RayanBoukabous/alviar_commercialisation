import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStatistics } from '@/lib/api/dashboardService';

// Clés de requête pour le cache
export const dashboardStatisticsKeys = {
    all: ['dashboard-statistics'] as const,
    statistics: () => [...dashboardStatisticsKeys.all, 'statistics'] as const,
};

// Hook pour récupérer les statistiques du dashboard
export const useDashboardStatistics = () => {
    return useQuery({
        queryKey: dashboardStatisticsKeys.statistics(),
        queryFn: () => dashboardService.getDashboardStatistics(),
        staleTime: 30000, // 30 secondes
        refetchInterval: 60000, // Rafraîchissement automatique toutes les minutes
        retry: 3,
        retryDelay: 1000,
    });
};

export default useDashboardStatistics;
