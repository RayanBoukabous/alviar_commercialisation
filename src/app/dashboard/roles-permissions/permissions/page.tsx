'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Key,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { PermissionsService } from '@/lib/api/permissionsService';
import { Permission } from '@/types';
import { CreatePermissionModal } from '@/components/forms/CreatePermissionModal';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function PermissionsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const { t } = useTranslation('permissions');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingPermissionId, setDeletingPermissionId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍', t('loadingPermissions'));
        const permissionsData = await PermissionsService.getAllPermissions();
        setPermissions(permissionsData);
        console.log('✅', t('permissionsLoaded'), permissionsData);
        
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        setError(`${t('errorLoadingPermissions')} ${err.message || 'Erreur inconnue'}`);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPermissions();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      console.log('🔄', t('refreshingPermissions'));
      const permissionsData = await PermissionsService.getAllPermissions();
      setPermissions(permissionsData);
      console.log('✅', t('permissionsRefreshed'), permissionsData);
      
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`${t('errorRefreshingPermissions')} ${err.message || 'Erreur inconnue'}`);
      setPermissions([]);
    } finally {
      setRefreshing(false);
    }
  };


  const handleDeletePermission = async (permissionId: number, permissionName: string) => {
    // Confirmation avant suppression avec plus de détails
    const confirmed = window.confirm(
      `${t('deleteConfirmation')} "${permissionName}"\n\n` +
      `${t('deleteConfirmationMessage')}\n` +
      t('deleteConfirmationDetails', { permissionName, permissionId }) + `\n\n` +
      t('deleteConfirmationQuestion')
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPermissionId(permissionId);
      setError('');
      
      console.log(`🔍`, t('deletingPermission', { permissionName, permissionId }));
      await PermissionsService.deletePermission(permissionId);
      
      // Supprimer la permission de la liste locale
      setPermissions(prevPermissions => prevPermissions.filter(permission => permission.id !== permissionId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(`✅ ${t('permissionDeletedSuccess', { permissionName })}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      console.log(`✅`, t('permissionDeletedSuccess', { permissionName }));
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression de la permission:', err);
      setError(`❌ ${t('errorDeletingPermission', { permissionName })} ${err.message || 'Erreur inconnue'}`);
    } finally {
      setDeletingPermissionId(null);
    }
  };

  const handleCreatePermissionSuccess = async () => {
    // Rafraîchir la liste des permissions après création
    try {
      setError('');
      const permissionsData = await PermissionsService.getAllPermissions();
      setPermissions(permissionsData);
      setSuccessMessage(`✅ ${t('permissionCreated')}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement après création:', err);
      setError(`Erreur lors du rafraîchissement: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getPermissionAction = (permissionName: string) => {
    return permissionName.split(':')[0];
  };

  const getPermissionCategory = (permissionName: string) => {
    return permissionName.split(':')[1] || 'other';
  };

  const getActionBadge = (action: string) => {
    const badgeConfig = {
      manage: { 
        bg: 'bg-slate-600 dark:bg-slate-500', 
        text: 'text-white', 
        label: t('actionLabels.manage')
      },
      read: { 
        bg: 'bg-emerald-600 dark:bg-emerald-500', 
        text: 'text-white', 
        label: t('actionLabels.read')
      },
      create: { 
        bg: 'bg-blue-600 dark:bg-blue-500', 
        text: 'text-white', 
        label: t('actionLabels.create')
      },
      update: { 
        bg: 'bg-amber-600 dark:bg-amber-500', 
        text: 'text-white', 
        label: t('actionLabels.update')
      },
      delete: { 
        bg: 'bg-red-600 dark:bg-red-500', 
        text: 'text-white', 
        label: t('actionLabels.delete')
      },
    };

    const config = badgeConfig[action as keyof typeof badgeConfig] || badgeConfig.read;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-sm`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  <Key className="h-7 w-7 mr-3 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">{t('pageDescription')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {t('refresh')}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newPermission')}
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
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
              <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
                <Filter className="h-4 w-4 mr-2" />
                {t('filters')}
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

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-5 w-5 text-red-500 mr-3">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-6 py-6">
          <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        {t('permission')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        {t('action')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        {t('category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        {t('id')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredPermissions.map((permission) => {
                      const action = getPermissionAction(permission.name);
                      const category = getPermissionCategory(permission.name);
                      
                      return (
                        <tr key={permission.id} className="transition-colors hover:theme-bg-secondary">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Key className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium theme-text-primary theme-transition">{permission.name}</div>
                                <div className="text-sm theme-text-secondary theme-transition">{t('systemPermission')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getActionBadge(action)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm theme-text-primary theme-transition capitalize">
                              {category.replace(/-/g, ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm theme-text-secondary theme-transition">
                              #{permission.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleDeletePermission(permission.id, permission.name)}
                                disabled={deletingPermissionId === permission.id}
                                className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title={`${t('deletePermission')} "${permission.name}"`}
                              >
                                {deletingPermissionId === permission.id ? (
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredPermissions.length === 0 && !loading && (
              <div className="text-center py-12">
                <Key className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('noPermissionsFound')}</h3>
                <p className="theme-text-secondary theme-transition">{t('noPermissionsDescription')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Permission Modal */}
        <CreatePermissionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreatePermissionSuccess}
        />
      </div>
    </Layout>
  );
}