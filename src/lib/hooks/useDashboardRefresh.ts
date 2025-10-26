import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseDashboardRefreshOptions {
    refreshInterval?: number; // en millisecondes
    enableAutoRefresh?: boolean;
    enableManualRefresh?: boolean;
    allowIntervalSelection?: boolean; // Permettre à l'utilisateur de changer l'intervalle
}

export const useDashboardRefresh = (options: UseDashboardRefreshOptions = {}) => {
    const {
        refreshInterval = 5 * 60 * 1000, // 5 minutes par défaut
        enableAutoRefresh = true,
        enableManualRefresh = true,
        allowIntervalSelection = false
    } = options;

    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [currentInterval, setCurrentInterval] = useState(refreshInterval);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPageVisible = useRef(true);

    // Fonction de refresh manuel
    const handleManualRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            // Invalider toutes les requêtes critiques du dashboard avec les bonnes clés
            await Promise.all([
                // Statistiques du dashboard (KPIs)
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats', 'dashboard'] }),
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats', 'my-abattoir'] }),
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats', 'global'] }),

                // Données de stock (carcasses, bêtes, etc.)
                queryClient.invalidateQueries({ queryKey: ['stock'] }),
                queryClient.invalidateQueries({ queryKey: ['stock', 'data'] }),

                // Statistiques d'abattage (graphiques)
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats', 'slaughter-statistics'] }),
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats', 'abattoirs-for-charts'] }),

                // Stabulations
                queryClient.invalidateQueries({ queryKey: ['stabulations'] }),
                queryClient.invalidateQueries({ queryKey: ['stabulation-stats'] }),

                // Bêtes et livestock
                queryClient.invalidateQueries({ queryKey: ['livestock'] }),
                queryClient.invalidateQueries({ queryKey: ['betes'] }),
                queryClient.invalidateQueries({ queryKey: ['betes-disponibles'] }),
            ]);

            // Forcer le refetch immédiat des requêtes actives
            console.log('🔄 Forcing immediate refetch of active queries...');
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['abattoir-stats', 'dashboard'] }),
                queryClient.refetchQueries({ queryKey: ['stock'] }),
                queryClient.refetchQueries({ queryKey: ['abattoir-stats', 'slaughter-statistics'] }),
            ]);
            console.log('✅ Immediate refetch completed');

            setLastRefresh(new Date());
            console.log('🔄 Dashboard refreshed manually - All queries invalidated');
            console.log('📊 Invalidated queries:', [
                'abattoir-stats/dashboard',
                'abattoir-stats/my-abattoir',
                'abattoir-stats/global',
                'stock/data',
                'abattoir-stats/slaughter-statistics',
                'abattoir-stats/abattoirs-for-charts',
                'stabulations',
                'stabulation-stats',
                'livestock',
                'betes',
                'betes-disponibles'
            ]);
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [queryClient, isRefreshing]);

    // Auto-refresh intelligent
    useEffect(() => {
        if (!enableAutoRefresh) return;

        const startAutoRefresh = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                // Forcer le rafraîchissement même si la page est statique
                console.log('🔄 Auto-refreshing dashboard...');
                console.log('📊 Dashboard refresh interval:', currentInterval / 1000, 'seconds');
                handleManualRefresh();
            }, currentInterval);
        };

        startAutoRefresh();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentInterval, enableAutoRefresh, handleManualRefresh]);

    // Détecter la visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => {
            isPageVisible.current = !document.hidden;

            // Si la page redevient visible, refresh immédiat
            if (!document.hidden) {
                console.log('👁️ Page became visible, refreshing...');
                handleManualRefresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleManualRefresh);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleManualRefresh);
        };
    }, [handleManualRefresh]);

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

    // Fonction pour changer l'intervalle
    const handleIntervalChange = useCallback((newInterval: number) => {
        setCurrentInterval(newInterval);
        console.log(`🔄 Refresh interval changed to ${newInterval / 1000} seconds`);
    }, []);

    return {
        isRefreshing,
        lastRefresh,
        handleManualRefresh,
        timeSinceLastRefresh: getTimeSinceLastRefresh(),
        enableManualRefresh,
        currentInterval,
        handleIntervalChange,
        allowIntervalSelection
    };
};
