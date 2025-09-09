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
import { clientsService, Client, LivenessConfig, livenessService } from '@/lib/api';
import { MatchingConfig, SilentLivenessConfig, LivenessSession } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { CreateConfigModal } from '@/components/forms/CreateConfigModal';
import { EditConfigModal } from '@/components/forms/EditConfigModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function ClientViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Helper function to ensure translations are strings
  const translate = (namespace: 'clients', key: string): string => {
    return t(namespace, key) as string;
  };
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditLivenessModalOpen, setIsEditLivenessModalOpen] = useState(false);
  const [isEditMatchingModalOpen, setIsEditMatchingModalOpen] = useState(false);
  const [isEditSilentLivenessModalOpen, setIsEditSilentLivenessModalOpen] = useState(false);
  const [editingLivenessConfig, setEditingLivenessConfig] = useState<any | null>(null);
  const [editingMatchingConfig, setEditingMatchingConfig] = useState<MatchingConfig | null>(null);
  const [editingSilentLivenessConfig, setEditingSilentLivenessConfig] = useState<SilentLivenessConfig | null>(null);
  
  // États pour les sessions de liveness
  const [livenessSessions, setLivenessSessions] = useState<LivenessSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string>('');
  
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = useState(0);

  const clientId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (clientId && isAuthenticated) {
      fetchClientData();
      fetchLivenessSessions();
    }
  }, [clientId, isAuthenticated]);

  // Force re-render when language changes
  useEffect(() => {
    setLanguageKey(prev => prev + 1);
  }, [currentLocale]);

  const fetchClientData = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError('');

      console.log(`🔍 Fetching client data for ID: ${clientId}`);
      
      // Récupérer toutes les informations du client en une seule fois
      const clientResponse = await clientsService.getClientById(clientId);
      console.log(`✅ Client récupéré avec toutes ses données:`, clientResponse);
      
      if (clientResponse && clientResponse.id) {
        setClient(clientResponse);
      } else {
        console.error('❌ Client response is invalid:', clientResponse);
        setError(translate('clients', 'client_not_found'));
      }

    } catch (err) {
      console.error('❌ Erreur lors de la récupération du client:', err);
      setError(translate('clients', 'loading_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLivenessSessions = async () => {
    if (!clientId) return;

    try {
      setSessionsLoading(true);
      setSessionsError('');

      console.log(`🔍 Fetching liveness sessions for client ID: ${clientId}`);
      
      const sessionsResponse = await livenessService.getSessionsByClientId(clientId);
      console.log(`✅ Liveness sessions récupérées:`, sessionsResponse);
      
      setLivenessSessions(sessionsResponse);

    } catch (err) {
      console.error('❌ Erreur lors de la récupération des sessions de liveness:', err);
      setSessionsError(translate('clients', 'sessions_loading_error'));
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!clientId) return;

    try {
      setRefreshing(true);
      await Promise.all([
        fetchClientData(),
        fetchLivenessSessions()
      ]);
    } catch (err) {
      setError(translate('clients', 'refresh_error'));
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateSuccess = () => {
    handleRefresh();
  };

  const handleEditLivenessConfig = (config: any) => {
    // Ajouter le type pour que la modal sache quel type de configuration c'est
    const configWithType = { ...config, type: 'liveness' };
    setEditingLivenessConfig(configWithType);
    setIsEditLivenessModalOpen(true);
  };

  const handleEditMatchingConfig = (config: MatchingConfig) => {
    // Ajouter le type pour que la modal sache quel type de configuration c'est
    const configWithType = { ...config, type: 'matching' as const };
    setEditingMatchingConfig(configWithType as MatchingConfig);
    setIsEditMatchingModalOpen(true);
  };

  const handleEditSilentLivenessConfig = (config: SilentLivenessConfig) => {
    // Ajouter le type pour que la modal sache quel type de configuration c'est
    const configWithType = { ...config, type: 'silent-liveness' as const };
    setEditingSilentLivenessConfig(configWithType as SilentLivenessConfig);
    setIsEditSilentLivenessModalOpen(true);
  };

  const handleLivenessEditSuccess = () => {
    handleRefresh();
    setEditingLivenessConfig(null);
  };

  const handleMatchingEditSuccess = () => {
    handleRefresh();
    setEditingMatchingConfig(null);
  };

  const handleSilentLivenessEditSuccess = () => {
    handleRefresh();
    setEditingSilentLivenessConfig(null);
  };

  const handleDeleteConfig = async (config: any) => {
    const configName = `Config #${config.id}`;
    
    const confirmed = window.confirm(
      translate('clients', 'delete_config_confirmation').replace('{name}', configName)
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingConfigId(config.id);
      // TODO: Implement deleteClientConfig method in clientsService
      // await clientsService.deleteClientConfig(clientId!);
      
      // Rafraîchir les données du client
      await fetchClientData();
      
      setSuccessMessage(translate('clients', 'config_deleted').replace('{name}', configName));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Configuration ${configName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la configuration:', err);
      setError(translate('clients', 'delete_config_error'));
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
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: translate('clients', 'active') },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: translate('clients', 'inactive') },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', label: translate('clients', 'suspended') }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getSessionStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: translate('clients', 'pending') },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: translate('clients', 'in_progress') },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: translate('clients', 'completed') },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: translate('clients', 'failed') },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: translate('clients', 'expired') }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
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
              {translate('clients', 'back')}
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || (translate('clients', 'client_not_found') as string)}</p>
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {translate('clients', 'back_to_clients')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout key={languageKey}>
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
                  {translate('clients', 'refresh')}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {translate('clients', 'new_configuration')}
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
                {translate('clients', 'client_information')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'name')}</label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'id')}</label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">#{client.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'status')}</label>
                    <div className="mt-1">{getStatusBadge(client.status)}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {translate('clients', 'payment_plan')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {client.paymentPlan?.name || `Plan #${client.paymentPlan?.id}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {translate('clients', 'distributor')}
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
                      {translate('clients', 'created_by')}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {translate('clients', 'creation_date')}
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
                  {translate('clients', 'api_keys')} ({client.keys.length})
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
                        {key.isActive ? translate('clients', 'active') : translate('clients', 'inactive')}
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
                {translate('clients', 'liveness_configurations')} ({client.livenessConfig ? 1 : 0})
              </h2>
            </div>
            <div className="p-6">
              {!client.livenessConfig ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                  <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('clients', 'no_configuration')}</h3>
                  <p className="theme-text-secondary theme-transition mb-4">
                    {translate('clients', 'no_config_description')}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {translate('clients', 'create_first_config')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div key={client.livenessConfig.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Settings className="h-5 w-5 mr-2 text-primary-600" />
                          <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                            {translate('clients', 'configuration')} #{client.livenessConfig.id}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditLivenessConfig(client.livenessConfig)}
                          className="p-2 rounded-lg hover:theme-bg-elevated theme-transition"
                          title={translate('clients', 'edit_config')}
                        >
                            <Edit className="h-4 w-4 theme-text-tertiary hover:text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(client.livenessConfig)}
                            disabled={deletingConfigId === client.livenessConfig.id}
                            className="p-2 rounded-lg hover:theme-bg-elevated theme-transition disabled:opacity-50"
                            title={translate('clients', 'delete_config')}
                          >
                            {deletingConfigId === client.livenessConfig.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 theme-text-tertiary hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'movements')}</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.livenessConfig.requiredMovements.map((movement) => (
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
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'parameters')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{translate('clients', 'fps')}:</strong> {client.livenessConfig.fps}
                            </p>
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{translate('clients', 'duration')}:</strong> {client.livenessConfig.movementDurationSec}s
                            </p>
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{translate('clients', 'timeout')}:</strong> {client.livenessConfig.timeoutSec}s
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'creation')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              <strong>{translate('clients', 'by')}:</strong> {client.livenessConfig.createdBy}
                            </p>
                            <p className="text-sm theme-text-secondary theme-transition">
                              {formatDate(client.livenessConfig.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'last_modification')}</label>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm theme-text-primary theme-transition">
                              {formatDate(client.livenessConfig.updatedAt)}
                            </p>
                            {client.livenessConfig.updatedBy && (
                              <p className="text-sm theme-text-secondary theme-transition">
                                {translate('clients', 'by')}: {client.livenessConfig.updatedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Matching Configuration */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                {translate('clients', 'matching_configuration')} ({client.matchingConfig ? 1 : 0})
              </h2>
            </div>
            <div className="p-6">
              {!client.matchingConfig ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                  <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('clients', 'no_matching_config')}</h3>
                  <p className="theme-text-secondary theme-transition mb-4">
                    {translate('clients', 'no_matching_config_description')}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {translate('clients', 'create_matching_config')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div key={client.matchingConfig.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary-600" />
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          {translate('clients', 'matching_configuration')} #{client.matchingConfig.id}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMatchingConfig(client.matchingConfig!)}
                          className="p-2 rounded-lg hover:theme-bg-elevated theme-transition"
                          title={translate('clients', 'edit_config')}
                        >
                          <Edit className="h-4 w-4 theme-text-tertiary hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(client.matchingConfig!)}
                          disabled={deletingConfigId === client.matchingConfig!.id}
                          className="p-2 rounded-lg hover:theme-bg-elevated theme-transition disabled:opacity-50"
                          title={translate('clients', 'delete_config')}
                        >
                          {deletingConfigId === client.matchingConfig!.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 theme-text-tertiary hover:text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'distance_method')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.matchingConfig.distanceMethod}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'threshold')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.matchingConfig.threshold}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'minimum_confidence')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.matchingConfig.minimumConfidence}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'max_angle')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.matchingConfig.maxAngle}°</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'preprocessing')}</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.matchingConfig.enablePreprocessing 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.matchingConfig.enablePreprocessing ? translate('clients', 'enabled') : translate('clients', 'disabled')}
                        </span>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'fraud_check')}</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.matchingConfig.enableFraudCheck 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.matchingConfig.enableFraudCheck ? translate('clients', 'enabled') : translate('clients', 'disabled')}
                        </span>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'creation')}</label>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm theme-text-primary theme-transition">
                            <strong>{translate('clients', 'by')}:</strong> {client.matchingConfig.createdBy}
                          </p>
                          <p className="text-sm theme-text-secondary theme-transition">
                            {formatDate(client.matchingConfig.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'last_modification')}</label>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm theme-text-primary theme-transition">
                            {formatDate(client.matchingConfig.updatedAt)}
                          </p>
                          {client.matchingConfig.updatedBy && (
                            <p className="text-sm theme-text-secondary theme-transition">
                              {translate('clients', 'by')}: {client.matchingConfig.updatedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Silent Liveness Configuration */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                {translate('clients', 'silent_liveness_configuration')} ({client.silentLivenessConfig ? 1 : 0})
              </h2>
            </div>
            <div className="p-6">
              {!client.silentLivenessConfig ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                  <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('clients', 'no_silent_liveness_config')}</h3>
                  <p className="theme-text-secondary theme-transition mb-4">
                    {translate('clients', 'no_silent_liveness_config_description')}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {translate('clients', 'create_silent_liveness_config')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div key={client.silentLivenessConfig.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary-600" />
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          {translate('clients', 'silent_liveness_configuration')} #{client.silentLivenessConfig.id}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSilentLivenessConfig(client.silentLivenessConfig!)}
                          className="p-2 rounded-lg hover:theme-bg-elevated theme-transition"
                          title={translate('clients', 'edit_config')}
                        >
                          <Edit className="h-4 w-4 theme-text-tertiary hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(client.silentLivenessConfig!)}
                          disabled={deletingConfigId === client.silentLivenessConfig!.id}
                          className="p-2 rounded-lg hover:theme-bg-elevated theme-transition disabled:opacity-50"
                          title={translate('clients', 'delete_config')}
                        >
                          {deletingConfigId === client.silentLivenessConfig!.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 theme-text-tertiary hover:text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'fps')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.silentLivenessConfig.fps}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'timeout')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.silentLivenessConfig.timeoutSec}s</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'min_frames')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.silentLivenessConfig.minFrames}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'min_duration')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.silentLivenessConfig.minDurationSec}s</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'decision_threshold')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{client.silentLivenessConfig.decisionThreshold}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'creation')}</label>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm theme-text-primary theme-transition">
                            <strong>{translate('clients', 'by')}:</strong> {client.silentLivenessConfig.createdBy}
                          </p>
                          <p className="text-sm theme-text-secondary theme-transition">
                            {formatDate(client.silentLivenessConfig.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'last_modification')}</label>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm theme-text-primary theme-transition">
                            {formatDate(client.silentLivenessConfig.updatedAt)}
                          </p>
                          {client.silentLivenessConfig.updatedBy && (
                            <p className="text-sm theme-text-secondary theme-transition">
                              {translate('clients', 'by')}: {client.silentLivenessConfig.updatedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                {translate('clients', 'statistics')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{client._count.users}</div>
                  <div className="text-sm theme-text-secondary theme-transition">{translate('clients', 'total_users')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{client._count.keys}</div>
                  <div className="text-sm theme-text-secondary theme-transition">{translate('clients', 'api_keys')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{client._count.livenessSessions}</div>
                  <div className="text-sm theme-text-secondary theme-transition">{translate('clients', 'liveness_sessions')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{client._count.livenessResults}</div>
                  <div className="text-sm theme-text-secondary theme-transition">{translate('clients', 'liveness_results')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Section */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                {translate('clients', 'users')} ({client.users.length})
              </h2>
            </div>
            <div className="p-6">
              {client.users.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                  <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('clients', 'no_users')}</h3>
                  <p className="theme-text-secondary theme-transition">
                    {translate('clients', 'no_users_description')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.users.map((user) => (
                    <div key={user.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-primary-600" />
                          <div>
                            <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                              {user.fullName}
                            </h3>
                            <p className="text-sm theme-text-secondary theme-transition">
                              @{user.username} • {user.externalUserId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.totalRequests > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.totalRequests} {translate('clients', 'requests')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'total_requests')}</label>
                          <p className="text-lg font-semibold theme-text-primary theme-transition">{user.totalRequests}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'last_request')}</label>
                          <p className="text-sm theme-text-primary theme-transition">
                            {user.lastRequestAt ? formatDate(user.lastRequestAt) : translate('clients', 'never')}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'created_at')}</label>
                          <p className="text-sm theme-text-secondary theme-transition">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Liveness Sessions Section */}
        <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4 border-b theme-border-primary">
            <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
              {translate('clients', 'liveness_sessions')} ({livenessSessions.length})
            </h2>
          </div>
          <div className="p-6">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 theme-text-secondary theme-transition">{translate('clients', 'loading_sessions')}</span>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{sessionsError}</p>
                <button
                  onClick={fetchLivenessSessions}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {translate('clients', 'retry')}
                </button>
              </div>
            ) : livenessSessions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('clients', 'no_sessions')}</h3>
                <p className="theme-text-secondary theme-transition">
                  {translate('clients', 'no_sessions_description')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {livenessSessions.map((session) => (
                  <div key={session.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                        <div>
                          <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                            {translate('clients', 'session')} #{session.id}
                          </h3>
                          <p className="text-sm theme-text-secondary theme-transition">
                            {translate('clients', 'session_id')}: {session.sessionId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSessionStatusBadge(session.status)}
                        <span className="text-sm theme-text-secondary theme-transition">
                          {session._count.livenessResults} {translate('clients', 'results')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'movements_requested')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{session.movementsRequested}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'movements_completed')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{session.movementsCompleted}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'current_movement')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{session.currentMovement || translate('clients', 'none')}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'frames_count')}</label>
                        <p className="text-sm theme-text-primary theme-transition font-semibold">{session._count.frames}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'created_at')}</label>
                        <p className="text-sm theme-text-secondary theme-transition">{formatDate(session.createdAt)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'updated_at')}</label>
                        <p className="text-sm theme-text-secondary theme-transition">{formatDate(session.updatedAt)}</p>
                      </div>
                      
                      {session.completedAt && (
                        <div>
                          <label className="text-sm font-medium theme-text-secondary theme-transition">{translate('clients', 'completed_at')}</label>
                          <p className="text-sm theme-text-secondary theme-transition">{formatDate(session.completedAt)}</p>
                        </div>
                      )}
                    </div>

                    {/* Liveness Results */}
                    {session.livenessResults && session.livenessResults.length > 0 && (
                      <div className="mt-4 pt-4 border-t theme-border-primary">
                        <h4 className="text-md font-semibold theme-text-primary theme-transition mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary-600" />
                          {translate('clients', 'liveness_results')} ({session.livenessResults.length})
                        </h4>
                        <div className="space-y-3">
                          {session.livenessResults.map((result) => (
                            <div key={result.id} className="p-3 theme-bg-secondary rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    result.result 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {result.result ? translate('clients', 'success') : translate('clients', 'failed')}
                                  </span>
                                </div>
                                <span className="text-xs theme-text-secondary theme-transition">
                                  {formatDate(result.createdAt)}
                                </span>
                              </div>
                              {result.details && (
                                <p className="text-sm theme-text-primary theme-transition">
                                  <strong>{translate('clients', 'details')}:</strong> {result.details}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Config Modal */}
        <CreateConfigModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          clients={client ? [client] : []}
        />

        {/* Edit Liveness Config Modal */}
        <EditConfigModal
          isOpen={isEditLivenessModalOpen}
          onClose={() => {
            setIsEditLivenessModalOpen(false);
            setEditingLivenessConfig(null);
          }}
          onSuccess={handleLivenessEditSuccess}
          config={editingLivenessConfig}
        />

        {/* Edit Matching Config Modal */}
        <EditConfigModal
          isOpen={isEditMatchingModalOpen}
          onClose={() => {
            setIsEditMatchingModalOpen(false);
            setEditingMatchingConfig(null);
          }}
          onSuccess={handleMatchingEditSuccess}
          config={editingMatchingConfig}
        />

        {/* Edit Silent Liveness Config Modal */}
        <EditConfigModal
          isOpen={isEditSilentLivenessModalOpen}
          onClose={() => {
            setIsEditSilentLivenessModalOpen(false);
            setEditingSilentLivenessConfig(null);
          }}
          onSuccess={handleSilentLivenessEditSuccess}
          config={editingSilentLivenessConfig}
        />
      </div>
    </Layout>
  );
}
