import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receptionService, Reception, ReceptionCreate, ReceptionUpdate, ReceptionFilters, ConfirmerReception, AnnulerReception, ReceptionStats } from '../api/receptionService';

// Clés de requête
export const receptionKeys = {
    all: ['receptions'] as const,
    lists: () => [...receptionKeys.all, 'list'] as const,
    list: (filters: ReceptionFilters) => [...receptionKeys.lists(), filters] as const,
    details: () => [...receptionKeys.all, 'detail'] as const,
    detail: (id: number) => [...receptionKeys.details(), id] as const,
    stats: () => [...receptionKeys.all, 'stats'] as const,
};

// Hook pour récupérer toutes les réceptions
export const useReceptions = (filters: ReceptionFilters = {}) => {
    return useQuery({
        queryKey: receptionKeys.list(filters),
        queryFn: () => receptionService.getReceptions(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer une réception spécifique
export const useReception = (id: number) => {
    return useQuery({
        queryKey: receptionKeys.detail(id),
        queryFn: () => receptionService.getReception(id),
        enabled: !!id,
    });
};

// Hook pour les statistiques des réceptions
export const useReceptionStats = () => {
    return useQuery({
        queryKey: receptionKeys.stats(),
        queryFn: () => receptionService.getStats(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook pour créer une réception
export const useCreateReception = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ReceptionCreate) => receptionService.createReception(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receptionKeys.stats() });
        },
    });
};

// Hook pour mettre à jour une réception
export const useUpdateReception = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ReceptionUpdate }) =>
            receptionService.updateReception(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receptionKeys.detail(variables.id) });
        },
    });
};

// Hook pour supprimer une réception
export const useDeleteReception = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => receptionService.deleteReception(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receptionKeys.stats() });
        },
    });
};

// Hook pour confirmer une réception
export const useConfirmerReception = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ConfirmerReception }) =>
            receptionService.confirmerReception(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receptionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: receptionKeys.stats() });
            // Invalider aussi les transferts car le statut change
            queryClient.invalidateQueries({ queryKey: ['transferts'] });
        },
    });
};

// Hook pour annuler une réception
export const useAnnulerReception = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AnnulerReception }) =>
            receptionService.annulerReception(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receptionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: receptionKeys.stats() });
            // Invalider aussi les transferts
            queryClient.invalidateQueries({ queryKey: ['transferts'] });
        },
    });
};

// Hook pour les réceptions de l'utilisateur connecté
export const useMesReceptions = (filters: Omit<ReceptionFilters, 'mes_receptions'> = {}) => {
    return useReceptions({ ...filters, mes_receptions: true });
};

// Hook pour les réceptions en attente
export const useReceptionsEnAttente = (filters: Omit<ReceptionFilters, 'en_attente'> = {}) => {
    return useReceptions({ ...filters, en_attente: true });
};

// Hook pour les réceptions partielles
export const useReceptionsPartielles = (filters: Omit<ReceptionFilters, 'partielles'> = {}) => {
    return useReceptions({ ...filters, partielles: true });
};

// Hook pour les réceptions par abattoir destinataire
export const useReceptionsParAbattoir = (abattoirId: number, filters: Omit<ReceptionFilters, 'abattoir_destinataire'> = {}) => {
    return useReceptions({
        ...filters,
        abattoir_destinataire: abattoirId,
    });
};

// Hook pour les réceptions d'un abattoir expéditeur
export const useReceptionsDeAbattoir = (abattoirId: number, filters: Omit<ReceptionFilters, 'abattoir_expediteur'> = {}) => {
    return useReceptions({
        ...filters,
        abattoir_expediteur: abattoirId,
    });
};

// Hook pour les réceptions complètes
export const useReceptionsCompletes = (filters: Omit<ReceptionFilters, 'statut'> = {}) => {
    return useReceptions({ ...filters, statut: 'RECU' });
};

// Hook pour les réceptions annulées
export const useReceptionsAnnulees = (filters: Omit<ReceptionFilters, 'statut'> = {}) => {
    return useReceptions({ ...filters, statut: 'ANNULE' });
};