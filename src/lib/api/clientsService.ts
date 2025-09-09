import { apiClient } from './client';

export interface Client {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
    paymentPlan: {
        id: number;
        name: string;
    };
    distributor: {
        id: number;
        name: string;
    };
    keys: Array<{
        id: number;
        key: string;
        isActive: boolean;
    }>;
}

export interface PaymentPlan {
    id: number;
    name: string;
    price: string;
    currency: string;
    billingCycle: string;
    requestLimit: number;
    isDefault: boolean;
    trialDays: number;
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

export interface CreateClientRequest {
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    paymentPlanId: number;
    distributorId: number;
    createdBy: string;
}

export interface ClientsResponse {
    clients: Client[];
    total: number;
    page: number;
    limit: number;
}

class ClientsService {
    /**
     * Récupère tous les clients
     */
    async getAllClients(forceRefresh: boolean = false): Promise<ClientsResponse> {
        try {
            const config = forceRefresh ? {
                params: {
                    _t: Date.now() // Cache busting parameter
                }
            } : {};

            const response = await apiClient.get('/clients', config);

            console.log('🔍 Debug response structure:');
            console.log('response:', response);
            console.log('typeof response:', typeof response);
            console.log('Array.isArray(response):', Array.isArray(response));

            // L'API retourne directement un tableau de clients
            let clients = [];

            if (Array.isArray(response)) {
                clients = response;
            } else if (response && Array.isArray(response.clients)) {
                clients = response.clients;
            } else if (response && response.data && Array.isArray(response.data)) {
                clients = response.data;
            } else {
                console.warn('Structure de réponse inattendue:', response);
                clients = [];
            }

            console.log('✅ Clients extraits:', clients);

            return {
                clients,
                total: clients.length,
                page: 1,
                limit: clients.length
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
            const response = await apiClient.post('/clients', clientData);
            console.log('Response from POST /api/v1/clients:', response.data);
            return response.data;
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
            const response = await apiClient.get(`/clients/${id}`);
            return response.data;
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
            const response = await apiClient.patch(`/clients/${id}`, clientData);
            return response.data;
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
            await apiClient.delete(`/clients/${id}`);
        } catch (error) {
            console.error(`Error deleting client ${id}:`, error);
            throw error;
        }
    }

    /**
     * Récupère tous les plans de paiement
     */
    async getPaymentPlans(): Promise<PaymentPlan[]> {
        try {
            const response = await apiClient.get('/payment-plans');

            // L'API retourne directement un tableau de plans de paiement
            let plans = [];

            if (Array.isArray(response)) {
                plans = response;
            } else if (response && Array.isArray(response.plans)) {
                plans = response.plans;
            } else if (response && response.data && Array.isArray(response.data)) {
                plans = response.data;
            } else {
                console.warn('Structure de réponse inattendue pour les plans de paiement:', response);
                plans = [];
            }

            return plans;
        } catch (error) {
            console.error('Erreur lors de la récupération des plans de paiement:', error);
            throw error;
        }
    }
}

export const clientsService = new ClientsService();
