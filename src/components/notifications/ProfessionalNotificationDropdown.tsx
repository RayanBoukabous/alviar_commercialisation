'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, ExternalLink, Clock, Trash } from 'lucide-react';
import { useUnreadNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteAllNotifications } from '@/lib/hooks/useNotifications';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { notificationUtils } from '@/lib/api/notificationService';

interface ProfessionalNotificationDropdownProps {
  className?: string;
}

export const ProfessionalNotificationDropdown: React.FC<ProfessionalNotificationDropdownProps> = ({ className }) => {
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
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

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

  const handleDeleteAllNotifications = () => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من إفراغ قائمة الإشعارات؟ سيتم حذف جميع الإشعارات نهائياً.' : 'Êtes-vous sûr de vouloir vider la liste des notifications ? Toutes les notifications seront définitivement supprimées.')) {
      deleteAllNotificationsMutation.mutate();
    }
  };

  const handleNotificationClick = (notification: any) => {
    const url = getNotificationUrl(notification);
    if (url) {
      if (!notification.is_read) {
        handleMarkAsRead(notification.id);
      }
      router.push(url);
      setIsOpen(false);
    }
  };

  // Fonction pour obtenir l'URL de navigation
  const getNotificationUrl = (notification: any) => {
    const { type_notification, data } = notification;
    
    if (!data || typeof data !== 'object') {
      return null;
    }
    
    switch (type_notification) {
      case 'STABULATION_CREATED':
      case 'STABULATION_TERMINATED':
        return data.stabulation_id ? `/dashboard/abattoirs/${data.stabulation_id}` : null;
      case 'BON_COMMANDE_CREATED':
      case 'BON_COMMANDE_CONFIRMED':
        return data.bon_commande_id ? `/dashboard/bons-commande/${data.bon_commande_id}` : null;
      case 'TRANSFERT_CREATED':
      case 'TRANSFERT_DELIVERED':
        return data.transfert_id ? `/dashboard/transfert/${data.transfert_id}` : null;
      case 'ABATTOIR_UPDATED':
        return data.abattoir_id ? `/dashboard/abattoirs/${data.abattoir_id}` : null;
      default:
        return null;
    }
  };

  const hasUnreadNotifications = (unreadCount?.unread_count || 0) > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bouton de notification neutre et professionnel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isOpen 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
        aria-label={isRTL ? 'الإشعارات' : 'Notifications'}
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount?.unread_count || 0}
          </span>
        )}
      </button>

      {/* Dropdown sobre et professionnel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50">
          {/* Header neutre et professionnel */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h3>
            <div className="flex items-center space-x-2">
              {hasUnreadNotifications && (
                <>
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                    title={isRTL ? 'تحديد الكل كمقروء' : 'Marquer tout comme lu'}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDeleteAllNotifications}
                    disabled={deleteAllNotificationsMutation.isPending}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                    title={isRTL ? 'إفراغ قائمة الإشعارات نهائياً' : 'Vider définitivement la liste des notifications'}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={isRTL ? 'إغلاق' : 'Fermer'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contenu des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {isRTL ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? 'خطأ في تحميل الإشعارات' : 'Erreur lors du chargement des notifications'}
                </p>
              </div>
            ) : !unreadNotifications || unreadNotifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد إشعارات جديدة' : 'Aucune notification'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {unreadNotifications.map((notification) => {
                  const isClickable = getNotificationUrl(notification) !== null;
                  const isUrgent = notification.priority === 'URGENT';
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors group ${
                        isClickable 
                          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' 
                          : ''
                      }`}
                      onClick={isClickable ? () => handleNotificationClick(notification) : undefined}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Indicateur neutre et uniforme */}
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full mt-2 bg-gray-500 dark:bg-gray-400"></div>
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-sm font-medium text-gray-900 dark:text-white line-clamp-1 ${
                              isClickable ? 'hover:text-gray-600 dark:hover:text-gray-300' : ''
                            }`}>
                              {notification.title}
                              {isClickable && (
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                  {isRTL ? 'انقر للعرض' : 'Cliquez pour voir'}
                                </span>
                              )}
                            </h4>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Informations importantes */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{notificationUtils.formatTimeAgo(notification.created_at)}</span>
                            </div>
                            
                            {/* Actions discrètes et neutres */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title={isRTL ? 'تحديد كمقروء' : 'Marquer comme lu'}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title={isRTL ? 'حذف' : 'Supprimer'}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer avec bouton trash global */}
          {hasUnreadNotifications && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount?.unread_count || 0} {isRTL ? 'إشعار غير مقروء' : 'notification(s) non lue(s)'}
                </div>
                <button
                  onClick={handleDeleteAllNotifications}
                  disabled={deleteAllNotificationsMutation.isPending}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title={isRTL ? 'إفراغ قائمة الإشعارات نهائياً' : 'Vider définitivement la liste des notifications'}
                >
                  <Trash className="h-3 w-3" />
                  <span>{isRTL ? 'إفراغ قائمة الإشعارات' : 'Vider la liste des notifications'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};