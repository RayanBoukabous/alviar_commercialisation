'use client';

import React from 'react';
import { ExternalLink, Check, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  generateNotificationUrl, 
  isNotificationNavigable, 
  getNotificationNavigationConfig,
  handleNotificationNavigation 
} from '@/lib/utils/notificationNavigation';
import { notificationUtils } from '@/lib/api/notificationService';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (notification: any) => void;
  isRTL?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  isRTL = false
}) => {
  const { t } = useLanguage();
  
  const isNavigable = isNotificationNavigable(notification);
  const navigationConfig = getNotificationNavigationConfig(notification);
  
  const handleClick = () => {
    if (isNavigable) {
      onNavigate(notification);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={`
        p-4 transition-all duration-200 border-l-4
        ${isNavigable 
          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-primary-500 bg-primary-50/30 dark:bg-primary-900/20' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${notificationUtils.getPriorityBgColor(notification.priority)}
      `}
      onClick={isNavigable ? handleClick : undefined}
    >
      <div className="flex items-start space-x-3">
        {/* Icône de type */}
        <div className="flex-shrink-0">
          <span className="text-lg">
            {navigationConfig?.icon || notificationUtils.getNotificationIcon(notification.type_notification)}
          </span>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* En-tête avec titre et priorité */}
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-medium theme-text-primary truncate ${
              isNavigable ? 'hover:text-primary-600' : ''
            }`}>
              {notification.title}
              {isNavigable && (
                <span className="ml-2 text-xs text-primary-500">
                  {isRTL ? 'انقر للعرض' : 'Cliquez pour voir'}
                </span>
              )}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full ${notificationUtils.getPriorityColor(notification.priority)}`}>
              {notification.priority_display}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm theme-text-secondary mb-3 line-clamp-2">
            {notification.message}
          </p>

          {/* Bouton de navigation si navigable */}
          {isNavigable && (
            <div className="mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="inline-flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                {navigationConfig?.title || (isRTL ? 'عرض التفاصيل' : 'Voir les détails')}
              </button>
            </div>
          )}

          {/* Footer avec timestamp et actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs theme-text-tertiary">
              <Clock className="h-3 w-3 mr-1" />
              {notificationUtils.formatTimeAgo(notification.created_at)}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMarkAsRead}
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title={isRTL ? 'تحديد كمقروء' : 'Marquer comme lu'}
              >
                <Check className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title={isRTL ? 'حذف' : 'Supprimer'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
