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
  Building2,
  Calendar,
  User,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { clientsService, Client } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { CreateClientModal } from '@/components/forms/CreateClientModal';
import { EditClientModal } from '@/components/forms/EditClientModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface Client est maintenant importée depuis @/lib/api

export default function ClientsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading } = useLanguage();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');


  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        // Force refresh pour éviter le cache 304
        const response = await clientsService.getAllClients(true);
        setClients(response.clients || []);
        console.log('Clients récupérés:', response);
      } catch (err) {
        setError(t('clients', 'loading_error') as string);
        console.error('Erreur:', err);
        // En cas d'erreur, utiliser les données mock pour le développement
        // setClients(mockClients);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await clientsService.getAllClients(true);
      setClients(response.clients || []);
      console.log('Clients rafraîchis:', response);
    } catch (err) {
      setError(t('clients', 'refresh_error') as string);
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateSuccess = () => {
    // Rafraîchir la liste des clients après création
    handleRefresh();
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir la liste des clients après modification
    handleRefresh();
    setEditingClient(null);
  };

  const handleViewClient = (client: Client) => {
    router.push(`/dashboard/clients/${client.id}`);
  };

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      (t('clients', 'delete_confirmation') as string).replace('{name}', clientName)
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingClientId(clientId);
      await clientsService.deleteClient(clientId);
      
      // Supprimer le client de la liste locale
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage((t('clients', 'client_deleted') as string).replace('{name}', clientName));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Client ${clientName} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression du client:', err);
      setError(t('clients', 'delete_error') as string);
    } finally {
      setDeletingClientId(null);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: t('clients', 'active') as string },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('clients', 'inactive') as string },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', label: t('clients', 'suspended') as string }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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

  if (isLoading || translationLoading) {
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
                <Building2 className="h-7 w-7 mr-3 text-primary-600" />
                {t('clients', 'title')}
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">{t('clients', 'subtitle')}</p>
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
                {t('clients', 'new_client')}
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
                placeholder={t('clients', 'search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">{t('clients', 'all_statuses')}</option>
              <option value="ACTIVE">{t('clients', 'active')}</option>
              <option value="INACTIVE">{t('clients', 'inactive')}</option>
              <option value="SUSPENDED">{t('clients', 'suspended')}</option>
            </select>
            <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
              <Filter className="h-4 w-4 mr-2" />
              {t('clients', 'filters')}
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
                      {t('clients', 'client')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'payment_plan')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'distributor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'created_by')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'creation_date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('clients', 'actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium theme-text-primary theme-transition">{client.name}</div>
                            <div className="text-sm theme-text-secondary theme-transition">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(client.status)}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                         {client.paymentPlan?.name || `Plan #${client.paymentPlan?.id}`}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                         {client.distributor?.name || `Distributeur #${client.distributor?.id}`}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                        {client.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewClient(client)}
                            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                            title={t('clients', 'view_details')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                            title={t('clients', 'edit_client')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            disabled={deletingClientId === client.id}
                            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                            title={t('clients', 'delete_client')}
                          >
                            {deletingClientId === client.id ? (
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
          
          {filteredClients.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('clients', 'no_clients_found')}</h3>
              <p className="theme-text-secondary theme-transition">{t('clients', 'start_adding')}</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}
        onSuccess={handleEditSuccess}
        client={editingClient}
      />
    </Layout>
  );
}
