import { apiClient } from './client';
import {
    Config,
    ConfigType,
    LivenessConfig,
    MatchingConfig,
    SilentLivenessConfig,
    CreateLivenessConfigRequest,
    CreateMatchingConfigRequest,
    CreateSilentLivenessConfigRequest,
    UpdateLivenessConfigRequest,
    UpdateMatchingConfigRequest,
    UpdateSilentLivenessConfigRequest,
    ConfigsResponse
} from '@/types';

class ConfigsService {
    /**
     * Obtient l'endpoint API selon le type de configuration
     */
    private getEndpoint(configType: ConfigType, clientId?: number, configId?: number): string {
        switch (configType) {
            case 'liveness':
                if (configId) {
                    return `/configs/liveness/config/${configId}`;
                }
                return `/configs/liveness/${clientId}`;
            case 'matching':
                if (configId) {
                    return `/configs/matching/config/${configId}`;
                }
                return `/configs/matching/${clientId}`;
            case 'silent-liveness':
                if (configId) {
                    return `/configs/silent-livenes/config/${configId}`;
                }
                return `/configs/silent-livenes/${clientId}`;
            default:
                throw new Error(`Type de configuration non supporté: ${configType}`);
        }
    }

    /**
     * Récupère toutes les configurations d'un type spécifique pour un client
     */
    async getConfigsByClient<T extends Config>(
        configType: ConfigType,
        clientId: number,
        forceRefresh: boolean = false
    ): Promise<ConfigsResponse<T>> {
        try {
            const params = forceRefresh ? { _t: Date.now() } : {};
            const endpoint = this.getEndpoint(configType, clientId);
            console.log(`🌐 Appel API GET: ${endpoint} pour client ${clientId} (type: ${configType})`);
            const response = await apiClient.get(endpoint, { params });

            console.log(`🔍 Debug ${configType} config response for client ${clientId}:`, response);

            // Fonction pour ajouter le type aux configurations
            const addTypeToConfigs = (configs: any[]) => {
                return configs.map(config => ({
                    ...config,
                    type: configType
                }));
            };

            // Gérer différentes structures de réponse
            if (Array.isArray(response)) {
                return {
                    configs: addTypeToConfigs(response),
                    total: response.length,
                    page: 1,
                    limit: response.length
                };
            } else if (response && typeof response === 'object' && 'configs' in response) {
                const responseData = response as any;
                return {
                    configs: addTypeToConfigs(responseData.configs),
                    total: responseData.total || responseData.configs.length,
                    page: responseData.page || 1,
                    limit: responseData.limit || responseData.configs.length
                };
            } else if (response && typeof response === 'object' && 'data' in response) {
                const configs = Array.isArray((response as any).data) ? (response as any).data : [(response as any).data];
                return {
                    configs: addTypeToConfigs(configs),
                    total: configs.length,
                    page: 1,
                    limit: configs.length
                };
            } else if (response && typeof response === 'object' && 'id' in response) {
                // L'API retourne directement un objet de configuration
                console.log(`✅ ${configType} config trouvée pour client ${clientId}:`, response);
                return {
                    configs: addTypeToConfigs([response]),
                    total: 1,
                    page: 1,
                    limit: 1
                };
            } else {
                throw new Error('Format de réponse inattendu');
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération des configs ${configType}:`, error);
            throw error;
        }
    }

    /**
     * Récupère une configuration par ID et type
     */
    async getConfigById<T extends Config>(configType: ConfigType, configId: number): Promise<T> {
        try {
            const endpoint = this.getEndpoint(configType, undefined, configId);
            const response = await apiClient.get(endpoint);
            // Ajouter le type à la configuration
            return {
                ...(response as any),
                type: configType
            } as T;
        } catch (error) {
            console.error(`Erreur lors de la récupération de la config ${configType}:`, error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle configuration pour un client
     */
    async createConfig<T extends Config>(
        configType: ConfigType,
        clientId: number,
        configData: any
    ): Promise<T> {
        try {
            const endpoint = this.getEndpoint(configType, clientId);
            const response = await apiClient.post(endpoint, configData);
            // Ajouter le type à la configuration créée
            return {
                ...(response as any),
                type: configType
            } as T;
        } catch (error) {
            console.error(`Erreur lors de la création de la config ${configType}:`, error);
            throw error;
        }
    }

    /**
     * Met à jour une configuration pour un client
     */
    async updateConfig<T extends Config>(
        configType: ConfigType,
        clientId: number,
        configData: any
    ): Promise<T> {
        try {
            const endpoint = this.getEndpoint(configType, clientId);
            const response = await apiClient.put(endpoint, configData);
            // Ajouter le type à la configuration mise à jour
            return {
                ...(response as any),
                type: configType
            } as T;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la config ${configType}:`, error);
            throw error;
        }
    }

    /**
     * Supprime une configuration pour un client
     */
    async deleteConfig(configType: ConfigType, clientId: number): Promise<void> {
        try {
            const endpoint = this.getEndpoint(configType, clientId);
            await apiClient.delete(endpoint);
        } catch (error) {
            console.error(`Erreur lors de la suppression de la config ${configType}:`, error);
            throw error;
        }
    }

    // Méthodes spécifiques pour chaque type de configuration (pour la rétrocompatibilité)

    /**
     * Récupère toutes les configurations liveness pour un client
     */
    async getLivenessConfigsByClient(clientId: number, forceRefresh: boolean = false): Promise<ConfigsResponse<LivenessConfig>> {
        return this.getConfigsByClient<LivenessConfig>('liveness', clientId, forceRefresh);
    }

    /**
     * Récupère toutes les configurations matching pour un client
     */
    async getMatchingConfigsByClient(clientId: number, forceRefresh: boolean = false): Promise<ConfigsResponse<MatchingConfig>> {
        return this.getConfigsByClient<MatchingConfig>('matching', clientId, forceRefresh);
    }

    /**
     * Récupère toutes les configurations silent-liveness pour un client
     */
    async getSilentLivenessConfigsByClient(clientId: number, forceRefresh: boolean = false): Promise<ConfigsResponse<SilentLivenessConfig>> {
        return this.getConfigsByClient<SilentLivenessConfig>('silent-liveness', clientId, forceRefresh);
    }

    /**
     * Crée une nouvelle configuration liveness pour un client
     */
    async createLivenessConfig(clientId: number, configData: CreateLivenessConfigRequest): Promise<LivenessConfig> {
        return this.createConfig<LivenessConfig>('liveness', clientId, configData);
    }

    /**
     * Crée une nouvelle configuration matching pour un client
     */
    async createMatchingConfig(clientId: number, configData: CreateMatchingConfigRequest): Promise<MatchingConfig> {
        return this.createConfig<MatchingConfig>('matching', clientId, configData);
    }

    /**
     * Crée une nouvelle configuration silent-liveness pour un client
     */
    async createSilentLivenessConfig(clientId: number, configData: CreateSilentLivenessConfigRequest): Promise<SilentLivenessConfig> {
        return this.createConfig<SilentLivenessConfig>('silent-liveness', clientId, configData);
    }

    /**
     * Met à jour une configuration liveness pour un client
     */
    async updateLivenessConfig(clientId: number, configData: UpdateLivenessConfigRequest): Promise<LivenessConfig> {
        return this.updateConfig<LivenessConfig>('liveness', clientId, configData);
    }

    /**
     * Met à jour une configuration matching pour un client
     */
    async updateMatchingConfig(clientId: number, configData: UpdateMatchingConfigRequest): Promise<MatchingConfig> {
        return this.updateConfig<MatchingConfig>('matching', clientId, configData);
    }

    /**
     * Met à jour une configuration silent-liveness pour un client
     */
    async updateSilentLivenessConfig(clientId: number, configData: UpdateSilentLivenessConfigRequest): Promise<SilentLivenessConfig> {
        return this.updateConfig<SilentLivenessConfig>('silent-liveness', clientId, configData);
    }

    /**
     * Supprime une configuration liveness pour un client
     */
    async deleteLivenessConfig(clientId: number): Promise<void> {
        return this.deleteConfig('liveness', clientId);
    }

    /**
     * Supprime une configuration matching pour un client
     */
    async deleteMatchingConfig(clientId: number): Promise<void> {
        return this.deleteConfig('matching', clientId);
    }

    /**
     * Supprime une configuration silent-liveness pour un client
     */
    async deleteSilentLivenessConfig(clientId: number): Promise<void> {
        return this.deleteConfig('silent-liveness', clientId);
    }
}

export const configsService = new ConfigsService();
