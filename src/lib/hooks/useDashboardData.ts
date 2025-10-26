import { useMemo, useCallback, useRef } from 'react';
import { useMockDashboard } from '@/lib/hooks/useMockDashboard';
import { useDashboardStatistics } from '@/lib/hooks/useDashboardStatistics';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAutoRefresh } from './useAutoRefresh';

interface DashboardStats {
    name: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    color: string;
    bgColor: string;
    iconColor: string;
    isLoading: boolean;
    description: string;
}

interface UseDashboardDataReturn {
    // Data
    dashboardStats: any;
    realStats: any;
    mainStats: DashboardStats[];

    // Loading states
    isLoading: boolean;
    statsLoading: boolean;
    translationLoading: boolean;

    // Errors
    error: any;
    statsError: any;

    // RTL/LTR
    isRTL: boolean;
    textDirection: 'rtl' | 'ltr';

    // Refresh
    isRefreshing: boolean;
    lastRefresh: Date | null;
    nextRefresh: Date | null;
    manualRefresh: () => void;
    pauseRefresh: () => void;
    resumeRefresh: () => void;
    isPaused: boolean;

    // Actions
    refetch: () => void;
    refetchStats: () => void;
}

export const useDashboardData = (): UseDashboardDataReturn => {
    const { data: dashboardStats, isLoading, error, refetch } = useMockDashboard();
    const { data: realStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStatistics();
    const { t, loading: translationLoading, currentLocale } = useLanguage();

    // Gestion RTL/LTR
    const isRTL = currentLocale === 'ar';
    const textDirection = isRTL ? 'rtl' : 'ltr';

    // Fonction de refresh combinée - STABLE avec useRef
    const refetchRef = useRef(refetch);
    const refetchStatsRef = useRef(refetchStats);

    // Mettre à jour les refs
    refetchRef.current = refetch;
    refetchStatsRef.current = refetchStats;

    const handleRefresh = useCallback(async () => {
        await Promise.all([
            refetchRef.current(),
            refetchStatsRef.current()
        ]);
    }, []); // Dépendances vides pour éviter les re-créations

    // Hook de refresh automatique
    const {
        isRefreshing,
        lastRefresh,
        nextRefresh,
        manualRefresh,
        pauseRefresh,
        resumeRefresh,
        isPaused
    } = useAutoRefresh({
        interval: 10 * 60 * 1000, // 10 minutes
        enabled: true,
        onRefresh: handleRefresh
    });

    // Statistiques principales mémorisées - OPTIMISÉES
    const mainStats = useMemo((): DashboardStats[] => [
        {
            name: isRTL ? 'الماشية الحية' : 'Bêtes vivantes',
            value: realStats?.nombre_betes?.toLocaleString() || '0',
            change: (realStats?.stats_supplementaires?.betes_ajoutees_aujourdhui || 0) > 0 ?
                `+${realStats?.stats_supplementaires?.betes_ajoutees_aujourdhui || 0}` : '+0',
            changeType: 'positive',
            icon: require('lucide-react').Package,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
            isLoading: statsLoading,
            description: isRTL ? 'الحيوانات الحية في النظام' : 'Animaux vivants dans le système',
        },
        {
            name: isRTL ? 'الذبيحة' : 'Carcasses',
            value: realStats?.nombre_carcasses?.toLocaleString() || '0',
            change: (realStats?.stats_supplementaires?.betes_par_statut?.find((s: any) => s.statut === 'ABATTU')?.count || 0) > 0 ?
                `+${realStats?.stats_supplementaires?.betes_par_statut?.find((s: any) => s.statut === 'ABATTU')?.count || 0}` : '+0',
            changeType: 'positive',
            icon: require('lucide-react').Activity,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: 'text-orange-600 dark:text-orange-400',
            isLoading: statsLoading,
            description: isRTL ? 'الحيوانات المذبوحة' : 'Animaux abattus',
        },
        {
            name: isRTL ? 'النقل اليوم' : 'Transferts aujourd\'hui',
            value: realStats?.transferts_aujourdhui?.toLocaleString() || '0',
            change: (realStats?.stats_supplementaires?.transferts_7_derniers_jours || 0) > 0 ?
                `+${realStats?.stats_supplementaires?.transferts_7_derniers_jours || 0}` : '+0',
            changeType: 'positive',
            icon: require('lucide-react').Truck,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            isLoading: statsLoading,
            description: isRTL ? 'النقلات المنجزة اليوم' : 'Transferts effectués aujourd\'hui',
        },
        {
            name: isRTL ? 'في الاستقرار' : 'En stabulation',
            value: realStats?.animaux_stabulation?.toLocaleString() || '0',
            change: '+0',
            changeType: 'neutral',
            icon: require('lucide-react').Home,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
            isLoading: statsLoading,
            description: isRTL ? 'الحيوانات في الاستقرار' : 'Animaux en stabulation',
        },
    ], [realStats, statsLoading, isRTL]);

    return {
        // Data
        dashboardStats,
        realStats,
        mainStats,

        // Loading states
        isLoading,
        statsLoading,
        translationLoading,

        // Errors
        error,
        statsError,

        // RTL/LTR
        isRTL,
        textDirection,

        // Refresh
        isRefreshing,
        lastRefresh,
        nextRefresh,
        manualRefresh,
        pauseRefresh,
        resumeRefresh,
        isPaused,

        // Actions
        refetch,
        refetchStats
    };
};