import { useQuery } from '@tanstack/react-query';
import {
    historiqueAbattoirService,
    HistoriqueAbattoirResponse,
    HistoriqueAbattoir,
    HistoriqueAbattoirFilters,
    HistoriqueAbattoirStatsResponse
} from '@/lib/api/historiqueAbattoirService';

// Clés de requête
export const historiqueAbattoirKeys = {
    all: ['historique-abattoir'] as const,
    lists: () => [...historiqueAbattoirKeys.all, 'list'] as const,
    list: (filters: HistoriqueAbattoirFilters) => [...historiqueAbattoirKeys.lists(), filters] as const,
    details: () => [...historiqueAbattoirKeys.all, 'detail'] as const,
    detail: (id: number) => [...historiqueAbattoirKeys.details(), id] as const,
    stats: () => [...historiqueAbattoirKeys.all, 'stats'] as const,
};

// Hook pour récupérer la liste des historiques
export const useHistoriqueAbattoirs = (filters: HistoriqueAbattoirFilters = {}) => {
    return useQuery<HistoriqueAbattoirResponse, Error>({
        queryKey: historiqueAbattoirKeys.list(filters),
        queryFn: () => historiqueAbattoirService.getHistoriques(filters),
        staleTime: 0, // Pas de cache - toujours considéré comme obsolète
        gcTime: 0, // Pas de cache - supprimer immédiatement
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true, // Rafraîchir quand on revient sur la page
        refetchOnMount: true, // Rafraîchir à chaque montage
        refetchOnReconnect: true, // Rafraîchir quand la connexion revient
    });
};

// Hook pour récupérer les détails d'un historique
export const useHistoriqueAbattoirDetail = (id: number) => {
    return useQuery<HistoriqueAbattoir, Error>({
        queryKey: historiqueAbattoirKeys.detail(id),
        queryFn: () => historiqueAbattoirService.getHistoriqueDetail(id),
        enabled: !!id,
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

// Hook pour récupérer les statistiques de l'historique
export const useHistoriqueAbattoirStats = () => {
    return useQuery<HistoriqueAbattoirStatsResponse, Error>({
        queryKey: historiqueAbattoirKeys.stats(),
        queryFn: historiqueAbattoirService.getHistoriqueStats,
        staleTime: 0, // Pas de cache - toujours considéré comme obsolète
        gcTime: 0, // Pas de cache - supprimer immédiatement
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true, // Rafraîchir quand on revient sur la page
        refetchOnMount: true, // Rafraîchir à chaque montage
        refetchOnReconnect: true, // Rafraîchir quand la connexion revient
    });
};
