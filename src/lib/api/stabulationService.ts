import { djangoApi } from './djangoAuthService';

// Interface Stabulation basée sur le modèle Django backend
export interface Stabulation {
    id: number;
    numero_stabulation: string;
    abattoir: number;
    abattoir_nom: string;
    abattoir_wilaya: string;
    abattoir_commune: string;
    type_bete: 'BOVIN' | 'OVIN' | 'CAPRIN' | 'AUTRE';
    statut: 'EN_COURS' | 'TERMINE' | 'ANNULE';
    date_debut: string;
    date_fin?: string;
    notes?: string;

    // Propriétés calculées
    nombre_betes_actuelles: number;
    capacite_maximale: number;
    taux_occupation: number;
    duree_stabulation_heures: number;
    duree_stabulation_formatee: string;
    est_pleine: boolean;
    places_disponibles: number;

    // Informations sur les bêtes
    betes: number[];
    betes_info: {
        id: number;
        numero_identification: string;
        nom?: string;
        espece?: string;
        race?: string;
        poids?: number;
        statut: string;
        etat_sante: string;
    }[];

    // Métadonnées
    created_by?: number;
    created_by_nom?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateStabulationRequest {
    numero_stabulation?: string; // Généré automatiquement côté backend
    abattoir: number;
    type_bete: 'BOVIN' | 'OVIN' | 'CAPRIN' | 'AUTRE';
    date_debut: string;
    notes?: string;
    betes?: number[];
    automatic_count?: number; // Pour la sélection automatique
}

export interface UpdateStabulationRequest {
    statut?: 'EN_COURS' | 'TERMINE' | 'ANNULE';
    date_fin?: string;
    notes?: string;
    betes?: number[];
}

export interface StabulationStats {
    total_stabulations: number;
    stabulations_en_cours: number;
    stabulations_terminees: number;
    stabulations_annulees: number;
    stabulations_par_type: Record<string, number>;
    taux_occupation_moyen: number;
    total_betes_en_stabulation: number;
}

export interface StabulationsResponse {
    stabulations: Stabulation[];
    statistics: StabulationStats;
    abattoir: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
    };
}

export interface StabulationsListResponse {
    results: Stabulation[];
    count: number;
    next?: string;
    previous?: string;
}

// Service pour les stabulations
export const stabulationService = {
    // Récupérer toutes les stabulations
    async getStabulations(params?: {
        abattoir_id?: number;
        type_bete?: string;
        statut?: string;
        date_debut?: string;
        date_fin?: string;
        search?: string;
        page?: number;
        page_size?: number;
    }): Promise<StabulationsListResponse> {
        const response = await djangoApi.get('/abattoirs/stabulations/', { params });
        return response.data as StabulationsListResponse;
    },

    // Récupérer une stabulation par ID
    async getStabulation(id: number): Promise<Stabulation> {
        const response = await djangoApi.get(`/abattoirs/stabulations/${id}/`);
        return response.data as Stabulation;
    },

    // Créer une nouvelle stabulation
    async createStabulation(data: CreateStabulationRequest): Promise<Stabulation> {
        const response = await djangoApi.post('/abattoirs/stabulations/', data);
        return response.data as Stabulation;
    },

    // Mettre à jour une stabulation
    async updateStabulation(id: number, data: UpdateStabulationRequest): Promise<Stabulation> {
        const response = await djangoApi.patch(`/abattoirs/stabulations/${id}/`, data);
        return response.data as Stabulation;
    },

    // Supprimer une stabulation
    async deleteStabulation(id: number): Promise<void> {
        await djangoApi.delete(`/abattoirs/stabulations/${id}/`);
    },

    // Récupérer les stabulations d'un abattoir spécifique
    async getStabulationsByAbattoir(abattoirId: number, params?: {
        statut?: string;
        type_bete?: string;
    }): Promise<StabulationsResponse> {
        const response = await djangoApi.get(`/abattoirs/${abattoirId}/stabulations/`, { params });
        return response.data as StabulationsResponse;
    },

    // Récupérer toutes les stabulations (pour les superusers)
    async getAllStabulations(params?: {
        statut?: string;
        type_bete?: string;
        abattoir_id?: number;
    }): Promise<StabulationsResponse> {
        const response = await djangoApi.get('/abattoirs/stabulations/all/', { params });
        return response.data as StabulationsResponse;
    },

    // Récupérer les statistiques des stabulations
    async getStabulationStats(params?: {
        abattoir_id?: number;
    }): Promise<StabulationStats> {
        const response = await djangoApi.get('/abattoirs/stabulations/stats/', { params });
        return response.data as StabulationStats;
    },

    // Terminer une stabulation
    async terminerStabulation(id: number, poidsData: Array<{ bete_id: number, poids_a_chaud: number, num_boucle_post_abattage: string }>): Promise<{
        message: string;
        stabulation: {
            id: number;
            statut: string;
            date_fin: string;
        };
        betes_affectees: number;
    }> {
        const response = await djangoApi.post(`/abattoirs/stabulations/${id}/terminer/`, {
            poidsData: poidsData
        });
        return response.data as {
            message: string;
            stabulation: {
                id: number;
                statut: string;
                date_fin: string;
            };
            betes_affectees: number;
        };
    },

    // Ajouter des bêtes à une stabulation
    async ajouterBetes(id: number, betesIds: number[]): Promise<Stabulation> {
        const response = await djangoApi.post(`/abattoirs/stabulations/${id}/ajouter-betes/`, {
            betes_ids: betesIds
        });
        return response.data as Stabulation;
    },

    // Retirer des bêtes d'une stabulation
    async retirerBetes(id: number, betesIds: number[]): Promise<Stabulation> {
        const response = await djangoApi.post(`/abattoirs/stabulations/${id}/retirer-betes/`, {
            betes_ids: betesIds
        });
        return response.data as Stabulation;
    },

    // Annuler une stabulation
    async annulerStabulation(id: number, raisonAnnulation: string): Promise<{
        message: string;
        stabulation: {
            id: number;
            statut: string;
            date_fin: string;
            notes: string;
        };
        betes_affectees: number;
    }> {
        const response = await djangoApi.post(`/abattoirs/stabulations/${id}/annuler/`, {
            raison_annulation: raisonAnnulation
        });
        return response.data as {
            message: string;
            stabulation: {
                id: number;
                statut: string;
                date_fin: string;
                notes: string;
            };
            betes_affectees: number;
        };
    }
};
