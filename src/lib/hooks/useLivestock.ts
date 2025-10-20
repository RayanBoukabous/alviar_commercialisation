import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { livestockService, LivestockFilters, LivestockResponse, Bete, CarcassStatistics } from '@/lib/api/livestockService';

// Clés de requête
export const livestockKeys = {
    all: ['livestock'] as const,
    lists: () => [...livestockKeys.all, 'list'] as const,
    list: (filters: LivestockFilters) => [...livestockKeys.lists(), filters] as const,
    live: (filters: Omit<LivestockFilters, 'statut'>) => [...livestockKeys.all, 'live', filters] as const,
    carcasses: (filters: Omit<LivestockFilters, 'statut'>) => [...livestockKeys.all, 'carcasses', filters] as const,
    carcassStats: (filters: Omit<LivestockFilters, 'statut'>) => [...livestockKeys.all, 'carcass-stats', filters] as const,
    stats: () => [...livestockKeys.all, 'stats'] as const,
    details: () => [...livestockKeys.all, 'detail'] as const,
    detail: (id: number) => [...livestockKeys.details(), id] as const,
};

// Hook pour récupérer les bêtes avec filtres
export const useLivestock = (filters: LivestockFilters = {}) => {
    return useQuery<LivestockResponse, Error>({
        queryKey: livestockKeys.list(filters),
        queryFn: () => livestockService.getLivestock(filters),
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

// Hook pour récupérer les bêtes vivantes
export const useLiveLivestock = (filters: Omit<LivestockFilters, 'statut'> = {}) => {
    // Créer une clé de requête unique qui inclut tous les filtres
    const queryKey = ['livestock', 'live', JSON.stringify(filters)];

    return useQuery<LivestockResponse, Error>({
        queryKey,
        queryFn: () => {
            console.log('useLiveLivestock queryFn called with filters:', filters);
            return livestockService.getLiveLivestock(filters);
        },
        staleTime: 0, // Toujours considérer les données comme périmées pour permettre le refetch
        gcTime: 5 * 60 * 1000,
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

// Hook pour récupérer les carcasses
export const useCarcasses = (filters: Omit<LivestockFilters, 'statut'> = {}) => {
    return useQuery<LivestockResponse, Error>({
        queryKey: livestockKeys.carcasses(filters),
        queryFn: () => livestockService.getCarcasses(filters),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
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

// Hook pour récupérer les statistiques
export const useLivestockStats = () => {
    return useQuery<LivestockResponse, Error>({
        queryKey: livestockKeys.stats(),
        queryFn: () => livestockService.getLivestockStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes (les stats changent moins souvent)
        gcTime: 10 * 60 * 1000,
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

// Hook pour la pagination infinie des bêtes
export const useInfiniteLivestock = (filters: LivestockFilters = {}) => {
    return useInfiniteQuery<LivestockResponse, Error>({
        queryKey: livestockKeys.list(filters),
        queryFn: ({ pageParam = 1 }) =>
            livestockService.getLivestock({ ...filters, page: pageParam as number }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.has_next) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les détails d'une bête
export const useBeteDetails = (id: number) => {
    return useQuery<Bete, Error>({
        queryKey: livestockKeys.detail(id),
        queryFn: () => livestockService.getBeteDetails(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
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

// Hook pour mettre à jour une bête
export const useUpdateBete = () => {
    const queryClient = useQueryClient();

    return useMutation<Bete, Error, { id: number; data: Partial<Bete> }>({
        mutationFn: ({ id, data }) => livestockService.updateBete(id, data),
        onSuccess: (updatedBete, variables) => {
            // Invalider et refetch les détails de la bête
            queryClient.invalidateQueries({ queryKey: livestockKeys.detail(variables.id) });

            // Invalider toutes les listes de bêtes pour les mettre à jour
            queryClient.invalidateQueries({ queryKey: livestockKeys.all });

            // Optionnel: mettre à jour directement le cache
            queryClient.setQueryData(livestockKeys.detail(variables.id), updatedBete);
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour de la bête:', error);
        },
    });
};

// Hook pour récupérer les statistiques des carcasses
export const useCarcassStatistics = (filters: Omit<LivestockFilters, 'statut'> = {}) => {
    return useQuery<CarcassStatistics, Error>({
        queryKey: livestockKeys.carcassStats(filters),
        queryFn: () => livestockService.getCarcassStatistics(filters),
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
    });
};
