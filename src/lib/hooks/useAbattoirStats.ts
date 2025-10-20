import { useQuery } from '@tanstack/react-query';
import { abattoirStatsService, DashboardStats, AbattoirsForChartsResponse, Abattoir, AbattoirLivestockStats } from '@/lib/api/abattoirStatsService';

// Clés de requête
export const abattoirStatsKeys = {
    all: ['abattoir-stats'] as const,
    dashboard: () => [...abattoirStatsKeys.all, 'dashboard'] as const,
    myAbattoir: () => [...abattoirStatsKeys.all, 'my-abattoir'] as const,
    global: () => [...abattoirStatsKeys.all, 'global'] as const,
    abattoirsForCharts: () => [...abattoirStatsKeys.all, 'abattoirs-for-charts'] as const,
    list: () => [...abattoirStatsKeys.all, 'list'] as const,
    livestockStats: (abattoirId: number) => [...abattoirStatsKeys.all, 'livestock-stats', abattoirId] as const,
};

// Hook pour les statistiques du dashboard
export const useDashboardStats = () => {
    return useQuery<DashboardStats, Error>({
        queryKey: abattoirStatsKeys.dashboard(),
        queryFn: abattoirStatsService.getDashboardStats,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};

// Hook pour les statistiques de l'abattoir de l'utilisateur
export const useMyAbattoirStats = () => {
    return useQuery({
        queryKey: abattoirStatsKeys.myAbattoir(),
        queryFn: abattoirStatsService.getMyAbattoirStats,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        refetchOnWindowFocus: false,
    });
};

// Hook pour les statistiques globales (superviseurs)
export const useGlobalStats = () => {
    return useQuery({
        queryKey: abattoirStatsKeys.global(),
        queryFn: abattoirStatsService.getGlobalStats,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les abattoirs pour les graphiques
export const useAbattoirsForCharts = () => {
    return useQuery<AbattoirsForChartsResponse, Error>({
        queryKey: abattoirStatsKeys.abattoirsForCharts(),
        queryFn: abattoirStatsService.getAbattoirsForCharts,
        staleTime: 10 * 60 * 1000, // 10 minutes (les abattoirs changent rarement)
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};

// Hook pour récupérer la liste des abattoirs
export const useAbattoirsList = () => {
    return useQuery<Abattoir[], Error>({
        queryKey: abattoirStatsKeys.list(),
        queryFn: abattoirStatsService.getAbattoirsList,
        staleTime: 10 * 60 * 1000, // 10 minutes (les abattoirs changent rarement)
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};

// Hook pour récupérer les statistiques détaillées du bétail d'un abattoir
export const useAbattoirLivestockStats = (abattoirId: number) => {
    return useQuery<AbattoirLivestockStats, Error>({
        queryKey: abattoirStatsKeys.livestockStats(abattoirId),
        queryFn: () => abattoirStatsService.getAbattoirLivestockStats(abattoirId),
        enabled: !!abattoirId,
        staleTime: 2 * 60 * 1000, // 2 minutes (les stats changent plus souvent)
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};
