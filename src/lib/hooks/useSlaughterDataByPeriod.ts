import { useState, useEffect, useCallback } from 'react';

const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';

interface SlaughterDataByPeriod {
    period: string;
    start_date: string;
    end_date: string;
    abattoirs_data: Array<{
        abattoir_nom: string;
        BOVIN: number;
        OVIN: number;
        CAPRIN: number;
        AUTRE: number;
    }>;
    total_animals: number;
}

interface UseSlaughterDataByPeriodReturn {
    data: SlaughterDataByPeriod | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useSlaughterDataByPeriod = (period: 'today' | 'week' | 'month' = 'today'): UseSlaughterDataByPeriodReturn => {
    const [data, setData] = useState<SlaughterDataByPeriod | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Vérifier que le token existe
            const token = localStorage.getItem('django_token');
            if (!token) {
                throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
            }

            console.log('🔑 Token utilisé pour slaughter data:', token.substring(0, 10) + '...');

            // Récupérer les données filtrées par période
            const response = await fetch(`${DJANGO_API_BASE_URL}/api/abattoirs/slaughter-data-by-period/?period=${period}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            console.error('Erreur lors de la récupération des données d\'abattage:', err);
            setError(err.message || 'Erreur lors de la récupération des données');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData
    };
};
