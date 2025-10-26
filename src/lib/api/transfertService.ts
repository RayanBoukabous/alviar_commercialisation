import { djangoApi } from './djangoAuthService';

// Interfaces pour les transferts
export interface Transfert {
    id: number;
    numero_transfert: string;
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
    nombre_betes: number;
    nombre_betes_actuelles: number;
    statut: 'EN_COURS' | 'EN_LIVRAISON' | 'LIVRE' | 'ANNULE';
    statut_display: string;
    date_creation: string;
    date_livraison?: string;
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
    motif?: string;
    notes?: string;
    betes: Array<{
        id: number;
        bete: {
            id: number;
            num_boucle: string;
            espece_nom: string;
            sexe: string;
            poids_vif: string;
            statut: string;
            etat_sante: string;
        };
        ajoute_par: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            nom: string;
        };
        date_ajout: string;
    }>;
    est_complet: boolean;
    peut_etre_livre: boolean;
    peut_etre_annule: boolean;
    reception?: {
        id: number;
        numero_reception: string;
        statut: 'EN_ATTENTE' | 'EN_COURS' | 'RECU' | 'PARTIEL' | 'ANNULE';
        statut_display: string;
        nombre_betes_attendues: number;
        nombre_betes_recues: number;
        nombre_betes_manquantes: number;
        taux_reception: number;
        date_creation: string;
        date_reception?: string;
        cree_par: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            nom: string;
        };
    };
    created_at: string;
    updated_at: string;
}

export interface TransfertCreate {
    abattoir_expediteur_id: number;
    abattoir_destinataire_id: number;
    nombre_betes: number;
    motif?: string;
    notes?: string;
    betes_ids?: number[];
}

export interface TransfertUpdate {
    abattoir_expediteur_id?: number;
    abattoir_destinataire_id?: number;
    nombre_betes?: number;
    motif?: string;
    notes?: string;
    betes_ids?: number[];
}

export interface TransfertFilters {
    statut?: string;
    abattoir_expediteur?: number;
    abattoir_destinataire?: number;
    date_creation_after?: string;
    date_creation_before?: string;
    date_livraison_after?: string;
    date_livraison_before?: string;
    nombre_betes_min?: number;
    nombre_betes_max?: number;
    en_cours?: boolean;
    mes_transferts?: boolean;
    search?: string;
    ordering?: string;
}

export interface TransfertStats {
    total_transferts: number;
    transferts_en_cours: number;
    transferts_livres: number;
    transferts_annules: number;
    total_betes_transferees: number;
    taux_livraison: number;
}

export interface AjouterBete {
    bete_id: number;
}

export interface RetirerBete {
    bete_id: number;
}

export interface LivrerTransfert {
    // Pas de données spécifiques requises
}

export interface AnnulerTransfert {
    motif_annulation?: string;
}

// Service pour les transferts
export const transfertService = {
    // Récupérer tous les transferts
    async getTransferts(filters: TransfertFilters = {}): Promise<{
        results: Transfert[];
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

        const response = await djangoApi.get(`/transferts/transferts/?${params.toString()}`);
        return response.data as {
            results: Transfert[];
            count: number;
            next?: string;
            previous?: string;
        };
    },

    // Récupérer un transfert par ID
    async getTransfert(id: number): Promise<Transfert> {
        const response = await djangoApi.get(`/transferts/transferts/${id}/`);
        return response.data as Transfert;
    },

    // Créer un nouveau transfert
    async createTransfert(data: TransfertCreate): Promise<Transfert> {
        const response = await djangoApi.post('/transferts/transferts/', data);
        return response.data as Transfert;
    },

    // Mettre à jour un transfert
    async updateTransfert(id: number, data: TransfertUpdate): Promise<Transfert> {
        const response = await djangoApi.patch(`/transferts/transferts/${id}/`, data);
        return response.data as Transfert;
    },

    // Supprimer un transfert
    async deleteTransfert(id: number): Promise<void> {
        await djangoApi.delete(`/transferts/transferts/${id}/`);
    },

    // Ajouter une bête au transfert
    async ajouterBete(id: number, data: AjouterBete): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/transferts/${id}/ajouter_bete/`, data);
        return response.data as { message: string };
    },

    // Retirer une bête du transfert
    async retirerBete(id: number, data: RetirerBete): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/transferts/${id}/retirer_bete/`, data);
        return response.data as { message: string };
    },

    // Mettre un transfert en livraison
    async mettreEnLivraisonTransfert(id: number): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/transferts/${id}/mettre_en_livraison/`);
        return response.data as { message: string };
    },

    // Livrer un transfert
    async livrerTransfert(id: number, data: LivrerTransfert = {}): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/transferts/${id}/livrer/`, data);
        return response.data as { message: string };
    },

    // Annuler un transfert
    async annulerTransfert(id: number, data: AnnulerTransfert): Promise<{ message: string }> {
        const response = await djangoApi.post(`/transferts/transferts/${id}/annuler/`, data);
        return response.data as { message: string };
    },

    // Récupérer les statistiques des transferts
    async getStats(): Promise<TransfertStats> {
        const response = await djangoApi.get('/transferts/transferts/stats/');
        return response.data as TransfertStats;
    }
};

export default transfertService;