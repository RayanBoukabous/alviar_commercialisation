import { djangoApi } from './djangoAuthService';

// Interface Client basée sur le modèle Django backend
export interface Client {
    id: number;
    nom: string;
    type_client: 'PARTICULIER' | 'SUPERGROSSISTE' | 'GROSSISTE';
    type_client_display: string;
    telephone: string;
    email?: string;
    adresse: string;
    nif?: string;
    nis?: string;
    wilaya?: string;
    commune?: string;
    contact_principal?: string;
    telephone_contact?: string;
    commercial?: number;
    commercial_nom?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by?: number;
    created_by_nom?: string;
}

export interface CreateClientRequest {
    nom: string;
    type_client: 'PARTICULIER' | 'SUPERGROSSISTE' | 'GROSSISTE';
    telephone: string;
    email?: string;
    adresse: string;
    nif?: string;
    nis?: string;
    wilaya?: string;
    commune?: string;
    contact_principal?: string;
    telephone_contact?: string;
    commercial?: number;
    notes?: string;
}

export interface ClientsResponse {
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    count: number;
    next: string | null;
    previous: string | null;
}

export interface ClientStats {
    total_clients: number;
    par_type: Record<string, number>;
    par_wilaya: Record<string, number>;
    par_commune: Record<string, number>;
}

class ClientsService {
    /**
     * Récupère tous les clients avec pagination et filtres
     */
    async getAllClients(params: {
        page?: number;
        limit?: number;
        search?: string;
        type_client?: string;
        wilaya?: string;
        commune?: string;
        commercial_id?: number;
    } = {}): Promise<ClientsResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.type_client) queryParams.append('type_client', params.type_client);
            if (params.wilaya) queryParams.append('wilaya', params.wilaya);
            if (params.commune) queryParams.append('commune', params.commune);
            if (params.commercial_id) queryParams.append('commercial_id', params.commercial_id.toString());

            const url = `/clients/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await djangoApi.get(url);

            console.log('🔍 Debug clients response:', response);

            // L'API Django retourne un objet avec count, next, previous, results
            let clients = [];
            let total = 0;
            let count = 0;
            let next = null;
            let previous = null;
            
            const data = response.data as any;
            
            if (data && data.results && Array.isArray(data.results)) {
                clients = data.results;
                total = data.count || clients.length;
                count = data.count || 0;
                next = data.next || null;
                previous = data.previous || null;
            } else if (Array.isArray(data)) {
                // Fallback pour les anciennes versions
                clients = data;
                total = clients.length;
                count = clients.length;
            } else {
                console.warn('Structure de réponse inattendue:', response);
                clients = [];
                total = 0;
                count = 0;
            }

            return {
                clients,
                total,
                page: params.page || 1,
                limit: params.limit || 10,
                count,
                next,
                previous
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des clients:', error);
            throw error;
        }
    }

    /**
     * Crée un nouveau client
     */
    async createClient(clientData: CreateClientRequest): Promise<Client> {
        try {
            const response = await djangoApi.post('/clients', clientData);
            console.log('Response from POST /clients:', response);
            return response.data as Client;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    /**
     * Récupère un client par ID
     */
    async getClientById(id: number): Promise<Client> {
        try {
            const response = await djangoApi.get(`/clients/${id}`);
            console.log('🔍 Debug getClientById response:', response);
            return response.data as Client;
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            throw error;
        }
    }

    /**
     * Met à jour un client
     */
    async updateClient(id: number, clientData: Partial<CreateClientRequest>): Promise<Client> {
        try {
            const response = await djangoApi.patch(`/clients/${id}`, clientData);
            return response.data as Client;
        } catch (error) {
            console.error(`Error updating client ${id}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un client
     */
    async deleteClient(id: number): Promise<void> {
        try {
            await djangoApi.delete(`/clients/${id}`);
        } catch (error) {
            console.error(`Error deleting client ${id}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les statistiques des clients
     */
    async getClientStats(): Promise<ClientStats> {
        try {
            const response = await djangoApi.get('/clients/stats');
            console.log('🔍 Debug client stats response:', response);
            return response.data as ClientStats;
        } catch (error) {
            console.error('Error fetching client stats:', error);
            throw error;
        }
    }
}

export const clientsService = new ClientsService();
