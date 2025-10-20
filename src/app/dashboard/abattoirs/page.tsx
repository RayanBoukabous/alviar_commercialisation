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
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAbattoirs, useDeleteAbattoir, abattoirKeys } from '@/lib/hooks/useAbattoirs';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { Abattoir as ApiAbattoir } from '@/lib/api/abattoirService';

// Fonction pour mapper les données API vers le format de l'interface
const mapApiAbattoirToTableFormat = (apiAbattoir: ApiAbattoir) => {
  return {
    id: apiAbattoir.id,
    name: apiAbattoir.nom,
    wilaya: apiAbattoir.wilaya,
    commune: apiAbattoir.commune,
    address: apiAbattoir.adresse_complete,
    capacity: apiAbattoir.capacite_totale_reception,
    currentStock: apiAbattoir.betes_count, // Utiliser le vrai nombre de bêtes assignées
    status: apiAbattoir.actif ? 'ACTIVE' : 'INACTIVE',
    manager: apiAbattoir.responsable_nom || 'Non assigné',
    phone: apiAbattoir.responsable_email || 'Non disponible',
    email: apiAbattoir.responsable_email || 'Non disponible',
    createdAt: apiAbattoir.created_at,
    lastActivity: apiAbattoir.updated_at
  };
};

export default function AbattoirsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [wilayaFilter, setWilayaFilter] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Debounce pour la recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Préparer les filtres pour l'API
  const filters: any = {
    page_size: 100
  };

  if (debouncedSearchTerm) {
    filters.search = debouncedSearchTerm;
  }
  if (statusFilter !== 'ALL') {
    filters.actif = statusFilter === 'ACTIVE';
  }
  if (wilayaFilter !== 'ALL') {
    filters.wilaya = wilayaFilter;
  }

  // Hooks pour les données
  const { data: abattoirsData, isLoading: loading, error, refetch } = useAbattoirs(filters);
  const deleteAbattoirMutation = useDeleteAbattoir();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: abattoirKeys.all });
  };

  const handleViewAbattoir = (abattoir: any) => {
    router.push(`/dashboard/abattoirs/${abattoir.id}`);
  };

  const handleEditAbattoir = (abattoir: any) => {
    // TODO: Implémenter la modification
    console.log('Modifier abattoir:', abattoir);
  };

  const handleDeleteAbattoir = async (abattoirId: number, abattoirName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'abattoir "${abattoirName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAbattoirMutation.mutateAsync(abattoirId);
      setSuccessMessage(`Abattoir "${abattoirName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'abattoir:', err);
    }
  };

  // Mapper les données API vers le format de l'interface
  const abattoirs = abattoirsData?.abattoirs?.map(mapApiAbattoirToTableFormat) || [];
  
  // Les filtres sont maintenant gérés côté serveur, donc pas besoin de filtrage côté client
  const filteredAbattoirs = abattoirs;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
      MAINTENANCE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' }
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

  const getWilayas = () => {
    const wilayas = [...new Set(abattoirs.map(abattoir => abattoir.wilaya))];
    return wilayas.sort();
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
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Building2 className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'المجازر' : 'Abattoirs'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة المجازر والمواشي' : 'Gestion des abattoirs et du bétail'}
                </p>
                {abattoirsData && (
                  <div className="mt-2 flex items-center text-sm">
                    <span className="theme-text-tertiary">
                      {abattoirsData.user_type === 'superuser' 
                        ? (isRTL ? 'عرض جميع المجازر' : 'Vue globale - Tous les abattoirs')
                        : (isRTL ? `عرض مجزر: ${abattoirsData.abattoir_name}` : `Vue abattoir: ${abattoirsData.abattoir_name}`)
                      }
                    </span>
                    <span className="mx-2 theme-text-tertiary">•</span>
                    <span className="theme-text-tertiary">
                      {abattoirsData.statistics?.total_count || 0} {isRTL ? 'مجزر' : 'abattoir(s)'}
                    </span>
                  </div>
                )}
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => console.log('Nouvel abattoir')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة مجزر' : 'Nouvel abattoir'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في المجازر...' : 'Rechercher un abattoir...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="ACTIVE">{isRTL ? 'نشط' : 'Actif'}</option>
                <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactif'}</option>
                <option value="MAINTENANCE">{isRTL ? 'صيانة' : 'Maintenance'}</option>
              </select>
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الولايات' : 'Toutes les wilayas'}</option>
                {getWilayas().map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصفية' : 'Filtres'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`h-5 w-5 text-green-500 ${isRTL ? 'ml-3' : 'mr-3'}`}>
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
                <p className="text-red-600">{error.message || 'Erreur lors du chargement des abattoirs'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y theme-border-secondary theme-transition">
                  <thead className="theme-bg-secondary theme-transition">
                    <tr>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المجزر' : 'Abattoir'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الموقع' : 'Localisation'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'السعة' : 'Capacité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الرئيس' : 'Responsable'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'آخر نشاط' : 'Dernière activité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredAbattoirs.map((abattoir) => (
                      <tr key={abattoir.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.name}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {abattoir.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.wilaya}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{abattoir.commune}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {abattoir.currentStock} / {abattoir.capacity}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {isRTL ? 'بقر / سعة' : 'bêtes / capacité'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.manager}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{abattoir.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(abattoir.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(abattoir.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewAbattoir(abattoir)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAbattoir(abattoir)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل المجزر' : 'Modifier l\'abattoir'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAbattoir(abattoir.id, abattoir.name)}
                              disabled={deleteAbattoirMutation.isPending}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف المجزر' : 'Supprimer l\'abattoir'}
                            >
                              {deleteAbattoirMutation.isPending ? (
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
            
            {filteredAbattoirs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على مجازر' : 'Aucun abattoir trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة مجازر جديدة' : 'Commencez par ajouter de nouveaux abattoirs'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

