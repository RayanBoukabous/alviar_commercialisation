import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier si nous sommes côté client
 * Évite les problèmes d'hydratation avec localStorage
 */
export const useClientSide = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
};

