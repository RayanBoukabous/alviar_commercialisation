/**
 * Hook de cache intelligent pour le Dashboard
 * Système simple avec sélecteur de temps et refresh complet
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type RefreshInterval = '5min' | '10min' | '15min' | '30min' | '1hour' | 'manual';

interface DashboardCacheOptions {
    defaultInterval?: RefreshInterval;
    enableAutoRefresh?: boolean;
}

export const useDashboardCache = (options: DashboardCacheOptions = {}) => {
    const {
        defaultInterval = '10min',
        enableAutoRefresh = true
    } = options;

    const queryClient = useQueryClient();
    const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(defaultInterval);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Configuration des intervalles
    const intervalConfig = {
        '5min': 5 * 60 * 1000,
        '10min': 10 * 60 * 1000,
        '15min': 15 * 60 * 1000,
        '30min': 30 * 60 * 1000,
        '1hour': 60 * 60 * 1000,
        'manual': 0
    };

    // Fonction de refresh complet de toutes les données Dashboard
    const refreshAllData = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        console.log('🔄 Dashboard: Starting complete data refresh...');

        try {
            // Invalider toutes les requêtes Dashboard
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
                queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] }),
                queryClient.invalidateQueries({ queryKey: ['stock'] }),
                queryClient.invalidateQueries({ queryKey: ['livestock'] }),
                queryClient.invalidateQueries({ queryKey: ['betes'] }),
                queryClient.invalidateQueries({ queryKey: ['betes-disponibles'] }),
                queryClient.invalidateQueries({ queryKey: ['stabulations'] }),
                queryClient.invalidateQueries({ queryKey: ['stabulation-stats'] }),
                queryClient.invalidateQueries({ queryKey: ['transferts'] }),
                queryClient.invalidateQueries({ queryKey: ['clients'] }),
                queryClient.invalidateQueries({ queryKey: ['personnel'] }),
                queryClient.invalidateQueries({ queryKey: ['bon-commande'] }),
                queryClient.invalidateQueries({ queryKey: ['aliment-stock'] }),
                queryClient.invalidateQueries({ queryKey: ['aliment-transfert'] })
            ]);

            // Forcer le refetch immédiat de toutes les requêtes actives
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['dashboard-stats'] }),
                queryClient.refetchQueries({ queryKey: ['abattoir-stats'] }),
                queryClient.refetchQueries({ queryKey: ['stock'] }),
                queryClient.refetchQueries({ queryKey: ['livestock'] }),
                queryClient.refetchQueries({ queryKey: ['betes'] }),
                queryClient.refetchQueries({ queryKey: ['stabulations'] }),
                queryClient.refetchQueries({ queryKey: ['transferts'] }),
                queryClient.refetchQueries({ queryKey: ['clients'] }),
                queryClient.refetchQueries({ queryKey: ['personnel'] })
            ]);

            const now = new Date();
            setLastRefresh(now);

            // Calculer le prochain refresh
            if (refreshInterval !== 'manual') {
                const nextRefreshTime = new Date(now.getTime() + intervalConfig[refreshInterval]);
                setNextRefresh(nextRefreshTime);
            } else {
                setNextRefresh(null);
            }

            console.log('✅ Dashboard: Complete data refresh successful');
            console.log(`📊 Next refresh: ${nextRefreshTime?.toLocaleTimeString() || 'Manual only'}`);

        } catch (error) {
            console.error('❌ Dashboard: Error during refresh:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [queryClient, isRefreshing, refreshInterval]);

    // Fonction pour changer l'intervalle de refresh
    const changeRefreshInterval = useCallback((newInterval: RefreshInterval) => {
        console.log(`🔄 Dashboard: Changing refresh interval to ${newInterval}`);
        setRefreshInterval(newInterval);

        // Si on passe en mode manuel, arrêter l'auto-refresh
        if (newInterval === 'manual') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setNextRefresh(null);
        }
    }, []);

    // Auto-refresh basé sur l'intervalle sélectionné
    useEffect(() => {
        if (!enableAutoRefresh || refreshInterval === 'manual') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Nettoyer l'intervalle précédent
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Démarrer le nouvel intervalle
        const intervalMs = intervalConfig[refreshInterval];
        intervalRef.current = setInterval(() => {
            console.log(`🔄 Dashboard: Auto-refresh triggered (${refreshInterval})`);
            refreshAllData();
        }, intervalMs);

        // Calculer le prochain refresh
        const now = new Date();
        const nextRefreshTime = new Date(now.getTime() + intervalMs);
        setNextRefresh(nextRefreshTime);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [refreshInterval, enableAutoRefresh, refreshAllData]);

    // Refresh immédiat au montage
    useEffect(() => {
        if (enableAutoRefresh && refreshInterval !== 'manual') {
            refreshAllData();
        }
    }, []);

    // Gestion de la visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && enableAutoRefresh && refreshInterval !== 'manual') {
                console.log('👁️ Dashboard became visible - refreshing data...');
                refreshAllData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [refreshAllData, enableAutoRefresh, refreshInterval]);

    // Formatage du temps restant
    const getTimeUntilNextRefresh = useCallback(() => {
        if (!nextRefresh) return 'Mode manuel';

        const now = new Date();
        const diff = nextRefresh.getTime() - now.getTime();

        if (diff <= 0) return 'En cours...';

        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${minutes}m ${seconds}s`;
    }, [nextRefresh]);

    // Formatage du temps depuis le dernier refresh
    const getTimeSinceLastRefresh = useCallback(() => {
        if (!lastRefresh) return 'Jamais';

        const now = new Date();
        const diff = now.getTime() - lastRefresh.getTime();

        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (minutes > 0) {
            return `Il y a ${minutes}m ${seconds}s`;
        } else {
            return `Il y a ${seconds}s`;
        }
    }, [lastRefresh]);

    return {
        // État
        refreshInterval,
        isRefreshing,
        lastRefresh,
        nextRefresh,
        enableAutoRefresh,

        // Actions
        refreshAllData,
        changeRefreshInterval,

        // Utilitaires
        getTimeUntilNextRefresh,
        getTimeSinceLastRefresh,
        isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
        isPageVisible: typeof window !== 'undefined' ? !document.hidden : true
    };
};

