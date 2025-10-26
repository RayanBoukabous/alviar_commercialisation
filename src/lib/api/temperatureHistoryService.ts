import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Interface pour les données de température
export interface TemperatureRecord {
    id: number;
    chambre_froide: number;
    chambre_froide_numero: string;
    abattoir_nom: string;
    temperature: number;
    date_mesure: string;
    mesure_par: number;
    mesure_par_nom: string;
    mesure_par_username: string;
    notes?: string;
    created_at: string;
}

export interface TemperatureHistoryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: TemperatureRecord[];
}

export interface TemperatureHistoryFilters {
    abattoir_id?: number;
    chambre_froide_id?: number;
    date_debut?: string;
    date_fin?: string;
    page?: number;
    page_size?: number;
}

// Instance axios pour les appels API
const temperatureApi = axios.create({
    baseURL: `${API_BASE_URL}/api/abattoirs`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification Django
temperatureApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('django_token');
    if (token && config.headers) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs d'authentification
temperatureApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token invalide ou expiré
            localStorage.removeItem('django_token');
            localStorage.removeItem('django_user');
            // Rediriger vers la page de connexion si nécessaire
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Récupère l'historique des températures pour un abattoir
 */
export const getTemperatureHistory = async (
    filters: TemperatureHistoryFilters = {}
): Promise<TemperatureHistoryResponse> => {
    try {
        const params = new URLSearchParams();

        if (filters.abattoir_id) {
            params.append('abattoir_id', filters.abattoir_id.toString());
        }
        if (filters.chambre_froide_id) {
            params.append('chambre_froide_id', filters.chambre_froide_id.toString());
        }
        if (filters.date_debut) {
            params.append('date_debut', filters.date_debut);
        }
        if (filters.date_fin) {
            params.append('date_fin', filters.date_fin);
        }
        if (filters.page) {
            params.append('page', filters.page.toString());
        }
        if (filters.page_size) {
            params.append('page_size', filters.page_size.toString());
        }

        const response = await temperatureApi.get(`/historique-temperatures/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des températures:', error);
        throw error;
    }
};

/**
 * Crée une nouvelle mesure de température
 */
export const createTemperatureMeasurement = async (data: {
    chambre_froide: number;
    temperature: number;
    notes?: string;
}): Promise<TemperatureRecord> => {
    try {
        const response = await temperatureApi.post('/historique-temperatures/', data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la mesure de température:', error);
        throw error;
    }
};

/**
 * Récupère les statistiques des températures pour un abattoir
 */
export const getTemperatureStats = async (abattoirId: number): Promise<{
    total_mesures: number;
    temperature_moyenne: number;
    temperature_min: number;
    temperature_max: number;
    alertes_count: number;
}> => {
    try {
        const response = await temperatureApi.get(`/historique-temperatures/?abattoir_id=${abattoirId}`);
        const data = response.data.results;

        if (data.length === 0) {
            return {
                total_mesures: 0,
                temperature_moyenne: 0,
                temperature_min: 0,
                temperature_max: 0,
                alertes_count: 0
            };
        }

        const temperatures = data.map(record => record.temperature);
        const temperature_moyenne = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
        const temperature_min = Math.min(...temperatures);
        const temperature_max = Math.max(...temperatures);

        // Compter les alertes (températures en dehors de la plage normale -2°C à +2°C)
        const alertes_count = temperatures.filter(temp => temp < -2 || temp > 2).length;

        return {
            total_mesures: data.length,
            temperature_moyenne: Math.round(temperature_moyenne * 10) / 10,
            temperature_min,
            temperature_max,
            alertes_count
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de température:', error);
        throw error;
    }
};
