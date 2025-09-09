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
  Building2,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/api';
import { CreateUserModal } from '@/components/forms/CreateUserModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Type pour les utilisateurs
interface User {
  id: number;
  clientId: number;
  externalUserId: string;
  username: string;
  fullName: string;
  totalRequests: number;
  lastRequestAt: string | null;
  createdAt: string;
  updatedAt: string;
}
import { Layout } from '@/components/layout/Layout';

export default function UsersListPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Helper function to ensure translations are strings
  const translate = (namespace: 'users', key: string): string => {
    return t(namespace, key) as string;
  };
  
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        // Force refresh pour éviter le cache 304
        const response = await usersService.getAllUsers(true);
        console.log('Réponse complète:', response);
        console.log('Users dans la réponse:', response.users);
        
        // Utiliser les données de l'API
        console.log('🔍 Avant setUsers - response.users:', response.users);
        console.log('🔍 Type de response.users:', typeof response.users);
        console.log('🔍 Est-ce un tableau?', Array.isArray(response.users));
        console.log('🔍 Longueur:', response.users?.length);
        
        setUsers(response.users || []);
        console.log('✅ Users récupérés depuis l\'API:', response.users);
        
        console.log('✅ Users récupérés et définis:', response.users || []);
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        console.error('Message d\'erreur:', err.message);
        console.error('Réponse d\'erreur:', err.response);
        setError(translate('users', 'loading_error'));
        // En cas d'erreur, ne pas utiliser de données mock
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Force re-render when language changes
  useEffect(() => {
    setLanguageKey(prev => prev + 1);
  }, [currentLocale]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const response = await usersService.getAllUsers(true);
      console.log('Users rafraîchis:', response);
      setUsers(response.users || []);
      console.log('Users rafraîchis depuis l\'API:', response.users);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(translate('users', 'refresh_error'));
      // En cas d'erreur, ne pas utiliser de données mock
      setUsers([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewUser = (user: User) => {
    router.push(`/dashboard/users/list/${user.id}`);
  };

  const handleCreateSuccess = () => {
    // Rafraîchir la liste des utilisateurs après création
    handleRefresh();
  };

  const handleEditUser = (user: User) => {
    // TODO: Implémenter l'édition
    console.log('Éditer utilisateur:', user);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      translate('users', 'delete_user_confirmation').replace('{name}', userName)
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await usersService.deleteUser(userId);
      
      // Supprimer l'utilisateur de la liste locale
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(translate('users', 'user_deleted').replace('{name}', userName));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Utilisateur ${userName} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError(translate('users', 'delete_user_error'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.externalUserId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
    <Layout key={languageKey}>
      <div className="min-h-screen theme-bg-secondary theme-transition">
      {/* Header */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
        <div>
              <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                <User className="h-7 w-7 mr-3 text-primary-600" />
                {translate('users', 'title')}
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">{translate('users', 'subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {translate('users', 'refresh')}
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                {translate('users', 'new_user')}
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
                placeholder={translate('users', 'search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
              <Filter className="h-4 w-4 mr-2" />
              {translate('users', 'filters')}
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
                      {translate('users', 'user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'external_id')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'client_id')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'requests')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'last_activity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'created_at')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {translate('users', 'actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium theme-text-primary theme-transition">{user.fullName}</div>
                            <div className="text-sm theme-text-secondary theme-transition">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 theme-text-tertiary" />
                          <span className="text-sm theme-text-primary theme-transition">{user.externalUserId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition">
                        #{user.clientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 theme-text-tertiary" />
                          <span className="text-sm theme-text-primary theme-transition">{user.totalRequests}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {user.lastRequestAt ? formatDate(user.lastRequestAt) : translate('users', 'never_active')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                            title={translate('users', 'view_user')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                            title={translate('users', 'edit_user')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            disabled={deletingUserId === user.id}
                            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                            title={translate('users', 'delete_user')}
                          >
                            {deletingUserId === user.id ? (
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
          
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{translate('users', 'no_users_found')}</h3>
              <p className="theme-text-secondary theme-transition">{translate('users', 'start_adding_users')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      </div>
    </Layout>
  );
}