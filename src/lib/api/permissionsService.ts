import { apiClient } from './client';
import { Permission } from '@/types';

export class PermissionsService {
    /**
     * Récupère toutes les permissions
     */
    static async getAllPermissions(): Promise<Permission[]> {
        try {
            console.log('🔍 Récupération de toutes les permissions depuis l\'API...');

            const response = await apiClient.get<Permission[]>('/roles/all/permissions');

            console.log('✅ Permissions récupérées avec succès:', response);

            // L'API retourne directement un tableau de permissions
            return response.data || response || [];
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des permissions:', error);
            throw new Error(`Erreur lors de la récupération des permissions: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Récupère une permission par son ID
     */
    static async getPermissionById(id: number): Promise<Permission> {
        try {
            console.log(`🔍 Récupération de la permission ${id} depuis l'API...`);

            const response = await apiClient.get<Permission>(`/permissions/${id}`);

            console.log(`✅ Permission ${id} récupérée avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la récupération de la permission ${id}:`, error);
            throw new Error(`Erreur lors de la récupération de la permission: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée une nouvelle permission
     */
    static async createPermission(permissionData: { name: string }): Promise<Permission> {
        try {
            console.log('🔍 Création d\'une nouvelle permission...', permissionData);

            const response = await apiClient.post<Permission>('/permissions', permissionData);

            console.log('✅ Permission créée avec succès:', response);

            return response.data || response;
        } catch (error: any) {
            console.error('❌ Erreur lors de la création de la permission:', error);
            throw new Error(`Erreur lors de la création de la permission: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Met à jour une permission
     */
    static async updatePermission(id: number, permissionData: { name?: string }): Promise<Permission> {
        try {
            console.log(`🔍 Mise à jour de la permission ${id}...`, permissionData);

            const response = await apiClient.put<Permission>(`/permissions/${id}`, permissionData);

            console.log(`✅ Permission ${id} mise à jour avec succès:`, response);

            return response.data || response;
        } catch (error: any) {
            console.error(`❌ Erreur lors de la mise à jour de la permission ${id}:`, error);
            throw new Error(`Erreur lors de la mise à jour de la permission: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Supprime une permission
     */
    static async deletePermission(id: number): Promise<void> {
        try {
            console.log(`🔍 Suppression de la permission ${id}...`);

            await apiClient.delete(`/permissions/${id}`);

            console.log(`✅ Permission ${id} supprimée avec succès`);
        } catch (error: any) {
            console.error(`❌ Erreur lors de la suppression de la permission ${id}:`, error);
            throw new Error(`Erreur lors de la suppression de la permission: ${error.message || 'Erreur inconnue'}`);
        }
    }
}
