/**
 * Hook spécialisé pour la synchronisation temps réel du Dashboard
 * Combine useIntelligentRefresh, useCrossTabSync, et useServerSentEvents
 */
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIntelligentRefresh } from './useIntelligentRefresh';
import { useCrossTabSync } from './useCrossTabSync';
import { useServerSentEvents } from './useServerSentEvents';

interface UseDashboardRealtimeSyncOptions {
    enableAutoRefresh?: boolean;
    enableManualRefresh?: boolean;
    forceRefresh?: boolean;
}

export const useDashboardRealtimeSync = (options: UseDashboardRealtimeSyncOptions = {}) => {
    const {
        enableAutoRefresh = true,
        enableManualRefresh = true,
        forceRefresh = true
    } = options;

    const queryClient = useQueryClient();

    // Initialiser la synchronisation cross-tab
    const { notifyOtherTabs } = useCrossTabSync();

    // Initialiser la synchronisation SSE temps réel
    const { isConnected: sseConnected, connectionStatus: sseStatus } = useServerSentEvents();

    // Hook de refresh intelligent pour le dashboard
    const {
        isRefreshing: isDashboardRefreshing,
        lastRefresh: lastDashboardRefresh,
        handleManualRefresh: handleDashboardRefresh,
        timeSinceLastRefresh: timeSinceLastDashboardRefresh,
        enableManualRefresh: enableDashboardManualRefresh
    } = useIntelligentRefresh({
        pageName: 'Dashboard',
        queryKeys: [
            'dashboard-stats',
            'abattoir-stats',
            'stock-data',
            'livestock',
            'betes',
            'betes-disponibles',
            'stabulations',
            'stabulation-stats',
            'transferts'
        ],
        enableAutoRefresh,
        enableManualRefresh,
        forceRefresh
    });

    // Fonction pour notifier les autres onglets des changements
    const notifyDashboardUpdate = useCallback((type: string, data: any) => {
        console.log(`📡 Notifying dashboard update: ${type}`, data);
        notifyOtherTabs(type as any, data);
    }, [notifyOtherTabs]);

    // Fonction pour forcer la synchronisation de toutes les données Dashboard
    const syncAllDashboardData = useCallback(async () => {
        console.log('🔄 Syncing all dashboard data...');

        // Invalider toutes les requêtes liées au dashboard
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
            queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] }),
            queryClient.invalidateQueries({ queryKey: ['stock'] }),
            queryClient.invalidateQueries({ queryKey: ['livestock'] }),
            queryClient.invalidateQueries({ queryKey: ['betes'] }),
            queryClient.invalidateQueries({ queryKey: ['betes-disponibles'] }),
            queryClient.invalidateQueries({ queryKey: ['stabulations'] }),
            queryClient.invalidateQueries({ queryKey: ['stabulation-stats'] }),
            queryClient.invalidateQueries({ queryKey: ['transferts'] })
        ]);

        // Forcer le refetch immédiat
        await Promise.all([
            queryClient.refetchQueries({ queryKey: ['dashboard-stats'] }),
            queryClient.refetchQueries({ queryKey: ['abattoir-stats'] }),
            queryClient.refetchQueries({ queryKey: ['stock'] }),
            queryClient.refetchQueries({ queryKey: ['livestock'] }),
            queryClient.refetchQueries({ queryKey: ['betes'] }),
            queryClient.refetchQueries({ queryKey: ['stabulations'] }),
            queryClient.refetchQueries({ queryKey: ['transferts'] })
        ]);

        console.log('✅ All dashboard data synced');
    }, [queryClient]);

    // Écouter les changements de visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Dashboard became visible - syncing data...');
                syncAllDashboardData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [syncAllDashboardData]);

    // Écouter les événements de reconnexion réseau
    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Network reconnected - syncing dashboard data...');
            syncAllDashboardData();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [syncAllDashboardData]);

    return {
        // État de synchronisation
        isRefreshing: isDashboardRefreshing,
        lastRefresh: lastDashboardRefresh,
        timeSinceLastRefresh: timeSinceLastDashboardRefresh,
        enableManualRefresh: enableDashboardManualRefresh,

        // État des connexions
        sseConnected,
        sseStatus,

        // Actions
        handleRefresh: handleDashboardRefresh,
        syncAllData: syncAllDashboardData,
        notifyUpdate: notifyDashboardUpdate,

        // Fonctions utilitaires
        isOnline: navigator.onLine,
        isPageVisible: !document.hidden
    };
};

