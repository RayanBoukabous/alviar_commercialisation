'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  MapPin, 
  User, 
  Calendar, 
  Package, 
  AlertCircle,
  Eye,
  RefreshCw,
  Activity,
  FileText,
  Hash,
  Building2,
  Users,
  Plus,
  Minus,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useReception, useConfirmerReception, useAnnulerReception } from '@/lib/hooks/useReceptions';
import { Reception } from '@/lib/api/receptionService';
import Tabs from '@/components/ui/Tabs';

export default function ReceptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const [showConfirmerModal, setShowConfirmerModal] = useState(false);
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [nombreBetesRecues, setNombreBetesRecues] = useState<number>(0);
  const [betesManquantes, setBetesManquantes] = useState<string>('');
  const [betesEnPlus, setBetesEnPlus] = useState<string>('');
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';
  const receptionId = parseInt(params.id as string);

  // Hooks pour les données et actions
  const { data: reception, isLoading: loading, error, refetch } = useReception(receptionId);
  const confirmerMutation = useConfirmerReception();
  const annulerMutation = useAnnulerReception();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refetch]);

  // Rafraîchissement forcé au focus de la page
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const handleConfirmer = async () => {
    try {
      setIsProcessing(true);
      await confirmerMutation.mutateAsync({
        id: receptionId,
        data: {
          nombre_betes_recues: nombreBetesRecues,
          betes_manquantes: betesManquantes ? betesManquantes.split(',').map(b => b.trim()) : [],
          note: note
        }
      });
      setSuccessMessage('Réception confirmée avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowConfirmerModal(false);
      // Reset form
      setNombreBetesRecues(0);
      setBetesManquantes('');
      setBetesEnPlus('');
      setNote('');
    } catch (err) {
      setErrorMessage('Erreur lors de la confirmation de la réception');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnnuler = async () => {
    try {
      setIsProcessing(true);
      await annulerMutation.mutateAsync({
        id: receptionId,
        data: { motif_annulation: motifAnnulation }
      });
      setSuccessMessage('Réception annulée avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAnnulerModal(false);
      setMotifAnnulation('');
    } catch (err) {
      setErrorMessage('Erreur lors de l\'annulation de la réception');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'EN_ATTENTE': { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      'EN_ROUTE': { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'في الطريق' : 'En route',
        icon: Truck
      },
      'EN_COURS': { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'قيد المعالجة' : 'En cours',
        icon: Activity
      },
      'RECU': { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'مكتمل' : 'Reçu',
        icon: CheckCircle
      },
      'PARTIEL': { 
        bg: 'bg-yellow-200 dark:bg-yellow-900/50', 
        text: 'text-yellow-900 dark:text-yellow-100', 
        border: 'border-yellow-300 dark:border-yellow-700',
        label: isRTL ? 'جزئي' : 'Partiel',
        icon: AlertCircle
      },
      'ANNULE': { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'ملغى' : 'Annulé',
        icon: XCircle
      },
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !reception) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold theme-text-primary mb-2">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
            </h2>
            <p className="theme-text-secondary mb-4">
              {isRTL ? 'لا يمكن العثور على هذه الاستقبال' : 'Impossible de charger cette réception'}
            </p>
            <button
              onClick={() => router.push('/dashboard/reception')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {isRTL ? 'العودة إلى القائمة' : 'Retour à la liste'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: isRTL ? 'نظرة عامة' : 'Vue d\'ensemble',
      content: (
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات الاستقبال' : 'Informations de la réception'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'رقم الاستقبال:' : 'Numéro:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{reception.numero_reception}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(reception.statut)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'الماشية المتوقعة:' : 'Bêtes attendues:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{reception.nombre_betes_attendues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'الماشية المستلمة:' : 'Bêtes reçues:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{reception.nombre_betes_recues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'معدل الاستقبال:' : 'Taux de réception:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{reception.taux_reception}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                  <span className="text-sm theme-text-primary">{formatDate(reception.date_creation)}</span>
                </div>
                {reception.date_reception && (
                  <div className="flex justify-between">
                    <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الاستقبال:' : 'Date de réception:'}</span>
                    <span className="text-sm theme-text-primary">{formatDate(reception.date_reception)}</span>
                  </div>
                )}
                {reception.date_annulation && (
                  <div className="flex justify-between">
                    <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإلغاء:' : 'Date d\'annulation:'}</span>
                    <span className="text-sm theme-text-primary">{formatDate(reception.date_annulation)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Building2 className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المجازر' : 'Abattoirs'}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Truck className={`h-4 w-4 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'المجزر المرسل' : 'Abattoir expéditeur'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary ml-6">{reception.abattoir_expediteur?.nom || 'N/A'}</p>
                  <p className="text-xs theme-text-secondary ml-6">
                    {reception.abattoir_expediteur?.wilaya}, {reception.abattoir_expediteur?.commune}
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'المجزر المستقبل' : 'Abattoir destinataire'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary ml-6">{reception.abattoir_destinataire?.nom || 'N/A'}</p>
                  <p className="text-xs theme-text-secondary ml-6">
                    {reception.abattoir_destinataire?.wilaya}, {reception.abattoir_destinataire?.commune}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transfert associé */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'النقل المرتبط' : 'Transfert associé'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'رقم النقل:' : 'Numéro de transfert:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{reception.transfert?.numero_transfert || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'حالة النقل:' : 'Statut du transfert:'}</span>
                  {reception.transfert?.statut ? getStatusBadge(reception.transfert.statut) : <span className="text-sm theme-text-primary">N/A</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'عدد الماشية:' : 'Nombre de bêtes:'}</span>
                  <span className="text-sm font-medium theme-text-primary">
                    {reception.transfert?.nombre_betes_actuelles || 0} / {reception.transfert?.nombre_betes || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                  <span className="text-sm theme-text-primary">{formatDate(reception.transfert?.date_creation || '')}</span>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => router.push(`/dashboard/transfert/${reception.transfert?.id}`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'عرض النقل' : 'Voir le transfert'}
                </button>
              </div>
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المستخدمين' : 'Utilisateurs'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <User className={`h-4 w-4 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-sm font-medium theme-text-primary">
                    {isRTL ? 'أنشأ بواسطة' : 'Créé par'}
                  </span>
                </div>
                <p className="text-sm theme-text-primary ml-6">{reception.cree_par?.nom || 'N/A'}</p>
                <p className="text-xs theme-text-secondary ml-6">@{reception.cree_par?.username || 'N/A'}</p>
              </div>
              {reception.valide_par && (
                <div>
                  <div className="flex items-center mb-2">
                    <CheckCircle className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'تم التحقق بواسطة' : 'Validé par'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary ml-6">{reception.valide_par.nom}</p>
                  <p className="text-xs theme-text-secondary ml-6">@{reception.valide_par.username}</p>
                </div>
              )}
              {reception.annule_par && (
                <div>
                  <div className="flex items-center mb-2">
                    <XCircle className={`h-4 w-4 text-red-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'ألغى بواسطة' : 'Annulé par'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary ml-6">{reception.annule_par.nom}</p>
                  <p className="text-xs theme-text-secondary ml-6">@{reception.annule_par.username}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes et informations supplémentaires */}
          {(reception.note || reception.betes_manquantes?.length > 0) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'ملاحظات ومعلومات إضافية' : 'Notes et informations supplémentaires'}
              </h3>
              <div className="space-y-4">
                {reception.note && (
                  <div>
                    <span className="text-sm font-medium theme-text-primary block mb-2">
                      {isRTL ? 'ملاحظة:' : 'Note:'}
                    </span>
                    <p className="text-sm theme-text-primary bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {reception.note}
                    </p>
                  </div>
                )}
                {reception.betes_manquantes && reception.betes_manquantes.length > 0 && (
                  <div>
                    <span className="text-sm font-medium theme-text-primary block mb-2">
                      {isRTL ? 'الماشية المفقودة:' : 'Bêtes manquantes:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {reception.betes_manquantes.map((bete, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full text-xs">
                          {bete}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'users',
      label: isRTL ? 'المستخدمين' : 'Utilisateurs',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'معلومات المستخدمين' : 'Informations des utilisateurs'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center mb-3">
                  <User className={`h-5 w-5 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="font-medium theme-text-primary">
                    {isRTL ? 'المنشئ' : 'Créateur'}
                  </span>
                </div>
                <p className="text-sm theme-text-primary">{reception.cree_par?.nom || 'N/A'}</p>
                <p className="text-xs theme-text-secondary">@{reception.cree_par?.username || 'N/A'}</p>
                <p className="text-xs theme-text-tertiary mt-1">
                  {formatDate(reception.date_creation)}
                </p>
              </div>

              {reception.valide_par && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="font-medium theme-text-primary">
                      {isRTL ? 'المتحقق' : 'Validateur'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary">{reception.valide_par.nom}</p>
                  <p className="text-xs theme-text-secondary">@{reception.valide_par.username}</p>
                  <p className="text-xs theme-text-tertiary mt-1">
                    {formatDate(reception.date_reception || '')}
                  </p>
                </div>
              )}

              {reception.annule_par && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <XCircle className={`h-5 w-5 text-red-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="font-medium theme-text-primary">
                      {isRTL ? 'الملغي' : 'Annulateur'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary">{reception.annule_par.nom}</p>
                  <p className="text-xs theme-text-secondary">@{reception.annule_par.username}</p>
                  <p className="text-xs theme-text-tertiary mt-1">
                    {formatDate(reception.date_annulation || '')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      {/* En-tête avec navigation et actions */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/reception')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg theme-transition mr-4"
              >
                <ArrowLeft className="h-5 w-5 theme-text-primary" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Package className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {reception.numero_reception}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'تفاصيل الاستقبال' : 'Détails de la réception'}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary"
              >
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Actualiser'}
              </button>
              <button 
                onClick={() => {
                  window.location.reload();
                }}
                className="px-3 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {isRTL ? 'إعادة تحميل' : 'Recharger'}
              </button>
              <div className="text-xs theme-text-secondary flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                {isRTL ? 'تحديث تلقائي' : 'Auto-refresh'}
              </div>
              {getStatusBadge(reception.statut)}
            </div>
          </div>
        </div>
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions disponibles */}
      {reception && (reception.statut === 'EN_ROUTE' || reception.statut === 'EN_ATTENTE' || reception.statut === 'EN_COURS') ? (
        <div className="px-6 py-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الإجراءات المتاحة' : 'Actions disponibles'}
            </h3>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <button
                onClick={() => setShowConfirmerModal(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تأكيد الاستقبال' : 'Confirmer la réception'}
              </button>
              <button
                onClick={() => setShowAnnulerModal(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إلغاء الاستقبال' : 'Annuler la réception'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Contenu principal avec onglets */}
      <div className="px-6 py-6">
        <Tabs tabs={tabs} />
      </div>

      {/* Modal de confirmation */}
      {showConfirmerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">
              {isRTL ? 'تأكيد الاستقبال' : 'Confirmer la réception'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {isRTL ? 'عدد الماشية المستلمة:' : 'Nombre de bêtes reçues:'}
                </label>
                <input
                  type="number"
                  value={nombreBetesRecues}
                  onChange={(e) => setNombreBetesRecues(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                  min="0"
                  max={reception.nombre_betes_attendues}
                />
                <p className="text-xs theme-text-secondary mt-1">
                  {isRTL ? 'المتوقع:' : 'Attendu:'} {reception.nombre_betes_attendues}
                </p>
              </div>
              
              {nombreBetesRecues < reception.nombre_betes_attendues && (
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {isRTL ? 'أرقام الماشية المفقودة (اختياري):' : 'Numéros de boucles manquantes (optionnel):'}
                  </label>
                  <textarea
                    value={betesManquantes}
                    onChange={(e) => setBetesManquantes(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                    rows={3}
                    placeholder={isRTL ? 'أدخل أرقام الماشية المفقودة مفصولة بفواصل...' : 'Entrez les numéros de boucles manquantes séparés par des virgules...'}
                  />
                </div>
              )}
              
              {nombreBetesRecues > reception.nombre_betes_attendues && (
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {isRTL ? 'أرقام الماشية الإضافية (اختياري):' : 'Numéros de boucles supplémentaires (optionnel):'}
                  </label>
                  <textarea
                    value={betesEnPlus}
                    onChange={(e) => setBetesEnPlus(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                    rows={3}
                    placeholder={isRTL ? 'أدخل أرقام الماشية الإضافية مفصولة بفواصل...' : 'Entrez les numéros de boucles supplémentaires séparés par des virgules...'}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {isRTL ? 'ملاحظة (اختياري):' : 'Note (optionnel):'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                  rows={3}
                  placeholder={isRTL ? 'أدخل ملاحظة إضافية...' : 'Entrez une note supplémentaire...'}
                />
              </div>
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} justify-end mt-6`}>
              <button
                onClick={() => setShowConfirmerModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleConfirmer}
                disabled={isProcessing || nombreBetesRecues < 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? (isRTL ? 'جاري التأكيد...' : 'Confirmation...') : (isRTL ? 'تأكيد' : 'Confirmer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'annulation */}
      {showAnnulerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">
              {isRTL ? 'إلغاء الاستقبال' : 'Annuler la réception'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {isRTL ? 'سبب الإلغاء:' : 'Motif d\'annulation:'}
                </label>
                <textarea
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                  rows={3}
                  placeholder={isRTL ? 'أدخل سبب الإلغاء...' : 'Entrez le motif d\'annulation...'}
                />
              </div>
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} justify-end mt-6`}>
              <button
                onClick={() => setShowAnnulerModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleAnnuler}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? (isRTL ? 'جاري الإلغاء...' : 'Annulation...') : (isRTL ? 'إلغاء' : 'Annuler')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}