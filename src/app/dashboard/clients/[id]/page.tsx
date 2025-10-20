'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Hash,
  UserCheck,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { clientsService, Client } from '@/lib/api/clientsService';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { EditClientModal } from '@/components/forms/EditClientModal';

export default function ClientViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const clientId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (clientId && isAuthenticated) {
      fetchClientData();
    }
  }, [clientId, isAuthenticated]);

  const fetchClientData = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError('');

      console.log(`🔍 Fetching client data for ID: ${clientId}`);
      
      const clientResponse = await clientsService.getClientById(clientId);
      console.log(`✅ Client récupéré:`, clientResponse);
      
      if (clientResponse && clientResponse.id) {
        setClient(clientResponse);
      } else {
        console.error('❌ Client response is invalid:', clientResponse);
        setError('Client non trouvé');
      }

    } catch (err) {
      console.error('❌ Erreur lors de la récupération du client:', err);
      setError('Erreur lors du chargement du client');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!clientId) return;

    try {
      setRefreshing(true);
      await fetchClientData();
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditSuccess = () => {
    fetchClientData();
    setIsEditModalOpen(false);
    setSuccessMessage('Client mis à jour avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteClient = async () => {
    if (!client) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le client "${client.nom}" ?`
    );

    if (!confirmed) return;

    try {
      await clientsService.deleteClient(client.id);
      setSuccessMessage(`Client "${client.nom}" supprimé avec succès`);
      setTimeout(() => {
        router.push('/dashboard/clients');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la suppression du client:', err);
      setError('Erreur lors de la suppression du client');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PARTICULIER: { bg: 'bg-blue-200 dark:bg-blue-900/30', text: 'text-blue-900 dark:text-blue-200', label: 'Particulier' },
      SUPERGROSSISTE: { bg: 'bg-purple-200 dark:bg-purple-900/30', text: 'text-purple-900 dark:text-purple-200', label: 'Supergrossiste' },
      GROSSISTE: { bg: 'bg-orange-200 dark:bg-orange-900/30', text: 'text-orange-900 dark:text-orange-200', label: 'Grossiste' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PARTICULIER;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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

  if (error || !client) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="px-6 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-primary-600 hover:text-primary-700 theme-transition mb-4"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'رجوع' : 'Retour'}
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Client non trouvé'}</p>
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isRTL ? 'العودة إلى العملاء' : 'Retour aux clients'}
              </button>
            </div>
          </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className={`${isRTL ? 'ml-4' : 'mr-4'} p-2 rounded-lg hover:theme-bg-secondary theme-transition`}
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Building2 className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {client.nom}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    ID: {client.id} • {getTypeBadge(client.type_client)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </button>
                <button 
                  onClick={handleDeleteClient}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حذف' : 'Supprimer'}
                </button>
              </div>
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

        <div className="px-6 py-6 space-y-6">
          {/* Client Information */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Building2 className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات العميل' : 'Informations du client'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Hash className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'معرف العميل' : 'ID Client'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">#{client.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Building2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'اسم العميل' : 'Nom du client'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <UserCheck className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'نوع العميل' : 'Type de client'}
                    </label>
                    <div className="mt-1">{getTypeBadge(client.type_client)}</div>
                  </div>
                </div>
                
                {/* Informations de contact */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Phone className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'رقم الهاتف' : 'Téléphone'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.telephone}</p>
                  </div>
                  {client.email && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <Mail className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.email}</p>
                    </div>
                  )}
                  {client.telephone_contact && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <Phone className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'هاتف الاتصال' : 'Téléphone de contact'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.telephone_contact}</p>
                    </div>
                  )}
                </div>
                
                {/* Informations géographiques */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <MapPin className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'العنوان' : 'Adresse'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{client.adresse}</p>
                  </div>
                  {client.wilaya && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <Globe className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'الولاية' : 'Wilaya'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.wilaya}</p>
                    </div>
                  )}
                  {client.commune && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <Globe className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'البلدية' : 'Commune'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.commune}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations légales et commerciales */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <FileText className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المعلومات القانونية والتجارية' : 'Informations légales et commerciales'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Informations fiscales */}
                <div className="space-y-4">
                  {client.nif && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">
                        {isRTL ? 'رقم التعريف الضريبي (NIF)' : 'NIF'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.nif}</p>
                    </div>
                  )}
                  {client.nis && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">
                        {isRTL ? 'رقم التعريف الإحصائي (NIS)' : 'NIS'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.nis}</p>
                    </div>
                  )}
                </div>
                
                {/* Informations commerciales */}
                <div className="space-y-4">
                  {client.commercial_nom && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <User className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'التاجر المسؤول' : 'Commercial responsable'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.commercial_nom}</p>
                    </div>
                  )}
                  {client.contact_principal && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <User className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'جهة الاتصال الرئيسية' : 'Contact principal'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.contact_principal}</p>
                    </div>
                  )}
                </div>
                
                {/* Notes */}
                {client.notes && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <FileText className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'ملاحظات' : 'Notes'}
                      </label>
                      <p className="text-sm theme-text-primary theme-transition bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {client.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations de création et modification */}
          <div className="rounded-lg shadow-sm border theme-bg-elevated theme-border-primary theme-transition">
            <div className="px-6 py-4 border-b theme-border-primary">
              <h2 className="text-lg font-semibold theme-text-primary theme-transition flex items-center">
                <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات الإنشاء والتعديل' : 'Informations de création et modification'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{formatDate(client.created_at)}</p>
                  </div>
                  {client.created_by_nom && (
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                        <User className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'أنشئ بواسطة' : 'Créé par'}
                      </label>
                      <p className="text-lg font-semibold theme-text-primary theme-transition">{client.created_by_nom}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium theme-text-secondary theme-transition flex items-center">
                      <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'آخر تعديل' : 'Dernière modification'}
                    </label>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">{formatDate(client.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Client Modal */}
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          client={client}
        />
      </div>
    </Layout>
  );
}