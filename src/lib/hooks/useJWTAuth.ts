'use client';

import { useState, useEffect } from 'react';
import { jwtAuthService } from '@/lib/api/jwtAuthService';
import { authMigration } from '@/lib/auth/AuthMigration';

// Types
export interface TokenStatus {
    isExpiringSoon: boolean;
    timeUntilExpiration: number;
    isValid: boolean;
}

export interface JWTProtectedRouteReturn {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    isTokenExpiringSoon: boolean;
}

/**
 * Hook pour la protection des routes JWT
 */
export const useJWTProtectedRoute = (): JWTProtectedRouteReturn => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isTokenExpiringSoon, setIsTokenExpiringSoon] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true);

                // Essayer d'abord la migration depuis l'ancien système
                const migrationSuccess = authMigration.forceMigration();
                if (migrationSuccess) {
                    console.log('✅ Migration depuis l\'ancien système réussie');
                }

                // Vérifier l'authentification
                const authenticated = jwtAuthService.isAuthenticated();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    // Récupérer l'utilisateur
                    const currentUser = jwtAuthService.getCurrentUser();
                    setUser(currentUser);

                    // Vérifier si le token va expirer bientôt
                    const expiringSoon = jwtAuthService.isTokenExpiringSoon();
                    setIsTokenExpiringSoon(expiringSoon);
                } else {
                    setUser(null);
                    setIsTokenExpiringSoon(false);
                }
            } catch (error) {
                console.error('❌ Erreur lors de la vérification JWT:', error);
                setIsAuthenticated(false);
                setUser(null);
                setIsTokenExpiringSoon(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return {
        isAuthenticated,
        isLoading,
        user,
        isTokenExpiringSoon,
    };
};

/**
 * Hook pour le rafraîchissement automatique du token JWT
 */
export const useJWTAutoRefresh = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);

    useEffect(() => {
        const updateTokenStatus = () => {
            try {
                const isExpiringSoon = jwtAuthService.isTokenExpiringSoon();
                const timeUntilExpiration = jwtAuthService.getTimeUntilExpiration();
                const isValid = jwtAuthService.isAuthenticated();

                setTokenStatus({
                    isExpiringSoon,
                    timeUntilExpiration,
                    isValid,
                });
            } catch (error) {
                console.error('❌ Erreur lors de la mise à jour du statut du token:', error);
                setTokenStatus(null);
            }
        };

        // Mise à jour initiale
        updateTokenStatus();

        // Vérifier toutes les 30 secondes
        const interval = setInterval(updateTokenStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const autoRefresh = async () => {
            if (!tokenStatus) return;

            // Si le token va expirer dans les 5 minutes, essayer de le rafraîchir
            if (tokenStatus.isExpiringSoon && tokenStatus.isValid) {
                try {
                    setIsRefreshing(true);
                    console.log('🔄 Rafraîchissement automatique du token JWT...');

                    await jwtAuthService.refreshToken();
                    console.log('✅ Token JWT rafraîchi automatiquement');

                    // Mettre à jour le statut
                    const newTimeUntilExpiration = jwtAuthService.getTimeUntilExpiration();
                    setTokenStatus(prev => prev ? {
                        ...prev,
                        timeUntilExpiration: newTimeUntilExpiration,
                        isExpiringSoon: false,
                    } : null);
                } catch (error) {
                    console.error('❌ Erreur lors du rafraîchissement automatique:', error);
                    // En cas d'erreur, déconnecter l'utilisateur
                    jwtAuthService.logout();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login-jwt';
                    }
                } finally {
                    setIsRefreshing(false);
                }
            }
        };

        autoRefresh();
    }, [tokenStatus]);

    return {
        isRefreshing,
        tokenStatus,
    };
};

/**
 * Hook pour les actions JWT
 */
export const useJWTActions = () => {
    const refreshToken = async () => {
        try {
            const newToken = await jwtAuthService.refreshToken();
            console.log('✅ Token rafraîchi manuellement');
            return newToken;
        } catch (error) {
            console.error('❌ Erreur lors du rafraîchissement manuel:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await jwtAuthService.logout();
            console.log('✅ Déconnexion réussie');
            if (typeof window !== 'undefined') {
                window.location.href = '/login-jwt';
            }
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    };

    const getTokenInfo = () => {
        try {
            const token = jwtAuthService.getAccessToken();
            const user = jwtAuthService.getCurrentUser();
            const timeUntilExpiration = jwtAuthService.getTimeUntilExpiration();
            const isExpiringSoon = jwtAuthService.isTokenExpiringSoon();

            return {
                token,
                user,
                timeUntilExpiration,
                isExpiringSoon,
                isValid: jwtAuthService.isAuthenticated(),
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos du token:', error);
            return null;
        }
    };

  return {
    refreshToken,
    logout,
    getTokenInfo,
  };
};

/**
 * Hook pour la connexion JWT
 */
export const useJWTLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await jwtAuthService.login(credentials);
      console.log('✅ Connexion JWT réussie');
      return result;
    } catch (err: any) {
      console.error('❌ Erreur de connexion JWT:', err);
      setError(err.message || 'Erreur de connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
};
