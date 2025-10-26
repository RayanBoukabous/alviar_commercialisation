import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Hook pour créer un nouveau personnel
export const useCreatePersonnel = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (personnelData: any) => personnelService.createPersonnel(personnelData),
        onSuccess: (data, variables) => {
            // Invalider et refetch les queries liées au personnel
            queryClient.invalidateQueries({ queryKey: ['personnel'] });
            
            // Invalider spécifiquement la query du personnel de l'abattoir
            if (variables.abattoir) {
                queryClient.invalidateQueries({ 
                    queryKey: ['personnel', 'abattoir', variables.abattoir] 
                });
                queryClient.invalidateQueries({ 
                    queryKey: ['personnel', 'all', variables.abattoir] 
                });
            }
        },
        onError: (error) => {
            console.error('Erreur lors de la création du personnel:', error);
        }
    });
};

// Hook pour mettre à jour un personnel
export const useUpdatePersonnel = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ personnelId, personnelData }: { personnelId: string; personnelData: any }) => 
            personnelService.updatePersonnel(personnelId, personnelData),
        onSuccess: (data, variables) => {
            // Invalider et refetch les queries liées au personnel
            queryClient.invalidateQueries({ queryKey: ['personnel'] });
            
            // Invalider spécifiquement la query du personnel de l'abattoir
            if (data.abattoir) {
                queryClient.invalidateQueries({ 
                    queryKey: ['personnel', 'abattoir', data.abattoir] 
                });
                queryClient.invalidateQueries({ 
                    queryKey: ['personnel', 'all', data.abattoir] 
                });
            }
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du personnel:', error);
        }
    });
};

// Hook pour supprimer un personnel
export const useDeletePersonnel = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (personnelId: string) => personnelService.deletePersonnel(personnelId),
        onSuccess: (data, personnelId) => {
            // Invalider et refetch les queries liées au personnel
            queryClient.invalidateQueries({ queryKey: ['personnel'] });
        },
        onError: (error) => {
            console.error('Erreur lors de la suppression du personnel:', error);
        }
    });
};
