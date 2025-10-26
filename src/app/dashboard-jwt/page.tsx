'use client';

import React, { useEffect, useState } from 'react';
import { useJWTProtectedRoute, useJWTAutoRefresh } from '@/lib/hooks/useJWTAuth';
import { jwtAuthService } from '@/lib/api/jwtAuthService';
import JWTLayout from '@/components/layout/JWTLayout';
import { Clock, Shield, Zap, AlertTriangle } from 'lucide-react';

export default function JWTDashboardPage() {
  const { isAuthenticated, isLoading, user, isTokenExpiringSoon } = useJWTProtectedRoute();
  const { isRefreshing, tokenStatus } = useJWTAutoRefresh();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Mise à jour du temps restant
  useEffect(() => {
    if (tokenStatus) {
      setTimeLeft(Math.round(tokenStatus.timeUntilExpiration / 1000));
      
      const interval = setInterval(() => {
        const newTimeLeft = Math.round(jwtAuthService.getTimeUntilExpiration() / 1000);
        setTimeLeft(newTimeLeft);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tokenStatus]);

  if (isLoading || isRefreshing) {
    return (
      <JWTLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isRefreshing ? 'Rafraîchissement du token JWT...' : 'Chargement du dashboard JWT...'}
            </p>
          </div>
        </div>
      </JWTLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection gérée par le hook
  }

  return (
    <JWTLayout>
      <div className="p-6">
        {/* Header JWT */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard JWT
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Système d'authentification JWT avec expiration automatique
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Token Status */}
          <div className={`p-6 rounded-xl border-2 ${
            isTokenExpiringSoon 
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'border-green-400 bg-green-50 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Statut du Token
                </h3>
                <p className={`text-sm ${
                  isTokenExpiringSoon ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
                }`}>
                  {isTokenExpiringSoon ? 'Expire bientôt' : 'Valide'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isTokenExpiringSoon ? 'bg-yellow-400' : 'bg-green-400'
              }`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Time Left */}
          <div className="p-6 rounded-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Temps Restant
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {timeLeft > 0 ? `${timeLeft} secondes` : 'Expiré'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-400">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Auto Refresh */}
          <div className="p-6 rounded-xl border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Auto Refresh
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {isRefreshing ? 'En cours...' : 'Actif'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-400">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 rounded-xl border-2 border-gray-400 bg-gray-50 dark:bg-gray-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Utilisateur
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.username || 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-400">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Détails du Token JWT
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Informations de Session
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Utilisateur:</span>
                  <span className="font-mono text-sm">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-mono text-sm">{user?.user_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Superuser:</span>
                  <span className="font-mono text-sm">{user?.is_superuser ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Abattoir:</span>
                  <span className="font-mono text-sm">{user?.abattoir?.nom || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Statut du Token
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Authentifié:</span>
                  <span className={`font-mono text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {isAuthenticated ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expire bientôt:</span>
                  <span className={`font-mono text-sm ${isTokenExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isTokenExpiringSoon ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temps restant:</span>
                  <span className="font-mono text-sm">{timeLeft}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Refresh en cours:</span>
                  <span className={`font-mono text-sm ${isRefreshing ? 'text-blue-600' : 'text-gray-600'}`}>
                    {isRefreshing ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Actions JWT
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const newToken = jwtAuthService.refreshToken();
                console.log('🔄 Refresh manuel du token:', newToken);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rafraîchir le Token
            </button>
            
            <button
              onClick={() => {
                jwtAuthService.logout();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
            
            <button
              onClick={() => {
                const token = jwtAuthService.getAccessToken();
                console.log('🔑 Token actuel:', token);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voir le Token
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        {isTokenExpiringSoon && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Attention: Session proche de l'expiration
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Votre session JWT va expirer dans {timeLeft} secondes. 
                    Le système va automatiquement tenter de rafraîchir votre token.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </JWTLayout>
  );
}
