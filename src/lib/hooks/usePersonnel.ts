import { useQuery } from '@tanstack/react-query';
import { personnelService, PersonnelResponse, Personnel, PersonnelFilters } from '@/lib/api/personnelService';

// Hook pour récupérer le personnel d'un abattoir
export const usePersonnelByAbattoir = (abattoirId: number, filters: any = {}) => {
    return useQuery<PersonnelResponse>({
        queryKey: ['personnel', 'abattoir', abattoirId, filters],
        queryFn: () => personnelService.getPersonnelByAbattoir(abattoirId, filters),
        enabled: !!abattoirId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer le responsable d'un abattoir
export const useAbattoirManager = (abattoirId: number) => {
    return useQuery<Personnel | null>({
        queryKey: ['personnel', 'manager', abattoirId],
        queryFn: () => personnelService.getAbattoirManager(abattoirId),
        enabled: !!abattoirId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer les rôles
export const useRoles = () => {
    return useQuery({
        queryKey: ['personnel', 'roles'],
        queryFn: () => personnelService.getRoles(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook pour récupérer tout le personnel d'un abattoir (pour l'onglet personnel)
export const useAllPersonnelByAbattoir = (abattoirId: number, filters: PersonnelFilters = {}) => {
    return useQuery<PersonnelResponse>({
        queryKey: ['personnel', 'all', abattoirId, filters],
        queryFn: () => personnelService.getAllPersonnelByAbattoir(abattoirId, filters),
        enabled: !!abattoirId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook pour récupérer les détails d'un employé spécifique
export const usePersonnelDetail = (personnelId: string) => {
    return useQuery<Personnel>({
        queryKey: ['personnel', 'detail', personnelId],
        queryFn: () => personnelService.getPersonnelDetail(personnelId),
        enabled: !!personnelId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
