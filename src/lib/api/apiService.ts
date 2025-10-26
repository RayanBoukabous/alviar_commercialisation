/**
 * SERVICE API UNIFIÉ
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Instance axios configurée
 */
export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur de requête pour ajouter le token Django
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('django_token');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer les erreurs 401/403 Django
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Pour Django Token Authentication, on ne fait pas de refresh automatique
        // On laisse les hooks gérer la redirection
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Nettoyer le localStorage Django
            if (typeof window !== 'undefined') {
                localStorage.removeItem('django_token');
                localStorage.removeItem('django_user');
            }
        }

        return Promise.reject(error);
    }
);

export default api;

