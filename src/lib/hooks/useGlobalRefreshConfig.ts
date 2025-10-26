import { useState, useEffect, useCallback } from 'react';

const REFRESH_INTERVAL_KEY = 'alviar_refresh_interval';
const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes par défaut

export const useGlobalRefreshConfig = () => {
    const [refreshInterval, setRefreshInterval] = useState<number>(DEFAULT_INTERVAL);
    const [isInitialized, setIsInitialized] = useState(false);

    // Charger la configuration depuis localStorage au montage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedInterval = localStorage.getItem(REFRESH_INTERVAL_KEY);
            if (savedInterval) {
                const interval = parseInt(savedInterval, 10);
                if (!isNaN(interval) && interval > 0) {
                    setRefreshInterval(interval);
                }
            }
            setIsInitialized(true);
        }
    }, []);

    // Sauvegarder la configuration dans localStorage
    const updateRefreshInterval = useCallback((newInterval: number) => {
        setRefreshInterval(newInterval);
        if (typeof window !== 'undefined') {
            localStorage.setItem(REFRESH_INTERVAL_KEY, newInterval.toString());
            console.log(`🔄 Global refresh interval updated to ${newInterval / 1000} seconds`);
        }
    }, []);

    // Obtenir l'intervalle formaté
    const getFormattedInterval = useCallback(() => {
        const minutes = Math.floor(refreshInterval / (1000 * 60));
        return `${minutes} min`;
    }, [refreshInterval]);

    // Obtenir les options d'intervalle disponibles
    const getAvailableIntervals = useCallback(() => {
        return [
            { value: 5 * 60 * 1000, label: '5 min', description: 'Temps réel' },
            { value: 10 * 60 * 1000, label: '10 min', description: 'Équilibré' },
            { value: 15 * 60 * 1000, label: '15 min', description: 'Économique' },
        ];
    }, []);

    return {
        refreshInterval,
        updateRefreshInterval,
        getFormattedInterval,
        getAvailableIntervals,
        isInitialized
    };
};
