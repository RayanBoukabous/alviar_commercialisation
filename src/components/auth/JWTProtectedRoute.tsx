'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJWTProtectedRoute } from '@/lib/hooks/useJWTAuth';
import { jwtAuthService } from '@/lib/api/jwtAuthService';

interface JWTProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const JWTProtectedRoute: React.FC<JWTProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/login'
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, isTokenExpiringSoon } = useJWTProtectedRoute();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier l'authentification côté client
        const authenticated = jwtAuthService.isAuthenticated();
        
        if (!authenticated) {
          console.log('🔒 Non authentifié, redirection vers login');
          router.push(redirectTo);
          return;
        }

        // Vérifier si le token va expirer bientôt
        if (jwtAuthService.isTokenExpiringSoon()) {
          console.log('⚠️ Token va expirer bientôt, tentative de refresh...');
          try {
            await jwtAuthService.refreshToken();
            console.log('✅ Token rafraîchi avec succès');
          } catch (error) {
            console.error('❌ Impossible de rafraîchir le token:', error);
            jwtAuthService.logout();
            router.push(redirectTo);
            return;
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error('❌ Erreur lors de la vérification d\'authentification:', error);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Afficher le fallback pendant la vérification
  if (isChecking || isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return null; // La redirection est gérée dans useEffect
  }

  // Afficher un avertissement si le token va expirer bientôt
  if (isTokenExpiringSoon) {
    return (
      <div className="relative">
        {/* Bannière d'avertissement */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Votre session va expirer bientôt. Veuillez sauvegarder votre travail.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

// Hook pour utiliser la protection JWT dans les composants
export const useJWTProtection = () => {
  const { isAuthenticated, isLoading, user, isTokenExpiringSoon } = useJWTProtectedRoute();
  const router = useRouter();

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const checkTokenExpiration = async () => {
    if (jwtAuthService.isTokenExpiringSoon()) {
      try {
        await jwtAuthService.refreshToken();
        return true;
      } catch (error) {
        console.error('❌ Impossible de rafraîchir le token:', error);
        jwtAuthService.logout();
        router.push('/login');
        return false;
      }
    }
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    isTokenExpiringSoon,
    requireAuth,
    checkTokenExpiration,
  };
};

export default JWTProtectedRoute;
