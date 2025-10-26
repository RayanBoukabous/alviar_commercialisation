import { djangoApi } from './djangoAuthService';

// Interfaces pour les réceptions
export interface Reception {
    id: number;
    numero_reception: string;
    transfert: {
        id: number;
        numero_transfert: string;
        abattoir_expediteur: {
            id: number;
            nom: string;
            wilaya: string;
            commune: string;
        };
        abattoir_destinataire: {
            id: number;
            nom: string;
            wilaya: string;
            commune: string;
        };
        betes: Array<{
            id: number;
            num_boucle: string;
            espece_nom: string;
            sexe: string;
            poids_vif: string;
        }>;
        nombre_betes: number;
        statut: 'EN_COURS' | 'LIVRE' | 'ANNULE';
        date_creation: string;
        date_livraison?: string;
        cree_par: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            nom: string;
        };
    };
    // Propriétés ajoutées par le sérialiseur backend
    abattoir_expediteur: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
        adresse_complete: string;
    };
    abattoir_destinataire: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
        adresse_complete: string;
    };
    nombre_betes_attendues: number;
    nombre_betes_recues: number;
    nombre_betes_manquantes: number;
    betes_manquantes: string[];
    statut: 'EN_ATTENTE' | 'EN_COURS' | 'RECU' | 'PARTIEL' | 'ANNULE';
    statut_display: string;
    date_creation: string;
    date_reception?: string;
    date_annulation?: string;
    cree_par: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        nom: string;
    };
    valide_par?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        nom: string;
    };
    annule_par?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        nom: string;
    };
    note?: string;
    taux_reception: number;
    est_complete: boolean;
    est_partielle: boolean;
    est_vide: boolean;
    peut_etre_confirmee: boolean;
    peut_etre_annulee: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReceptionCreate {
    transfert_id: number;
    note?: string;
}

export interface ReceptionUpdate {
    note?: string;
}

export interface ConfirmerReception {
    nombre_betes_recues: number;
    betes_manquantes?: string[];
    note?: string;
}

export interface AnnulerReception {
    motif_annulation?: string;
}

export interface ReceptionFilters {
    statut?: string;
    abattoir_expediteur?: number;
    abattoir_destinataire?: number;
    date_creation_after?: string;
    date_creation_before?: string;
    date_reception_after?: string;
    date_reception_before?: string;
    nombre_betes_attendues_min?: number;
    nombre_betes_attendues_max?: number;
    nombre_betes_recues_min?: number;
    nombre_betes_recues_max?: number;
    en_attente?: boolean;
    partielles?: boolean;
    mes_receptions?: boolean;
    search?: string;
    ordering?: string;
}

export interface ReceptionStats {
    total_receptions: number;
    receptions_en_attente: number;
    receptions_completes: number;
    receptions_partielles: number;
    receptions_annulees: number;
    total_betes_recues: number;
    taux_reception: number;
}

// Service pour les réceptions
export const receptionService = {
    // Récupérer toutes les réceptions
    async getReceptions(filters: ReceptionFilters = {}): Promise<{
        results: Reception[];
        count: number;
        next?: string;
        previous?: string;
    }> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await djangoApi.get(`/transferts/receptions/?${params.toString()}`);
        return response.data as {
            results: Reception[];
            count: number;
            next?: string;
            previous?: string;
        };
    },

    // Récupérer une réception par ID
    async getReception(id: number): Promise<Reception> {
        const response = await djangoApi.get(`/transferts/receptions/${id}/`);
        return response.data as Reception;
    },

    // Créer une nouvelle réception
    async createReception(data: ReceptionCreate): Promise<Reception> {
        const response = await djangoApi.post('/transferts/receptions/', data);
        return response.data as Reception;
    },

    // Mettre à jour une réception
    async updateReception(id: number, data: ReceptionUpdate): Promise<Reception> {
        const response = await djangoApi.patch(`/transferts/receptions/${id}/`, data);
        return response.data as Reception;
    },

    // Supprimer une réception
    async deleteReception(id: number): Promise<void> {
        await djangoApi.delete(`/transferts/receptions/${id}/`);
    },

    // Confirmer une réception
    async confirmerReception(id: number, data: ConfirmerReception): Promise<Reception> {
        const response = await djangoApi.post(`/transferts/receptions/${id}/confirmer/`, data);
        return response.data as Reception;
    },

    // Annuler une réception
    async annulerReception(id: number, data: AnnulerReception): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/receptions/${id}/annuler/`, data);
        return response.data as { message: string };
    },

    // Récupérer les statistiques des réceptions
    async getStats(): Promise<ReceptionStats> {
        const response = await djangoApi.get('/transferts/receptions/stats/');
        return response.data as ReceptionStats;
    }
};

export default receptionService;