import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGlobalRefreshConfig } from './useGlobalRefreshConfig';

interface UseIntelligentRefreshOptions {
    pageName: string; // Nom de la page pour les logs
    queryKeys: string[]; // Clés de requêtes à invalider
    enableAutoRefresh?: boolean;
    enableManualRefresh?: boolean;
    forceRefresh?: boolean; // Force le refresh même si la page est statique
}

export const useIntelligentRefresh = (options: UseIntelligentRefreshOptions) => {
    const {
        pageName,
        queryKeys,
        enableAutoRefresh = true,
        enableManualRefresh = true,
        forceRefresh = true
    } = options;

    const queryClient = useQueryClient();
    const { refreshInterval, isInitialized } = useGlobalRefreshConfig();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPageVisible = useRef(true);

    // Fonction de refresh manuel
    const handleManualRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            console.log(`🔄 Manual refresh triggered for ${pageName}`);

            // Invalider toutes les requêtes spécifiées
            await Promise.all(
                queryKeys.map(key =>
                    queryClient.invalidateQueries({ queryKey: [key] })
                )
            );

            // Forcer le refetch immédiat des requêtes actives
            await Promise.all(
                queryKeys.map(key =>
                    queryClient.refetchQueries({ queryKey: [key] })
                )
            );

            setLastRefresh(new Date());
            console.log(`✅ ${pageName} refreshed successfully`);
        } catch (error) {
            console.error(`❌ Error refreshing ${pageName}:`, error);
        } finally {
            setIsRefreshing(false);
        }
    }, [queryClient, isRefreshing, pageName, queryKeys]);

    // Auto-refresh intelligent
    useEffect(() => {
        if (!enableAutoRefresh || !isInitialized) return;

        const startAutoRefresh = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                // Force le rafraîchissement même si la page est statique
                if (forceRefresh) {
                    console.log(`🔄 Auto-refreshing ${pageName} (force mode)...`);
                    console.log(`📊 ${pageName} refresh interval: ${refreshInterval / 1000} seconds`);
                    handleManualRefresh();
                } else if (isPageVisible.current) {
                    console.log(`🔄 Auto-refreshing ${pageName} (visible mode)...`);
                    handleManualRefresh();
                }
            }, refreshInterval);
        };

        startAutoRefresh();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [refreshInterval, enableAutoRefresh, handleManualRefresh, pageName, forceRefresh, isInitialized]);

    // Écouter les événements de synchronisation cross-tab
    useEffect(() => {
        const handleCrossTabSync = (event: CustomEvent) => {
            const { type, data } = event.detail;

            // Vérifier si l'événement concerne cette page
            const shouldRefresh = queryKeys.some(key => {
                if (typeof key === 'string') {
                    return key.includes('dashboard') ||
                        key.includes('abattoir-stats') ||
                        key.includes('stock') ||
                        key.includes('stabulation') ||
                        key.includes('livestock') ||
                        key.includes('betes');
                }
                return false;
            });

            if (shouldRefresh) {
                console.log(`🔄 Cross-tab sync event received for ${pageName}:`, type, data);
                handleManualRefresh();
            }
        };

        // Écouter les événements de synchronisation
        window.addEventListener('alviar-sync', handleCrossTabSync as EventListener);

        return () => {
            window.removeEventListener('alviar-sync', handleCrossTabSync as EventListener);
        };
    }, [handleManualRefresh, pageName, queryKeys]);

    // Détecter la visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;

            // Si la page redevient visible, refresh immédiat
            if (!document.hidden) {
                console.log(`👁️ ${pageName} became visible, refreshing...`);
                handleManualRefresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleManualRefresh);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleManualRefresh);
        };
    }, [handleManualRefresh, pageName]);

    // Formatage du temps depuis le dernier refresh
    const getTimeSinceLastRefresh = useCallback(() => {
        if (!lastRefresh) return 'Jamais';

        const now = new Date();
        const diffMs = now.getTime() - lastRefresh.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'À l\'instant';
        if (diffMinutes === 1) return 'Il y a 1 minute';
        if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return 'Il y a 1 heure';
        return `Il y a ${diffHours} heures`;
    }, [lastRefresh]);

    return {
        isRefreshing,
        lastRefresh,
        handleManualRefresh,
        timeSinceLastRefresh: getTimeSinceLastRefresh(),
        enableManualRefresh,
        refreshInterval,
        isInitialized
    };
};
