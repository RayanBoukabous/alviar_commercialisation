import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTemperatureHistory,
    createTemperatureMeasurement,
    getTemperatureStats,
    TemperatureHistoryFilters,
    TemperatureRecord
} from '@/lib/api/temperatureHistoryService';

// Clés de requête
export const temperatureHistoryKeys = {
    all: ['temperatureHistory'] as const,
    lists: () => [...temperatureHistoryKeys.all, 'list'] as const,
    list: (filters: TemperatureHistoryFilters) => [...temperatureHistoryKeys.lists(), filters] as const,
    details: () => [...temperatureHistoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...temperatureHistoryKeys.details(), id] as const,
    stats: (abattoirId: number) => [...temperatureHistoryKeys.all, 'stats', abattoirId] as const,
};

/**
 * Hook pour récupérer l'historique des températures
 */
export const useTemperatureHistory = (filters: TemperatureHistoryFilters = {}) => {
    return useQuery({
        queryKey: temperatureHistoryKeys.list(filters),
        queryFn: () => getTemperatureHistory(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!filters.abattoir_id, // Seulement si un abattoir est spécifié
    });
};

/**
 * Hook pour créer une nouvelle mesure de température
 */
export const useCreateTemperatureMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTemperatureMeasurement,
        onSuccess: (data) => {
            // Invalider les caches liés aux températures
            queryClient.invalidateQueries({ queryKey: temperatureHistoryKeys.all });

            // Invalider les statistiques pour l'abattoir concerné
            if (data.chambre_froide) {
                queryClient.invalidateQueries({
                    queryKey: temperatureHistoryKeys.stats(data.chambre_froide)
                });
            }
        },
        onError: (error) => {
            console.error('Erreur lors de la création de la mesure de température:', error);
        },
    });
};

/**
 * Hook pour récupérer les statistiques des températures
 */
export const useTemperatureStats = (abattoirId: number) => {
    return useQuery({
        queryKey: temperatureHistoryKeys.stats(abattoirId),
        queryFn: () => getTemperatureStats(abattoirId),
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!abattoirId,
    });
};

/**
 * Hook pour récupérer l'historique des températures d'un abattoir spécifique
 */
export const useAbattoirTemperatureHistory = (abattoirId: number, options?: {
    date_debut?: string;
    date_fin?: string;
    page_size?: number;
}) => {
    return useTemperatureHistory({
        abattoir_id: abattoirId,
        ...options,
    });
};

/**
 * Hook pour récupérer l'historique des températures d'une chambre froide spécifique
 */
export const useChambreTemperatureHistory = (chambreFroideId: number, options?: {
    date_debut?: string;
    date_fin?: string;
    page_size?: number;
}) => {
    return useTemperatureHistory({
        chambre_froide_id: chambreFroideId,
        ...options,
    });
};
