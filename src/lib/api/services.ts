import { apiClient } from './client';
import { API_ENDPOINTS } from '@/lib/config/api';
import { User, DashboardMetrics, ChartData, PaginatedResponse, PaginationParams, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types';

// Service pour l'authentification
export const authService = {
  // Connexion
  login: async (email: string, password: string) => {
    const loginData: LoginRequest = { email, password };
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData);
  },

  // Inscription
  register: async (userData: RegisterRequest) => {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  // Déconnexion
  logout: async () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Vérification du token
  verifyToken: async () => {
    return apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.VERIFY);
  },

  // Mot de passe oublié
  forgotPassword: async (email: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Réinitialisation du mot de passe
  resetPassword: async (token: string, password: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  },

  // Changement de mot de passe
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  // Rafraîchir le token
  refreshToken: async () => {
    return apiClient.post<{ access_token: string; message: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  },
};

// Service pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  getUsers: async (params?: PaginationParams & { search?: string; role?: string }) => {
    return apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params });
  },

  // Récupérer un utilisateur par ID
  getUser: async (id: string) => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  // Créer un utilisateur
  createUser: async (userData: Partial<User>) => {
    return apiClient.post<User>(API_ENDPOINTS.USERS.BASE, userData);
  },

  // Mettre à jour un utilisateur
  updateUser: async (id: string, userData: Partial<User>) => {
    return apiClient.put<User>(API_ENDPOINTS.USERS.BY_ID(id), userData);
  },

  // Supprimer un utilisateur
  deleteUser: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },

  // Mettre à jour le profil de l'utilisateur connecté
  updateProfile: async (userData: Partial<User>) => {
    return apiClient.put<User>(API_ENDPOINTS.USERS.PROFILE, userData);
  },

  // Upload d'avatar
  uploadAvatar: async (file: File, onProgress?: (progress: number) => void) => {
    return apiClient.upload<{ avatarUrl: string }>(API_ENDPOINTS.USERS.AVATAR, file, onProgress);
  },
};

// Service pour le dashboard
export const dashboardService = {
  // Récupérer les métriques du dashboard
  getMetrics: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get<DashboardMetrics>(API_ENDPOINTS.DASHBOARD.METRICS, {
      params: dateRange,
    });
  },

  // Récupérer les données des graphiques
  getChartData: async (chartType: string, dateRange?: { start: string; end: string }) => {
    return apiClient.get<ChartData>(API_ENDPOINTS.DASHBOARD.CHARTS(chartType), {
      params: dateRange,
    });
  },

  // Récupérer les données de liveness
  getLivenessData: async (params?: PaginationParams & {
    dateRange?: { start: string; end: string };
    status?: string;
  }) => {
    return apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.DASHBOARD.LIVENESS_DATA, { params });
  },

  // Exporter les données
  exportData: async (format: 'csv' | 'xlsx' | 'pdf', filters?: any) => {
    return apiClient.post<{ downloadUrl: string }>(API_ENDPOINTS.DASHBOARD.EXPORT, {
      format,
      filters,
    });
  },
};

// Service pour les analytics
export const analyticsService = {
  // Récupérer les statistiques générales
  getStats: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get('/analytics/stats', { params: dateRange });
  },

  // Récupérer les données de performance
  getPerformanceData: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get<ChartData>('/analytics/performance', { params: dateRange });
  },

  // Récupérer les données de conversion
  getConversionData: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get<ChartData>('/analytics/conversion', { params: dateRange });
  },

  // Récupérer les données géographiques
  getGeoData: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get<ChartData>('/analytics/geo', { params: dateRange });
  },
};

// Service pour les paramètres
export const settingsService = {
  // Récupérer les paramètres
  getSettings: async () => {
    return apiClient.get('/settings');
  },

  // Mettre à jour les paramètres
  updateSettings: async (settings: any) => {
    return apiClient.put('/settings', settings);
  },

  // Récupérer les préférences utilisateur
  getUserPreferences: async () => {
    return apiClient.get('/settings/preferences');
  },

  // Mettre à jour les préférences utilisateur
  updateUserPreferences: async (preferences: any) => {
    return apiClient.put('/settings/preferences', preferences);
  },
};

// Service pour les notifications
export const notificationService = {
  // Récupérer les notifications
  getNotifications: async (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<any>>('/notifications', { params });
  },

  // Marquer une notification comme lue
  markAsRead: async (id: string) => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    return apiClient.put('/notifications/read-all');
  },

  // Supprimer une notification
  deleteNotification: async (id: string) => {
    return apiClient.delete(`/notifications/${id}`);
  },
};

// Service pour les logs
export const logService = {
  // Récupérer les logs
  getLogs: async (params?: PaginationParams & {
    level?: string;
    dateRange?: { start: string; end: string };
  }) => {
    return apiClient.get<PaginatedResponse<any>>('/logs', { params });
  },

  // Récupérer les logs d'erreur
  getErrorLogs: async (params?: PaginationParams) => {
    return apiClient.get<PaginatedResponse<any>>('/logs/errors', { params });
  },

  // Exporter les logs
  exportLogs: async (format: 'csv' | 'xlsx', filters?: any) => {
    return apiClient.post<{ downloadUrl: string }>('/logs/export', {
      format,
      filters,
    });
  },
};

// Export de tous les services
export const apiServices = {
  auth: authService,
  users: userService,
  dashboard: dashboardService,
  analytics: analyticsService,
  settings: settingsService,
  notifications: notificationService,
  logs: logService,
};
