import { djangoApi } from './djangoAuthService';

// Types pour l'historique des bons de commande
export interface HistoriqueBonDeCommande {
    id: number;
    type_action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'CANCELLED' | 'DELIVERED' | 'CONFIRMED' | 'STARTED';
    type_action_display: string;
    description: string;
    ancien_statut?: string;
    ancien_statut_display?: string;
    nouveau_statut?: string;
    nouveau_statut_display?: string;
    user: number;
    user_nom: string;
    data: Record<string, any>;
    created_at: string;
}

export interface HistoriqueBonDeCommandeStats {
    total_actions: number;
    actions_par_type: Record<string, number>;
    derniere_action?: {
        type: string;
        user: string;
        date: string;
    };
    premiere_action?: {
        type: string;
        user: string;
        date: string;
    };
    actions_par_utilisateur: Record<string, number>;
    changements_statut: number;
    modifications: number;
}

// Service pour l'historique des bons de commande
export const historiqueBonCommandeService = {
    // Récupérer l'historique d'un bon de commande
    async getHistorique(bonId: number): Promise<HistoriqueBonDeCommande[]> {
        const response = await djangoApi.get(`/bons-commande/${bonId}/historique/`);
        console.log('API Response for historique:', response.data);
        // L'API Django REST Framework retourne une réponse paginée
        const result = response.data.results || response.data || [];
        console.log('Processed historique data:', result);
        return result;
    },

    // Récupérer les détails d'une entrée d'historique
    async getHistoriqueDetail(bonId: number, historiqueId: number): Promise<HistoriqueBonDeCommande> {
        const response = await djangoApi.get(`/bons-commande/${bonId}/historique/${historiqueId}/`);
        return response.data;
    },

    // Récupérer les statistiques de l'historique
    async getHistoriqueStats(bonId: number): Promise<HistoriqueBonDeCommandeStats> {
        const response = await djangoApi.get(`/bons-commande/${bonId}/historique/stats/`);
        return response.data;
    }
};
