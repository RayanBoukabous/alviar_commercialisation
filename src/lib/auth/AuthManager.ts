/**
 * GESTIONNAIRE D'AUTHENTIFICATION UNIFIÉ ET PROFESSIONNEL
 * 
 * Ce module centralise TOUTE la logique d'authentification pour éviter
 * les conflits entre différents systèmes d'auth.
 */

import axios, { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';

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

export interface JWTPayload {
    user_id: number;
    username: string;
    email: string;
    user_type: string;
    abattoir_id: number | null;
    is_superuser: boolean;
    exp: number;
    iat: number;
    jti: string;
    token_type: string;
}

// Clés de stockage
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
} as const;

/**
 * GESTIONNAIRE DE TOKENS JWT
 */
class TokenManager {
    private static instance: TokenManager;

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    /**
     * Vérifier si nous sommes côté client
     */
    private isClient(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Obtenir un token du localStorage
     */
    private getToken(key: string): string | null {
        if (!this.isClient()) return null;
        return localStorage.getItem(key);
    }

    /**
     * Définir un token dans le localStorage
     */
    private setToken(key: string, value: string): void {
        if (!this.isClient()) return;
        localStorage.setItem(key, value);
    }

    /**
     * Supprimer un token du localStorage
     */
    private removeToken(key: string): void {
        if (!this.isClient()) return;
        localStorage.removeItem(key);
    }

    /**
     * Obtenir le token d'accès
     */
    getAccessToken(): string | null {
        return this.getToken(STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Obtenir le token de refresh
     */
    getRefreshToken(): string | null {
        return this.getToken(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Définir les tokens
     */
    setTokens(access: string, refresh: string): void {
        this.setToken(STORAGE_KEYS.ACCESS_TOKEN, access);
        this.setToken(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    }

    /**
     * Nettoyer tous les tokens
     */
    clearTokens(): void {
        this.removeToken(STORAGE_KEYS.ACCESS_TOKEN);
        this.removeToken(STORAGE_KEYS.REFRESH_TOKEN);
        this.removeToken(STORAGE_KEYS.USER);
    }

    /**
     * Vérifier si un token est valide et non expiré
     */
    isTokenValid(token: string | null): boolean {
        if (!token) return false;

        try {
            const decoded = jwtDecode<JWTPayload>(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    /**
     * Vérifier si le token va expirer bientôt (dans les 5 minutes)
     */
    isTokenExpiringSoon(token: string | null): boolean {
        if (!token) return false;

        try {
            const decoded = jwtDecode<JWTPayload>(token);
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
    getTimeUntilExpiration(token: string | null): number {
        if (!token) return 0;

        try {
            const decoded = jwtDecode<JWTPayload>(token);
            const currentTime = Date.now() / 1000;
            return Math.max(0, (decoded.exp - currentTime) * 1000);
        } catch {
            return 0;
        }
    }
}

/**
 * GESTIONNAIRE D'UTILISATEUR
 */
class UserManager {
    private static instance: UserManager;

    static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    private isClient(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        if (!this.isClient()) return null;

        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Définir l'utilisateur actuel
     */
    setCurrentUser(user: User): void {
        if (!this.isClient()) return;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    /**
     * Nettoyer les données utilisateur
     */
    clearUser(): void {
        if (!this.isClient()) return;
        localStorage.removeItem(STORAGE_KEYS.USER);
    }
}

/**
 * GESTIONNAIRE D'AUTHENTIFICATION PRINCIPAL
 */
class AuthManager {
    private static instance: AuthManager;
    private tokenManager: TokenManager;
    private userManager: UserManager;
    private api: any;

    private constructor() {
        this.tokenManager = TokenManager.getInstance();
        this.userManager = UserManager.getInstance();
        this.setupApi();

        // Vérifier que l'API est bien initialisée
        if (!this.api) {
            console.error('❌ Échec de l\'initialisation de l\'API');
            throw new Error('Échec de l\'initialisation de l\'API');
        }
    }

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    /**
     * Configuration de l'API axios
     */
    private setupApi(): void {
        console.log('🔧 Initialisation de l\'API axios...');
        this.api = axios.create({
            baseURL: `${API_BASE_URL}/api`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercepteur de requête pour ajouter le token
        this.api.interceptors.request.use(
            (config: any) => {
                const token = this.tokenManager.getAccessToken();
                if (token && this.tokenManager.isTokenValid(token)) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: any) => Promise.reject(error)
        );

        // Intercepteur de réponse pour gérer les erreurs 401
        this.api.interceptors.response.use(
            (response: any) => response,
            async (error: any) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshToken();
                        const newToken = this.tokenManager.getAccessToken();
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.api(originalRequest);
                        }
                    } catch (refreshError) {
                        this.logout();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }
                }

                return Promise.reject(error);
            }
        );

        console.log('✅ API axios initialisée avec succès');
    }

    /**
     * Connexion
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            // Vérifier que l'API est initialisée
            if (!this.api) {
                console.error('❌ API non initialisée');
                throw new Error('API non initialisée');
            }

            const response: AxiosResponse<LoginResponse> = await this.api.post('/users/auth/login/', credentials);
            const { access, refresh, user } = response.data;

            // Stocker les tokens et l'utilisateur
            this.tokenManager.setTokens(access, refresh);
            this.userManager.setCurrentUser(user);

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
            await this.api.post('/users/logout/');
        } catch (error) {
            console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
        } finally {
            this.tokenManager.clearTokens();
            this.userManager.clearUser();
            console.log('✅ Déconnexion réussie');
        }
    }

    /**
     * Rafraîchir le token
     */
    async refreshToken(): Promise<string> {
        const refreshToken = this.tokenManager.getRefreshToken();
        if (!refreshToken || !this.tokenManager.isTokenValid(refreshToken)) {
            throw new Error('Refresh token invalide ou expiré');
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/auth/refresh/`, {
                refresh: refreshToken,
            });

            const { access } = response.data;
            this.tokenManager.setToken(STORAGE_KEYS.ACCESS_TOKEN, access);

            console.log('🔄 Token rafraîchi avec succès');
            return access;
        } catch (error) {
            console.error('❌ Erreur lors du refresh:', error);
            throw error;
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        const token = this.tokenManager.getAccessToken();
        const user = this.userManager.getCurrentUser();

        return !!(token && user && this.tokenManager.isTokenValid(token));
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        return this.userManager.getCurrentUser();
    }

    /**
     * Vérifier si le token va expirer bientôt
     */
    isTokenExpiringSoon(): boolean {
        const token = this.tokenManager.getAccessToken();
        return this.tokenManager.isTokenExpiringSoon(token);
    }

    /**
     * Obtenir le temps restant avant expiration
     */
    getTimeUntilExpiration(): number {
        const token = this.tokenManager.getAccessToken();
        return this.tokenManager.getTimeUntilExpiration(token);
    }

    /**
     * Obtenir l'API configurée
     */
    getApi() {
        return this.api;
    }
}

// Export de l'instance unique
export const authManager = AuthManager.getInstance();
export default authManager;
