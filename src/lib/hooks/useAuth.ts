import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/auth/tokenManager';
import { authService } from '@/lib/api';
import { LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
}

interface UseAuthReturn extends AuthState {
    login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
    register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
    });

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAuth = tokenManager.isAuthenticated();
                setAuthState({
                    isAuthenticated: isAuth,
                    isLoading: false,
                    user: isAuth ? { id: tokenManager.getUserId() } : null,
                });
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                });
            }
        };

        checkAuth();
    }, []);

    // Fonction de connexion
    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await authService.login(credentials.email, credentials.password);

            if (response.access_token) {
                // Sauvegarder le token
                tokenManager.setToken({
                    access_token: response.access_token,
                });

                setAuthState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: { id: tokenManager.getUserId() },
                });

                // Redirection automatique vers le dashboard
                router.push('/dashboard');

                return { success: true };
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: 'Token d\'accès non reçu' };
            }
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: error.message || 'Erreur de connexion' };
        }
    }, []);

    // Fonction d'inscription
    const register = useCallback(async (userData: RegisterRequest) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await authService.register(userData);

            if (response.access_token) {
                // Sauvegarder le token
                tokenManager.setToken({
                    access_token: response.access_token,
                });

                setAuthState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: response.user || { id: tokenManager.getUserId() },
                });

                // Redirection automatique vers le dashboard
                router.push('/dashboard');

                return { success: true };
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: 'Token d\'accès non reçu' };
            }
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: error.message || 'Erreur d\'inscription' };
        }
    }, []);

    // Fonction de déconnexion
    const logout = useCallback(async () => {
        try {
            // Appeler l'API de déconnexion si nécessaire
            await authService.logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Supprimer le token local
            tokenManager.clearToken();

            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
            });

            // Rediriger vers la page de connexion
            router.push('/login');
        }
    }, [router]);

    // Fonction de rafraîchissement du token
    const refreshToken = useCallback(async () => {
        try {
            const response = await authService.refreshToken();

            if (response.access_token) {
                tokenManager.refreshToken({
                    access_token: response.access_token,
                });

                setAuthState(prev => ({
                    ...prev,
                    isAuthenticated: true,
                }));

                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            logout();
            return false;
        }
    }, [logout]);

    return {
        ...authState,
        login,
        register,
        logout,
        refreshToken,
    };
}

// Hook pour vérifier si l'utilisateur est authentifié
export function useRequireAuth() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    return { isAuthenticated, isLoading };
}

// Hook pour vérifier si l'utilisateur n'est pas authentifié (pour les pages de login)
export function useRequireGuest() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    return { isAuthenticated, isLoading };
}
