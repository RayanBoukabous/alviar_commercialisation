import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { handleNotificationNavigation as handleNavigation } from '@/lib/utils/notificationNavigation';

/**
 * Hook personnalisé pour gérer la navigation depuis les notifications
 * Solution professionnelle et optimale
 */
export const useNotificationNavigation = () => {
    const router = useRouter();

    const navigateFromNotification = useCallback((
        notification: any,
        onMarkAsRead?: (id: number) => void,
        onClose?: () => void
    ) => {
        return handleNavigation(notification, router, onMarkAsRead, onClose);
    }, [router]);

    return {
        navigateFromNotification
    };
};
