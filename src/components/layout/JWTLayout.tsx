'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useJWTProtectedRoute, useJWTAutoRefresh } from '@/lib/hooks/useJWTAuth';
import { jwtAuthService } from '@/lib/api/jwtAuthService';
import LayoutLTR from './LayoutLTR';
import LayoutRTL from './LayoutRTL';

interface JWTLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const JWTLayout: React.FC<JWTLayoutProps> = ({
  children,
  className,
  showSidebar = true,
}) => {
  const { currentLocale } = useLanguage();
  const { isAuthenticated, isLoading, user, isTokenExpiringSoon } = useJWTProtectedRoute();
  const { isRefreshing, tokenStatus } = useJWTAutoRefresh();
  const isRTL = currentLocale === 'ar';

  // Vérification d'authentification côté client
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      try {
        const authenticated = jwtAuthService.isAuthenticated();
        if (!authenticated) {
          console.log('🔒 Non authentifié, redirection vers login JWT');
          window.location.href = '/login-jwt';
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
            window.location.href = '/login-jwt';
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification JWT:', error);
        window.location.href = '/login-jwt';
      }
    };

    checkAuth();
  }, []);

  // Afficher le loader pendant la vérification
  if (isLoading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRefreshing ? 'Rafraîchissement du token...' : 'Vérification de l\'authentification...'}
          </p>
          {tokenStatus && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Token expire dans {Math.round(tokenStatus.timeUntilExpiration / 1000)}s
            </p>
          )}
        </div>
      </div>
    );
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return null; // La redirection est gérée dans useEffect
  }

  // Afficher un avertissement si le token va expirer bientôt
  const showExpirationWarning = isTokenExpiringSoon || (tokenStatus?.isExpiringSoon);

  return (
    <div className="relative">
      {/* Bannière d'avertissement JWT */}
      {showExpirationWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                ⚠️ Votre session JWT va expirer bientôt. 
                {tokenStatus && (
                  <span className="font-semibold">
                    {' '}Expire dans {Math.round(tokenStatus.timeUntilExpiration / 1000)} secondes.
                  </span>
                )}
                {' '}Veuillez sauvegarder votre travail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      {isRTL ? (
        <LayoutRTL 
          key={`jwt-rtl-${currentLocale}`}
          className={className}
          showSidebar={showSidebar}
        >
          {children}
        </LayoutRTL>
      ) : (
        <LayoutLTR 
          key={`jwt-ltr-${currentLocale}`}
          className={className}
          showSidebar={showSidebar}
        >
          {children}
        </LayoutLTR>
      )}

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && tokenStatus && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div>JWT Status: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Expires in: {Math.round(tokenStatus.timeUntilExpiration / 1000)}s</div>
          <div>Expiring soon: {tokenStatus.isExpiringSoon ? '⚠️' : '✅'}</div>
        </div>
      )}
    </div>
  );
};

export default JWTLayout;
