import { useEffect, useCallback, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
    interval?: number; // en millisecondes
    enabled?: boolean;
    onRefresh: () => void | Promise<void>;
}

interface UseAutoRefreshReturn {
    isRefreshing: boolean;
    lastRefresh: Date | null;
    nextRefresh: Date | null;
    manualRefresh: () => void;
    pauseRefresh: () => void;
    resumeRefresh: () => void;
    isPaused: boolean;
}

export const useAutoRefresh = ({
    interval = 10 * 60 * 1000, // 10 minutes par défaut
    enabled = true,
    onRefresh
}: UseAutoRefreshOptions): UseAutoRefreshReturn => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);
    const isPausedRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);

    // États pour forcer les re-renders
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Mettre à jour la référence de onRefresh
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    const manualRefresh = useCallback(async () => {
        if (isRefreshingRef.current) return;

        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setLastRefresh(new Date());

        try {
            await onRefreshRef.current();
        } catch (error) {
            console.error('Erreur lors du refresh automatique:', error);
        } finally {
            isRefreshingRef.current = false;
            setIsRefreshing(false);
            // Recalculer le prochain refresh
            const next = new Date(Date.now() + interval);
            setNextRefresh(next);
        }
    }, [interval]);

    const pauseRefresh = useCallback(() => {
        isPausedRef.current = true;
        setIsPaused(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const resumeRefresh = useCallback(() => {
        isPausedRef.current = false;
        setIsPaused(false);
        if (enabled && !intervalRef.current) {
            intervalRef.current = setInterval(manualRefresh, interval);
            const next = new Date(Date.now() + interval);
            setNextRefresh(next);
        }
    }, [enabled, interval, manualRefresh]);

    // Initialiser le refresh automatique - SEULEMENT au montage
    useEffect(() => {
        if (enabled && !isPausedRef.current) {
            // Premier refresh immédiat
            manualRefresh();

            // Programmer les refreshes suivants
            intervalRef.current = setInterval(manualRefresh, interval);
            const next = new Date(Date.now() + interval);
            setNextRefresh(next);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []); // Dépendances vides pour éviter les re-créations

    // Nettoyer l'intervalle au démontage
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    return {
        isRefreshing,
        lastRefresh,
        nextRefresh,
        manualRefresh,
        pauseRefresh,
        resumeRefresh,
        isPaused
    };
};