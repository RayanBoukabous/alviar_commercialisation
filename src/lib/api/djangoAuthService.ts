import axios from 'axios';

// Configuration de l'API Django
const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://0.0.0.0:8000';

// Types pour l'authentification Django
export interface DjangoAbattoir {
  id: number;
  nom: string;
  wilaya: string;
  commune: string;
  actif: boolean;
}

export interface DjangoUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'ALIMENT_SHEPTEL' | 'PRODUCTION' | 'SUPERVISEUR';
  abattoir: DjangoAbattoir | null;
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
  user: DjangoUser;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// Instance axios pour Django
const djangoApi = axios.create({
  baseURL: `${DJANGO_API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
djangoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('django_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
djangoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger automatiquement pour les erreurs 401/403
    // Laisser les hooks gérer la redirection
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Juste nettoyer le localStorage, pas de redirection automatique
      if (typeof window !== 'undefined') {
        localStorage.removeItem('django_token');
        localStorage.removeItem('django_user');
      }
    }
    return Promise.reject(error);
  }
);

// Service d'authentification Django
export const djangoAuthService = {
  // Connexion
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await djangoApi.post('/users/login/', credentials);
      const { token, user } = response.data;

      // Stocker le token et les données utilisateur (côté client seulement)
      if (typeof window !== 'undefined') {
        localStorage.setItem('django_token', token);
        localStorage.setItem('django_user', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        'Erreur de connexion'
      );
    }
  },

  // Déconnexion
  async logout(): Promise<LogoutResponse> {
    // Supprimer le token et les données utilisateur (côté client seulement)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('django_token');
      localStorage.removeItem('django_user');
    }

    try {
      const response = await djangoApi.post('/users/logout/');
      return response.data;
    } catch (error: any) {
      // Si erreur 403 (token expiré) ou autre erreur, on considère que c'est OK
      // car on a déjà supprimé les données locales
      if (error.response?.status === 403 || error.response?.status === 401) {
        return { message: 'Déconnexion réussie.' };
      }
      // Pour les autres erreurs, on les ignore aussi car on a déjà nettoyé localement
      return { message: 'Déconnexion réussie.' };
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('django_token');
    const user = localStorage.getItem('django_user');

    console.log('=== DEBUG AUTH CHECK ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('Is authenticated:', !!(token && user));
    console.log('========================');

    return !!(token && user);
  },

  // Obtenir le token
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('django_token');
  },

  // Obtenir l'utilisateur connecté
  getCurrentUser(): DjangoUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const userStr = localStorage.getItem('django_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('=== DEBUG AUTH ===');
        console.log('User from localStorage:', user);
        console.log('Is superuser:', user?.is_superuser);
        console.log('==================');
        return user;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Obtenir les informations du profil utilisateur
  async getProfile(): Promise<DjangoUser> {
    try {
      const response = await djangoApi.get('/users/profile/');
      const user = response.data;

      // Mettre à jour les données utilisateur en local (côté client seulement)
      if (typeof window !== 'undefined') {
        localStorage.setItem('django_user', JSON.stringify(user));
      }

      return user;
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération du profil');
    }
  },

  // Changer le mot de passe
  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    try {
      const response = await djangoApi.post('/users/change-password/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        'Erreur lors du changement de mot de passe'
      );
    }
  },

  // Obtenir les statistiques utilisateur
  async getUserStats(): Promise<any> {
    try {
      const response = await djangoApi.get('/users/stats/');
      return response.data;
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }
};

// Export de l'instance axios pour d'autres services
export { djangoApi };
