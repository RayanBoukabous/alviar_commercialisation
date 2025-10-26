'use client';

import React from 'react';
import { 
  ExternalLink, 
  CheckCircle, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { notificationUtils } from '@/lib/api/notificationService';

interface ProfessionalNotificationItemProps {
  notification: any;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (notification: any) => void;
  isRTL?: boolean;
  isCompact?: boolean;
}

export const ProfessionalNotificationItem: React.FC<ProfessionalNotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  isRTL = false,
  isCompact = false
}) => {
  const { t } = useLanguage();
  
  const isNavigable = getNotificationUrl(notification) !== null;
  const isUrgent = notification.priority === 'URGENT';
  const isHigh = notification.priority === 'HIGH';
  
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

  // Icône de priorité
  const getPriorityIcon = () => {
    if (isUrgent) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (isHigh) return <Zap className="h-4 w-4 text-orange-600" />;
    return <Info className="h-4 w-4 text-blue-600" />;
  };

  // Couleur de bordure selon la priorité
  const getBorderColor = () => {
    if (isUrgent) return 'border-l-red-500';
    if (isHigh) return 'border-l-orange-500';
    return 'border-l-blue-500';
  };

  // Couleur de fond selon la priorité
  const getBackgroundColor = () => {
    if (isUrgent) return 'bg-red-50 dark:bg-red-900/20';
    if (isHigh) return 'bg-orange-50 dark:bg-orange-900/20';
    return 'bg-blue-50 dark:bg-blue-900/20';
  };

  if (isCompact) {
    return (
      <div
        className={`
          p-3 transition-all duration-200 group border-l-4 ${getBorderColor()}
          ${isNavigable 
            ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' 
            : ''
          }
          ${getBackgroundColor()}
        `}
        onClick={isNavigable ? handleClick : undefined}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getPriorityIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium theme-text-primary truncate">
              {notification.title}
            </h4>
            <p className="text-xs theme-text-secondary truncate">
              {notification.message}
            </p>
          </div>
          {isNavigable && (
            <ExternalLink className="h-4 w-4 text-primary-600" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        p-4 transition-all duration-200 group border-l-4 ${getBorderColor()}
        ${isNavigable 
          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' 
          : ''
        }
        ${getBackgroundColor()}
      `}
      onClick={isNavigable ? handleClick : undefined}
    >
      <div className="flex items-start space-x-3">
        {/* Icône de priorité avec badge */}
        <div className="flex-shrink-0 relative">
          <div className={`
            p-3 rounded-xl
            ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 
              isHigh ? 'bg-orange-100 dark:bg-orange-900/30' : 
              'bg-blue-100 dark:bg-blue-900/30'}
          `}>
            {getPriorityIcon()}
          </div>
          {isUrgent && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* En-tête avec titre et badges */}
          <div className="flex items-start justify-between mb-2">
            <h4 className={`text-sm font-semibold theme-text-primary line-clamp-1 ${
              isNavigable ? 'hover:text-primary-600' : ''
            }`}>
              {notification.title}
              {isNavigable && (
                <span className="ml-2 text-xs text-primary-500">
                  {isRTL ? 'انقر للعرض' : 'Cliquez pour voir'}
                </span>
              )}
            </h4>
            <div className="flex items-center space-x-2">
              {isUrgent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                  {isRTL ? 'عاجل' : 'URGENT'}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${notificationUtils.getPriorityColor(notification.priority)}`}>
                {notification.priority_display}
              </span>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm theme-text-secondary mb-3 line-clamp-2">
            {notification.message}
          </p>

          {/* Bouton d'action si navigable */}
          {isNavigable && (
            <div className="mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm
                  ${isUrgent 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : isHigh 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }
                `}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
              </button>
            </div>
          )}

          {/* Footer avec timestamp et actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs theme-text-tertiary">
              <Clock className="h-3 w-3 mr-1" />
              {notificationUtils.formatTimeAgo(notification.created_at)}
            </div>

            {/* Actions avec animation */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button
                onClick={handleMarkAsRead}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                title={isRTL ? 'تحديد كمقروء' : 'Marquer comme lu'}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title={isRTL ? 'حذف' : 'Supprimer'}
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
