'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  Settings,
  Star,
  Shield,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { useUnreadNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { notificationUtils } from '@/lib/api/notificationService';

interface EnterpriseNotificationBarProps {
  className?: string;
}

export const EnterpriseNotificationBar: React.FC<EnterpriseNotificationBarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  const router = useRouter();

  // Hooks pour les notifications
  const { data: unreadNotifications, isLoading, error } = useUnreadNotifications(50);
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

  // Filtrage des notifications
  const filteredNotifications = unreadNotifications?.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.is_read) ||
      (filter === 'urgent' && notification.priority === 'URGENT') ||
      (filter === 'high' && notification.priority === 'HIGH');
    
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const hasUnreadNotifications = (unreadCount?.unread_count || 0) > 0;
  const urgentCount = unreadNotifications?.filter(n => n.priority === 'URGENT').length || 0;
  const highCount = unreadNotifications?.filter(n => n.priority === 'HIGH').length || 0;

  // Statistiques des notifications
  const getNotificationStats = () => {
    const total = unreadNotifications?.length || 0;
    const unread = unreadCount?.unread_count || 0;
    const urgent = urgentCount;
    const high = highCount;
    
    return { total, unread, urgent, high };
  };

  const stats = getNotificationStats();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bouton principal ultra professionnel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300
          ${isOpen 
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
          }
        `}
        aria-label={isRTL ? 'مركز الإشعارات' : 'Centre de Notifications'}
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce shadow-lg">
              {unreadCount?.unread_count || 0}
            </div>
          )}
        </div>
        
        <div className="hidden sm:block">
          <span className="text-sm font-semibold">
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </span>
          {hasUnreadNotifications && (
            <div className="text-xs opacity-90">
              {unreadCount?.unread_count || 0} {isRTL ? 'جديد' : 'nouveau(x)'}
            </div>
          )}
        </div>
        
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown ultra professionnel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header avec gradient et statistiques */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isRTL ? 'مركز الإشعارات' : 'Centre de Notifications'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {isRTL ? 'إدارة شاملة للإشعارات' : 'Gestion complète des notifications'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Statistiques en temps réel */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: isRTL ? 'المجموع' : 'Total', value: stats.total, icon: Info, color: 'text-blue-200' },
                { label: isRTL ? 'غير مقروء' : 'Non lues', value: stats.unread, icon: Clock, color: 'text-yellow-200' },
                { label: isRTL ? 'عاجل' : 'Urgentes', value: stats.urgent, icon: AlertTriangle, color: 'text-red-200' },
                { label: isRTL ? 'مهم' : 'Importantes', value: stats.high, icon: Star, color: 'text-orange-200' }
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <div className={`${color} mb-1`}>
                    <Icon className="h-4 w-4 mx-auto" />
                  </div>
                  <div className="text-white font-bold text-lg">{value}</div>
                  <div className="text-primary-100 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre de contrôles avancés */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث المتقدم...' : 'Recherche avancée...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title={isRTL ? 'تغيير العرض' : 'Changer la vue'}
                >
                  {viewMode === 'list' ? <MoreHorizontal className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex space-x-1">
                  {[
                    { key: 'all', label: isRTL ? 'الكل' : 'Toutes', count: stats.total, color: 'bg-gray-600' },
                    { key: 'unread', label: isRTL ? 'غير مقروء' : 'Non lues', count: stats.unread, color: 'bg-yellow-600' },
                    { key: 'urgent', label: isRTL ? 'عاجل' : 'Urgentes', count: stats.urgent, color: 'bg-red-600' },
                    { key: 'high', label: isRTL ? 'مهم' : 'Importantes', count: stats.high, color: 'bg-orange-600' }
                  ].map(({ key, label, count, color }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                        ${filter === key
                          ? `${color} text-white shadow-md`
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          {hasUnreadNotifications && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {isRTL ? 'إجراءات سريعة' : 'Actions rapides'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>{isRTL ? 'تحديد الكل كمقروء' : 'Marquer tout comme lu'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenu des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? 'جاري التحميل...' : 'Chargement...'}
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  {isRTL ? 'خطأ في النظام' : 'Erreur système'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'تعذر تحميل الإشعارات' : 'Impossible de charger les notifications'}
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'لا توجد إشعارات' : 'Aucune notification'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد إشعارات تطابق الفلتر المحدد' : 'Aucune notification ne correspond au filtre sélectionné'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => {
                  const isClickable = getNotificationUrl(notification) !== null;
                  const isUrgent = notification.priority === 'URGENT';
                  const isHigh = notification.priority === 'HIGH';
                  
                  return (
                    <div
                      key={notification.id}
                      className={`
                        p-4 transition-all duration-200 group
                        ${isClickable 
                          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-primary-500' 
                          : ''
                        }
                        ${isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 
                          isHigh ? 'bg-orange-50 dark:bg-orange-900/20' : ''}
                      `}
                      onClick={isClickable ? () => handleNotificationClick(notification) : undefined}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icône de priorité avec animation */}
                        <div className="flex-shrink-0">
                          <div className={`
                            p-3 rounded-xl relative
                            ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : 
                              isHigh ? 'bg-orange-100 dark:bg-orange-900/30' : 
                              'bg-blue-100 dark:bg-blue-900/30'}
                          `}>
                            {isUrgent ? (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : isHigh ? (
                              <Star className="h-5 w-5 text-orange-600" />
                            ) : (
                              <Info className="h-5 w-5 text-blue-600" />
                            )}
                            {isUrgent && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`text-sm font-semibold theme-text-primary line-clamp-1 ${
                              isClickable ? 'hover:text-primary-600' : ''
                            }`}>
                              {notification.title}
                              {isClickable && (
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
                              {isHigh && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                  {isRTL ? 'مهم' : 'IMPORTANT'}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${notificationUtils.getPriorityColor(notification.priority)}`}>
                                {notification.priority_display}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm theme-text-secondary mb-3 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Bouton d'action si cliquable */}
                          {isClickable && (
                            <div className="mb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                title={isRTL ? 'تحديد كمقروء' : 'Marquer comme lu'}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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
                })}
              </div>
            )}
          </div>

          {/* Footer avec statistiques et paramètres */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs theme-text-secondary">
              <div className="flex items-center space-x-4">
                <span className="font-medium">
                  {filteredNotifications.length} {isRTL ? 'إشعار' : 'notification(s)'}
                </span>
                {urgentCount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {urgentCount} {isRTL ? 'عاجل' : 'urgente(s)'}
                  </span>
                )}
                {highCount > 0 && (
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    {highCount} {isRTL ? 'مهم' : 'importante(s)'}
                  </span>
                )}
              </div>
              <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 transition-colors">
                <Settings className="h-3 w-3" />
                <span>{isRTL ? 'الإعدادات' : 'Paramètres'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
