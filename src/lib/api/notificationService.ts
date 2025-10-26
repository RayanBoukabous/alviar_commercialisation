import { api } from './apiService';

// Types pour les notifications
export interface Notification {
  id: number;
  type_notification: string;
  type_display: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priority_display: string;
  is_read: boolean;
  read_at: string | null;
  abattoir: number | null;
  abattoir_nom: string | null;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  time_since_created: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  urgent_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: string;
  priority?: string;
  abattoir_id?: number;
}

// Service pour les notifications
export const notificationService = {
  // Récupérer la liste des notifications
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.abattoir_id) params.append('abattoir_id', filters.abattoir_id.toString());

    const response = await api.get(`/notifications/?${params.toString()}`);
    return response.data;
  },

  // Récupérer les notifications non lues
  async getUnreadNotifications(limit: number = 10): Promise<Notification[]> {
    const response = await api.get(`/notifications/unread/?limit=${limit}`);
    return response.data.results;
  },

  // Récupérer une notification spécifique
  async getNotification(id: number): Promise<Notification> {
    const response = await api.get(`/notifications/${id}/`);
    return response.data;
  },

  // Marquer une notification comme lue
  async markAsRead(id: number): Promise<void> {
    await api.post(`/notifications/${id}/mark-read/`);
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/notifications/unread-count/');
    return response.data;
  },

  // Récupérer les statistiques des notifications
  async getStats(): Promise<NotificationStats> {
    const response = await api.get('/notifications/stats/');
    return response.data;
  },

  // Supprimer une notification
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}/`);
  },

  // Mettre à jour une notification
  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/`, data);
    return response.data;
  },

  // Supprimer toutes les notifications
  async deleteAllNotifications(): Promise<{ message: string; deleted_count: number }> {
    const response = await api.delete('/notifications/delete-all/');
    return response.data;
  }
};

// Fonctions utilitaires
export const notificationUtils = {
  // Formater le temps écoulé
  formatTimeAgo(timeString: string): string {
    const now = new Date();
    const time = new Date(timeString);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  },

  // Obtenir l'icône selon le type de notification
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'STABULATION_CREATED': '🏠',
      'STABULATION_TERMINATED': '✅',
      'BON_COMMANDE_CREATED': '📋',
      'BON_COMMANDE_CONFIRMED': '✅',
      'TRANSFERT_CREATED': '🚚',
      'TRANSFERT_DELIVERED': '📦',
      'ABATTOIR_UPDATED': '🏢'
    };
    return iconMap[type] || '🔔';
  },

  // Obtenir la couleur selon la priorité
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'LOW': 'text-gray-500',
      'MEDIUM': 'text-blue-500',
      'HIGH': 'text-orange-500',
      'URGENT': 'text-red-500'
    };
    return colorMap[priority] || 'text-gray-500';
  },

  // Obtenir la couleur de fond selon la priorité
  getPriorityBgColor(priority: string): string {
    const bgColorMap: Record<string, string> = {
      'LOW': 'bg-gray-100 dark:bg-gray-800',
      'MEDIUM': 'bg-blue-100 dark:bg-blue-900/30',
      'HIGH': 'bg-orange-100 dark:bg-orange-900/30',
      'URGENT': 'bg-red-100 dark:bg-red-900/30'
    };
    return bgColorMap[priority] || 'bg-gray-100 dark:bg-gray-800';
  }
};
