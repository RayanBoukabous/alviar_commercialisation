'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Key,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { PermissionsService } from '@/lib/api/permissionsService';
import { Permission } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useAuth';

export default function PermissionDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const permissionId = parseInt(params.id as string);

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchPermission = async () => {
      if (!permissionId || isNaN(permissionId)) {
        setError('ID de permission invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log(`🔍 Chargement de la permission ${permissionId} depuis l'API...`);
        const permissionData = await PermissionsService.getPermissionById(permissionId.toString());
        setPermission(permissionData);
        console.log('✅ Permission chargée:', permissionData);
        
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        setError(`Erreur lors du chargement de la permission: ${err.message || 'Erreur inconnue'}`);
        setPermission(null);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPermission();
    }
  }, [isAuthenticated, permissionId]);

  const handleRefresh = async () => {
    if (!permissionId || isNaN(permissionId)) return;

    try {
      setRefreshing(true);
      setError('');
      
      console.log(`🔄 Rafraîchissement de la permission ${permissionId}...`);
      const permissionData = await PermissionsService.getPermissionById(permissionId.toString());
      setPermission(permissionData);
      console.log('✅ Permission rafraîchie:', permissionData);
      
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`Erreur lors du rafraîchissement de la permission: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditPermission = () => {
    // TODO: Implémenter l'édition
    console.log('Éditer permission:', permission);
  };

  const handleDeletePermission = async () => {
    if (!permission) return;

    const confirmed = window.confirm(
      `⚠️ ATTENTION - Suppression de la permission "${permission.name}"\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera :\n` +
      `• La permission "${permission.name}" (ID: ${permission.id})\n` +
      `• Cette permission de tous les rôles qui l'utilisent\n\n` +
      `Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      console.log(`🔍 Suppression de la permission ${permission.name} (ID: ${permission.id})...`);
      await PermissionsService.deletePermission(permission.id);
      
      console.log(`✅ Permission ${permission.name} supprimée avec succès`);
      
      // Rediriger vers la liste des permissions
      router.push('/dashboard/roles-permissions/permissions');
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression de la permission:', err);
      setError(`❌ Erreur lors de la suppression de la permission "${permission.name}": ${err.message || 'Erreur inconnue'}`);
    }
  };

  const getPermissionAction = (permissionName: string) => {
    return permissionName.split(':')[0];
  };

  const getPermissionCategory = (permissionName: string) => {
    return permissionName.split(':')[1] || 'other';
  };

  const getActionBadge = (action: string) => {
    const badgeConfig = {
      manage: { 
        bg: 'bg-blue-500 dark:bg-blue-600', 
        text: 'text-white', 
        label: 'Gérer'
      },
      read: { 
        bg: 'bg-green-500 dark:bg-green-600', 
        text: 'text-white', 
        label: 'Lire'
      },
      create: { 
        bg: 'bg-purple-500 dark:bg-purple-600', 
        text: 'text-white', 
        label: 'Créer'
      },
      update: { 
        bg: 'bg-orange-500 dark:bg-orange-600', 
        text: 'text-white', 
        label: 'Modifier'
      },
      delete: { 
        bg: 'bg-red-500 dark:bg-red-600', 
        text: 'text-white', 
        label: 'Supprimer'
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

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Erreur</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/dashboard/roles-permissions/permissions')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retour à la liste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!permission) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <Key className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary">Permission non trouvée</h3>
                <p className="theme-text-secondary">La permission demandée n'existe pas ou a été supprimée.</p>
                <button
                  onClick={() => router.push('/dashboard/roles-permissions/permissions')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const action = getPermissionAction(permission.name);
  const category = getPermissionCategory(permission.name);

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition">
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard/roles-permissions/permissions')}
                  className="p-2 rounded-lg theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Key className="h-7 w-7 mr-3 text-blue-600" />
                    {permission.name}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">Détails de la permission</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </button>
                <button 
                  onClick={handleEditPermission}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                <button 
                  onClick={handleDeletePermission}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">ID Permission</p>
                    <p className="text-2xl font-bold theme-text-primary theme-transition">#{permission.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">Action</p>
                    <div className="mt-1">
                      {getActionBadge(action)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">Catégorie</p>
                    <p className="text-lg font-bold theme-text-primary theme-transition capitalize">
                      {category.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de la permission */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  Informations de la Permission
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                      Nom complet
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border theme-border-primary">
                      <code className="text-sm theme-text-primary theme-transition font-mono">
                        {permission.name}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                      ID unique
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border theme-border-primary">
                      <span className="text-sm theme-text-primary theme-transition font-mono">
                        {permission.id}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                      Type d'action
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border theme-border-primary">
                      {getActionBadge(action)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                      Ressource concernée
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border theme-border-primary">
                      <span className="text-sm theme-text-primary theme-transition capitalize">
                        {category.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Description
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Permission système</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Cette permission fait partie du système de sécurité et contrôle l'accès aux fonctionnalités. 
                        Elle est utilisée par les rôles pour définir les autorisations des utilisateurs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
