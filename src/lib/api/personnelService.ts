import { djangoApi } from './djangoAuthService';

// Types pour le personnel
export interface Personnel {
    id: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    numero_employe: string;
    telephone: string;
    telephone_urgence?: string;
    email?: string;
    adresse: string;
    wilaya: string;
    commune: string;
    date_naissance: string;
    lieu_naissance: string;
    sexe: 'M' | 'F';
    nationalite: string;
    numero_carte_identite: string;
    date_emission_carte: string;
    lieu_emission_carte: string;
    abattoir: number;
    abattoir_nom?: string;
    role: number;
    role_nom?: string;
    date_embauche: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'CONGE' | 'DEMISSION';
    photo?: string;
    carte_identite_recto?: string;
    carte_identite_verso?: string;
    created_by?: number;
    created_by_nom?: string;
    created_at: string;
    updated_at: string;
    notes?: string;
    competences?: any[];
    formations?: any[];
    age?: number;
    anciennete?: number;
}

export interface PersonnelResponse {
    results: Personnel[];
    count: number;
    next?: string;
    previous?: string;
}

export interface PersonnelFilters {
    abattoir?: number;
    role?: number;
    statut?: string;
    wilaya?: string;
    sexe?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

// Service pour le personnel
export const personnelService = {
    // Obtenir le personnel d'un abattoir
    async getPersonnelByAbattoir(abattoirId: number, filters: PersonnelFilters = {}): Promise<PersonnelResponse> {
        try {
            const params = new URLSearchParams();

            params.append('abattoir', abattoirId.toString());

            if (filters.role) params.append('role', filters.role.toString());
            if (filters.statut) params.append('statut', filters.statut);
            if (filters.wilaya) params.append('wilaya', filters.wilaya);
            if (filters.sexe) params.append('sexe', filters.sexe);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.page_size) params.append('page_size', filters.page_size.toString());

            const url = `/personnel/abattoir/${abattoirId}/?${params.toString()}`;

            const response = await djangoApi.get(url);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération du personnel:', error);
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du personnel');
        }
    },

    // Obtenir le responsable d'un abattoir (rôle RESPONSABLE_ABATTOIR)
    async getAbattoirManager(abattoirId: number): Promise<Personnel | null> {
        try {
            // Utiliser directement l'ID du rôle RESPONSABLE_ABATTOIR (ID: 1)
            const response = await this.getPersonnelByAbattoir(abattoirId, {
                role: 1, // ID du rôle RESPONSABLE_ABATTOIR
                statut: 'ACTIF'
            });


            return response.results.length > 0 ? response.results[0] : null;
        } catch (error: any) {
            console.error('Erreur lors de la récupération du responsable:', error);
            return null;
        }
    },

    // Obtenir tous les rôles
    async getRoles(): Promise<any[]> {
        try {
            const response = await djangoApi.get('/personnel/roles/');
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des rôles:', error);
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des rôles');
        }
    },

    // Obtenir tout le personnel d'un abattoir (pour l'onglet personnel)
    async getAllPersonnelByAbattoir(abattoirId: number, filters: PersonnelFilters = {}): Promise<PersonnelResponse> {
        try {
            const params = new URLSearchParams();
            params.append('abattoir', abattoirId.toString());
            if (filters.role) params.append('role', filters.role.toString());
            if (filters.statut) params.append('statut', filters.statut);
            if (filters.wilaya) params.append('wilaya', filters.wilaya);
            if (filters.sexe) params.append('sexe', filters.sexe);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.page_size) params.append('page_size', filters.page_size.toString());

            const url = `/personnel/abattoir/${abattoirId}/?${params.toString()}`;
            const response = await djangoApi.get(url);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération du personnel:', error);
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du personnel');
        }
    },

    // Obtenir les détails d'un employé spécifique
    async getPersonnelDetail(personnelId: string): Promise<Personnel> {
        try {
            const response = await djangoApi.get(`/personnel/${personnelId}/`);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des détails du personnel:', error);
            throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des détails du personnel');
        }
    }
};
