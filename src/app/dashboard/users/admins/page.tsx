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
  User,
  Calendar,
  Mail,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminsService, Admin } from '@/lib/api';
import { rolesService } from '@/lib/api';
import { Role } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { CreateAdminModal } from '@/components/forms/CreateAdminModal';
import { EditAdminModal } from '@/components/forms/EditAdminModal';

export default function AdminsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Map<number, Role>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);
  const [activatingAdminId, setActivatingAdminId] = useState<number | null>(null);
  const [suspendingAdminId, setSuspendingAdminId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');


  // Fonction pour récupérer les rôles uniques des admins
  const fetchRolesForAdmins = async (admins: Admin[]) => {
    const uniqueRoleIds = [...new Set(admins.map(admin => admin.roleId))];
    const rolesMap = new Map<number, Role>();
    
    try {
      // Récupérer tous les rôles en parallèle
      const rolePromises = uniqueRoleIds.map(roleId => 
        rolesService.getRoleById(roleId).catch((err: any) => {
          console.error(`Erreur lors de la récupération du rôle ${roleId}:`, err);
          return null;
        })
      );
      
      const roles = await Promise.all(rolePromises);
      
      // Construire la map des rôles
      roles.forEach((role: Role | null) => {
        if (role) {
          rolesMap.set(role.id, role);
        }
      });
      
      console.log('✅ Rôles récupérés:', rolesMap);
      return rolesMap;
    } catch (err) {
      console.error('Erreur lors de la récupération des rôles:', err);
      return new Map<number, Role>();
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError('');
        // Force refresh pour éviter le cache 304
        const response = await adminsService.getAllAdmins(true);
        console.log('Réponse complète:', response);
        console.log('Admins dans la réponse:', response.admins);
        
        // Utiliser les données de l'API
        console.log('🔍 Avant setAdmins - response.admins:', response.admins);
        console.log('🔍 Type de response.admins:', typeof response.admins);
        console.log('🔍 Est-ce un tableau?', Array.isArray(response.admins));
        console.log('🔍 Longueur:', response.admins?.length);
        
        const adminsData = response.admins || [];
        setAdmins(adminsData);
        
        // Récupérer les rôles pour ces admins
        if (adminsData.length > 0) {
          const rolesMap = await fetchRolesForAdmins(adminsData);
          setRoles(rolesMap);
        }
        
        console.log('✅ Admins récupérés depuis l\'API:', adminsData);
        console.log('✅ Admins récupérés et définis:', adminsData);
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        console.error('Message d\'erreur:', err.message);
        console.error('Réponse d\'erreur:', err.response);
        setError(`Erreur lors du chargement des administrateurs: ${err.message || 'Erreur inconnue'}`);
        // En cas d'erreur, ne pas utiliser de données mock
        setAdmins([]);
        setRoles(new Map());
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAdmins();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const response = await adminsService.getAllAdmins(true);
      console.log('Admins rafraîchis:', response);
      
      const adminsData = response.admins || [];
      setAdmins(adminsData);
      
      // Récupérer les rôles pour ces admins
      if (adminsData.length > 0) {
        const rolesMap = await fetchRolesForAdmins(adminsData);
        setRoles(rolesMap);
      }
      
      console.log('Admins rafraîchis depuis l\'API:', adminsData);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`Erreur lors du rafraîchissement des administrateurs: ${err.message || 'Erreur inconnue'}`);
      // En cas d'erreur, ne pas utiliser de données mock
      setAdmins([]);
      setRoles(new Map());
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateSuccess = () => {
    // Rafraîchir la liste des admins après création
    handleRefresh();
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir la liste des admins après modification
    handleRefresh();
    setEditingAdmin(null);
  };

  const handleViewAdmin = (admin: Admin) => {
    router.push(`/dashboard/users/admins/${admin.id}`);
  };

  const handleDeleteAdmin = async (adminId: number, adminName: string) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'administrateur "${adminName}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAdminId(adminId);
      await adminsService.deleteAdmin(adminId);
      
      // Supprimer l'admin de la liste locale
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(`Administrateur "${adminName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Administrateur ${adminName} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'administrateur:', err);
      setError('Erreur lors de la suppression de l\'administrateur');
    } finally {
      setDeletingAdminId(null);
    }
  };

  const handleActivateAdmin = async (adminId: number, adminName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir activer l'administrateur "${adminName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActivatingAdminId(adminId);
      await adminsService.activateAdmin(adminId);
      
      // Mettre à jour le statut de l'admin dans la liste locale
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId ? { ...admin, status: 'active' } : admin
        )
      );
      
      setSuccessMessage(`Administrateur "${adminName}" activé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Administrateur ${adminName} activé avec succès`);
    } catch (err) {
      console.error('Erreur lors de l\'activation de l\'administrateur:', err);
      setError('Erreur lors de l\'activation de l\'administrateur');
    } finally {
      setActivatingAdminId(null);
    }
  };

  const handleSuspendAdmin = async (adminId: number, adminName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir suspendre l'administrateur "${adminName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSuspendingAdminId(adminId);
      await adminsService.suspendAdmin(adminId);
      
      // Mettre à jour le statut de l'admin dans la liste locale
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId ? { ...admin, status: 'suspended' } : admin
        )
      );
      
      setSuccessMessage(`Administrateur "${adminName}" suspendu avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Administrateur ${adminName} suspendu avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suspension de l\'administrateur:', err);
      setError('Erreur lors de la suspension de l\'administrateur');
    } finally {
      setSuspendingAdminId(null);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Log pour debug
  console.log('🔍 filteredAdmins calculé:', filteredAdmins);
  console.log('🔍 Nombre d\'admins filtrés:', filteredAdmins.length);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspendu' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (roleId: number) => {
    const role = roles.get(roleId);
    const roleName = role?.name || 'Rôle inconnu';
    
    // Configuration des couleurs basée sur le nom du rôle
    const getRoleConfig = (name: string) => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('super') || lowerName.includes('admin')) {
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      } else if (lowerName.includes('moderator') || lowerName.includes('moderateur')) {
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      } else if (lowerName.includes('user') || lowerName.includes('utilisateur')) {
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      } else {
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      }
    };
    
    const config = getRoleConfig(roleName);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {roleName}
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
                <Shield className="h-7 w-7 mr-3 text-primary-600" />
                Gestion des Administrateurs
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">Gérez les administrateurs et leurs permissions</p>
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
                Nouvel Admin
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
                placeholder="Rechercher un administrateur..."
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
              <option value="ALL">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
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
                      Administrateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      Dernière connexion
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
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium theme-text-primary theme-transition">{admin.fullName}</div>
                            <div className="text-sm theme-text-secondary theme-transition">@{admin.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 theme-text-tertiary" />
                          <span className="text-sm theme-text-primary theme-transition">{admin.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(admin.roleId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(admin.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {admin.lastLogin ? formatDate(admin.lastLogin) : 'Jamais connecté'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            onClick={() => handleViewAdmin(admin)}
                            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                            title="Voir les détails de l'administrateur"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditAdmin(admin)}
                            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                            title="Modifier l'administrateur"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {/* Bouton Activer - visible seulement si l'admin n'est pas actif */}
                          {admin.status !== 'active' && (
                            <button 
                              onClick={() => handleActivateAdmin(admin.id, admin.fullName)}
                              disabled={activatingAdminId === admin.id}
                              className="p-1 theme-text-tertiary hover:text-green-500 theme-transition disabled:opacity-50"
                              title="Activer l'administrateur"
                            >
                              {activatingAdminId === admin.id ? (
                                <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          {/* Bouton Suspendre - visible seulement si l'admin est actif */}
                          {admin.status === 'active' && (
                            <button 
                              onClick={() => handleSuspendAdmin(admin.id, admin.fullName)}
                              disabled={suspendingAdminId === admin.id}
                              className="p-1 theme-text-tertiary hover:text-orange-500 theme-transition disabled:opacity-50"
                              title="Suspendre l'administrateur"
                            >
                              {suspendingAdminId === admin.id ? (
                                <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                              ) : (
                                <Pause className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id, admin.fullName)}
                            disabled={deletingAdminId === admin.id}
                            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                            title="Supprimer l'administrateur"
                          >
                            {deletingAdminId === admin.id ? (
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
          
          {filteredAdmins.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">Aucun administrateur trouvé</h3>
              <p className="theme-text-secondary theme-transition">Commencez par ajouter votre premier administrateur.</p>
              <div className="mt-4 text-sm theme-text-tertiary bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Total admins: {admins.length}</p>
                <p>Filtered admins: {filteredAdmins.length}</p>
                <p>Search term: "{searchTerm}"</p>
                <p>Status filter: "{statusFilter}"</p>
                <p>Loading: {loading.toString()}</p>
                <p>Error: {error}</p>
                <p>Admins data: {JSON.stringify(admins, null, 2)}</p>
                <p>Admins type: {typeof admins}</p>
                <p>Is array: {Array.isArray(admins).toString()}</p>
                <p>First admin: {admins[0] ? JSON.stringify(admins[0]) : 'None'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAdmin(null);
        }}
        onSuccess={handleEditSuccess}
        admin={editingAdmin}
        roles={roles}
      />

    </Layout>
  );
}