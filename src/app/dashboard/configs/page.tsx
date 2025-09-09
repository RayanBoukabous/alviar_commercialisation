'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  Calendar,
  User,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { 
  configsService, 
  Config, 
  ConfigType, 
  LivenessConfig, 
  MatchingConfig, 
  SilentLivenessConfig,
  clientsService, 
  Client 
} from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { CreateConfigModal } from '@/components/forms/CreateConfigModal';
import { EditConfigModal } from '@/components/forms/EditConfigModal';
import { ViewConfigModal } from '@/components/forms/ViewConfigModal';

export default function ConfigsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [configTypeFilter, setConfigTypeFilter] = useState<ConfigType | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingConfig, setViewingConfig] = useState<Config | null>(null);

  // Données mock pour le développement
  const mockConfigs: Config[] = [
    {
      id: 1,
      type: 'liveness',
      clientId: 1,
      requiredMovements: ['blink', 'smile'],
      movementCount: 2,
      movementDurationSec: 2,
      fps: 15,
      timeoutSec: 30,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      createdBy: 'admin',
      updatedBy: undefined
    } as LivenessConfig,
    {
      id: 2,
      type: 'matching',
      clientId: 2,
      distanceMethod: 'cosine',
      threshold: 0.5,
      minimumConfidence: 0.7,
      maxAngle: 30,
      enablePreprocessing: true,
      enableFraudCheck: true,
      createdAt: '2024-01-20T14:15:00Z',
      updatedAt: '2024-01-20T14:15:00Z',
      createdBy: 'admin',
      updatedBy: undefined
    } as MatchingConfig,
    {
      id: 3,
      type: 'silent-liveness',
      clientId: 1,
      fps: 15,
      timeoutSec: 30,
      minFrames: 10,
      minDurationSec: 3,
      decisionThreshold: 0.8,
      createdAt: '2024-01-25T09:45:00Z',
      updatedAt: '2024-01-25T09:45:00Z',
      createdBy: 'admin',
      updatedBy: undefined
    } as SilentLivenessConfig
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les clients d'abord
        const clientsResponse = await clientsService.getAllClients(true);
        const clientsList = clientsResponse.clients || [];
        setClients(clientsList);
        
        // Récupérer les configurations pour chaque client et chaque type
        const allConfigs: Config[] = [];
        const configTypes: ConfigType[] = ['liveness', 'matching', 'silent-liveness'];
        
        for (const client of clientsList) {
          for (const configType of configTypes) {
            try {
              console.log(`Récupération des configs ${configType} pour le client ${client.id} (${client.name})`);
              const configsResponse = await configsService.getConfigsByClient(configType, client.id, true);
              
              if (configsResponse.configs && configsResponse.configs.length > 0) {
                // Le type est déjà connu selon la route utilisée
                allConfigs.push(...configsResponse.configs);
                console.log(`✅ Configs ${configType} trouvées pour ${client.name}:`, configsResponse.configs);
              } else {
                console.log(`ℹ️ Aucune config ${configType} trouvée pour ${client.name}`);
              }
            } catch (configError: unknown) {
              // Gérer spécifiquement les erreurs 404 (pas de config pour ce client)
              if ((configError as any).status === 404 || (configError as any).code === 'NOT_FOUND_ERROR') {
                console.log(`ℹ️ Aucune config ${configType} trouvée pour le client ${client.id} (${client.name}) - 404`);
              } else {
                console.warn(`⚠️ Erreur lors de la récupération des configs ${configType} pour le client ${client.id}:`, configError);
              }
              // Continue avec les autres clients/types même si un échoue
            }
          }
        }
        
        setConfigs(allConfigs);
        console.log('Toutes les configs récupérées:', allConfigs);
        
      } catch (err) {
        setError('Erreur lors du chargement des configurations');
        console.error('Erreur:', err);
        // En cas d'erreur, utiliser les données mock
        setConfigs(mockConfigs);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Récupérer tous les clients d'abord
      const clientsResponse = await clientsService.getAllClients(true);
      const clientsList = clientsResponse.clients || [];
      
      // Récupérer les configurations pour chaque client et chaque type
      const allConfigs: Config[] = [];
      const configTypes: ConfigType[] = ['liveness', 'matching', 'silent-liveness'];
      
      for (const client of clientsList) {
        for (const configType of configTypes) {
          try {
            console.log(`Rafraîchissement des configs ${configType} pour le client ${client.id} (${client.name})`);
            const configsResponse = await configsService.getConfigsByClient(configType, client.id, true);
            
            if (configsResponse.configs && configsResponse.configs.length > 0) {
              allConfigs.push(...configsResponse.configs);
              console.log(`✅ Configs ${configType} rafraîchies pour ${client.name}:`, configsResponse.configs);
            }
          } catch (configError: unknown) {
            // Gérer spécifiquement les erreurs 404 (pas de config pour ce client)
            if ((configError as any).status === 404 || (configError as any).code === 'NOT_FOUND_ERROR') {
              console.log(`ℹ️ Aucune config ${configType} trouvée pour le client ${client.id} (${client.name}) - 404`);
            } else {
              console.warn(`⚠️ Erreur lors du rafraîchissement des configs ${configType} pour le client ${client.id}:`, configError);
            }
          }
        }
      }
      
      setConfigs(allConfigs);
      console.log('Configs rafraîchies:', allConfigs);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des configurations');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteConfig = async (config: Config) => {
    const configName = `${config.type.toUpperCase()} Config #${config.id}`;
    
    // Confirmation avant suppression
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la configuration "${configName}" pour le client ${getClientName(config.clientId)} ?\n\nCette action est irréversible.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingConfigId(config.id);
      
      // Appeler l'API de suppression avec le type et l'ID du client
      await configsService.deleteConfig(config.type, config.clientId);
      
      // Supprimer la config de la liste locale
      setConfigs(prevConfigs => prevConfigs.filter(c => c.id !== config.id));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(`Configuration "${configName}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Configuration ${configName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la configuration:', err);
      setError('Erreur lors de la suppression de la configuration');
    } finally {
      setDeletingConfigId(null);
    }
  };

  const handleCreateSuccess = () => {
    // Rafraîchir la liste des configs après création
    handleRefresh();
  };

  const handleEditConfig = (config: Config) => {
    setEditingConfig(config);
    setIsEditModalOpen(true);
  };

  const handleViewConfig = (config: Config) => {
    setViewingConfig(config);
    setIsViewModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir la liste des configs après modification
    handleRefresh();
    setEditingConfig(null);
  };

  const filteredConfigs = configs.filter(config => {
    // Recherche par terme
    const searchLower = searchTerm.toLowerCase();
    let matchesSearch = false;
    
    if (config.type === 'liveness') {
      const movementsText = (config as LivenessConfig).requiredMovements.join(' ').toLowerCase();
      matchesSearch = movementsText.includes(searchLower) || 
                     config.createdBy.toLowerCase().includes(searchLower) ||
                     config.type.toLowerCase().includes(searchLower);
    } else {
      matchesSearch = config.createdBy.toLowerCase().includes(searchLower) ||
                     config.type.toLowerCase().includes(searchLower);
    }
    
    // Filtre par client
    const matchesClient = clientFilter === 'ALL' || config.clientId.toString() === clientFilter;
    
    // Filtre par type de configuration
    const matchesType = configTypeFilter === 'ALL' || config.type === configTypeFilter;
    
    return matchesSearch && matchesClient && matchesType;
  });


  const getClientName = (clientId: number, clientData?: any) => {
    // Si on a les données client directement dans la réponse API
    if (clientData && clientData.name) {
      return clientData.name;
    }
    // Sinon, chercher dans la liste des clients
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : `Client #${clientId}`;
  };

  const getClientStatus = (clientId: number, clientData?: any) => {
    // Si on a les données client directement dans la réponse API
    if (clientData && clientData.status) {
      return clientData.status;
    }
    // Sinon, chercher dans la liste des clients
    const client = clients.find(c => c.id === clientId);
    return client ? client.status : 'UNKNOWN';
  };

  const getConfigTypeName = (type: ConfigType) => {
    switch (type) {
      case 'liveness':
        return 'Liveness';
      case 'matching':
        return 'Matching';
      case 'silent-liveness':
        return 'Silent Liveness';
      default:
        return type;
    }
  };

  const getConfigTypeIcon = (type: ConfigType) => {
    switch (type) {
      case 'liveness':
        return '🎭';
      case 'matching':
        return '🔍';
      case 'silent-liveness':
        return '👁️';
      default:
        return '⚙️';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition">
      {/* Header */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                <Settings className="h-7 w-7 mr-3 text-primary-600" />
                Gestion des Configurations
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">Gérez vos configurations de liveness</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Rafraîchir
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Configuration
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Filters and Search */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition" />
              <input
                type="text"
                placeholder="Rechercher une configuration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">Tous les clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id.toString()}>
                  {client.name}
                </option>
              ))}
            </select>
            <select
              value={configTypeFilter}
              onChange={(e) => setConfigTypeFilter(e.target.value as ConfigType | 'ALL')}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">Tous les types</option>
              <option value="liveness">Liveness</option>
              <option value="matching">Matching</option>
              <option value="silent-liveness">Silent Liveness</option>
            </select>
            <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-5 w-5 text-green-500 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-6">
        <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y theme-border-secondary theme-transition">
                <thead className="theme-bg-secondary theme-transition">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Configuration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Détails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Paramètres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Créé par
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Date de création
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {filteredConfigs.map((config) => (
                    <tr key={`${config.type}-${config.id}`} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{getConfigTypeIcon(config.type)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              Config #{config.id}
                            </div>
                            <div className="text-xs theme-text-tertiary theme-transition">
                              {getConfigTypeName(config.type)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          config.type === 'liveness' ? 'bg-blue-100 text-blue-800' :
                          config.type === 'matching' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getConfigTypeIcon(config.type)} {config.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-medium">{getClientName(config.clientId, (config as any).client)}</div>
                            <div className="text-xs theme-text-tertiary theme-transition">
                              ID: {config.clientId}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            getClientStatus(config.clientId, (config as any).client) === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getClientStatus(config.clientId, (config as any).client)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {config.type === 'liveness' ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {(config as LivenessConfig).requiredMovements.map((movement, index) => (
                                <span
                                  key={`${config.id}-${movement}-${index}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {movement}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs theme-text-tertiary theme-transition">
                              {(config as LivenessConfig).movementCount} mouvements • {(config as LivenessConfig).movementDurationSec}s
                            </div>
                          </div>
                        ) : config.type === 'matching' ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {(config as MatchingConfig).distanceMethod}
                            </div>
                            <div className="text-xs theme-text-tertiary theme-transition">
                              Seuil: {(config as MatchingConfig).threshold} • Confiance: {(config as MatchingConfig).minimumConfidence}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm theme-text-secondary theme-transition">
                            FPS: {(config as SilentLivenessConfig).fps}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          {config.type === 'liveness' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">FPS:</span>
                                <span className="theme-text-primary theme-transition">{(config as LivenessConfig).fps}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Timeout:</span>
                                <span className="theme-text-primary theme-transition">{config.timeoutSec}s</span>
                              </div>
                            </>
                          ) : config.type === 'matching' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Angle max:</span>
                                <span className="theme-text-primary theme-transition">{(config as MatchingConfig).maxAngle}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Prétraitement:</span>
                                <span className={`${(config as MatchingConfig).enablePreprocessing ? 'text-green-600' : 'text-red-600'}`}>
                                  {(config as MatchingConfig).enablePreprocessing ? 'Oui' : 'Non'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Anti-fraude:</span>
                                <span className={`${(config as MatchingConfig).enableFraudCheck ? 'text-green-600' : 'text-red-600'}`}>
                                  {(config as MatchingConfig).enableFraudCheck ? 'Oui' : 'Non'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Frames min:</span>
                                <span className="theme-text-primary theme-transition">{(config as SilentLivenessConfig).minFrames}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Durée min:</span>
                                <span className="theme-text-primary theme-transition">{(config as SilentLivenessConfig).minDurationSec}s</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="theme-text-tertiary theme-transition">Seuil décision:</span>
                                <span className="theme-text-primary theme-transition">{(config as SilentLivenessConfig).decisionThreshold}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {config.createdBy?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{config.createdBy}</span>
                        </div>
                        {config.updatedBy && config.updatedBy !== config.createdBy && (
                          <div className="text-xs theme-text-tertiary theme-transition mt-1">
                            Modifié par {config.updatedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        <div className="text-xs">
                          {formatDate(config.createdAt)}
                        </div>
                        {config.updatedAt && config.updatedAt !== config.createdAt && (
                          <div className="text-xs theme-text-tertiary theme-transition">
                            Modifié: {formatDate(config.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewConfig(config)}
                            className="p-1 theme-text-tertiary hover:text-green-500 theme-transition"
                            title="Voir les détails de la configuration"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditConfig(config)}
                            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                            title="Modifier la configuration"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteConfig(config)}
                            disabled={deletingConfigId === config.id}
                            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                            title="Supprimer la configuration"
                          >
                            {deletingConfigId === config.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                          <button className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredConfigs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">Aucune configuration trouvée</h3>
              <p className="theme-text-secondary theme-transition">Commencez par ajouter votre première configuration.</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Create Config Modal */}
      <CreateConfigModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        clients={clients}
      />

      {/* Edit Config Modal */}
      {editingConfig && (
        <EditConfigModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingConfig(null);
          }}
          onSuccess={handleEditSuccess}
          config={editingConfig}
        />
      )}

      {/* View Config Modal */}
      <ViewConfigModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingConfig(null);
        }}
        config={viewingConfig}
      />
    </Layout>
  );
}
