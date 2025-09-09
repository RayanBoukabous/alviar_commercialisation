import { apiClient } from './client';
import { API_ENDPOINTS } from '@/lib/config/api';
import { PaginatedResponse, PaginationParams, LivenessSession } from '@/types';

// Types spécifiques pour les données de liveness (ancien format)
export interface LegacyLivenessSession {
  id: string;
  userId: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  createdAt: string;
  completedAt?: string;
  attempts: number;
  maxAttempts: number;
  metadata?: {
    deviceInfo?: any;
    location?: any;
    ipAddress?: string;
  };
}

export interface LivenessMetrics {
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  pendingSessions: number;
  successRate: number;
  averageAttempts: number;
  averageCompletionTime: number;
}

export interface LivenessFilters {
  status?: 'pending' | 'verified' | 'failed' | 'expired';
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
  deviceType?: string;
}

// Service spécialisé pour les données de liveness
export const livenessService = {
  // Récupérer toutes les sessions de liveness
  getSessions: async (params?: PaginationParams & LivenessFilters) => {
    return apiClient.get<PaginatedResponse<LegacyLivenessSession>>(API_ENDPOINTS.LIVENESS.SESSIONS, { params });
  },

  // Récupérer une session par ID
  getSession: async (id: string) => {
    return apiClient.get<LegacyLivenessSession>(API_ENDPOINTS.LIVENESS.BY_ID(id));
  },

  // Créer une nouvelle session de liveness
  createSession: async (userId: string, metadata?: any) => {
    return apiClient.post<LegacyLivenessSession>(API_ENDPOINTS.LIVENESS.BASE, {
      userId,
      metadata,
    });
  },

  // Vérifier une session de liveness
  verifySession: async (sessionId: string, verificationData: any) => {
    return apiClient.post<{ success: boolean; score: number; details: any }>(
      API_ENDPOINTS.LIVENESS.VERIFY,
      {
        sessionId,
        verificationData,
      }
    );
  },

  // Récupérer l'historique des sessions
  getHistory: async (params?: PaginationParams & LivenessFilters) => {
    return apiClient.get<PaginatedResponse<LegacyLivenessSession>>(API_ENDPOINTS.LIVENESS.HISTORY, { params });
  },

  // Récupérer les métriques de liveness
  getMetrics: async (dateRange?: { start: string; end: string }) => {
    return apiClient.get<LivenessMetrics>(API_ENDPOINTS.DASHBOARD.METRICS, {
      params: { type: 'liveness', ...dateRange },
    });
  },

  // Exporter les données de liveness
  exportSessions: async (format: 'csv' | 'xlsx' | 'pdf', filters?: LivenessFilters) => {
    return apiClient.post<{ downloadUrl: string }>(API_ENDPOINTS.DASHBOARD.EXPORT, {
      type: 'liveness',
      format,
      filters,
    });
  },

  // Supprimer une session
  deleteSession: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.LIVENESS.BY_ID(id));
  },

  // Annuler une session en cours
  cancelSession: async (id: string) => {
    return apiClient.patch(API_ENDPOINTS.LIVENESS.BY_ID(id), {
      status: 'cancelled',
    });
  },

  // Récupérer les statistiques en temps réel
  getRealTimeStats: async () => {
    return apiClient.get<{
      activeSessions: number;
      completedToday: number;
      failedToday: number;
      averageResponseTime: number;
    }>('/liveness/stats/realtime');
  },

  // Récupérer les sessions de liveness par client ID
  getSessionsByClientId: async (clientId: number): Promise<LivenessSession[]> => {
    const response = await apiClient.get<LivenessSession[]>(`/liveness-sessions/client/${clientId}`);
    // L'API retourne directement un tableau, pas un objet ApiResponse
    return Array.isArray(response) ? response : response.data || [];
  },
};

export default livenessService;
