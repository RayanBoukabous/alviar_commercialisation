'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar, 
  Activity,
  Clock,
  Hash,
  Edit,
  Trash2
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { usersService } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

interface UserDetails {
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

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const userId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setError('ID d\'utilisateur invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Récupération des détails de l\'utilisateur ID:', userId);
        const userData = await usersService.getUserById(userId);
        console.log('✅ Détails de l\'utilisateur récupérés:', userData);
        
        setUser(userData);
      } catch (err: any) {
        console.error('❌ Erreur lors de la récupération des détails:', err);
        setError(`Erreur lors du chargement des détails: ${err.message || 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && userId) {
      fetchUserDetails();
    }
  }, [isAuthenticated, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    // TODO: Implémenter l'édition
    console.log('Éditer l\'utilisateur:', user);
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.fullName}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await usersService.deleteUser(user.id);
      router.push('/dashboard/users/list');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
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
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto mb-4 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">Erreur</h3>
              <p className="theme-text-secondary theme-transition">{error}</p>
              <button
                onClick={() => router.push('/dashboard/users/list')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">Utilisateur non trouvé</h3>
              <p className="theme-text-secondary theme-transition">L'utilisateur demandé n'existe pas.</p>
            </div>
          </div>
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
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard/users/list')}
                  className="mr-4 p-2 hover:theme-bg-secondary rounded-lg theme-transition"
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <User className="h-7 w-7 mr-3 text-blue-600" />
                    {user.fullName}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">Détails de l'utilisateur</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2">
              <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">Informations générales</h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Nom d'utilisateur
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">@{user.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        ID Externe
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">{user.externalUserId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Hash className="h-4 w-4 mr-2" />
                        Client ID
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">#{user.clientId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Total des requêtes
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">{user.totalRequests}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Activité récente */}
              <div className="mt-6 shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">Activité récente</h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-6">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Dernière requête
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {user.lastRequestAt ? formatDate(user.lastRequestAt) : 'Aucune requête'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div>
              <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">Informations système</h2>
                </div>
                <div className="p-6">
                  <dl className="space-y-6">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Date de création
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {formatDate(user.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Dernière modification
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {formatDate(user.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        ID utilisateur
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        #{user.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
