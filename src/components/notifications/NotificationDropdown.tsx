'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { useUnreadNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { NotificationItem } from './NotificationItem';
import { handleNotificationNavigation } from '@/lib/utils/notificationNavigation';

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  const router = useRouter();

  // Hooks pour les notifications
  const { data: unreadNotifications, isLoading, error } = useUnreadNotifications(10);
  const { data: unreadCount } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Gestionnaires d'événements
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleNotificationNavigation = (notification: any) => {
    const success = handleNotificationNavigation(
      notification,
      router,
      handleMarkAsRead,
      () => setIsOpen(false)
    );

    if (!success) {
      console.warn('Navigation échouée pour la notification:', notification);
    }
  };

  const hasUnreadNotifications = (unreadCount?.unread_count || 0) > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label={isRTL ? 'الإشعارات' : 'Notifications'}
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount?.unread_count || 0}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary">
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h3>
            <div className="flex items-center space-x-2">
              {hasUnreadNotifications && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="p-1.5 text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                  title={isRTL ? 'تحديد الكل كمقروء' : 'Marquer tout comme lu'}
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title={isRTL ? 'إغلاق' : 'Fermer'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm theme-text-secondary mt-2">
                  {isRTL ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {isRTL ? 'خطأ في تحميل الإشعارات' : 'Erreur lors du chargement des notifications'}
                </p>
              </div>
            ) : !unreadNotifications || unreadNotifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm theme-text-secondary">
                  {isRTL ? 'لا توجد إشعارات جديدة' : 'Aucune notification'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    onNavigate={handleNotificationNavigation}
                    isRTL={isRTL}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {hasUnreadNotifications && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-xs theme-text-secondary">
                <span>
                  {unreadCount?.unread_count || 0} {isRTL ? 'إشعار غير مقروء' : 'notification(s) non lue(s)'}
                </span>
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-primary-600 hover:text-primary-800 disabled:opacity-50 transition-colors"
                >
                  {isRTL ? 'تحديد الكل كمقروء' : 'Marquer tout comme lu'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};