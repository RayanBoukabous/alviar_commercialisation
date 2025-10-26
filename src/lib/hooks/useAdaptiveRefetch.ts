import { useCallback, useEffect, useState } from 'react';

interface AdaptiveRefetchConfig {
    baseInterval: number;
    maxInterval: number;
    minInterval: number;
    backoffMultiplier: number;
    activityThreshold: number;
}

const defaultConfig: AdaptiveRefetchConfig = {
    baseInterval: 15000, // 15 secondes de base
    maxInterval: 300000, // 5 minutes maximum
    minInterval: 5000,   // 5 secondes minimum
    backoffMultiplier: 1.5, // Multiplier pour le backoff
    activityThreshold: 3, // Seuil d'activité
};

export const useAdaptiveRefetch = (config: Partial<AdaptiveRefetchConfig> = {}) => {
    const finalConfig = { ...defaultConfig, ...config };
    const [currentInterval, setCurrentInterval] = useState(finalConfig.baseInterval);
    const [activityCount, setActivityCount] = useState(0);
    const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
    const [lastActivity, setLastActivity] = useState<Date | null>(null);

    // Détecter la visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Calculer l'intervalle adaptatif
    const calculateInterval = useCallback(() => {
        if (!isPageVisible) {
            return false; // Pas de refetch si page cachée
        }

        const now = new Date();
        const timeSinceLastActivity = lastActivity
            ? now.getTime() - lastActivity.getTime()
            : Infinity;

        // Si pas d'activité récente, augmenter l'intervalle
        if (timeSinceLastActivity > 60000) { // 1 minute
            const newInterval = Math.min(
                currentInterval * finalConfig.backoffMultiplier,
                finalConfig.maxInterval
            );
            return newInterval;
        }

        // Si activité récente, diminuer l'intervalle
        if (activityCount > finalConfig.activityThreshold) {
            const newInterval = Math.max(
                currentInterval / finalConfig.backoffMultiplier,
                finalConfig.minInterval
            );
            return newInterval;
        }

        return currentInterval;
    }, [isPageVisible, lastActivity, activityCount, currentInterval, finalConfig]);

    // Marquer une activité
    const markActivity = useCallback(() => {
        setActivityCount(prev => prev + 1);
        setLastActivity(new Date());

        // Diminuer l'intervalle si beaucoup d'activité
        if (activityCount > finalConfig.activityThreshold) {
            setCurrentInterval(prev => Math.max(
                prev / finalConfig.backoffMultiplier,
                finalConfig.minInterval
            ));
        }
    }, [activityCount, finalConfig]);

    // Réinitialiser l'activité
    const resetActivity = useCallback(() => {
        setActivityCount(0);
    }, []);

    // Obtenir l'intervalle de refetch
    const getRefetchInterval = useCallback(() => {
        return calculateInterval();
    }, [calculateInterval]);

    return {
        getRefetchInterval,
        markActivity,
        resetActivity,
        currentInterval,
        activityCount,
        isPageVisible,
        lastActivity
    };
};
