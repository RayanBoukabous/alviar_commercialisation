import { djangoApi } from './djangoAuthService';

// Types pour l'historique des abattoirs
export interface HistoriqueAbattoir {
    id: number;
    abattoir: number;
    abattoir_nom: string;
    utilisateur: number;
    nom_utilisateur: string;
    type_action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
    type_action_display: string;
    champ_modifie?: string;
    ancienne_valeur?: string;
    nouvelle_valeur?: string;
    details_modification?: any;
    notes?: string;
    date_modification: string;
    adresse_ip?: string;
    description_modification: string;
}

export interface HistoriqueAbattoirFilters {
    abattoir_id?: number;
    type_action?: string;
    utilisateur_id?: number;
    date_debut?: string;
    date_fin?: string;
    page?: number;
    page_size?: number;
}

export interface HistoriqueAbattoirResponse {
    count: number;
    next?: string;
    previous?: string;
    results: HistoriqueAbattoir[];
}

export interface HistoriqueAbattoirStats {
    total_modifications: number;
    modifications_recentes_30j: number;
    modifications_aujourd_hui: number;
    modifications_par_type: Array<{ type_action: string; count: number }>;
    modifications_par_utilisateur: Array<{
        utilisateur__first_name: string;
        utilisateur__last_name: string;
        utilisateur__username: string;
        count: number
    }>;
    modifications_par_abattoir: Array<{ abattoir__nom: string; count: number }>;
}

export interface HistoriqueAbattoirStatsResponse {
    statistiques: HistoriqueAbattoirStats;
    user_type: 'superuser' | 'regular';
    last_updated: string;
}

// Service pour l'historique des abattoirs
export const historiqueAbattoirService = {
    // Obtenir la liste des historiques
    async getHistoriques(filters: HistoriqueAbattoirFilters = {}): Promise<HistoriqueAbattoirResponse> {
        try {
            const params = new URLSearchParams();

            if (filters.abattoir_id) params.append('abattoir_id', filters.abattoir_id.toString());
            if (filters.type_action) params.append('type_action', filters.type_action);
            if (filters.utilisateur_id) params.append('utilisateur_id', filters.utilisateur_id.toString());
            if (filters.date_debut) params.append('date_debut', filters.date_debut);
            if (filters.date_fin) params.append('date_fin', filters.date_fin);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.page_size) params.append('page_size', filters.page_size.toString());

            const url = `/abattoirs/historique/${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await djangoApi.get(url);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            throw new Error('Erreur lors de la récupération de l\'historique');
        }
    },

    // Obtenir les détails d'un historique
    async getHistoriqueDetail(id: number): Promise<HistoriqueAbattoir> {
        try {
            const response = await djangoApi.get(`/abattoirs/historique/${id}/`);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des détails de l\'historique:', error);
            throw new Error('Erreur lors de la récupération des détails de l\'historique');
        }
    },

    // Obtenir les statistiques de l'historique
    async getHistoriqueStats(): Promise<HistoriqueAbattoirStatsResponse> {
        try {
            const response = await djangoApi.get('/abattoirs/historique-stats/');
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des statistiques de l\'historique:', error);
            throw new Error('Erreur lors de la récupération des statistiques de l\'historique');
        }
    }
};
