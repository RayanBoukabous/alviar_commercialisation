// Hook d'authentification personnalisé qui utilise les hooks Django
import { useAuth as useDjangoAuth, useLogout } from './useDjangoAuth';
import { djangoAuthService } from '@/lib/api/djangoAuthService';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, error } = useDjangoAuth();
  const logoutMutation = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: async (credentials: { email: string; password: string }) => {
      // Cette fonction sera remplacée par le hook useLogin dans les composants
      throw new Error('Utilisez useLogin() hook pour la connexion');
    },
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};

export const useRequireGuest = () => {
  const { isAuthenticated, isLoading } = useDjangoAuth();

  return {
    isAuthenticated,
    isLoading,
  };
};