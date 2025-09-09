'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Building2,
  Settings,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  MapPin,
  Key,
  Eye,
  Smile,
  RotateCcw,
  Move,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { clientsService, Client, configsService, LivenessConfig } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { CreateConfigModal } from '@/components/forms/CreateConfigModal';
import { EditConfigModal } from '@/components/forms/EditConfigModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function ClientViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading } = useLanguage();
  
  const [client, setClient] = useState<Client | null>(null);
  const [configs, setConfigs] = useState<LivenessConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LivenessConfig | null>(null);

  const clientId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (clientId && isAuthenticated) {
      fetchClientData();
    }
  }, [clientId, isAuthenticated]);

  const fetchClientData = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError('');

      // Récupérer les informations du client
      const clientsResponse = await clientsService.getAllClients(true);
      const foundClient = clientsResponse.clients?.find(c => c.id === clientId);
      
      if (!foundClient) {
        setError(t('clients', 'client_not_found'));
        return;
      }
      
      setClient(foundClient);

      // Récupérer les configurations du client
      try {
        const configsResponse = await configsService.getLivenessConfigsByClient(clientId, true);
        setConfigs(configsResponse.configs || []);
        console.log(`✅ Configs trouvées pour ${foundClient.name}:`, configsResponse.configs);
      } catch (configError: any) {
        if (configError.status === 404 || configError.code === 'NOT_FOUND_ERROR') {
          console.log(`ℹ️ Aucune config trouvée pour le client ${clientId}`);
          setConfigs([]);
        } else {
          console.warn(`⚠️ Erreur lors de la récupération des configs:`, configError);
          setConfigs([]);
        }
      }

    } catch (err) {
      setError(t('clients', 'loading_error'));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!clientId) return;

    try {
      setRefreshing(true);
      await fetchClientData();
    } catch (err) {
      setError(t('clients', 'refresh_error'));
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateSuccess = () => {
    handleRefresh();
  };

  const handleEditConfig = (config: LivenessConfig) => {
    setEditingConfig(config);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    handleRefresh();
    setEditingConfig(null);
  };

  const handleDeleteConfig = async (config: LivenessConfig) => {
    const configName = `Config #${config.id}`;
    
    const confirmed = window.confirm(
      t('clients', 'delete_config_confirmation').replace('{name}', configName)
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingConfigId(config.id);
      await configsService.deleteLivenessConfig(config.clientId);
      
      setConfigs(prevConfigs => prevConfigs.filter(c => c.id !== config.id));
      
      setSuccessMessage(t('clients', 'config_deleted').replace('{name}', configName));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Configuration ${configName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la configuration:', err);
      setError(t('clients', 'delete_config_error'));
    } finally {
      setDeletingConfigId(null);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: t('clients', 'active') },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('clients', 'inactive') },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', label: t('clients', 'suspended') }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-primary-600 hover:text-primary-700 theme-transition mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('clients', 'back')}
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || t('clients', 'client_not_found')}</p>
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('clients', 'back_to_clients')}
              </button>
            </div>
          </div>
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
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 rounded-lg hover:theme-bg-secondary theme-transition"
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Building2 className="h-7 w-7 mr-3 text-primary-600" />
                    {client.name}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    ID: {client.id} • {getStatusBadge(client.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {t('clients', 'refresh')}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('clients', 'new_configuration')}
                </button>
              </div>
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

        <div className="px-6 py-6 space-y-6">
          {/* Client Information */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                {t('clients', 'client_information')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'name')}</label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'id')}</label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">#{client.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'status')}</label>
                    <div className="mt-1">{getStatusBadge(client.status)}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {t('clients', 'payment_plan')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {client.paymentPlan?.name || `Plan #${client.paymentPlan?.id}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {t('clients', 'distributor')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {client.distributor?.name || `Distributeur #${client.distributor?.id}`}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {t('clients', 'created_by')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {t('clients', 'creation_date')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys */}
          {client.keys && client.keys.length > 0 && (
            <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                  <Key className="h-5 w-5 mr-2 text-primary-600" />
                  {t('clients', 'api_keys')} ({client.keys.length})
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {client.keys.map((key, index) => (
                    <div key={index} className="flex items-center justify-between p-3 theme-bg-secondary rounded-lg">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2 theme-text-tertiary" />
                        <code className="text-sm font-mono theme-text-primary theme-transition">{key.key}</code>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {key.isActive ? t('clients', 'active') : t('clients', 'inactive')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Configurations */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                {t('clients', 'liveness_configurations')} ({configs.length})
              </h2>
            </div>
            <div className="p-6">
              {configs.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                  <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('clients', 'no_configuration')}</h3>
                  <p className="theme-text-secondary theme-transition mb-4">
                    {t('clients', 'no_config_description')}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {t('clients', 'create_first_config')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Settings className="h-5 w-5 mr-2 text-primary-600" />
                          <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                            {t('clients', 'configuration')} #{config.id}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditConfig(config)}
                            className="p-2 rounded-lg hover:theme-bg-elevated theme-transition"
                            title={t('clients', 'edit_config')}
                          >
                            <Edit className="h-4 w-4 theme-text-tertiary hover:text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config)}
                            disabled={deletingConfigId === config.id}
                            className="p-2 rounded-lg hover:theme-bg-elevated theme-transition disabled:opacity-50"
                            title={t('clients', 'delete_config')}
                          >
                            {deletingConfigId === config.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 theme-text-tertiary hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'movements')}</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {config.requiredMovements.map((movement) => (
                              <span
                                key={movement}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {movement}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'parameters')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{t('clients', 'fps')}:</strong> {config.fps}
                            </p>
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{t('clients', 'duration')}:</strong> {config.movementDurationSec}s
                            </p>
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{t('clients', 'timeout')}:</strong> {config.timeoutSec}s
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'creation')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{t('clients', 'by')}:</strong> {config.createdBy}
                            </p>
                            <p className="text-sm theme-text-secondary theme-transition">
                              {formatDate(config.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{t('clients', 'last_modification')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              {formatDate(config.updatedAt)}
                            </p>
                            {config.updatedBy && (
                              <p className="text-sm theme-text-secondary theme-transition">
                                {t('clients', 'by')}: {config.updatedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
          clients={client ? [client] : []}
        />

        {/* Edit Config Modal */}
        <EditConfigModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingConfig(null);
          }}
          onSuccess={handleEditSuccess}
          config={editingConfig}
        />
      </div>
    </Layout>
  );
}
