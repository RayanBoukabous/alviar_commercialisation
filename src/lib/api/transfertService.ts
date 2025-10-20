import { djangoApi } from './djangoAuthService';

// Types pour les transferts
export interface Abattoir {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
}

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    nom: string;
}

export interface Bete {
    id: number;
    num_boucle: string;
    espece_nom: string;
    sexe: string;
    poids_vif: string;
}

export interface Transfert {
    id: number;
    numero_transfert: string;
    abattoir_expediteur: Abattoir;
    abattoir_destinataire: Abattoir;
    betes: Bete[];
    nombre_betes: number;
    statut: 'EN_COURS' | 'LIVRE' | 'ANNULE';
    statut_display: string;
    date_creation: string;
    date_livraison?: string;
    date_annulation?: string;
    cree_par: User;
    valide_par?: User;
    note?: string;
    est_modifiable: boolean;
    est_annulable: boolean;
    est_livrable: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTransfertRequest {
    abattoir_destinataire_id: number;
    betes_ids?: number[];
    nombre_betes_aleatoire?: number;
    note?: string;
}

export interface UpdateTransfertStatusRequest {
    id: number;
    statut: 'EN_COURS' | 'LIVRE' | 'ANNULE';
}

export interface TransfertStats {
    total_transferts: number;
    transferts_en_cours: number;
    transferts_livres: number;
    transferts_annules: number;
    taux_livraison: number;
}

export interface TransfertFilters {
    statut?: string;
    abattoir_id?: number;
    search?: string;
}

// Services API
export const transfertService = {
    // Récupérer tous les transferts
    async getTransferts(filters: TransfertFilters = {}): Promise<{
        results: Transfert[];
        count: number;
        next: string | null;
        previous: string | null;
    }> {
        const params = new URLSearchParams();

        if (filters.statut && filters.statut !== 'ALL') {
            params.append('statut', filters.statut);
        }

        if (filters.abattoir_id) {
            params.append('abattoir_id', filters.abattoir_id.toString());
        }

        if (filters.search) {
            params.append('search', filters.search);
        }

        const response = await djangoApi.get(`/transferts/?${params.toString()}`);
        return response.data;
    },

    // Récupérer un transfert par ID
    async getTransfert(id: number): Promise<Transfert> {
        const response = await djangoApi.get(`/transferts/${id}/`);
        return response.data;
    },

    // Créer un nouveau transfert
    async createTransfert(data: CreateTransfertRequest): Promise<Transfert> {
        const response = await djangoApi.post('/transferts/', data);
        return response.data;
    },

    // Mettre à jour le statut d'un transfert
    async updateTransfertStatus(data: UpdateTransfertStatusRequest): Promise<Transfert> {
        const response = await djangoApi.patch(`/transferts/${data.id}/`, {
            statut: data.statut
        });
        return response.data;
    },

    // Annuler un transfert
    async annulerTransfert(id: number): Promise<Transfert> {
        const response = await djangoApi.post(`/transferts/${id}/annuler/`);
        return response.data;
    },

    // Marquer un transfert comme livré
    async livrerTransfert(id: number): Promise<Transfert> {
        const response = await djangoApi.post(`/transferts/${id}/livrer/`);
        return response.data;
    },

    // Confirmer la réception détaillée d'un transfert
    async confirmerReceptionDetaillee(id: number, data: {
        received_count: number;
        missing_betes?: string[];
        received_betes?: number[];
    }): Promise<{
        detail: string;
        transfert: Transfert;
        betes_recues: number;
        betes_manquantes: number;
    }> {
        const response = await djangoApi.post(`/transferts/${id}/confirmer-reception/`, data);
        return response.data;
    },

    // Récupérer les statistiques
    async getTransfertStats(): Promise<TransfertStats> {
        const response = await djangoApi.get('/transferts/stats/');
        return response.data;
    },

    // Récupérer les bêtes disponibles
    async getBetesDisponibles(
        abattoirId?: number,
        search?: string,
        espece?: string,
        typeProduit?: string,
        page: number = 1,
        pageSize: number = 30
    ): Promise<{
        results: Bete[];
        count: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    }> {
        const params = new URLSearchParams();

        if (abattoirId) {
            params.append('abattoir_id', abattoirId.toString());
        }

        if (search) {
            params.append('search', search);
        }

        if (espece) {
            params.append('espece', espece);
        }

        if (typeProduit) {
            params.append('type_produit', typeProduit);
        }

        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());

        const response = await djangoApi.get(`/transferts/betes-disponibles/?${params.toString()}`);
        return response.data;
    }
};
