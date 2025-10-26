import { djangoApi } from './djangoAuthService';

export interface Abattoir {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
    actif: boolean;
    capacite_reception_ovin: number;
    capacite_reception_bovin: number;
    capacite_stabulation: number;
    responsable?: number;
    responsable_nom?: string;
    responsable_email?: string;
    capacite_totale_reception: number;
    adresse_complete: string;
    betes_count: number;
    created_at: string;
    updated_at: string;
}

export interface AbattoirFilters {
    actif?: boolean;
    wilaya?: string;
    commune?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

export interface AbattoirPagination {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface AbattoirStatistics {
    total_count: number;
    actifs_count: number;
    inactifs_count: number;
    par_wilaya: Array<{ wilaya: string; count: number }>;
    capacite_totale_ovin: number;
    capacite_totale_bovin: number;
    capacite_totale_stabulation: number;
}

export interface AbattoirResponse {
    results: Abattoir[];
    count: number;
    next?: string;
    previous?: string;
    pagination?: AbattoirPagination;
    statistics?: AbattoirStatistics;
    user_type?: 'superuser' | 'regular';
    abattoir_name?: string;
}

export interface ChambreFroide {
    id: number;
    abattoir: number;
    numero: string;
    dimensions_m3: number;
    abattoir_nom?: string;
    nombre_mesures?: number;
    derniere_temperature?: number;
    created_at: string;
    updated_at: string;
}

export interface HistoriqueChambreFroide {
    id: number;
    chambre_froide: number;
    chambre_froide_numero?: string;
    abattoir_nom?: string;
    temperature: number | string;
    date_mesure: string;
    mesure_par?: number;
    mesure_par_nom?: string;
    mesure_par_username?: string;
    notes?: string;
    created_at: string;
}

export interface AbattoirDetailStatistics {
    betes_count: number;
    betes_vivantes: number;
    betes_abattues: number;
    betes_mortes: number;
    utilisateurs_count: number;
    chambres_froides_count: number;
    capacite_utilisee: number;
}

export interface AbattoirDetailResponse {
    abattoir: Abattoir;
    chambres_froides: ChambreFroide[];
    statistics: AbattoirDetailStatistics;
    user_type: 'superuser' | 'regular';
}

// Service pour les abattoirs
export const abattoirService = {
    // Obtenir les abattoirs pour la page de gestion
    async getAbattoirs(filters: AbattoirFilters = {}): Promise<AbattoirResponse> {
        try {
            const params = new URLSearchParams();

            if (filters.actif !== undefined) params.append('actif', filters.actif.toString());
            if (filters.wilaya) params.append('wilaya', filters.wilaya);
            if (filters.commune) params.append('commune', filters.commune);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.page_size) params.append('page_size', filters.page_size.toString());

            const url = `/abattoirs/abattoirs-for-management/?${params.toString()}`;
            console.log('API Call URL:', url);
            console.log('Filters passed:', filters);

            const response = await djangoApi.get(url);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching abattoirs:', error);

            // Fallback avec des abattoirs par défaut si l'API n'est pas accessible
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.warn('Backend non accessible, utilisation des abattoirs par défaut');
                return {
                    results: [
                        {
                            id: 1,
                            nom: 'Abattoir de Blida',
                            wilaya: 'Blida',
                            commune: 'Blida',
                            actif: true,
                            capacite_reception_ovin: 100,
                            capacite_reception_bovin: 50,
                            capacite_stabulation: 200,
                            capacite_totale_reception: 150,
                            adresse_complete: 'Blida, Algérie',
                            betes_count: 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        },
                        {
                            id: 2,
                            nom: 'Abattoir d\'Alger',
                            wilaya: 'Alger',
                            commune: 'Alger',
                            actif: true,
                            capacite_reception_ovin: 150,
                            capacite_reception_bovin: 75,
                            capacite_stabulation: 300,
                            capacite_totale_reception: 225,
                            adresse_complete: 'Alger, Algérie',
                            betes_count: 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ],
                    count: 2,
                    next: null,
                    previous: null
                };
            }

            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des abattoirs');
        }
    },

    // Obtenir les détails d'un abattoir spécifique
    async getAbattoirDetails(id: number): Promise<Abattoir> {
        try {
            const response = await djangoApi.get(`/abattoirs/${id}/`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des détails de l\'abattoir');
        }
    },

    // Mettre à jour un abattoir
    async updateAbattoir(id: number, data: Partial<Abattoir>): Promise<Abattoir> {
        try {
            const response = await djangoApi.patch(`/abattoirs/${id}/`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de l\'abattoir');
        }
    },

    // Créer un nouvel abattoir
    async createAbattoir(data: Partial<Abattoir>): Promise<Abattoir> {
        try {
            const response = await djangoApi.post('/abattoirs/', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la création de l\'abattoir');
        }
    },

    // Supprimer un abattoir
    async deleteAbattoir(id: number): Promise<void> {
        try {
            await djangoApi.delete(`/abattoirs/${id}/`);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de l\'abattoir');
        }
    },

    // Obtenir les détails d'un abattoir avec ses chambres froides
    async getAbattoirDetailWithFacilities(id: number): Promise<AbattoirDetailResponse> {
        try {
            const response = await djangoApi.get(`/abattoirs/${id}/detail-with-facilities/`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des détails de l\'abattoir');
        }
    },
};
