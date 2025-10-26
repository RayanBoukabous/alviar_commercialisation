import { djangoApi } from './djangoAuthService';

// Types pour les espèces
export interface Espece {
    id: number;
    nom: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface EspecesResponse {
    results: Espece[];
    count: number;
    next?: string;
    previous?: string;
}

// Service pour les espèces
export const especeService = {
    // Obtenir la liste des espèces
    async getEspeces(): Promise<Espece[]> {
        try {
            console.log('Fetching especes from API...');
            const response = await djangoApi.get('/betes/especes-list/');
            console.log('Especes API response:', response.data);
            return response.data.results || response.data;
        } catch (error: any) {
            console.error('Error fetching especes:', error);

            // Fallback avec des espèces par défaut si l'API n'est pas accessible
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.warn('Backend non accessible, utilisation des espèces par défaut');
                return [
                    { id: 1, nom: 'Bovin' },
                    { id: 2, nom: 'Ovin' },
                    { id: 3, nom: 'Caprin' },
                    { id: 4, nom: 'Camelin' }
                ];
            }

            throw new Error('Erreur lors de la récupération de la liste des espèces');
        }
    }
};
