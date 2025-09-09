import { apiClient } from './client';
import { Admin, CreateAdminRequest, UpdateAdminRequest, AdminsResponse } from '@/types';
import { getToken } from '@/lib/auth/tokenManager';

export const adminsService = {
  /**
   * Récupère tous les administrateurs
   */
  async getAllAdmins(forceRefresh: boolean = false): Promise<AdminsResponse> {
    try {
      console.log('🔍 Début de getAllAdmins, forceRefresh:', forceRefresh);

      // Solution de contournement : utiliser fetch directement
      console.log('🔄 Utilisation de fetch directement...');
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://aiuniversfs.ddns.net:7000/api/v1';
      const url = `${baseURL}/admins${forceRefresh ? `?_t=${Date.now()}` : ''}`;

      const token = getToken();
      console.log('🔑 Token récupéré:', token ? 'Token présent' : 'Aucun token');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        console.log('❌ Erreur HTTP:', response.status, response.statusText);
        const errorData = await response.json();
        console.log('❌ Données d\'erreur:', errorData);

        if (response.status === 401) {
          console.log('🔑 Erreur d\'authentification 401');
          throw new Error('Non autorisé - Veuillez vous reconnecter');
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Fetch data direct:', data);
      console.log('🔍 Type de data:', typeof data);
      console.log('🔍 Est-ce un tableau?', Array.isArray(data));
      console.log('🔍 Longueur:', data?.length);

      if (Array.isArray(data)) {
        console.log('✅ Fetch direct: Traitement comme tableau, longueur:', data.length);
        console.log('✅ Contenu du tableau:', data);
        const result = {
          admins: data,
          total: data.length,
          page: 1,
          limit: data.length
        };
        console.log('📤 Fetch direct: Résultat final:', result);
        return result;
      }

      // Fallback vers apiClient si fetch ne fonctionne pas
      console.log('🔄 Fallback vers apiClient...');
      const apiResponse = await apiClient.get('/admins', {
        params: forceRefresh ? { _t: Date.now() } : {}
      });

      console.log('📡 Réponse complète de l\'API:', apiResponse);
      console.log('📡 Type de response:', typeof apiResponse);
      console.log('📡 response.data existe?', 'data' in apiResponse);
      console.log('📡 response.data:', apiResponse.data);
      console.log('📊 Données de la réponse:', apiResponse.data);
      console.log('🔍 Type de response.data:', typeof apiResponse.data);
      console.log('🔍 Est-ce un tableau?', Array.isArray(apiResponse.data));
      console.log('🔍 response.data est undefined?', apiResponse.data === undefined);
      console.log('🔍 response.data est null?', apiResponse.data === null);

      // Vérifier si response.data existe
      if (apiResponse.data === undefined || apiResponse.data === null) {
        console.log('❌ response.data est undefined ou null');
        return {
          admins: [],
          total: 0,
          page: 1,
          limit: 0
        };
      }

      // Si l'API retourne directement un tableau (ce qui est le cas ici)
      if (Array.isArray(apiResponse.data)) {
        console.log('✅ Traitement comme tableau, longueur:', apiResponse.data.length);
        console.log('✅ Données du tableau:', apiResponse.data);
        const result = {
          admins: apiResponse.data,
          total: apiResponse.data.length,
          page: 1,
          limit: apiResponse.data.length
        };
        console.log('📤 Résultat final:', result);
        return result;
      }

      // Si l'API retourne un objet avec une propriété admins
      if (apiResponse.data && apiResponse.data.admins) {
        console.log('✅ Traitement comme objet avec propriété admins');
        return apiResponse.data;
      }

      // Fallback: traiter comme un tableau vide
      console.log('⚠️ Fallback: tableau vide');
      return {
        admins: [],
        total: 0,
        page: 1,
        limit: 0
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des administrateurs:', error);
      throw error;
    }
  },

  /**
   * Récupère un administrateur par son ID
   */
  async getAdminById(id: number): Promise<any> {
    try {
      console.log('🔍 Récupération de l\'admin ID:', id);

      // Utiliser fetch directement comme pour getAllAdmins
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://aiuniversfs.ddns.net:7000/api/v1';
      const url = `${baseURL}/admins/${id}`;

      const token = getToken();
      console.log('🔑 Token récupéré pour getAdminById:', token ? 'Token présent' : 'Aucun token');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        console.log('❌ Erreur HTTP getAdminById:', response.status, response.statusText);
        const errorData = await response.json();
        console.log('❌ Données d\'erreur getAdminById:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Admin récupéré par ID:', data);
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel administrateur
   */
  async createAdmin(adminData: CreateAdminRequest): Promise<Admin> {
    try {
      // Utiliser l'API d'enregistrement avec le bon format
      const registerData = {
        email: adminData.email,
        password: adminData.password,
        confirmPassword: adminData.password, // Utiliser le même mot de passe
        username: adminData.username,
        fullName: adminData.fullName,
        role: 'admin' // Toujours admin pour ce service
      };

      console.log('🔍 Données d\'enregistrement:', registerData);

      const response = await apiClient.post('/auth/register', registerData);
      console.log('✅ Admin créé avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
      throw error;
    }
  },

  /**
   * Met à jour un administrateur
   */
  async updateAdmin(id: number, adminData: UpdateAdminRequest): Promise<Admin> {
    try {
      const response = await apiClient.put(`/admins/${id}`, adminData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un administrateur
   */
  async deleteAdmin(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admins/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Active un administrateur
   */
  async activateAdmin(id: number): Promise<Admin> {
    try {
      console.log('🔄 Activation de l\'admin ID:', id);
      const response = await apiClient.patch(`/admins/${id}/activate`);
      console.log('✅ Admin activé avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'activation de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Suspend un administrateur
   */
  async suspendAdmin(id: number): Promise<Admin> {
    try {
      console.log('🔄 Suspension de l\'admin ID:', id);
      const response = await apiClient.patch(`/admins/${id}/suspend`);
      console.log('✅ Admin suspendu avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suspension de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Change le statut d'un administrateur (méthode générique)
   */
  async updateAdminStatus(id: number, status: 'active' | 'inactive' | 'suspended'): Promise<Admin> {
    try {
      const response = await apiClient.patch(`/admins/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Recherche des administrateurs
   */
  async searchAdmins(query: string): Promise<Admin[]> {
    try {
      const response = await apiClient.get('/api/v1/admins/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'administrateurs:', error);
      throw error;
    }
  }
};