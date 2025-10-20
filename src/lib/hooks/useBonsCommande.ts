import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getBonsDeCommande,
    getBonDeCommandeById,
    createBonDeCommande,
    updateBonDeCommande,
    deleteBonDeCommande,
    updateBonStatus,
    annulerBon,
    getBonDeCommandeStats,
    BonDeCommandeListParams,
    CreateBonDeCommandeRequest
} from '@/lib/api/bonCommandeService';

/**
 * Hook pour récupérer la liste des bons de commande
 */
export const useBonsDeCommande = (params?: BonDeCommandeListParams) => {
    return useQuery({
        queryKey: ['bons-commande', params],
        queryFn: () => getBonsDeCommande(params),
    });
};

/**
 * Hook pour récupérer un bon de commande par ID
 */
export const useBonDeCommandeDetails = (id: number) => {
    return useQuery({
        queryKey: ['bon-commande', id],
        queryFn: () => getBonDeCommandeById(id),
        enabled: !!id,
    });
};

/**
 * Hook pour créer un bon de commande
 */
export const useCreateBonDeCommande = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBonDeCommandeRequest) => createBonDeCommande(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande-stats'] });
        },
    });
};

/**
 * Hook pour mettre à jour un bon de commande
 */
export const useUpdateBonDeCommande = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateBonDeCommandeRequest> }) =>
            updateBonDeCommande(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande-stats'] });
        },
    });
};

/**
 * Hook pour supprimer un bon de commande
 */
export const useDeleteBonDeCommande = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteBonDeCommande(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande-stats'] });
        },
    });
};

/**
 * Hook pour mettre à jour le statut d'un bon
 */
export const useUpdateBonStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, statut, date_livraison_reelle }: { id: number; statut: string; date_livraison_reelle?: string }) =>
            updateBonStatus(id, statut, date_livraison_reelle),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande-stats'] });
        },
    });
};

/**
 * Hook pour annuler un bon
 */
export const useAnnulerBon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => annulerBon(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande', id] });
            queryClient.invalidateQueries({ queryKey: ['bon-commande-stats'] });
        },
    });
};

/**
 * Hook pour récupérer les statistiques
 */
export const useBonDeCommandeStats = () => {
    return useQuery({
        queryKey: ['bon-commande-stats'],
        queryFn: getBonDeCommandeStats,
    });
};

