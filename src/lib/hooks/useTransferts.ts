import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    transfertService,
    Transfert,
    CreateTransfertRequest,
    UpdateTransfertStatusRequest,
    TransfertFilters
} from '@/lib/api/transfertService';
import { toast } from 'react-hot-toast';

// Clés de requête
export const transfertKeys = {
    all: ['transferts'] as const,
    lists: () => [...transfertKeys.all, 'list'] as const,
    list: (filters: TransfertFilters) => [...transfertKeys.lists(), filters] as const,
    details: () => [...transfertKeys.all, 'detail'] as const,
    detail: (id: number) => [...transfertKeys.details(), id] as const,
    stats: () => [...transfertKeys.all, 'stats'] as const,
    betesDisponibles: (abattoirId?: number, search?: string, espece?: string, typeProduit?: string, page?: number) =>
        [...transfertKeys.all, 'betes-disponibles', abattoirId, search, espece, typeProduit, page] as const,
};

// Hook pour récupérer les transferts
export const useTransferts = (filters: TransfertFilters = {}) => {
    return useQuery({
        queryKey: transfertKeys.list(filters),
        queryFn: () => transfertService.getTransferts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer un transfert spécifique
export const useTransfert = (id: number) => {
    return useQuery({
        queryKey: transfertKeys.detail(id),
        queryFn: () => transfertService.getTransfert(id),
        enabled: !!id,
    });
};

// Hook pour récupérer les statistiques
export const useTransfertStats = () => {
    return useQuery({
        queryKey: transfertKeys.stats(),
        queryFn: transfertService.getTransfertStats,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook pour récupérer les bêtes disponibles avec pagination infinie
export const useBetesDisponibles = (
    abattoirId?: number,
    search?: string,
    espece?: string,
    typeProduit?: string,
    page: number = 1,
    pageSize: number = 30
) => {
    return useQuery({
        queryKey: transfertKeys.betesDisponibles(abattoirId, search, espece, typeProduit, page),
        queryFn: () => transfertService.getBetesDisponibles(abattoirId, search, espece, typeProduit, page, pageSize),
        enabled: !!abattoirId && !!espece && !!typeProduit,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook pour créer un transfert
export const useCreateTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransfertRequest) => transfertService.createTransfert(data),
        onSuccess: (newTransfert) => {
            // Invalider et refetch les listes
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });

            // Ajouter le nouveau transfert au cache
            queryClient.setQueryData(transfertKeys.detail(newTransfert.id), newTransfert);

            toast.success('Transfert créé avec succès');
        },
        onError: (error: any) => {
            console.error('Erreur lors de la création du transfert:', error);
            toast.error(error.response?.data?.detail || 'Erreur lors de la création du transfert');
        },
    });
};

// Hook pour mettre à jour le statut d'un transfert
export const useUpdateTransfertStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTransfertStatusRequest) => transfertService.updateTransfertStatus(data),
        onSuccess: (updatedTransfert) => {
            // Mettre à jour le cache
            queryClient.setQueryData(transfertKeys.detail(updatedTransfert.id), updatedTransfert);

            // Invalider les listes et stats
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });

            toast.success('Statut mis à jour avec succès');
        },
        onError: (error: any) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
            toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour du statut');
        },
    });
};

// Hook pour annuler un transfert
export const useAnnulerTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => transfertService.annulerTransfert(id),
        onSuccess: (updatedTransfert) => {
            // Mettre à jour le cache
            queryClient.setQueryData(transfertKeys.detail(updatedTransfert.id), updatedTransfert);

            // Invalider les listes et stats
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });

            toast.success('Transfert annulé avec succès');
        },
        onError: (error: any) => {
            console.error('Erreur lors de l\'annulation du transfert:', error);
            toast.error(error.response?.data?.detail || 'Erreur lors de l\'annulation du transfert');
        },
    });
};

// Hook pour livrer un transfert
export const useLivrerTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => transfertService.livrerTransfert(id),
        onSuccess: (updatedTransfert) => {
            // Mettre à jour le cache
            queryClient.setQueryData(transfertKeys.detail(updatedTransfert.id), updatedTransfert);

            // Invalider les listes et stats
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });

            toast.success('Transfert marqué comme livré');
        },
        onError: (error: any) => {
            console.error('Erreur lors de la livraison du transfert:', error);
            toast.error(error.response?.data?.detail || 'Erreur lors de la livraison du transfert');
        },
    });
};

// Hook pour confirmer la réception détaillée
export const useConfirmerReceptionDetaillee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { received_count: number; missing_betes?: string[]; received_betes?: number[] } }) =>
            transfertService.confirmerReceptionDetaillee(id, data),
        onSuccess: (response) => {
            // Mettre à jour le cache
            queryClient.setQueryData(transfertKeys.detail(response.transfert.id), response.transfert);

            // Invalider les listes et stats
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });

            toast.success(`Réception confirmée: ${response.betes_recues} bêtes reçues, ${response.betes_manquantes} manquantes`);
        },
        onError: (error: any) => {
            console.error('Erreur lors de la confirmation de réception:', error);
            toast.error(error.response?.data?.detail || 'Erreur lors de la confirmation de réception');
        },
    });
};