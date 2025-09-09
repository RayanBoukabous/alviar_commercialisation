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
  Shield,
  Calendar,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { RolesService } from '@/lib/api/rolesService';
import { Role } from '@/types';
import { EditRoleModal } from '@/components/forms/EditRoleModal';
import { CreateRoleModal } from '@/components/forms/CreateRoleModal';

export default function RolesPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement des rôles depuis l\'API...');
        const rolesData = await RolesService.getRoles();
        setRoles(rolesData);
        console.log('✅ Rôles chargés:', rolesData);
        
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        setError(`Erreur lors du chargement des rôles: ${err.message || 'Erreur inconnue'}`);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRoles();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      console.log('🔄 Rafraîchissement des rôles...');
      const rolesData = await RolesService.getRoles();
      setRoles(rolesData);
      console.log('✅ Rôles rafraîchis:', rolesData);
      
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`Erreur lors du rafraîchissement des rôles: ${err.message || 'Erreur inconnue'}`);
      setRoles([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewRole = (role: Role) => {
    router.push(`/dashboard/roles-permissions/roles/${role.id}`);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedRole: Role) => {
    // Rafraîchir complètement la liste des rôles pour avoir les données les plus récentes
    handleRefresh();
    setIsEditModalOpen(false);
    setSelectedRole(null);
    setSuccessMessage('✅ Rôle mis à jour avec succès');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleCreateSuccess = () => {
    // Rafraîchir la liste des rôles après création
    handleRefresh();
    setSuccessMessage('✅ Rôle créé avec succès');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    // Confirmation avant suppression avec plus de détails
    const confirmed = window.confirm(
      `⚠️ ATTENTION - Suppression du rôle "${roleName}"\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera :\n` +
      `• Le rôle "${roleName}" (ID: ${roleId})\n` +
      `• Toutes les permissions associées\n` +
      `• L'accès de tous les utilisateurs ayant ce rôle\n\n` +
      `Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRoleId(roleId);
      setError('');
      
      console.log(`🔍 Suppression du rôle ${roleName} (ID: ${roleId})...`);
      await RolesService.deleteRole(roleId);
      
      // Supprimer le rôle de la liste locale
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(`✅ Rôle "${roleName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      console.log(`✅ Rôle ${roleName} supprimé avec succès`);
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression du rôle:', err);
      setError(`❌ Erreur lors de la suppression du rôle "${roleName}": ${err.message || 'Erreur inconnue'}`);
    } finally {
      setDeletingRoleId(null);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Pour l'instant, on ne filtre pas par statut car l'API ne retourne pas cette info
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        bg: 'bg-green-500 dark:bg-green-600', 
        text: 'text-white', 
        label: 'Actif',
        icon: '✓'
      },
      inactive: { 
        bg: 'bg-gray-500 dark:bg-gray-600', 
        text: 'text-white', 
        label: 'Inactif',
        icon: '✗'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-sm`}>
        <span className="mr-1">{config.icon}</span>
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
                  <Shield className="h-7 w-7 mr-3 text-blue-600" />
                  Gestion des Rôles
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">Gérez les rôles et permissions du système</p>
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
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Rôle
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
                  placeholder="Rechercher un rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
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
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Utilisateurs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Statut
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
                    {filteredRoles.map((role) => (
                      <tr key={role.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium theme-text-primary theme-transition">{role.name}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {role.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm theme-text-primary theme-transition max-w-xs truncate">
                            Rôle système avec {role.permissions?.length || 0} permissions
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm theme-text-primary theme-transition">
                            {role.permissions?.length || 0} permission{(role.permissions?.length || 0) > 1 ? 's' : ''}
                          </div>
                          {role.permissions && role.permissions.length > 0 && (
                            <div className="text-xs theme-text-tertiary theme-transition mt-1">
                              {role.permissions.slice(0, 3).map(p => p.permission.name).join(', ')}
                              {role.permissions.length > 3 && ` +${role.permissions.length - 3} autres`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 theme-text-tertiary" />
                            <span className="text-sm theme-text-primary theme-transition">{role.admins?.length || 0}</span>
                          </div>
                          {role.admins && role.admins.length > 0 && (
                            <div className="text-xs theme-text-tertiary theme-transition mt-1">
                              {role.admins.slice(0, 2).map(admin => admin.username).join(', ')}
                              {role.admins.length > 2 && ` +${role.admins.length - 2} autres`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge('active')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          Système
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleViewRole(role)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title="Voir les détails du rôle"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditRole(role)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title="Modifier le rôle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              disabled={deletingRoleId === role.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title={`Supprimer le rôle "${role.name}"`}
                            >
                              {deletingRoleId === role.id ? (
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
            
            {filteredRoles.length === 0 && !loading && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">Aucun rôle trouvé</h3>
                <p className="theme-text-secondary theme-transition">Commencez par créer votre premier rôle.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de modification */}
      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onSuccess={handleEditSuccess}
      />
    </Layout>
  );
}
