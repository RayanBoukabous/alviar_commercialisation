import { useState, useEffect } from 'react';
import { simpleApiService, SimpleDashboardStats } from '@/lib/api/simpleApiService';

export const useSimpleDashboard = () => {
    const [data, setData] = useState<SimpleDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Test de connexion d'abord
            const connected = await simpleApiService.testConnection();
            setIsConnected(connected);

            if (connected) {
                const stats = await simpleApiService.getDashboardStats();
                setData(stats);
            } else {
                setError('Impossible de se connecter au serveur');
                // Données par défaut
                setData({
                    users_count: 0,
                    clients_count: 0,
                    superusers_count: 0,
                    betes_count: 0,
                    abattoir_name: 'Abattoir par défaut',
                    abattoir_location: 'Localisation par défaut'
                });
            }
        } catch (err: any) {
            console.error('Erreur dans useSimpleDashboard:', err);
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
