import { djangoApi } from './djangoAuthService';

// Types pour les bons de commande
export interface BonDeCommande {
    id: number;
    numero_bon: string;
    type_quantite: 'NOMBRE' | 'POIDS';
    type_quantite_display: string;
    quantite: number;
    type_bete: 'BOVIN' | 'OVIN' | 'CAPRIN';
    type_bete_display: string;
    type_produit: 'CARCASSE' | 'VIF';
    type_produit_display: string;
    avec_cinquieme_quartier: boolean;
    source: 'PRODUCTION' | 'ABATTOIR';
    source_display: string;
    abattoir: number;
    abattoir_nom: string;
    abattoir_info?: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
    };
    client: number;
    client_nom: string;
    client_info?: {
        id: number;
        nom: string;
        prenom: string;
        telephone: string;
        email: string;
    };
    notes: string;
    versement: number | null;
    statut: 'BROUILLON' | 'CONFIRME' | 'EN_COURS' | 'LIVRE' | 'ANNULE';
    statut_display: string;
    date_livraison_prevue: string | null;
    date_livraison_reelle: string | null;
    created_by: number | null;
    created_by_nom: string;
    created_at: string;
    updated_at: string;
    est_modifiable: boolean;
    est_annulable: boolean;
}

export interface CreateBonDeCommandeRequest {
    type_quantite: 'NOMBRE' | 'POIDS';
    quantite: number;
    type_bete: 'BOVIN' | 'OVIN' | 'CAPRIN';
    type_produit: 'CARCASSE' | 'VIF';
    avec_cinquieme_quartier: boolean;
    source: 'PRODUCTION' | 'ABATTOIR';
    abattoir: number;
    client: number;
    notes?: string;
    versement?: number;
    statut?: string;
    date_livraison_prevue?: string;
}

export interface BonDeCommandeListParams {
    statut?: string;
    client_id?: number;
    abattoir_id?: number;
    search?: string;
}

export interface BonDeCommandeStats {
    total_bons: number;
    bons_en_cours: number;
    bons_livres: number;
    stats_by_status: Array<{
        statut: string;
        count: number;
        total_quantite: number;
    }>;
    stats_by_type_bete: Array<{
        type_bete: string;
        count: number;
    }>;
}

/**
 * Récupère la liste des bons de commande
 */
export const getBonsDeCommande = async (params?: BonDeCommandeListParams): Promise<BonDeCommande[]> => {
    const response = await djangoApi.get('/bons-commande/', { params });

    // Gérer la pagination Django REST Framework
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
    }

    // Si pas de pagination, retourner directement les données
    if (Array.isArray(response.data)) {
        return response.data;
    }

    // Fallback
    return [];
};

/**
 * Récupère un bon de commande par ID
 */
export const getBonDeCommandeById = async (id: number): Promise<BonDeCommande> => {
    const response = await djangoApi.get(`/bons-commande/${id}/`);
    return response.data;
};

/**
 * Crée un nouveau bon de commande
 */
export const createBonDeCommande = async (data: CreateBonDeCommandeRequest): Promise<BonDeCommande> => {
    const response = await djangoApi.post('/bons-commande/', data);
    return response.data;
};

/**
 * Met à jour un bon de commande
 */
export const updateBonDeCommande = async (id: number, data: Partial<CreateBonDeCommandeRequest>): Promise<BonDeCommande> => {
    const response = await djangoApi.put(`/bons-commande/${id}/`, data);
    return response.data;
};

/**
 * Supprime un bon de commande (seulement si brouillon)
 */
export const deleteBonDeCommande = async (id: number): Promise<void> => {
    await djangoApi.delete(`/bons-commande/${id}/`);
};

/**
 * Met à jour le statut d'un bon de commande
 */
export const updateBonStatus = async (id: number, statut: string, date_livraison_reelle?: string): Promise<BonDeCommande> => {
    const response = await djangoApi.post(`/bons-commande/${id}/update-status/`, {
        statut,
        date_livraison_reelle
    });
    return response.data;
};

/**
 * Annule un bon de commande
 */
export const annulerBon = async (id: number): Promise<BonDeCommande> => {
    const response = await djangoApi.post(`/bons-commande/${id}/annuler/`);
    return response.data;
};

/**
 * Récupère les statistiques des bons de commande
 */
export const getBonDeCommandeStats = async (): Promise<BonDeCommandeStats> => {
    const response = await djangoApi.get('/bons-commande/stats/');
    return response.data;
};

