'use client';

import React, { useState } from 'react';
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
  RefreshCw,
  Users,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Client } from '@/lib/api/clientsService';
import { useClients, useClientStats, useDeleteClient } from '@/lib/hooks/useClients';
import { Layout } from '@/components/layout/Layout';
import { CreateClientModal } from '@/components/forms/CreateClientModal';
import { EditClientModal } from '@/components/forms/EditClientModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Pagination from '@/components/ui/Pagination';

export default function ClientsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  const router = useRouter();
  
  // États pour les filtres et pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [wilayaFilter, setWilayaFilter] = useState<string>('ALL');
  const [communeFilter, setCommuneFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // États pour les modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Paramètres de filtrage
  const filters = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    type_client: typeFilter !== 'ALL' ? typeFilter : undefined,
    wilaya: wilayaFilter !== 'ALL' ? wilayaFilter : undefined,
    commune: communeFilter !== 'ALL' ? communeFilter : undefined,
  };
  
  // Hooks pour les données
  const { data: clientsData, isLoading: loadingClients, error: clientsError, refetch } = useClients(filters);
  const { data: statsData, isLoading: loadingStats } = useClientStats();
  const deleteClientMutation = useDeleteClient();


  // Handlers
  const handleRefresh = () => {
    refetch();
  };

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingClient(null);
    setIsEditModalOpen(false);
  };

  const handleViewClient = (client: Client) => {
    router.push(`/dashboard/clients/${client.id}`);
  };

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`
    );

    if (!confirmed) return;

    try {
      await deleteClientMutation.mutateAsync(clientId);
      setSuccessMessage(`Client "${clientName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression du client:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PARTICULIER: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', label: 'Particulier' },
      SUPERGROSSISTE: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200', label: 'Supergrossiste' },
      GROSSISTE: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', label: 'Grossiste' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PARTICULIER;
    
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

  // Données extraites
  const clients = clientsData?.clients || [];
  const totalClients = clientsData?.total || 0;
  const totalPages = Math.ceil(totalClients / pageSize);
  const stats = statsData || { total_clients: 0, par_type: {}, par_wilaya: {}, par_commune: {} };

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
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                <Building2 className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {isRTL ? 'العملاء' : 'Clients'}
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">
                {isRTL ? 'إدارة العملاء والمعلومات' : 'Gestion des clients et informations'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={loadingClients}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loadingClients ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Actualiser'}
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة عميل' : 'Nouveau client'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total clients */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium theme-text-secondary theme-transition">
                  {isRTL ? 'إجمالي العملاء' : 'Total clients'}
                </p>
                <p className="text-2xl font-bold theme-text-primary theme-transition">
                  {loadingStats ? '...' : stats.total_clients}
                </p>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-900/30 rounded-full">
                <Users className="h-6 w-6 text-blue-900 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Particuliers */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium theme-text-secondary theme-transition">
                  {isRTL ? 'أفراد' : 'Particuliers'}
                </p>
                <p className="text-2xl font-bold theme-text-primary theme-transition">
                  {loadingStats ? '...' : stats.par_type.PARTICULIER || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-900/30 rounded-full">
                <User className="h-6 w-6 text-blue-900 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Grossistes */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium theme-text-secondary theme-transition">
                  {isRTL ? 'تجار جملة' : 'Grossistes'}
                </p>
                <p className="text-2xl font-bold theme-text-primary theme-transition">
                  {loadingStats ? '...' : (stats.par_type.GROSSISTE || 0) + (stats.par_type.SUPERGROSSISTE || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-200 dark:bg-orange-900/30 rounded-full">
                <Building2 className="h-6 w-6 text-orange-900 dark:text-orange-300" />
              </div>
            </div>
          </div>

          {/* Wilayas */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium theme-text-secondary theme-transition">
                  {isRTL ? 'ولايات' : 'Wilayas'}
                </p>
                <p className="text-2xl font-bold theme-text-primary theme-transition">
                  {loadingStats ? '...' : Object.keys(stats.par_wilaya).length}
                </p>
              </div>
              <div className="p-3 bg-green-200 dark:bg-green-900/30 rounded-full">
                <MapPin className="h-6 w-6 text-green-900 dark:text-green-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
              <input
                type="text"
                placeholder={isRTL ? 'البحث في العملاء...' : 'Rechercher un client...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
              <option value="PARTICULIER">{isRTL ? 'أفراد' : 'Particuliers'}</option>
              <option value="GROSSISTE">{isRTL ? 'تجار جملة' : 'Grossistes'}</option>
              <option value="SUPERGROSSISTE">{isRTL ? 'تجار جملة كبار' : 'Supergrossistes'}</option>
            </select>
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">{isRTL ? 'جميع الولايات' : 'Toutes les wilayas'}</option>
              {Object.keys(stats.par_wilaya).map(wilaya => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
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
          {loadingClients ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : clientsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">Erreur lors du chargement des clients</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y theme-border-secondary theme-transition">
                <thead className="theme-bg-secondary theme-transition">
                  <tr>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'العميل' : 'Client'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'النوع' : 'Type'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الهاتف' : 'Téléphone'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الولاية' : 'Wilaya'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition ${isRTL ? 'text-left' : 'text-right'}`}>
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {clients.map((client) => (
                    <tr key={client.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className={isRTL ? 'mr-4' : 'ml-4'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{client.nom}</div>
                            <div className="text-sm theme-text-secondary theme-transition">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(client.type_client)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm theme-text-primary theme-transition">
                          <Phone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
                          {client.telephone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                        {client.wilaya || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {formatDate(client.created_at)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                          <button 
                            onClick={() => handleViewClient(client)}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title={isRTL ? 'تعديل العميل' : 'Modifier le client'}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id, client.nom)}
                            disabled={deleteClientMutation.isPending}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                            title={isRTL ? 'حذف العميل' : 'Supprimer le client'}
                          >
                            {deleteClientMutation.isPending ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {clients.length === 0 && !loadingClients && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                {isRTL ? 'لم يتم العثور على عملاء' : 'Aucun client trouvé'}
              </h3>
              <p className="theme-text-secondary theme-transition">
                {isRTL ? 'ابدأ بإضافة عملاء جدد' : 'Commencez par ajouter de nouveaux clients'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalClients}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
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
