/**
 * SYSTÈME D'AUTHENTIFICATION SIMPLE ET ROBUSTE
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
    token: string;
    user: User;
    message: string;
}

/**
 * SYSTÈME D'AUTHENTIFICATION SIMPLE
 */
class SimpleAuth {
    private static instance: SimpleAuth;
    private api: any;

    private constructor() {
        console.log('🔧 SimpleAuth créé');
        this.setupApi();
    }

    static getInstance(): SimpleAuth {
        if (!SimpleAuth.instance) {
            SimpleAuth.instance = new SimpleAuth();
        }
        return SimpleAuth.instance;
    }

    /**
     * Configuration de l'API axios
     */
    private setupApi(): void {
        console.log('🔧 Initialisation de l\'API simple...');
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
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Token ${token}`;
                }
                return config;
            },
            (error: any) => Promise.reject(error)
        );

        // Intercepteur de réponse pour gérer les erreurs 401
        this.api.interceptors.response.use(
            (response: any) => response,
            async (error: any) => {
                if (error.response?.status === 401) {
                    console.log('🔒 Token invalide, déconnexion...');
                    this.logout();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        console.log('✅ API simple initialisée avec succès');
    }

    /**
     * Obtenir le token
     */
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;

        try {
            const userStr = localStorage.getItem('auth_user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors de la récupération de l\'utilisateur:', error);
        }

        return null;
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getCurrentUser();

        return !!(token && user);
    }

    /**
     * Connexion
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('🔧 Tentative de connexion...');

            const response = await this.api.post('/users/auth/login/', credentials);
            const { token, user } = response.data;

            // Stocker le token et l'utilisateur
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));
            }

            console.log('✅ Connexion réussie');
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur de connexion:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.detail ||
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
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
            console.log('✅ Déconnexion réussie');
        }
    }

    /**
     * Obtenir l'instance de l'API
     */
    getApi() {
        return this.api;
    }
}

// Export de l'instance unique
export const simpleAuth = SimpleAuth.getInstance();
export default simpleAuth;




