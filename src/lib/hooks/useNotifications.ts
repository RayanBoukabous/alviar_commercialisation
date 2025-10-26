import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationFilters, Notification } from '@/lib/api/notificationService';

// Clés de requête
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: number) => [...notificationKeys.details(), id] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// Hook pour récupérer les notifications
export const useNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 30000, // 30 secondes
  });
};

// Hook pour récupérer les notifications non lues
export const useUnreadNotifications = (limit: number = 10) => {
  return useQuery({
    queryKey: [...notificationKeys.unread(), limit],
    queryFn: () => notificationService.getUnreadNotifications(limit),
    staleTime: 10000, // 10 secondes
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });
};

// Hook pour récupérer une notification spécifique
export const useNotification = (id: number) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getNotification(id),
    enabled: !!id,
  });
};

// Hook pour récupérer le nombre de notifications non lues
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 5000, // 5 secondes
    refetchInterval: 15000, // Refetch toutes les 15 secondes
  });
};

// Hook pour récupérer les statistiques des notifications
export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.getStats(),
    staleTime: 60000, // 1 minute
  });
};

// Hook pour marquer une notification comme lue
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });

      // Mettre à jour la notification spécifique
      queryClient.setQueryData(notificationKeys.detail(id), (old: Notification) => {
        if (old) {
          return { ...old, is_read: true, read_at: new Date().toISOString() };
        }
        return old;
      });
    },
  });
};

// Hook pour marquer toutes les notifications comme lues
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalider toutes les requêtes de notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Hook pour supprimer une notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: (_, id) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });

      // Supprimer la notification du cache
      queryClient.removeQueries({ queryKey: notificationKeys.detail(id) });
    },
  });
};

// Hook pour mettre à jour une notification
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Notification> }) =>
      notificationService.updateNotification(id, data),
    onSuccess: (updatedNotification, { id }) => {
      // Mettre à jour la notification dans le cache
      queryClient.setQueryData(notificationKeys.detail(id), updatedNotification);

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

// Hook pour supprimer toutes les notifications
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      // Invalider toutes les requêtes de notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Hook pour rafraîchir les notifications
export const useRefreshNotifications = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };
};
