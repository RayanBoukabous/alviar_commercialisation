import axios from 'axios';

// Configuration simple et robuste
const API_BASE_URL = 'http://localhost:8000/api';

// Instance axios simple
const simpleApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token
simpleApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('django_token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
simpleApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Types pour le dashboard
export interface SimpleDashboardStats {
    users_count: number;
    clients_count: number;
    superusers_count: number;
    betes_count: number;
    abattoir_name: string;
    abattoir_location: string;
}

// Service API simple
export const simpleApiService = {
    // Obtenir les statistiques du dashboard
    async getDashboardStats(): Promise<SimpleDashboardStats> {
        try {
            const response = await simpleApi.get('/abattoirs/dashboard-stats/');
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            // Retourner des données par défaut en cas d'erreur
            return {
                users_count: 0,
                clients_count: 0,
                superusers_count: 0,
                betes_count: 0,
                abattoir_name: 'Abattoir par défaut',
                abattoir_location: 'Localisation par défaut'
            };
        }
    },

    // Test de connexion
    async testConnection(): Promise<boolean> {
        try {
            await simpleApi.get('/abattoirs/');
            return true;
        } catch (error) {
            console.error('Test de connexion échoué:', error);
            return false;
        }
    }
};

export default simpleApi;
