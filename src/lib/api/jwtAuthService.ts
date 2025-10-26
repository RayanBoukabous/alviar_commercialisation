/**
 * SERVICE D'AUTHENTIFICATION JWT
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Types
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: 'ALIMENT_SHEPTEL' | 'PRODUCTION' | 'SUPERVISEUR';
    abattoir: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
        actif: boolean;
    } | null;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

/**
 * SERVICE D'AUTHENTIFICATION JWT
 */
class JWTAuthService {
    private static instance: JWTAuthService;

    private constructor() {
        console.log('🔧 JWTAuthService créé');
    }

    static getInstance(): JWTAuthService {
        if (!JWTAuthService.instance) {
            JWTAuthService.instance = new JWTAuthService();
        }
        return JWTAuthService.instance;
    }

    /**
     * Obtenir le token d'accès
     */
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_access_token');
    }

    /**
     * Obtenir le token de refresh
     */
    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_refresh_token');
    }

    /**
     * Nettoyer tous les tokens
     */
    clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
    }

    /**
     * Vérifier si un token est valide et non expiré
     */
    isTokenValid(token: string | null): boolean {
        if (!token) return false;

        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;

        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }

        // Si pas d'utilisateur JWT, essayer la migration depuis l'ancien système
        try {
            const { authMigration } = require('@/lib/auth/AuthMigration');
            return authMigration.getCurrentUser();
        } catch (error) {
            console.warn('⚠️ Impossible de charger AuthMigration pour getCurrentUser:', error);
        }

        return null;
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        const user = this.getCurrentUser();

        // Si pas d'auth JWT, essayer la migration depuis l'ancien système
        if (!(token && user && this.isTokenValid(token))) {
            // Importer dynamiquement pour éviter les dépendances circulaires
            try {
                const { authMigration } = require('@/lib/auth/AuthMigration');
                return authMigration.isAuthenticated();
            } catch (error) {
                console.warn('⚠️ Impossible de charger AuthMigration:', error);
            }
        }

        return !!(token && user && this.isTokenValid(token));
    }

    /**
     * Connexion
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('🔧 Tentative de connexion JWT...');

            // Créer une instance axios simple pour cette requête
            const api = axios.create({
                baseURL: `${API_BASE_URL}/api`,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await api.post('/users/auth/login/', credentials);
            const { access, refresh, user } = response.data as LoginResponse;

            // Stocker les tokens et l'utilisateur DIRECTEMENT
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_access_token', access);
                localStorage.setItem('auth_refresh_token', refresh);
                localStorage.setItem('auth_user', JSON.stringify(user));
            }

            console.log('✅ Connexion JWT réussie');
            return response.data as LoginResponse;
        } catch (error: any) {
            console.error('❌ Erreur de connexion JWT:', error);
            throw new Error(
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                'Erreur de connexion JWT'
            );
        }
    }

    /**
     * Déconnexion
     */
    async logout(): Promise<void> {
        try {
            // Créer une instance axios simple pour cette requête
            const api = axios.create({
                baseURL: `${API_BASE_URL}/api`,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            await api.post('/users/logout/');
        } catch (error) {
            console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
        } finally {
            this.clearTokens();
            console.log('✅ Déconnexion JWT réussie');
        }
    }

    /**
     * Rafraîchir le token
     */
    async refreshToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken || !this.isTokenValid(refreshToken)) {
            throw new Error('Refresh token invalide ou expiré');
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/auth/refresh/`, {
                refresh: refreshToken,
            });

            const { access } = response.data as { access: string };
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_access_token', access);
            }

            console.log('🔄 Token JWT rafraîchi avec succès');
            return access;
        } catch (error) {
            console.error('❌ Erreur lors du refresh JWT:', error);
            throw error;
        }
    }

    /**
     * Vérifier si le token va expirer bientôt (dans les 5 minutes)
     */
    isTokenExpiringSoon(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = decoded.exp - currentTime;
            return timeUntilExpiry < 300; // 5 minutes
        } catch {
            return false;
        }
    }

    /**
     * Obtenir le temps restant avant expiration (en millisecondes)
     */
    getTimeUntilExpiration(): number {
        const token = this.getAccessToken();
        if (!token) return 0;

        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return Math.max(0, (decoded.exp - currentTime) * 1000);
        } catch {
            return 0;
        }
    }

    /**
     * Créer une instance axios avec authentification automatique
     */
    createAuthenticatedApi() {
        const api = axios.create({
            baseURL: `${API_BASE_URL}/api`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercepteur de requête pour ajouter le token
        api.interceptors.request.use(
            (config: any) => {
                const token = this.getAccessToken();
                if (token && this.isTokenValid(token)) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: any) => Promise.reject(error)
        );

        // Intercepteur de réponse pour gérer les erreurs 401
        api.interceptors.response.use(
            (response: any) => response,
            async (error: any) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshToken();
                        const newToken = this.getAccessToken();
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return api(originalRequest);
                        }
                    } catch (refreshError) {
                        this.logout();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login-jwt';
                        }
                    }
                }

                return Promise.reject(error);
            }
        );

        return api;
    }
}

// Export de l'instance unique
export const jwtAuthService = JWTAuthService.getInstance();
export default jwtAuthService;
