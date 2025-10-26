import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transfertService, Transfert, TransfertCreate, TransfertUpdate, TransfertFilters, AjouterBete, RetirerBete, LivrerTransfert, AnnulerTransfert, TransfertStats } from '../api/transfertService';

// Clés de requête
export const transfertKeys = {
    all: ['transferts'] as const,
    lists: () => [...transfertKeys.all, 'list'] as const,
    list: (filters: TransfertFilters) => [...transfertKeys.lists(), filters] as const,
    details: () => [...transfertKeys.all, 'detail'] as const,
    detail: (id: number) => [...transfertKeys.details(), id] as const,
    stats: () => [...transfertKeys.all, 'stats'] as const,
};

// Hook pour récupérer tous les transferts
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

// Hook pour les statistiques des transferts
export const useTransfertStats = () => {
    return useQuery({
        queryKey: transfertKeys.stats(),
        queryFn: () => transfertService.getStats(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook pour créer un transfert
export const useCreateTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TransfertCreate) => transfertService.createTransfert(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });
        },
    });
};

// Hook pour mettre à jour un transfert
export const useUpdateTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TransfertUpdate }) =>
            transfertService.updateTransfert(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
        },
    });
};

// Hook pour supprimer un transfert
export const useDeleteTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => transfertService.deleteTransfert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });
        },
    });
};

// Hook pour ajouter une bête au transfert
export const useAjouterBete = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AjouterBete }) =>
            transfertService.ajouterBete(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
        },
    });
};

// Hook pour retirer une bête du transfert
export const useRetirerBete = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RetirerBete }) =>
            transfertService.retirerBete(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
        },
    });
};

// Hook pour mettre un transfert en livraison
export const useMettreEnLivraisonTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => transfertService.mettreEnLivraisonTransfert(id),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });
            // Invalider aussi les réceptions car le statut change
            queryClient.invalidateQueries({ queryKey: ['receptions'] });
            queryClient.invalidateQueries({ queryKey: ['receptions', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['receptions', 'stats'] });
            // Invalidation plus agressive
            queryClient.invalidateQueries({ queryKey: ['receptions'], exact: false });
            queryClient.refetchQueries({ queryKey: ['receptions'] });
        },
    });
};

// Hook pour livrer un transfert
export const useLivrerTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data?: LivrerTransfert }) =>
            transfertService.livrerTransfert(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });
            // Invalider aussi les réceptions car le statut change
            queryClient.invalidateQueries({ queryKey: ['receptions'] });
            queryClient.invalidateQueries({ queryKey: ['receptions', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['receptions', 'stats'] });
        },
    });
};

// Hook pour annuler un transfert
export const useAnnulerTransfert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AnnulerTransfert }) =>
            transfertService.annulerTransfert(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: transfertKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transfertKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transfertKeys.stats() });
            // Invalider aussi les réceptions
            queryClient.invalidateQueries({ queryKey: ['receptions'] });
        },
    });
};

// Hook pour les transferts de l'utilisateur connecté
export const useMesTransferts = (filters: Omit<TransfertFilters, 'mes_transferts'> = {}) => {
    return useTransferts({ ...filters, mes_transferts: true });
};

// Hook pour les transferts en cours
export const useTransfertsEnCours = (filters: Omit<TransfertFilters, 'en_cours'> = {}) => {
    return useTransferts({ ...filters, en_cours: true });
};

// Hook pour les transferts livrés
export const useTransfertsLivres = (filters: Omit<TransfertFilters, 'statut'> = {}) => {
    return useTransferts({ ...filters, statut: 'LIVRE' });
};

// Hook pour les transferts annulés
export const useTransfertsAnnules = (filters: Omit<TransfertFilters, 'statut'> = {}) => {
    return useTransferts({ ...filters, statut: 'ANNULE' });
};

// Hook pour les transferts par abattoir expéditeur
export const useTransfertsParAbattoirExpediteur = (abattoirId: number, filters: Omit<TransfertFilters, 'abattoir_expediteur'> = {}) => {
    return useTransferts({
        ...filters,
        abattoir_expediteur: abattoirId,
    });
};

// Hook pour les transferts par abattoir destinataire
export const useTransfertsParAbattoirDestinataire = (abattoirId: number, filters: Omit<TransfertFilters, 'abattoir_destinataire'> = {}) => {
    return useTransferts({
        ...filters,
        abattoir_destinataire: abattoirId,
    });
};