import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { djangoApi } from '@/lib/api/djangoAuthService';

export interface Client {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    wilaya: string;
    commune: string;
    created_at: string;
    updated_at: string;
}

export interface ClientStats {
    total_clients: number;
    clients_actifs: number;
    nouveaux_mois: number;
}

/**
 * Récupère la liste de tous les clients
 */
export const getClients = async (): Promise<Client[]> => {
    try {
        const response = await djangoApi.get('/clients/');
        console.log('=== GET CLIENTS ===');
        console.log('Response data:', response.data);
        console.log('Has results?', !!response.data.results);
        console.log('Results:', response.data.results);
        console.log('Results is array?', Array.isArray(response.data.results));
        console.log('Results length:', response.data.results?.length);
        console.log('==================');

        // Si la réponse est un objet avec une propriété results (pagination DRF)
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            console.log('✅ Returning results array with', response.data.results.length, 'clients');
            return response.data.results;
        }

        // Si la réponse est directement un tableau
        if (Array.isArray(response.data)) {
            console.log('✅ Returning direct array with', response.data.length, 'clients');
            return response.data;
        }

        // Si aucun format reconnu
        console.warn('⚠️ Unexpected response format, returning empty array');
        return [];
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        throw error;
    }
};

/**
 * Récupère les statistiques des clients
 */
export const getClientStats = async (): Promise<ClientStats> => {
    const response = await djangoApi.get('/clients/stats/');
    return response.data;
};

/**
 * Supprime un client
 */
export const deleteClient = async (id: number): Promise<void> => {
    await djangoApi.delete(`/clients/${id}/`);
};

/**
 * Hook pour récupérer la liste des clients
 */
export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
    });
};

/**
 * Hook pour récupérer les statistiques des clients
 */
export const useClientStats = () => {
    return useQuery({
        queryKey: ['client-stats'],
        queryFn: getClientStats,
    });
};

/**
 * Hook pour supprimer un client
 */
export const useDeleteClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['client-stats'] });
        },
    });
};
