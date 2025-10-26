/**
 * GESTIONNAIRE D'AUTHENTIFICATION ULTRA FINAL QUI MARCHE
 */

import axios, { AxiosResponse } from 'axios';

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
 * GESTIONNAIRE D'AUTHENTIFICATION ULTRA FINAL
 */
class UltraFinalAuth {
    private static instance: UltraFinalAuth;

    private constructor() {
        console.log('🔧 UltraFinalAuth créé');
    }

    static getInstance(): UltraFinalAuth {
        if (!UltraFinalAuth.instance) {
            UltraFinalAuth.instance = new UltraFinalAuth();
        }
        return UltraFinalAuth.instance;
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
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        const user = this.getCurrentUser();

        return !!(token && user && this.isTokenValid(token));
    }

    /**
     * Connexion - VERSION ULTRA FINALE QUI MARCHE
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('🔧 Tentative de connexion...');

            // Créer une instance axios simple pour cette requête
            const api = axios.create({
                baseURL: `${API_BASE_URL}/api`,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response: AxiosResponse<LoginResponse> = await api.post('/users/auth/login/', credentials);
            const { access, refresh, user } = response.data;

            // Stocker les tokens et l'utilisateur DIRECTEMENT
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_access_token', access);
                localStorage.setItem('auth_refresh_token', refresh);
                localStorage.setItem('auth_user', JSON.stringify(user));
            }

            console.log('✅ Connexion réussie');
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur de connexion:', error);
            throw new Error(
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                'Erreur de connexion'
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
            console.log('✅ Déconnexion réussie');
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

            const { access } = response.data;
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_access_token', access);
            }

            console.log('🔄 Token rafraîchi avec succès');
            return access;
        } catch (error) {
            console.error('❌ Erreur lors du refresh:', error);
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
}

// Export de l'instance unique
export const ultraFinalAuth = UltraFinalAuth.getInstance();
export default ultraFinalAuth;




