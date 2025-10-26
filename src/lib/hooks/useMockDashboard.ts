import { useState, useEffect } from 'react';

export interface MockDashboardStats {
    users_count: number;
    clients_count: number;
    superusers_count: number;
    betes_count: number;
    abattoir_name: string;
    abattoir_location: string;
}

export const useMockDashboard = () => {
    const [data, setData] = useState<MockDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(true); // Toujours connecté avec des données mock

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simuler un délai de chargement
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Données mock réalistes
            const mockStats: MockDashboardStats = {
                users_count: 1247,
                clients_count: 89,
                superusers_count: 12,
                betes_count: 3456,
                abattoir_name: 'Abattoir Central ALVIAR',
                abattoir_location: 'Alger, Algérie'
            };

            setData(mockStats);
            setIsConnected(true);
        } catch (err: any) {
            console.error('Erreur dans useMockDashboard:', err);
            setError(err.message || 'Erreur inconnue');
            // Données par défaut en cas d'erreur
            setData({
                users_count: 0,
                clients_count: 0,
                superusers_count: 0,
                betes_count: 0,
                abattoir_name: 'Abattoir par défaut',
                abattoir_location: 'Localisation par défaut'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        isLoading,
        error,
        isConnected,
        refetch: fetchData
    };
};
