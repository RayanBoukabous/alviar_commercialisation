'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { adminsService } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { EditAdminModal } from '@/components/forms/EditAdminModal';

interface AdminDetails {
  id: number;
  email: string;
  username: string;
  fullName: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  lastLogout: string | null;
  status: 'active' | 'inactive' | 'suspended';
  role: {
    name: string;
  };
}

export default function AdminDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t } = useLanguage();
  
  const [admin, setAdmin] = useState<AdminDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roles, setRoles] = useState<Map<number, any>>(new Map());

  const adminId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (!adminId) {
        setError(t('admins', 'invalid_admin_id'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Récupération des détails de l\'admin ID:', adminId);
        const adminData = await adminsService.getAdminById(adminId);
        console.log('✅ Détails de l\'admin récupérés:', adminData);
        
        setAdmin(adminData);
        
        // Créer une map des rôles pour le modal d'édition
        if (adminData.role) {
          const rolesMap = new Map();
          rolesMap.set(adminData.roleId, adminData.role);
          setRoles(rolesMap);
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la récupération des détails:', err);
        setError(t('admins', 'loading_details_error').replace('{error}', err.message || 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && adminId) {
      fetchAdminDetails();
    }
  }, [isAuthenticated, adminId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        bg: 'bg-green-100 dark:bg-green-900/20', 
        text: 'text-green-800 dark:text-green-200', 
        icon: CheckCircle,
        label: t('admins', 'active') 
      },
      inactive: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-800 dark:text-gray-200', 
        icon: XCircle,
        label: t('admins', 'inactive') 
      },
      suspended: { 
        bg: 'bg-red-100 dark:bg-red-900/20', 
        text: 'text-red-800 dark:text-red-200', 
        icon: AlertCircle,
        label: t('admins', 'suspended') 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Rafraîchir les données de l'admin après modification
    if (adminId) {
      const refreshAdmin = async () => {
        try {
          const adminData = await adminsService.getAdminById(adminId);
          setAdmin(adminData);
          
          // Mettre à jour la map des rôles
          if (adminData.role) {
            const rolesMap = new Map();
            rolesMap.set(adminData.roleId, adminData.role);
            setRoles(rolesMap);
          }
        } catch (err) {
          console.error('Erreur lors du rafraîchissement:', err);
        }
      };
      refreshAdmin();
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!admin) return;

    const confirmed = window.confirm(
      t('admins', 'delete_admin_confirm').replace('{name}', admin.fullName)
    );

    if (!confirmed) return;

    try {
      await adminsService.deleteAdmin(admin.id);
      router.push('/dashboard/users/admins');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(t('admins', 'delete_details_error'));
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
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('admins', 'error')}</h3>
              <p className="theme-text-secondary theme-transition">{error}</p>
              <button
                onClick={() => router.push('/dashboard/users/admins')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('admins', 'back_to_list')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!admin) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('admins', 'admin_not_found')}</h3>
              <p className="theme-text-secondary theme-transition">{t('admins', 'admin_not_found_desc')}</p>
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
                  onClick={() => router.push('/dashboard/users/admins')}
                  className="mr-4 p-2 hover:theme-bg-secondary rounded-lg theme-transition"
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <User className="h-7 w-7 mr-3 text-blue-600" />
                    {admin.fullName}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">{t('admins', 'admin_details_title')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('admins', 'edit_admin')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('admins', 'delete_admin')}
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
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">{t('admins', 'general_information')}</h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {t('admins', 'email_label')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">{admin.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {t('admins', 'username_label')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">@{admin.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('admins', 'role_label')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition capitalize">{admin.role.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        {t('admins', 'status')}
                      </dt>
                      <dd className="mt-1">{getStatusBadge(admin.status)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Activité récente */}
              <div className="mt-6 shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">{t('admins', 'recent_activity')}</h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-6">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {t('admins', 'last_login')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {admin.lastLogin ? formatDate(admin.lastLogin) : t('admins', 'never_connected')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {t('admins', 'last_logout')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {admin.lastLogout ? formatDate(admin.lastLogout) : t('admins', 'never_logged_out')}
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
                  <h2 className="text-lg font-medium theme-text-primary theme-transition">{t('admins', 'system_information')}</h2>
                </div>
                <div className="p-6">
                  <dl className="space-y-6">
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('admins', 'creation_date')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {formatDate(admin.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('admins', 'last_modification')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        {formatDate(admin.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('admins', 'role_id')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        #{admin.roleId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium theme-text-tertiary theme-transition flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {t('admins', 'user_id')}
                      </dt>
                      <dd className="mt-1 text-sm theme-text-primary theme-transition">
                        #{admin.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      {admin && (
        <EditAdminModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          admin={admin}
          roles={roles}
        />
      )}
    </Layout>
  );
}
