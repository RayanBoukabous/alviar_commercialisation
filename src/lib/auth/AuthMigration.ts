/**
 * SERVICE DE MIGRATION D'AUTHENTIFICATION
 * Gère la compatibilité entre l'ancien et le nouveau système d'authentification
 */

import { jwtAuthService } from '@/lib/api/jwtAuthService';

// Clés de l'ancien système
const OLD_STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
} as const;

// Clés du nouveau système JWT
const NEW_STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
} as const;

/**
 * SERVICE DE MIGRATION D'AUTHENTIFICATION
 */
class AuthMigration {
    private static instance: AuthMigration;

    private constructor() {
        console.log('🔧 AuthMigration créé');
    }

    static getInstance(): AuthMigration {
        if (!AuthMigration.instance) {
            AuthMigration.instance = new AuthMigration();
        }
        return AuthMigration.instance;
    }

    /**
     * Vérifier si l'utilisateur est authentifié (compatible avec les deux systèmes)
     */
    isAuthenticated(): boolean {
        // D'abord vérifier le nouveau système JWT
        if (jwtAuthService.isAuthenticated()) {
            return true;
        }

        // Si pas d'auth JWT, vérifier l'ancien système
        return this.checkOldSystemAuth();
    }

    /**
     * Vérifier l'authentification de l'ancien système
     */
    private checkOldSystemAuth(): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const oldTokenData = localStorage.getItem(OLD_STORAGE_KEYS.AUTH_TOKEN);
            if (!oldTokenData) return false;

            const tokenData = JSON.parse(oldTokenData);
            const token = tokenData?.access_token || tokenData?.token;

            if (!token) return false;

            // Vérifier si le token est valide (format JWT)
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;
                const isValid = decoded.exp > currentTime;

                if (isValid) {
                    console.log('🔄 Token de l\'ancien système trouvé et valide, migration...');
                    this.migrateOldAuthToJWT(tokenData);
                    return true;
                }
            } catch {
                // Token invalide ou format incorrect
                return false;
            }

            return false;
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de l\'ancien système:', error);
            return false;
        }
    }

    /**
     * Migrer l'authentification de l'ancien système vers JWT
     */
    private migrateOldAuthToJWT(tokenData: any): void {
        try {
            console.log('🔄 Migration de l\'ancien système vers JWT...');

            // Extraire les données du token
            const accessToken = tokenData?.access_token || tokenData?.token;
            const refreshToken = tokenData?.refresh_token;
            const user = tokenData?.user;

            if (accessToken) {
                // Stocker dans le nouveau format JWT
                localStorage.setItem(NEW_STORAGE_KEYS.ACCESS_TOKEN, accessToken);

                if (refreshToken) {
                    localStorage.setItem(NEW_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                }

                if (user) {
                    localStorage.setItem(NEW_STORAGE_KEYS.USER, JSON.stringify(user));
                }

                console.log('✅ Migration vers JWT réussie');
            }
        } catch (error) {
            console.error('❌ Erreur lors de la migration:', error);
        }
    }

    /**
     * Obtenir l'utilisateur actuel (compatible avec les deux systèmes)
     */
    getCurrentUser(): any {
        // D'abord essayer le nouveau système JWT
        const jwtUser = jwtAuthService.getCurrentUser();
        if (jwtUser) return jwtUser;

        // Si pas d'utilisateur JWT, essayer l'ancien système
        if (typeof window === 'undefined') return null;

        try {
            const oldTokenData = localStorage.getItem(OLD_STORAGE_KEYS.AUTH_TOKEN);
            if (oldTokenData) {
                const tokenData = JSON.parse(oldTokenData);
                return tokenData?.user || null;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        }

        return null;
    }

    /**
     * Nettoyer tous les tokens (ancien et nouveau système)
     */
    clearAllTokens(): void {
        if (typeof window === 'undefined') return;

        // Nettoyer l'ancien système
        localStorage.removeItem(OLD_STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(OLD_STORAGE_KEYS.USER_PREFERENCES);

        // Nettoyer le nouveau système JWT
        jwtAuthService.clearTokens();

        console.log('✅ Tous les tokens nettoyés');
    }

    /**
     * Forcer la migration si nécessaire
     */
    forceMigration(): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const oldTokenData = localStorage.getItem(OLD_STORAGE_KEYS.AUTH_TOKEN);
            if (oldTokenData) {
                const tokenData = JSON.parse(oldTokenData);
                this.migrateOldAuthToJWT(tokenData);
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la migration forcée:', error);
        }

        return false;
    }
}

// Export de l'instance unique
export const authMigration = AuthMigration.getInstance();
export default authMigration;




