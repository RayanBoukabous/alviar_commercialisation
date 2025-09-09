'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Settings,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  MapPin,
  Key,
  Eye,
  Smile,
  RotateCcw,
  Move,
  CheckCircle,
  XCircle,
  MoreVertical,
  Activity,
  ScanFace,
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import {
  userService,
  configsService,
  LivenessConfig,
  User as UserType,
} from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { CreateConfigModal } from '@/components/forms/CreateConfigModal';
import { EditConfigModal } from '@/components/forms/EditConfigModal';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/contexts/LanguageContext';
interface ImageModalProps {
  imageUrl: string;
}

const getStatusBadge = (status: string, translate: (namespace: 'users', key: string) => string) => {
  const statusConfig = {
    SUCCESS: { bg: 'bg-green-100', text: 'text-green-800', label: translate('users', 'success') },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: translate('users', 'failed') },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.FAILED;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Eye button */}
      <button
        onClick={() => setOpen(true)}
        className='p-2 rounded-full hover:theme-bg-secondary theme-transition'
        aria-label='View Image'
      >
        <Eye className='w-5 h-5 text-primary-600' />
      </button>

      {/* Modal */}
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
          <div className='theme-bg-elevated rounded-2xl shadow-lg max-w-3xl w-full mx-4 relative theme-transition'>
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className='absolute top-2 right-2 p-2 rounded-full hover:theme-bg-secondary theme-transition'
              aria-label='Close'
            >
              <XCircle className='h-5 w-5 theme-text-primary' />
            </button>

            {/* Image */}
            <div className='p-4 flex justify-center'>
              <img
                src={imageUrl}
                alt='Preview'
                className='max-h-[80vh] max-w-full rounded-lg object-contain'
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default function UserViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Helper function to ensure translations are strings
  const translate = (namespace: 'users', key: string): string => {
    return t(namespace, key) as string;
  };
  
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = useState(0);

  const [user, setUser] = useState<any>(null);
  const [configs, setConfigs] = useState<LivenessConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LivenessConfig | null>(
    null
  );

  const userId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUserData();
    }
  }, [userId, isAuthenticated]);

  // Force re-render when language changes
  useEffect(() => {
    setLanguageKey(prev => prev + 1);
  }, [currentLocale]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      // Récupérer les informations du user
      const foundUser = await userService.getUser(`${userId}`);
      // const foundUser = clientsResponse.clients?.find(c => c.id === userId);

      if (!foundUser) {
        setError(translate('users', 'user_not_found'));
        return;
      }

      setUser(foundUser);

      // Récupérer les configurations du user
      // try {
      //   const configsResponse = await configsService.getLivenessConfigsByClient(
      //     userId,
      //     true
      //   );
      //   setConfigs(configsResponse.configs || []);
      //   console.log(
      //     `✅ Configs trouvées pour ${foundUser.name}:`,
      //     configsResponse.configs
      //   );
      // } catch (configError: any) {
      //   if (
      //     configError.status === 404 ||
      //     configError.code === 'NOT_FOUND_ERROR'
      //   ) {
      //     console.log(`ℹ️ Aucune config trouvée pour le user ${userId}`);
      //     setConfigs([]);
      //   } else {
      //     console.warn(
      //       `⚠️ Erreur lors de la récupération des configs:`,
      //       configError
      //     );
      //     setConfigs([]);
      //   }
      // }
    } catch (err) {
      setError(translate('users', 'loading_error'));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!userId) return;

    try {
      setRefreshing(true);
      await fetchUserData();
    } catch (err) {
      setError(translate('users', 'refresh_error'));
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className='min-h-screen theme-bg-secondary theme-transition'>
          <div className='px-6 py-4'>
            <button
              onClick={() => router.back()}
              className='flex items-center text-primary-600 hover:text-primary-700 theme-transition mb-4'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              {translate('users', 'back')}
            </button>
          </div>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <p className='text-red-600 mb-4'>
                {error || translate('users', 'user_not_found')}
              </p>
              <button
                onClick={() => router.push('/dashboard/users')}
                className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
              >
                {translate('users', 'back_to_users')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout key={languageKey}>
      <div className='min-h-screen theme-bg-secondary theme-transition'>
        {/* Header */}
        <div className='shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition'>
          <div className='px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <button
                  onClick={() => router.back()}
                  className='mr-4 p-2 rounded-lg hover:theme-bg-secondary theme-transition'
                >
                  <ArrowLeft className='h-5 w-5 theme-text-primary' />
                </button>
                <div>
                  <h1 className='text-2xl font-bold flex items-center theme-text-primary theme-transition'>
                    <User className='h-7 w-7 mr-3 text-primary-600' />
                    {user.username}
                  </h1>
                  <p className='mt-1 theme-text-secondary theme-transition'>
                    ID: {user.id}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className='px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      refreshing ? 'animate-spin' : ''
                    }`}
                  />
                  {translate('users', 'refresh')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className='px-6 py-4'>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <div className='h-5 w-5 text-green-500 mr-3'>
                  <svg fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-sm text-green-800'>{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className='px-6 py-6 space-y-6'>
          {/* Client Information */}
          <div className='rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition'>
            <div className='px-6 py-4 border-b theme-border-primary'>
              <h2 className='text-lg font-semibold theme-text-primary theme-transition flex items-center'>
                <User className='h-5 w-5 mr-2 text-primary-600' />
                {translate('users', 'user_information')}
              </h2>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition'>
                      {translate('users', 'name')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      {user.fullName || translate('users', 'not_available')}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition'>
                      {translate('users', 'id')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      #{user.id}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition flex items-center'>
                      {translate('users', 'requests')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      {user.totalRequests}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition'>
                      {translate('users', 'external_id')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      {user.externalUserId || translate('users', 'not_available')}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition flex items-center'>
                      <Calendar className='h-4 w-4 mr-1' />
                      {translate('users', 'last_activity')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      {user.lastRequestAt
                        ? formatDate(user.lastRequestAt)
                        : translate('users', 'never')}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium theme-text-secondary theme-transition flex items-center'>
                      <Calendar className='h-4 w-4 mr-1' />
                      {translate('users', 'created_at')}
                    </label>
                    <p className='text-lg font-semibold theme-text-primary theme-transition'>
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Registered Faces */}
          <div className='rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition'>
            <div className='px-6 py-4 border-b theme-border-primary'>
              <h2 className='text-lg font-semibold theme-text-primary theme-transition flex items-center'>
                <ScanFace className='h-5 w-5 mr-2 text-primary-600' />
                {translate('users', 'registered_faces')} ({user.registeredFaces.length})
              </h2>
            </div>
            <div className='p-6'>
              <div className='px-6 py-6'>
                <div className='shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition'>
                  {loading ? (
                    <div className='flex items-center justify-center py-12'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
                    </div>
                  ) : error ? (
                    <div className='text-center py-12'>
                      <p className='text-red-600'>{error}</p>
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y theme-border-secondary theme-transition'>
                        <thead className='theme-bg-secondary theme-transition'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'face')}
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'created_at')}
                            </th>
                            <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'image')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y theme-bg-elevated theme-border-secondary theme-transition'>
                          {user.registeredFaces.map((face: any) => (
                            <tr
                              key={face.id}
                              className='transition-colors hover:theme-bg-secondary'
                            >
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <div className='h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                                    <ScanFace className='h-5 w-5 text-primary-600' />
                                  </div>
                                  
                                  <div className='ml-4'>
                                    <div className='text-sm font-medium theme-text-primary theme-transition'>
                                      {face.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition'>
                                {formatDate(face.createdAt)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                <div className='flex items-center justify-end space-x-2'>
                                  <button
                                    // onClick={() => handleViewUser(user)}
                                    className='p-1 theme-text-tertiary hover:theme-text-primary theme-transition'
                                    title={translate('users', 'view_image')}
                                  >
                                    <ImageModal imageUrl={face.imagePath} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* {filteredUsers.length === 0 && !loading && (
                                      <div className='text-center py-12'>
                                        <ScanFace className='h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition' />
                                        <h3 className='text-lg font-medium mb-2 theme-text-primary theme-transition'>
                                          Aucun utilisateur trouvé
                                        </h3>
                                        <p className='theme-text-secondary theme-transition'>
                                          Commencez par ajouter votre premier utilisateur.
                                        </p>
                                      </div>
                                    )} */}
                </div>
              </div>
            </div>
          </div>
          {/* Face Matching Attempts */}
          <div className='rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition'>
            <div className='px-6 py-4 border-b theme-border-primary'>
              <h2 className='text-lg font-semibold theme-text-primary theme-transition flex items-center'>
                <ScanFace className='h-5 w-5 mr-2 text-primary-600' />
                {translate('users', 'face_matching_attempts')} ({user.faceMatchingAttempts.length})
              </h2>
            </div>
            <div className='p-6'>
              <div className='px-6 py-6'>
                <div className='shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition'>
                  {loading ? (
                    <div className='flex items-center justify-center py-12'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
                    </div>
                  ) : error ? (
                    <div className='text-center py-12'>
                      <p className='text-red-600'>{error}</p>
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y theme-border-secondary theme-transition'>
                        <thead className='theme-bg-secondary theme-transition'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'attempt')}
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'result')}
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'threshold')}
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'created_at')}
                            </th>
                            <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition'>
                              {translate('users', 'image')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y theme-bg-elevated theme-border-secondary theme-transition'>
                          {user.faceMatchingAttempts.map((attempt: any) => (
                            <tr
                              key={attempt.id}
                              className='transition-colors hover:theme-bg-secondary'
                            >
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <div className='h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                                    <ScanFace className='h-5 w-5 text-primary-600' />
                                  </div>
                                  <div className='ml-4'>
                                    <div className='text-sm font-medium theme-text-primary theme-transition'>
                                      {attempt.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                {getStatusBadge(
                                  attempt.result ? 'SUCCESS' : 'FAILED',
                                  translate
                                )}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm theme-text-primary theme-transition'>
                                {attempt.threshold || translate('users', 'not_available')}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition'>
                                {formatDate(attempt.createdAt)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                <div className='flex items-center justify-end space-x-2'>
                                  <button
                                    // onClick={() => handleViewUser(user)}
                                    className='p-1 theme-text-tertiary hover:theme-text-primary theme-transition'
                                    title={translate('users', 'view_image')}
                                  >
                                    <ImageModal
                                      imageUrl={attempt.capturedImagePath}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}