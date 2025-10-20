import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abattoirService, AbattoirFilters, AbattoirResponse, Abattoir, AbattoirDetailResponse } from '@/lib/api/abattoirService';

// Clés de requête
export const abattoirKeys = {
    all: ['abattoirs'] as const,
    lists: () => [...abattoirKeys.all, 'list'] as const,
    list: (filters: AbattoirFilters) => [...abattoirKeys.lists(), filters] as const,
    details: () => [...abattoirKeys.all, 'detail'] as const,
    detail: (id: number) => [...abattoirKeys.details(), id] as const,
    detailWithFacilities: (id: number) => [...abattoirKeys.details(), id, 'facilities'] as const,
};

// Hook pour récupérer les abattoirs avec filtres
export const useAbattoirs = (filters: AbattoirFilters = {}) => {
    return useQuery<AbattoirResponse, Error>({
        queryKey: abattoirKeys.list(filters),
        queryFn: () => abattoirService.getAbattoirs(filters),
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

// Hook pour récupérer les détails d'un abattoir
export const useAbattoirDetails = (id: number) => {
    return useQuery<Abattoir, Error>({
        queryKey: abattoirKeys.detail(id),
        queryFn: () => abattoirService.getAbattoirDetails(id),
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

// Hook pour récupérer les détails d'un abattoir avec ses chambres froides
export const useAbattoirDetailWithFacilities = (id: number) => {
    return useQuery<AbattoirDetailResponse, Error>({
        queryKey: abattoirKeys.detailWithFacilities(id),
        queryFn: () => abattoirService.getAbattoirDetailWithFacilities(id),
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

// Hook pour mettre à jour un abattoir
export const useUpdateAbattoir = () => {
    const queryClient = useQueryClient();

    return useMutation<Abattoir, Error, { id: number; data: Partial<Abattoir> }>({
        mutationFn: ({ id, data }) => abattoirService.updateAbattoir(id, data),
        onSuccess: (updatedAbattoir, variables) => {
            // Invalider et refetch les détails de l'abattoir
            queryClient.invalidateQueries({ queryKey: abattoirKeys.detail(variables.id) });

            // Invalider toutes les listes d'abattoirs pour les mettre à jour
            queryClient.invalidateQueries({ queryKey: abattoirKeys.all });

            // Optionnel: mettre à jour directement le cache
            queryClient.setQueryData(abattoirKeys.detail(variables.id), updatedAbattoir);
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour de l\'abattoir:', error);
        },
    });
};

// Hook pour créer un abattoir
export const useCreateAbattoir = () => {
    const queryClient = useQueryClient();

    return useMutation<Abattoir, Error, Partial<Abattoir>>({
        mutationFn: (data) => abattoirService.createAbattoir(data),
        onSuccess: () => {
            // Invalider toutes les listes d'abattoirs pour les mettre à jour
            queryClient.invalidateQueries({ queryKey: abattoirKeys.all });
        },
        onError: (error) => {
            console.error('Erreur lors de la création de l\'abattoir:', error);
        },
    });
};

// Hook pour supprimer un abattoir
export const useDeleteAbattoir = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => abattoirService.deleteAbattoir(id),
        onSuccess: (_, id) => {
            // Invalider toutes les listes d'abattoirs pour les mettre à jour
            queryClient.invalidateQueries({ queryKey: abattoirKeys.all });

            // Supprimer les détails de l'abattoir du cache
            queryClient.removeQueries({ queryKey: abattoirKeys.detail(id) });
        },
        onError: (error) => {
            console.error('Erreur lors de la suppression de l\'abattoir:', error);
        },
    });
};
