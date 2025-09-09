'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Shield,
  Users,
  Key,
  Settings,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { RolesService } from '@/lib/api/rolesService';
import { Role } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { EditRoleModal } from '@/components/forms/EditRoleModal';

export default function RoleDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const roleId = parseInt(params.id as string);

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId || isNaN(roleId)) {
        setError('ID de rôle invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log(`🔍 Chargement du rôle ${roleId} depuis l'API...`);
        const roleData = await RolesService.getRoleById(roleId);
        setRole(roleData);
        console.log('✅ Rôle chargé:', roleData);
        
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        setError(`Erreur lors du chargement du rôle: ${err.message || 'Erreur inconnue'}`);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRole();
    }
  }, [isAuthenticated, roleId]);

  const handleRefresh = async () => {
    if (!roleId || isNaN(roleId)) return;

    try {
      setRefreshing(true);
      setError('');
      
      console.log(`🔄 Rafraîchissement du rôle ${roleId}...`);
      const roleData = await RolesService.getRoleById(roleId);
      setRole(roleData);
      console.log('✅ Rôle rafraîchi:', roleData);
      
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`Erreur lors du rafraîchissement du rôle: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditRole = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedRole: Role) => {
    setRole(updatedRole);
    setIsEditModalOpen(false);
  };

  const handleDeleteRole = async () => {
    if (!role) return;

    const confirmed = window.confirm(
      `⚠️ ATTENTION - Suppression du rôle "${role.name}"\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera :\n` +
      `• Le rôle "${role.name}" (ID: ${role.id})\n` +
      `• Toutes les permissions associées (${role.permissions?.length || 0} permissions)\n` +
      `• L'accès de tous les utilisateurs ayant ce rôle (${role.admins?.length || 0} administrateurs)\n\n` +
      `Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      console.log(`🔍 Suppression du rôle ${role.name} (ID: ${role.id})...`);
      await RolesService.deleteRole(role.id);
      
      console.log(`✅ Rôle ${role.name} supprimé avec succès`);
      
      // Rediriger vers la liste des rôles
      router.push('/dashboard/roles-permissions/roles');
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression du rôle:', err);
      setError(`❌ Erreur lors de la suppression du rôle "${role.name}": ${err.message || 'Erreur inconnue'}`);
    }
  };

  const groupPermissionsByCategory = (permissions: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    if (!permissions || permissions.length === 0) {
      return grouped;
    }
    
    permissions.forEach(perm => {
      const category = perm.permission.name.split(':')[1] || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(perm);
    });
    
    return grouped;
  };

  const getPermissionIcon = (permissionName: string) => {
    if (permissionName.includes('manage') || permissionName.includes('create') || permissionName.includes('update')) {
      return <Settings className="h-4 w-4 text-blue-500" />;
    } else if (permissionName.includes('read')) {
      return <Eye className="h-4 w-4 text-green-500" />;
    } else if (permissionName.includes('delete')) {
      return <Trash2 className="h-4 w-4 text-red-500" />;
    }
    return <Key className="h-4 w-4 text-gray-500" />;
  };

  const getPermissionBadge = (permissionName: string) => {
    const action = permissionName.split(':')[0];
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
                    onClick={() => router.push('/dashboard/roles-permissions/roles')}
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

  if (!role) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary">Rôle non trouvé</h3>
                <p className="theme-text-secondary">Le rôle demandé n'existe pas ou a été supprimé.</p>
                <button
                  onClick={() => router.push('/dashboard/roles-permissions/roles')}
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

  const groupedPermissions = groupPermissionsByCategory(role.permissions || []);

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition">
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard/roles-permissions/roles')}
                  className="p-2 rounded-lg theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Shield className="h-7 w-7 mr-3 text-blue-600" />
                    {role.name}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">Détails du rôle et permissions</p>
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
                  onClick={handleEditRole}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                <button 
                  onClick={handleDeleteRole}
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
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">Permissions</p>
                    <p className="text-2xl font-bold theme-text-primary theme-transition">{role.permissions?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">Administrateurs</p>
                    <p className="text-2xl font-bold theme-text-primary theme-transition">{role.admins?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg p-6 shadow-sm border theme-border-primary theme-transition">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium theme-text-tertiary theme-transition">ID du rôle</p>
                    <p className="text-2xl font-bold theme-text-primary theme-transition">#{role.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrateurs */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Administrateurs ({role.admins?.length || 0})
                </h2>
              </div>
              <div className="p-6">
                {role.admins && role.admins.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {role.admins.map((admin) => (
                      <div key={admin.id} className="p-4 border rounded-lg theme-border-primary theme-bg-secondary theme-transition">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {admin.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium theme-text-primary theme-transition">{admin.username}</p>
                            <p className="text-sm theme-text-secondary theme-transition">{admin.email}</p>
                            <p className="text-xs theme-text-tertiary theme-transition">ID: {admin.id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                    <p className="theme-text-secondary theme-transition">Aucun administrateur assigné à ce rôle</p>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
              <div className="px-6 py-4 border-b theme-border-primary">
                <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  Permissions ({role.permissions?.length || 0})
                </h2>
              </div>
              <div className="p-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-md font-medium theme-text-primary theme-transition mb-3 capitalize">
                      {category.replace(/-/g, ' ')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((perm) => (
                        <div key={perm.permission.id} className="flex items-center justify-between p-3 border rounded-lg theme-border-primary theme-bg-secondary theme-transition">
                          <div className="flex items-center space-x-3">
                            {getPermissionIcon(perm.permission.name)}
                            <span className="text-sm theme-text-primary theme-transition font-medium">
                              {perm.permission.name}
                            </span>
                          </div>
                          {getPermissionBadge(perm.permission.name)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        role={role}
        onSuccess={handleEditSuccess}
      />
    </Layout>
  );
}
