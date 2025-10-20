import { djangoApi } from './djangoAuthService';

// Types pour les chambres froides
export interface ChambreFroide {
    id: number;
    abattoir: number;
    abattoir_nom: string;
    numero: string;
    dimensions_m3: number;
    nombre_mesures: number;
    derniere_temperature: number | null;
    created_at: string;
    updated_at: string;
}

export interface HistoriqueChambreFroide {
    id: number;
    chambre_froide: number;
    chambre_froide_numero: string;
    abattoir_nom: string;
    temperature: number;
    date_mesure: string;
    created_at: string;
}

export interface ChambreFroideResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ChambreFroide[];
}

export interface HistoriqueResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: HistoriqueChambreFroide[];
}

// Service pour les chambres froides
export const chambreFroideService = {
    // Obtenir la liste des chambres froides d'un abattoir
    async getChambresFroides(abattoirId: number): Promise<ChambreFroide[]> {
        try {
            const response = await djangoApi.get(`/abattoirs/chambres-froides/?abattoir_id=${abattoirId}`);
            return response.data.results || response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des chambres froides');
        }
    },

    // Obtenir l'historique des températures d'une chambre froide
    async getHistoriqueTemperatures(
        chambreFroideId: number,
        options?: {
            date_debut?: string;
            date_fin?: string;
            limit?: number;
        }
    ): Promise<HistoriqueChambreFroide[]> {
        try {
            const params = new URLSearchParams();
            params.append('chambre_froide_id', chambreFroideId.toString());

            if (options?.date_debut) {
                params.append('date_debut', options.date_debut);
            }
            if (options?.date_fin) {
                params.append('date_fin', options.date_fin);
            }
            if (options?.limit) {
                params.append('limit', options.limit.toString());
            }

            const response = await djangoApi.get(`/abattoirs/historique-temperatures/?${params.toString()}`);
            return response.data.results || response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'historique des températures');
        }
    },

    // Obtenir l'historique des températures de toutes les chambres froides d'un abattoir
    async getHistoriqueAbattoir(
        abattoirId: number,
        options?: {
            date_debut?: string;
            date_fin?: string;
            limit?: number;
        }
    ): Promise<HistoriqueChambreFroide[]> {
        try {
            const params = new URLSearchParams();
            params.append('abattoir_id', abattoirId.toString());

            if (options?.date_debut) {
                params.append('date_debut', options.date_debut);
            }
            if (options?.date_fin) {
                params.append('date_fin', options.date_fin);
            }
            if (options?.limit) {
                params.append('limit', options.limit.toString());
            }

            const response = await djangoApi.get(`/abattoirs/historique-temperatures/?${params.toString()}`);
            return response.data.results || response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'historique des températures');
        }
    },

    // Créer une nouvelle mesure de température
    async createTemperatureMeasurement(data: {
        chambre_froide: number;
        temperature: number;
    }): Promise<HistoriqueChambreFroide> {
        try {
            const response = await djangoApi.post('/abattoirs/historique-temperatures/', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la création de la mesure de température');
        }
    },

    // Créer une nouvelle chambre froide
    async createChambreFroide(data: {
        abattoir: number;
        numero: string;
        dimensions_m3: number;
    }): Promise<ChambreFroide> {
        try {
            const response = await djangoApi.post('/abattoirs/chambres-froides/', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la création de la chambre froide');
        }
    },

    // Mettre à jour une chambre froide
    async updateChambreFroide(id: number, data: Partial<ChambreFroide>): Promise<ChambreFroide> {
        try {
            const response = await djangoApi.patch(`/abattoirs/chambres-froides/${id}/`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de la chambre froide');
        }
    },

    // Supprimer une chambre froide
    async deleteChambreFroide(id: number): Promise<void> {
        try {
            await djangoApi.delete(`/abattoirs/chambres-froides/${id}/`);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la chambre froide');
        }
    }
};





