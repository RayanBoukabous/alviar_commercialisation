import { useQuery } from '@tanstack/react-query';
import { stockService, StockResponse } from '@/lib/api/stockService';

export const stockKeys = {
    all: ['stock'] as const,
    stockData: (abattoirId?: number) => [...stockKeys.all, 'data', abattoirId] as const,
};

export const useStockData = (abattoirId?: number) => {
    return useQuery<StockResponse, Error>({
        queryKey: stockKeys.stockData(abattoirId),
        queryFn: () => stockService.getStockData(abattoirId),
        staleTime: 1 * 60 * 1000, // Cache valide pendant 1 minute
        gcTime: 3 * 60 * 1000, // Garder en cache 3 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true, // Rafraîchir quand on revient sur la page
        refetchOnMount: true, // Rafraîchir à chaque montage
        refetchOnReconnect: true, // Rafraîchir quand la connexion revient
        // Pas de refetchInterval automatique - géré par useDashboardCache
    });
};
