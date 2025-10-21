import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chambreFroideService, ChambreFroide, HistoriqueChambreFroide } from '@/lib/api/chambreFroideService';

// Hook pour récupérer les chambres froides d'un abattoir
export const useChambresFroides = (abattoirId: number) => {
    return useQuery({
        queryKey: ['chambres-froides', abattoirId],
        queryFn: () => chambreFroideService.getChambresFroides(abattoirId),
        enabled: !!abattoirId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer l'historique des températures d'une chambre froide
export const useHistoriqueTemperatures = (
    chambreFroideId: number,
    options?: {
        date_debut?: string;
        date_fin?: string;
        limit?: number;
    }
) => {
    return useQuery({
        queryKey: ['historique-temperatures', chambreFroideId, options],
        queryFn: () => chambreFroideService.getHistoriqueTemperatures(chambreFroideId, options),
        enabled: !!chambreFroideId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook pour récupérer l'historique des températures de toutes les chambres froides d'un abattoir
export const useHistoriqueAbattoir = (
    abattoirId: number,
    options?: {
        date_debut?: string;
        date_fin?: string;
        limit?: number;
    }
) => {
    return useQuery({
        queryKey: ['historique-abattoir', abattoirId, options],
        queryFn: () => chambreFroideService.getHistoriqueAbattoir(abattoirId, options),
        enabled: !!abattoirId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook pour créer une nouvelle mesure de température
export const useCreateTemperatureMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { chambre_froide: number; temperature: number }) =>
            chambreFroideService.createTemperatureMeasurement(data),
        onSuccess: (data) => {
            // Invalider les caches liés
            queryClient.invalidateQueries({ queryKey: ['historique-temperatures', data.chambre_froide] });
            queryClient.invalidateQueries({ queryKey: ['historique-abattoir'] });
            queryClient.invalidateQueries({ queryKey: ['chambres-froides'] });
        },
    });
};

// Hook pour créer une nouvelle chambre froide
export const useCreateChambreFroide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { abattoir: number; numero: string; dimensions_m3: number }) =>
            chambreFroideService.createChambreFroide(data),
        onSuccess: (data) => {
            // Invalider le cache des chambres froides
            queryClient.invalidateQueries({ queryKey: ['chambres-froides', data.abattoir] });
        },
    });
};

// Hook pour mettre à jour une chambre froide
export const useUpdateChambreFroide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ChambreFroide> }) =>
            chambreFroideService.updateChambreFroide(id, data),
        onSuccess: (data) => {
            // Invalider le cache des chambres froides
            queryClient.invalidateQueries({ queryKey: ['chambres-froides', data.abattoir] });
        },
    });
};

// Hook pour supprimer une chambre froide
export const useDeleteChambreFroide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => chambreFroideService.deleteChambreFroide(id),
        onSuccess: (_, abattoirId) => {
            // Invalider le cache des chambres froides
            queryClient.invalidateQueries({ queryKey: ['chambres-froides', abattoirId] });
        },
    });
};






