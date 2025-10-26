import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Types pour les données réelles
interface RealAbattoirData {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
    capacite_reception_ovin: number;
    capacite_reception_bovin: number;
    capacite_stabulation_ovin: number;
    capacite_stabulation_bovin: number;
    actif: boolean;
}

interface RealSlaughterData {
    abattoir_id: number;
    abattoir_nom: string;
    abattoir_location: string;
    BOVIN: number;
    OVIN: number;
    CAPRIN: number;
    AUTRE: number;
    total: number;
    date_abattage: string;
}

interface RealDashboardStats {
    nombre_betes: number;
    nombre_carcasses: number;
    transferts_aujourdhui: number;
    animaux_stabulation: number;
    stats_supplementaires: {
        betes_par_statut: Array<{ statut: string; count: number }>;
        betes_par_espece: Array<{ espece__nom: string; count: number }>;
        transferts_7_derniers_jours: number;
        betes_ajoutees_aujourdhui: number;
    };
    abattoir_nom: string;
    abattoir_location: string;
    date_actualisation: string;
}

interface UseRealDashboardDataReturn {
    // Data
    abattoirs: RealAbattoirData[];
    slaughterData: RealSlaughterData[];
    dashboardStats: RealDashboardStats | null;

    // Loading states
    isLoading: boolean;
    isAbattoirsLoading: boolean;
    isSlaughterLoading: boolean;
    isStatsLoading: boolean;

    // Errors
    error: string | null;
    abattoirsError: string | null;
    slaughterError: string | null;
    statsError: string | null;

    // RTL/LTR
    isRTL: boolean;
    textDirection: 'rtl' | 'ltr';

    // Actions
    refetch: () => void;
    refetchAbattoirs: () => void;
    refetchSlaughter: () => void;
    refetchStats: () => void;
}

export const useRealDashboardData = (): UseRealDashboardDataReturn => {
    const { currentLocale } = useLanguage();
    const isRTL = currentLocale === 'ar';
    const textDirection = isRTL ? 'rtl' : 'ltr';

    // États de chargement
    const [isAbattoirsLoading, setIsAbattoirsLoading] = useState(false);
    const [isSlaughterLoading, setIsSlaughterLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    // États d'erreur
    const [abattoirsError, setAbattoirsError] = useState<string | null>(null);
    const [slaughterError, setSlaughterError] = useState<string | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    // États des données
    const [abattoirs, setAbattoirs] = useState<RealAbattoirData[]>([]);
    const [slaughterData, setSlaughterData] = useState<RealSlaughterData[]>([]);
    const [dashboardStats, setDashboardStats] = useState<RealDashboardStats | null>(null);

    // Fonction pour récupérer les abattoirs
    const fetchAbattoirs = useCallback(async () => {
        setIsAbattoirsLoading(true);
        setAbattoirsError(null);

        try {
            const response = await fetch('/api/abattoir/abattoirs-for-charts/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setAbattoirs(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des abattoirs:', error);
            setAbattoirsError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsAbattoirsLoading(false);
        }
    }, []);

    // Fonction pour récupérer les données d'abattage par espèce
    const fetchSlaughterData = useCallback(async () => {
        setIsSlaughterLoading(true);
        setSlaughterError(null);

        try {
            const response = await fetch('/api/abattoir/slaughtered-animals-report/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

      // Transformer les données pour correspondre à notre format
      const abattoirGroups = new Map<string, RealSlaughterData>();
      
      // Traiter les bêtes abattues récentes
      if (data.betes_abattues_recentes && Array.isArray(data.betes_abattues_recentes)) {
        data.betes_abattues_recentes.forEach((bete: any) => {
          const abattoirKey = bete.abattoir || 'Inconnu';
          const espece = bete.espece || 'AUTRE';
          
          if (!abattoirGroups.has(abattoirKey)) {
            abattoirGroups.set(abattoirKey, {
              abattoir_id: 0,
              abattoir_nom: abattoirKey,
              abattoir_location: '',
              BOVIN: 0,
              OVIN: 0,
              CAPRIN: 0,
              AUTRE: 0,
              total: 0,
              date_abattage: bete.date_abattage || new Date().toISOString()
            });
          }
          
          const group = abattoirGroups.get(abattoirKey)!;
          if (espece in group) {
            group[espece as keyof typeof group]++;
            group.total++;
          }
        });
      }
      
      setSlaughterData(Array.from(abattoirGroups.values()));
        } catch (error) {
            console.error('Erreur lors de la récupération des données d\'abattage:', error);
            setSlaughterError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsSlaughterLoading(false);
        }
    }, []);

    // Fonction pour récupérer les statistiques du dashboard
    const fetchDashboardStats = useCallback(async () => {
        setIsStatsLoading(true);
        setStatsError(null);

        try {
            const response = await fetch('/api/abattoir/dashboard-statistics/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setDashboardStats(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            setStatsError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Fonction de refresh combinée
    const refetch = useCallback(async () => {
        await Promise.all([
            fetchAbattoirs(),
            fetchSlaughterData(),
            fetchDashboardStats()
        ]);
    }, [fetchAbattoirs, fetchSlaughterData, fetchDashboardStats]);

    // Chargement initial
    useEffect(() => {
        refetch();
    }, [refetch]);

    // États calculés
    const isLoading = isAbattoirsLoading || isSlaughterLoading || isStatsLoading;
    const error = abattoirsError || slaughterError || statsError;

    return {
        // Data
        abattoirs,
        slaughterData,
        dashboardStats,

        // Loading states
        isLoading,
        isAbattoirsLoading,
        isSlaughterLoading,
        isStatsLoading,

        // Errors
        error,
        abattoirsError,
        slaughterError,
        statsError,

        // RTL/LTR
        isRTL,
        textDirection,

        // Actions
        refetch,
        refetchAbattoirs: fetchAbattoirs,
        refetchSlaughter: fetchSlaughterData,
        refetchStats: fetchDashboardStats
    };
};
