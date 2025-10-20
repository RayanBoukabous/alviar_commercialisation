import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useClientSide } from './useClientSide';
import {
  djangoAuthService,
  LoginRequest,
  LoginResponse,
  DjangoUser
} from '@/lib/api/djangoAuthService';

// Clés de requête
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  stats: () => [...authKeys.all, 'stats'] as const,
};

// Hook pour la connexion
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: djangoAuthService.login,
    onSuccess: (data) => {
      // Invalider et refetch les données utilisateur
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      queryClient.invalidateQueries({ queryKey: authKeys.stats() });

      toast.success('Connexion réussie !');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur de connexion');
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: djangoAuthService.logout,
    onSuccess: () => {
      // Nettoyer toutes les données en cache
      queryClient.clear();

      toast.success('Déconnexion réussie !');
      // Délai pour éviter les redirections multiples
      setTimeout(() => {
        router.push('/login');
      }, 100);
    },
    onError: (error) => {
      // Même en cas d'erreur, on nettoie les données locales
      queryClient.clear();

      // Ne pas afficher d'erreur pour les erreurs 403/401 (token expiré)
      if (error.message && !error.message.includes('403') && !error.message.includes('401')) {
        toast.error('Erreur lors de la déconnexion');
      } else {
        toast.success('Déconnexion réussie !');
      }

      // Délai pour éviter les redirections multiples
      setTimeout(() => {
        router.push('/login');
      }, 100);
    },
  });
};

// Hook pour obtenir le profil utilisateur
export const useProfile = () => {
  return useQuery<DjangoUser, Error>({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      // D'abord essayer de récupérer depuis localStorage
      const localUser = djangoAuthService.getCurrentUser();
      if (localUser) {
        // Faire un appel API en arrière-plan pour mettre à jour si nécessaire
        try {
          const freshUser = await djangoAuthService.getProfile();
          return freshUser;
        } catch (error) {
          // Si l'API échoue, retourner les données locales
          return localUser;
        }
      }
      // Si pas de données locales, faire l'appel API
      return await djangoAuthService.getProfile();
    },
    enabled: djangoAuthService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si l'utilisateur n'est pas authentifié
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2; // Réduire le nombre de retry
    },
    refetchOnWindowFocus: false, // Éviter les refetch automatiques
    refetchOnMount: false, // Éviter les refetch au montage si les données sont fraîches
    initialData: () => {
      // Utiliser les données du localStorage comme données initiales
      return djangoAuthService.getCurrentUser() || undefined;
    },
  });
};

// Hook pour obtenir les statistiques utilisateur
export const useUserStats = () => {
  return useQuery({
    queryKey: authKeys.stats(),
    queryFn: djangoAuthService.getUserStats,
    enabled: djangoAuthService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour changer le mot de passe
export const useChangePassword = () => {
  return useMutation({
    mutationFn: djangoAuthService.changePassword,
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    },
  });
};

// Hook pour vérifier l'authentification
export const useAuth = () => {
  const { data: user, isLoading, error } = useProfile();
  
  // Utiliser les données du localStorage en premier si disponibles
  const localUser = djangoAuthService.getCurrentUser();
  const isAuthenticatedLocally = djangoAuthService.isAuthenticated();

  return {
    user: user || localUser, // Utiliser les données API ou localStorage
    isLoading: isLoading && !localUser, // Pas de loading si on a des données locales
    isAuthenticated: !!user || isAuthenticatedLocally,
    error,
  };
};

// Hook pour vérifier si l'utilisateur est un invité (non connecté)
export const useRequireGuest = () => {
  const router = useRouter();
  const isClient = useClientSide();

  // Vérifier l'authentification localement sans faire d'appel API
  const isAuthenticated = isClient ? djangoAuthService.isAuthenticated() : false;
  const isLoading = !isClient; // Loading pendant l'hydratation

  // Rediriger vers le dashboard si déjà connecté (côté client seulement)
  if (isClient && isAuthenticated) {
    router.push('/dashboard');
  }

  return {
    isAuthenticated,
    isLoading,
  };
};

// Hook pour vérifier si l'utilisateur est authentifié (pour les pages protégées)
export const useRequireAuth = () => {
  const router = useRouter();
  const isClient = useClientSide();

  // Vérifier l'authentification localement d'abord (côté client seulement)
  const isAuthenticatedLocally = isClient ? djangoAuthService.isAuthenticated() : false;

  // Si pas connecté localement, rediriger immédiatement (côté client seulement)
  if (isClient && !isAuthenticatedLocally) {
    router.push('/login');
    return {
      isAuthenticated: false,
      isLoading: false,
    };
  }

  // Si connecté localement, on peut faire un appel API pour vérifier le profil
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated: isClient ? isAuthenticated : false,
    isLoading: !isClient || isLoading,
  };
};
