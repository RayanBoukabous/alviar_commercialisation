/**
 * Utilitaires pour la navigation depuis les notifications
 * Solution professionnelle et optimale pour la navigation
 */

export interface NotificationNavigationConfig {
    type: string;
    baseUrl: string;
    idField: string;
    title: string;
    icon: string;
}

/**
 * Configuration de navigation pour chaque type de notification
 */
export const NOTIFICATION_NAVIGATION_CONFIG: Record<string, NotificationNavigationConfig> = {
    TRANSFERT_CREATED: {
        type: 'TRANSFERT_CREATED',
        baseUrl: '/dashboard/transfert',
        idField: 'transfert_id',
        title: 'Voir le transfert',
        icon: '🚚'
    },
    TRANSFERT_DELIVERED: {
        type: 'TRANSFERT_DELIVERED',
        baseUrl: '/dashboard/transfert',
        idField: 'transfert_id',
        title: 'Voir le transfert',
        icon: '🚚'
    },
    STABULATION_CREATED: {
        type: 'STABULATION_CREATED',
        baseUrl: '/dashboard/abattoirs',
        idField: 'stabulation_id',
        title: 'Voir la stabulation',
        icon: '🏠'
    },
    STABULATION_TERMINATED: {
        type: 'STABULATION_TERMINATED',
        baseUrl: '/dashboard/abattoirs',
        idField: 'stabulation_id',
        title: 'Voir la stabulation',
        icon: '🏠'
    },
    BON_COMMANDE_CREATED: {
        type: 'BON_COMMANDE_CREATED',
        baseUrl: '/dashboard/bons-commande',
        idField: 'bon_commande_id',
        title: 'Voir le bon de commande',
        icon: '📋'
    },
    BON_COMMANDE_CONFIRMED: {
        type: 'BON_COMMANDE_CONFIRMED',
        baseUrl: '/dashboard/bons-commande',
        idField: 'bon_commande_id',
        title: 'Voir le bon de commande',
        icon: '📋'
    },
    ABATTOIR_UPDATED: {
        type: 'ABATTOIR_UPDATED',
        baseUrl: '/dashboard/abattoirs',
        idField: 'abattoir_id',
        title: 'Voir l\'abattoir',
        icon: '🏭'
    }
};

/**
 * Génère l'URL de navigation pour une notification
 */
export const generateNotificationUrl = (notification: any): string | null => {
    if (!notification || !notification.type_notification || !notification.data) {
        return null;
    }

    const config = NOTIFICATION_NAVIGATION_CONFIG[notification.type_notification];
    if (!config) {
        return null;
    }

    const id = notification.data[config.idField];
    if (!id) {
        return null;
    }

    return `${config.baseUrl}/${id}`;
};

/**
 * Vérifie si une notification est navigable
 */
export const isNotificationNavigable = (notification: any): boolean => {
    return generateNotificationUrl(notification) !== null;
};

/**
 * Obtient la configuration de navigation pour une notification
 */
export const getNotificationNavigationConfig = (notification: any): NotificationNavigationConfig | null => {
    if (!notification || !notification.type_notification) {
        return null;
    }

    return NOTIFICATION_NAVIGATION_CONFIG[notification.type_notification] || null;
};

/**
 * Gère la navigation depuis une notification
 */
export const handleNotificationNavigation = (
    notification: any,
    router: any,
    onMarkAsRead?: (id: number) => void,
    onClose?: () => void
): boolean => {
    const url = generateNotificationUrl(notification);

    if (!url) {
        console.warn('Navigation impossible: URL non générée pour la notification', notification);
        return false;
    }

    try {
        // Marquer comme lu si nécessaire
        if (notification && !notification.is_read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }

        // Naviguer vers la page
        router.push(url);

        // Fermer le dropdown si nécessaire
        if (onClose) {
            onClose();
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        return false;
    }
};
