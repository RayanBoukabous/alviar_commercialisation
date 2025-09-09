import { apiClient } from './client';
import { User, CreateUserRequest, UpdateUserRequest, UsersResponse } from '@/types';
import { getToken } from '@/lib/auth/tokenManager';

export const usersService = {
    /**
     * Récupère tous les utilisateurs
     */
    async getAllUsers(forceRefresh: boolean = false): Promise<UsersResponse> {
        try {
            console.log('🔍 Début de getAllUsers, forceRefresh:', forceRefresh);

            // Solution de contournement : utiliser fetch directement
            console.log('🔄 Utilisation de fetch directement...');
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://aiuniversfs.ddns.net:7000/api/v1';
            const url = `${baseURL}/users${forceRefresh ? `?_t=${Date.now()}` : ''}`;

            const token = getToken();
            console.log('🔑 Token récupéré pour users:', token ? 'Token présent' : 'Aucun token');

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
            console.log('🔍 Fetch data direct pour users:', data);
            console.log('🔍 Type de data:', typeof data);
            console.log('🔍 Est-ce un tableau?', Array.isArray(data));
            console.log('🔍 Longueur:', data?.length);

            if (Array.isArray(data)) {
                console.log('✅ Fetch direct: Traitement comme tableau, longueur:', data.length);
                console.log('✅ Contenu du tableau users:', data);
                const result = {
                    users: data,
                    total: data.length,
                    page: 1,
                    limit: data.length
                };
                console.log('📤 Fetch direct: Résultat final users:', result);
                return result;
            }

            // Fallback vers apiClient si fetch ne fonctionne pas
            console.log('🔄 Fallback vers apiClient...');
            const apiResponse = await apiClient.get('/users', {
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
                    users: [],
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
                    users: apiResponse.data,
                    total: apiResponse.data.length,
                    page: 1,
                    limit: apiResponse.data.length
                };
                console.log('📤 Résultat final:', result);
                return result;
            }

            // Si l'API retourne un objet avec une propriété users
            if (apiResponse.data && apiResponse.data.users) {
                console.log('✅ Traitement comme objet avec propriété users');
                return apiResponse.data;
            }

            // Fallback: traiter comme un tableau vide
            console.log('⚠️ Fallback: tableau vide');
            return {
                users: [],
                total: 0,
                page: 1,
                limit: 0
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    },

    /**
     * Récupère un utilisateur par son ID
     */
    async getUserById(id: number): Promise<any> {
        try {
            console.log('🔍 Récupération de l\'utilisateur ID:', id);

            // Utiliser fetch directement comme pour getAllUsers
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://aiuniversfs.ddns.net:7000/api/v1';
            const url = `${baseURL}/users/${id}`;

            const token = getToken();
            console.log('🔑 Token récupéré pour getUserById:', token ? 'Token présent' : 'Aucun token');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                console.log('❌ Erreur HTTP getUserById:', response.status, response.statusText);
                const errorData = await response.json();
                console.log('❌ Données d\'erreur getUserById:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Utilisateur récupéré par ID:', data);
            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crée un nouvel utilisateur
     */
    async createUser(userData: CreateUserRequest): Promise<User> {
        try {
            console.log('🔍 Données de création d\'utilisateur:', userData);

            const response = await apiClient.post('/users', userData);
            console.log('✅ Utilisateur créé avec succès:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    },

    /**
     * Met à jour un utilisateur
     */
    async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
        try {
            const response = await apiClient.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
            throw error;
        }
    },

    /**
     * Supprime un utilisateur
     */
    async deleteUser(id: number): Promise<void> {
        try {
            await apiClient.delete(`/users/${id}`);
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
            throw error;
        }
    },

    /**
     * Recherche des utilisateurs
     */
    async searchUsers(query: string): Promise<User[]> {
        try {
            const response = await apiClient.get('/users/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la recherche d\'utilisateurs:', error);
            throw error;
        }
    }
};
