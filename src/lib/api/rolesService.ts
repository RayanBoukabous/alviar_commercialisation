import { apiClient } from './client';
import { Role, RolesResponse } from '@/types';

export class RolesService {
    /**
     * Récupère tous les rôles
     */
    static async getRoles(): Promise<Role[]> {
        try {
            console.log('🔍 Récupération des rôles depuis l\'API...');

            const response = await apiClient.get<Role[]>('/roles');

            console.log('✅ Rôles récupérés avec succès:', response);

            // L'API retourne directement un tableau de rôles
            return response.data || response || [];
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des rôles:', error);
            throw new Error(`Erreur lors de la récupération des rôles: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Récupère un rôle par son ID
     */
    static async getRoleById(id: number): Promise<Role> {
        try {
            console.log(`🔍 Récupération du rôle ${id} depuis l'API...`);

            const response = await apiClient.get<Role>(`/roles/${id}`);

            console.log(`✅ Rôle ${id} récupéré avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la récupération du rôle ${id}:`, error);
            throw new Error(`Erreur lors de la récupération du rôle: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée un nouveau rôle
     */
    static async createRole(roleData: { name: string; permissions?: number[] }): Promise<Role> {
        try {
            console.log('🔍 Création d\'un nouveau rôle...', roleData);

            const response = await apiClient.post<Role>('/roles', roleData);

            console.log('✅ Rôle créé avec succès:', response);

            return response.data || response;
        } catch (error: any) {
            console.error('❌ Erreur lors de la création du rôle:', error);
            throw new Error(`Erreur lors de la création du rôle: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Met à jour un rôle
     */
    static async updateRole(id: number, roleData: { name?: string }): Promise<Role> {
        try {
            console.log(`🔍 Mise à jour du rôle ${id}...`, roleData);

            const response = await apiClient.put<Role>(`/roles/${id}`, roleData);

            console.log(`✅ Rôle ${id} mis à jour avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la mise à jour du rôle ${id}:`, error);
            throw new Error(`Erreur lors de la mise à jour du rôle: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Supprime un rôle
     */
    static async deleteRole(id: number): Promise<void> {
        try {
            console.log(`🔍 Suppression du rôle ${id}...`);

            await apiClient.delete(`/roles/${id}`);

            console.log(`✅ Rôle ${id} supprimé avec succès`);
        } catch (error: any) {
            console.error(`❌ Erreur lors de la suppression du rôle ${id}:`, error);
            throw new Error(`Erreur lors de la suppression du rôle: ${error.message || 'Erreur inconnue'}`);
        }
    }
}
