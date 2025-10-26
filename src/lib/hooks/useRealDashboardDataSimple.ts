import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Configuration de l'API Django
const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Types simplifiés pour les données réelles
interface SimpleSlaughterData {
    abattoir_nom: string;
    BOVIN: number;
    OVIN: number;
    CAPRIN: number;
    AUTRE: number;
    total: number;
}

interface SimpleDashboardStats {
    nombre_betes: number;
    nombre_carcasses: number;
    transferts_aujourdhui: number;
    animaux_stabulation: number;
    abattoir_nom: string;
    abattoir_location: string;
    date_actualisation: string;
}

interface UseRealDashboardDataSimpleReturn {
    // Data
    slaughterData: SimpleSlaughterData[];
    dashboardStats: SimpleDashboardStats | null;

    // Loading states
    isLoading: boolean;
    isSlaughterLoading: boolean;
    isStatsLoading: boolean;

    // Errors
    error: string | null;
    slaughterError: string | null;
    statsError: string | null;

    // RTL/LTR
    isRTL: boolean;
    textDirection: 'rtl' | 'ltr';

    // Actions
    refetch: () => void;
    refetchSlaughter: () => void;
    refetchStats: () => void;
}

export const useRealDashboardDataSimple = (): UseRealDashboardDataSimpleReturn => {
    const { currentLocale } = useLanguage();
    const isRTL = currentLocale === 'ar';
    const textDirection = isRTL ? 'rtl' : 'ltr';

    // États de chargement
    const [isSlaughterLoading, setIsSlaughterLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    // États d'erreur
    const [slaughterError, setSlaughterError] = useState<string | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    // États des données
    const [slaughterData, setSlaughterData] = useState<SimpleSlaughterData[]>([]);
    const [dashboardStats, setDashboardStats] = useState<SimpleDashboardStats | null>(null);

    // Fonction pour récupérer les données d'abattage RÉELLES
    const fetchSlaughterData = useCallback(async () => {
        setIsSlaughterLoading(true);
        setSlaughterError(null);

        try {
            // Vérifier que le token existe
            const token = localStorage.getItem('django_token');
            if (!token) {
                throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
            }

            console.log('🔑 Token utilisé:', token.substring(0, 10) + '...');

            // Récupérer les vraies données depuis ton API Django
            const response = await fetch(`${DJANGO_API_BASE_URL}/api/abattoirs/slaughtered-animals-report/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Transformer les données réelles pour le graphique
            const abattoirGroups = new Map<string, SimpleSlaughterData>();

            // Traiter les bêtes abattues récentes
            if (data.betes_abattues_recentes && Array.isArray(data.betes_abattues_recentes)) {
                data.betes_abattues_recentes.forEach((bete: any) => {
                    const abattoirKey = bete.abattoir || 'Inconnu';
                    const espece = bete.espece || 'AUTRE';

                    if (!abattoirGroups.has(abattoirKey)) {
                        abattoirGroups.set(abattoirKey, {
                            abattoir_nom: abattoirKey,
                            BOVIN: 0,
                            OVIN: 0,
                            CAPRIN: 0,
                            AUTRE: 0,
                            total: 0
                        });
                    }

                    const group = abattoirGroups.get(abattoirKey)!;
                    if (espece in group) {
                        group[espece as keyof typeof group]++;
                        group.total++;
                    }
                });
            }

            // Si aucune donnée réelle, afficher un message
            if (abattoirGroups.size === 0) {
                console.log('Aucune donnée d\'abattage trouvée dans la base de données');
                setSlaughterData([]);
            } else {
                setSlaughterData(Array.from(abattoirGroups.values()));
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des données d\'abattage:', error);
            setSlaughterError(error instanceof Error ? error.message : 'Erreur inconnue');

            // En cas d'erreur, afficher un tableau vide au lieu de données mock
            setSlaughterData([]);
        } finally {
            setIsSlaughterLoading(false);
        }
    }, []);

    // Fonction pour récupérer les statistiques du dashboard RÉELLES
    const fetchDashboardStats = useCallback(async () => {
        setIsStatsLoading(true);
        setStatsError(null);

        try {
            // Vérifier que le token existe
            const token = localStorage.getItem('django_token');
            if (!token) {
                throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
            }

            console.log('🔑 Token utilisé pour stats:', token.substring(0, 10) + '...');

            // Récupérer les vraies statistiques depuis ton API Django
            const response = await fetch(`${DJANGO_API_BASE_URL}/api/abattoirs/dashboard-statistics/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Transformer les données réelles
            const realStats: SimpleDashboardStats = {
                nombre_betes: data.nombre_betes || 0,
                nombre_carcasses: data.nombre_carcasses || 0,
                transferts_aujourdhui: data.transferts_aujourdhui || 0,
                animaux_stabulation: data.animaux_stabulation || 0,
                abattoir_nom: data.abattoir_nom || 'Système',
                abattoir_location: data.abattoir_location || 'Localisation inconnue',
                date_actualisation: data.date_actualisation || new Date().toISOString()
            };

            setDashboardStats(realStats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            setStatsError(error instanceof Error ? error.message : 'Erreur inconnue');

            // En cas d'erreur, afficher des statistiques vides
            setDashboardStats({
                nombre_betes: 0,
                nombre_carcasses: 0,
                transferts_aujourdhui: 0,
                animaux_stabulation: 0,
                abattoir_nom: 'Erreur de connexion',
                abattoir_location: 'Données non disponibles',
                date_actualisation: new Date().toISOString()
            });
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Fonction de refresh combinée
    const refetch = useCallback(async () => {
        await Promise.all([
            fetchSlaughterData(),
            fetchDashboardStats()
        ]);
    }, [fetchSlaughterData, fetchDashboardStats]);

    // Chargement initial
    useEffect(() => {
        // Attendre un peu que le token soit stocké après la connexion
        const timer = setTimeout(() => {
            refetch();
        }, 1000); // 1 seconde de délai

        return () => clearTimeout(timer);
    }, [refetch]);

    // États calculés
    const isLoading = isSlaughterLoading || isStatsLoading;
    const error = slaughterError || statsError;

    return {
        // Data
        slaughterData,
        dashboardStats,

        // Loading states
        isLoading,
        isSlaughterLoading,
        isStatsLoading,

        // Errors
        error,
        slaughterError,
        statsError,

        // RTL/LTR
        isRTL,
        textDirection,

        // Actions
        refetch,
        refetchSlaughter: fetchSlaughterData,
        refetchStats: fetchDashboardStats
    };
};
