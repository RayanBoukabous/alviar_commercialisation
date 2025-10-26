import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
    stabulationService,
    Stabulation,
    CreateStabulationRequest,
    UpdateStabulationRequest,
    StabulationStats,
    StabulationsResponse,
    HistoriqueResponse,
    HistoriqueStabulation
} from '@/lib/api/stabulationService';
import { useLiveLivestock } from './useLivestock';
import { useEspeces } from './useEspeces';
import { livestockService } from '@/lib/api/livestockService';

// Clés de requête
export const stabulationKeys = {
    all: ['stabulations'] as const,
    lists: () => [...stabulationKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...stabulationKeys.lists(), filters] as const,
    details: () => [...stabulationKeys.all, 'detail'] as const,
    detail: (id: number) => [...stabulationKeys.details(), id] as const,
    stats: (filters?: Record<string, any>) => [...stabulationKeys.all, 'stats', filters] as const,
    abattoir: (abattoirId: number, filters?: Record<string, any>) =>
        [...stabulationKeys.all, 'abattoir', abattoirId, filters] as const,
};

// Hook pour récupérer la liste des stabulations
export const useStabulations = (params?: {
    abattoir_id?: number;
    type_bete?: string;
    statut?: string;
    date_debut?: string;
    date_fin?: string;
    search?: string;
    page?: number;
    page_size?: number;
}) => {
    return useQuery({
        queryKey: stabulationKeys.list(params || {}),
        queryFn: () => stabulationService.getStabulations(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer une stabulation par ID
export const useStabulation = (id: number) => {
    return useQuery({
        queryKey: stabulationKeys.detail(id),
        queryFn: () => stabulationService.getStabulation(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Hook pour récupérer les détails d'une stabulation (alias pour useStabulation)
export const useStabulationDetail = (id: number) => {
    return useStabulation(id);
};



// Hook pour récupérer les stabulations d'un abattoir
export const useStabulationsByAbattoir = (abattoirId: number, params?: {
    statut?: string;
    type_bete?: string;
}) => {
    return useQuery({
        queryKey: stabulationKeys.abattoir(abattoirId, params),
        queryFn: () => stabulationService.getStabulationsByAbattoir(abattoirId, params),
        enabled: !!abattoirId,
        staleTime: 5 * 60 * 1000,
    });
};

// Hook pour récupérer toutes les stabulations (pour les superusers)
export const useAllStabulations = (params?: {
    statut?: string;
    type_bete?: string;
    abattoir_id?: number;
}) => {
    return useQuery({
        queryKey: [...stabulationKeys.all, 'all', params],
        queryFn: () => stabulationService.getAllStabulations(params),
        staleTime: 5 * 60 * 1000,
    });
};

// Hook pour récupérer les statistiques des stabulations
export const useStabulationStats = (params?: {
    abattoir_id?: number;
}) => {
    return useQuery({
        queryKey: stabulationKeys.stats(params),
        queryFn: () => stabulationService.getStabulationStats(params),
        staleTime: 5 * 60 * 1000,
    });
};

// Hook pour créer une stabulation
export const useCreateStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStabulationRequest) => stabulationService.createStabulation(data),
        onSuccess: (newStabulation) => {
            // Invalider toutes les requêtes de stabulations
            queryClient.invalidateQueries({ queryKey: stabulationKeys.all });

            // Invalider les listes de stabulations
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });

            // Invalider les stabulations de l'abattoir
            if (newStabulation.abattoir) {
                queryClient.invalidateQueries({
                    queryKey: stabulationKeys.abattoir(newStabulation.abattoir)
                });
            }

            // Invalider les requêtes "all" pour les superusers
            queryClient.invalidateQueries({
                queryKey: [...stabulationKeys.all, 'all']
            });
        },
    });
};

// Hook pour mettre à jour une stabulation
export const useUpdateStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateStabulationRequest }) =>
            stabulationService.updateStabulation(id, data),
        onSuccess: (updatedStabulation) => {
            // Mettre à jour le cache de la stabulation
            queryClient.setQueryData(
                stabulationKeys.detail(updatedStabulation.id),
                updatedStabulation
            );

            // Invalider les listes
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });

            // Invalider les stabulations de l'abattoir
            if (updatedStabulation.abattoir) {
                queryClient.invalidateQueries({
                    queryKey: stabulationKeys.abattoir(updatedStabulation.abattoir)
                });
            }
        },
    });
};

// Hook pour supprimer une stabulation
export const useDeleteStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => stabulationService.deleteStabulation(id),
        onSuccess: (_, deletedId) => {
            // Supprimer de la cache
            queryClient.removeQueries({ queryKey: stabulationKeys.detail(deletedId) });

            // Invalider les listes
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });
        },
    });
};

// Hook pour terminer une stabulation
export const useTerminerStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, poidsData }: { id: number; poidsData: Array<{ bete_id: number, poids_a_chaud: number, num_boucle_post_abattage: string }> }) =>
            stabulationService.terminerStabulation(id, poidsData),
        onSuccess: (result) => {
            // Invalider les requêtes SEULEMENT en cas de succès
            queryClient.invalidateQueries({ queryKey: stabulationKeys.all });
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });
            queryClient.invalidateQueries({ queryKey: stabulationKeys.detail(result.stabulation.id) });
        },
        onError: (error) => {
            console.error('Erreur lors de la finalisation:', error);
            // Ne rien faire en cas d'erreur
        },
        retry: false,
    });
};

// Hook pour annuler une stabulation
export const useAnnulerStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, raisonAnnulation }: { id: number; raisonAnnulation: string }) =>
            stabulationService.annulerStabulation(id, raisonAnnulation),
        onSuccess: (result) => {
            // Invalider toutes les requêtes de stabulations
            queryClient.invalidateQueries({ queryKey: stabulationKeys.all });

            // Invalider les listes
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });

            // Invalider la stabulation spécifique
            queryClient.invalidateQueries({ queryKey: stabulationKeys.detail(result.stabulation.id) });

            // Invalider les requêtes "all" pour les superusers
            queryClient.invalidateQueries({
                queryKey: [...stabulationKeys.all, 'all']
            });
        },
    });
};

// Hook pour ajouter des bêtes à une stabulation
export const useAjouterBetesStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, betesIds }: { id: number; betesIds: number[] }) =>
            stabulationService.ajouterBetes(id, betesIds),
        onSuccess: (updatedStabulation) => {
            // Mettre à jour le cache
            queryClient.setQueryData(
                stabulationKeys.detail(updatedStabulation.id),
                updatedStabulation
            );

            // Invalider les listes
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });
        },
    });
};

// Hook pour retirer des bêtes d'une stabulation
export const useRetirerBetesStabulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, betesIds }: { id: number; betesIds: number[] }) =>
            stabulationService.retirerBetes(id, betesIds),
        onSuccess: (updatedStabulation) => {
            // Mettre à jour le cache
            queryClient.setQueryData(
                stabulationKeys.detail(updatedStabulation.id),
                updatedStabulation
            );

            // Invalider les listes
            queryClient.invalidateQueries({ queryKey: stabulationKeys.lists() });

            // Invalider les statistiques
            queryClient.invalidateQueries({ queryKey: stabulationKeys.stats() });
        },
    });
};

// Hook pour récupérer les bêtes disponibles pour stabulation avec recherche et pagination
export const useBetesDisponibles = (abattoirId: number, especeNom?: string, search?: string, page: number = 1) => {
    return useLiveLivestock({
        abattoir_id: abattoirId,
        espece_nom: especeNom,
        search: search,
        page: page,
        page_size: 100 // 100 bêtes par page par défaut
        // Pas de filtre statut spécifique, donc par défaut VIVANT et EN_STABULATION
    });
};

// Hook pour récupérer les bêtes disponibles avec pagination infinie
export const useBetesDisponiblesInfinite = (abattoirId: number, especeNom?: string, search?: string) => {
    return useInfiniteQuery({
        queryKey: ['betes-disponibles', abattoirId, especeNom, search],
        queryFn: ({ pageParam = 1 }) =>
            livestockService.getLiveLivestock({
                abattoir_id: abattoirId,
                espece_nom: especeNom,
                search: search,
                page: pageParam,
                page_size: 50
            }),
        getNextPageParam: (lastPage) => {
            const { pagination } = lastPage;
            return pagination.has_next ? pagination.page + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer les espèces disponibles
export const useEspecesDisponibles = () => {
    return useEspeces();
};

// Hook pour récupérer l'historique des modifications d'une stabulation
export const useHistoriqueStabulation = (id: number) => {
    return useQuery<HistoriqueResponse, Error>({
        queryKey: [...stabulationKeys.detail(id), 'historique'],
        queryFn: () => stabulationService.getHistoriqueStabulation(id),
        enabled: !!id,
        staleTime: 30 * 1000, // 30 secondes
    });
};

