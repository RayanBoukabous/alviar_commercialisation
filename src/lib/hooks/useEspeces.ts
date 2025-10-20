import { useQuery } from '@tanstack/react-query';
import { especeService, Espece } from '@/lib/api/especeService';

// Clés de requête
export const especesKeys = {
    all: ['especes'] as const,
    lists: () => [...especesKeys.all, 'list'] as const,
};

// Hook pour récupérer la liste des espèces
export const useEspeces = () => {
    return useQuery<Espece[], Error>({
        queryKey: especesKeys.lists(),
        queryFn: especeService.getEspeces,
        staleTime: 10 * 60 * 1000, // 10 minutes (les espèces changent rarement)
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};





