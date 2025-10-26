'use client';

import React, { useState } from 'react';
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
  Plus,
  Eye,
  RefreshCw,
  Activity,
  FileText,
  Hash,
  Building2,
  Users
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTransfert, useMettreEnLivraisonTransfert, useLivrerTransfert, useAnnulerTransfert } from '@/lib/hooks/useTransferts';
import { Transfert } from '@/lib/api/transfertService';
import Tabs from '@/components/ui/Tabs';

export default function TransfertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';
  const transfertId = parseInt(params.id as string);

  // Hooks pour les données et actions
  const { data: transfert, isLoading: loading, error, refetch } = useTransfert(transfertId);
  const mettreEnLivraisonMutation = useMettreEnLivraisonTransfert();
  const livrerMutation = useLivrerTransfert();
  const annulerMutation = useAnnulerTransfert();

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

  const handleMettreEnLivraison = async () => {
    try {
      setIsProcessing(true);
      await mettreEnLivraisonMutation.mutateAsync(transfertId);
      setSuccessMessage('Transfert mis en livraison avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Erreur lors de la mise en livraison du transfert');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLivrer = async () => {
    try {
      setIsProcessing(true);
      await livrerMutation.mutateAsync({ id: transfertId });
      setSuccessMessage('Transfert livré avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Erreur lors de la livraison du transfert');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnnuler = async () => {
    try {
      setIsProcessing(true);
      await annulerMutation.mutateAsync({ 
        id: transfertId, 
        data: { motif_annulation: motifAnnulation } 
      });
      setSuccessMessage('Transfert annulé avec succès');
      setShowAnnulerModal(false);
      setMotifAnnulation('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Erreur lors de l\'annulation du transfert');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'EN_COURS': { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'قيد المعالجة' : 'En cours',
        icon: Activity
      },
      'EN_LIVRAISON': { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'في الطريق' : 'En livraison',
        icon: Truck
      },
      'LIVRE': { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'تم التسليم' : 'Livré',
        icon: CheckCircle
      },
      'ANNULE': { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['EN_COURS'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
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

  if (error || !transfert) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {error?.message || 'Transfert non trouvé'}
              </h3>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isRTL ? 'العودة' : 'Retour'}
              </button>
            </div>
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
                <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات النقل' : 'Informations du transfert'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'رقم النقل:' : 'Numéro:'}</span>
                  <span className="text-sm font-medium theme-text-primary">{transfert.numero_transfert}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(transfert.statut)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'عدد الماشية:' : 'Nombre de bêtes:'}</span>
                  <span className="text-sm font-medium theme-text-primary">
                    {transfert.nombre_betes_actuelles} / {transfert.nombre_betes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                  <span className="text-sm theme-text-primary">{formatDate(transfert.date_creation)}</span>
                </div>
                {transfert.date_livraison && (
                  <div className="flex justify-between">
                    <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ التسليم:' : 'Date de livraison:'}</span>
                    <span className="text-sm theme-text-primary">{formatDate(transfert.date_livraison)}</span>
                  </div>
                )}
                {transfert.date_annulation && (
                  <div className="flex justify-between">
                    <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإلغاء:' : 'Date d\'annulation:'}</span>
                    <span className="text-sm theme-text-primary">{formatDate(transfert.date_annulation)}</span>
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
                  <p className="text-sm theme-text-primary ml-6">{transfert.abattoir_expediteur.nom}</p>
                  <p className="text-xs theme-text-secondary ml-6">
                    {transfert.abattoir_expediteur.wilaya}, {transfert.abattoir_expediteur.commune}
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'المجزر المستقبل' : 'Abattoir destinataire'}
                    </span>
                  </div>
                  <p className="text-sm theme-text-primary ml-6">{transfert.abattoir_destinataire.nom}</p>
                  <p className="text-xs theme-text-secondary ml-6">
                    {transfert.abattoir_destinataire.wilaya}, {transfert.abattoir_destinataire.commune}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bêtes du transfert */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الماشية' : 'Bêtes du transfert'}
              <span className="ml-2 text-sm theme-text-secondary">({transfert.betes?.length || 0} {isRTL ? 'رأس' : 'bêtes'})</span>
            </h3>
            
            {transfert.betes && transfert.betes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfert.betes.map((transfertBete) => (
                  <div key={transfertBete.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium theme-text-primary">
                        {transfertBete.bete?.num_boucle || 'N/A'}
                      </span>
                      <span className="text-xs theme-text-secondary">
                        {transfertBete.bete?.poids_vif || 'N/A'} kg
                      </span>
                    </div>
                    <div className="text-xs theme-text-secondary">
                      {transfertBete.bete?.espece_nom || 'N/A'} - {transfertBete.bete?.sexe || 'N/A'}
                    </div>
                    <div className="text-xs theme-text-tertiary mt-1">
                      {isRTL ? 'أضيف بواسطة:' : 'Ajouté par:'} {transfertBete.ajoute_par?.nom || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
                <p className="text-sm theme-text-secondary">
                  {isRTL ? 'لا توجد ماشية في هذا النقل' : 'Aucune bête dans ce transfert'}
                </p>
              </div>
            )}
          </div>

          {/* Notes et motif */}
          {(transfert.motif || transfert.notes) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'الملاحظات' : 'Notes et informations'}
              </h3>
              <div className="space-y-3">
                {transfert.motif && (
                  <div>
                    <label className="text-sm font-medium theme-text-tertiary">
                      {isRTL ? 'السبب:' : 'Motif:'}
                    </label>
                    <p className="text-sm theme-text-primary mt-1">{transfert.motif}</p>
                  </div>
                )}
                {transfert.notes && (
                  <div>
                    <label className="text-sm font-medium theme-text-tertiary">
                      {isRTL ? 'ملاحظات:' : 'Notes:'}
                    </label>
                    <p className="text-sm theme-text-primary mt-1">{transfert.notes}</p>
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
      label: isRTL ? 'المستخدمون' : 'Utilisateurs',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المستخدمون المسؤولون' : 'Utilisateurs responsables'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <User className={`h-4 w-4 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-sm font-medium theme-text-primary">
                    {isRTL ? 'أنشأ بواسطة:' : 'Créé par:'}
                  </span>
                </div>
                <span className="text-sm theme-text-primary">{transfert.cree_par.nom}</span>
              </div>
              
              {transfert.valide_par && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'تم التحقق بواسطة:' : 'Validé par:'}
                    </span>
                  </div>
                  <span className="text-sm theme-text-primary">{transfert.valide_par.nom}</span>
                </div>
              )}
              
              {transfert.annule_par && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className={`h-4 w-4 text-red-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm font-medium theme-text-primary">
                      {isRTL ? 'تم الإلغاء بواسطة:' : 'Annulé par:'}
                    </span>
                  </div>
                  <span className="text-sm theme-text-primary">{transfert.annule_par.nom}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations d'annulation détaillées */}
          {transfert.statut === 'ANNULE' && transfert.annule_par && (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
                <XCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تفاصيل الإلغاء' : 'Détails de l\'annulation'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {isRTL ? 'ألغاه:' : 'Annulé par:'}
                  </span>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {transfert.annule_par.nom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {isRTL ? 'تاريخ الإلغاء:' : 'Date d\'annulation:'}
                  </span>
                  <span className="text-sm text-red-800 dark:text-red-200">
                    {formatDate(transfert.date_annulation || '')}
                  </span>
                </div>
                {transfert.notes && transfert.notes.includes('Annulation:') && (
                  <div>
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {isRTL ? 'سبب الإلغاء:' : 'Motif d\'annulation:'}
                    </span>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {transfert.notes.split('Annulation:')[1]?.trim() || 'Non spécifié'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'reception',
      label: isRTL ? 'الاستقبال' : 'Réception',
      content: transfert.reception ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <CheckCircle className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الاستقبال المرتبط' : 'Réception associée'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm theme-text-tertiary">{isRTL ? 'رقم الاستقبال:' : 'Numéro de réception:'}</span>
                <span className="text-sm font-medium theme-text-primary">{transfert.reception.numero_reception}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm theme-text-tertiary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                <span className="text-sm theme-text-primary">{transfert.reception.statut_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm theme-text-tertiary">{isRTL ? 'الماشية المستلمة:' : 'Bêtes reçues:'}</span>
                <span className="text-sm theme-text-primary">
                  {transfert.reception.nombre_betes_recues} / {transfert.reception.nombre_betes_attendues}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm theme-text-tertiary">{isRTL ? 'معدل الاستقبال:' : 'Taux de réception:'}</span>
                <span className="text-sm theme-text-primary">{transfert.reception.taux_reception}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                <span className="text-sm theme-text-primary">{formatDate(transfert.reception.date_creation)}</span>
              </div>
              {transfert.reception.date_reception && (
                <div className="flex justify-between">
                  <span className="text-sm theme-text-tertiary">{isRTL ? 'تاريخ الاستقبال:' : 'Date de réception:'}</span>
                  <span className="text-sm theme-text-primary">{formatDate(transfert.reception.date_reception)}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => transfert.reception && router.push(`/dashboard/reception/${transfert.reception.id}`)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'عرض الاستقبال' : 'Voir la réception'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
          <h3 className="text-lg font-medium mb-2 theme-text-primary">
            {isRTL ? 'لا يوجد استقبال مرتبط' : 'Aucune réception associée'}
          </h3>
          <p className="theme-text-secondary">
            {isRTL ? 'هذا النقل لا يحتوي على استقبال مرتبط' : 'Ce transfert n\'a pas de réception associée'}
          </p>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <button 
                  onClick={() => router.back()}
                  className="p-2 rounded-lg theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Truck className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {transfert.numero_transfert}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {isRTL ? 'تفاصيل النقل' : 'Détails du transfert'}
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
                {getStatusBadge(transfert.statut)}
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
        {(transfert.peut_etre_livre || transfert.peut_etre_annule || transfert.statut === 'EN_COURS') ? (
          <div className="px-6 py-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'الإجراءات المتاحة' : 'Actions disponibles'}
              </h3>
              <div className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                {transfert.statut === 'EN_COURS' && transfert.est_complet && (
                  <button
                    onClick={handleMettreEnLivraison}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    <Truck className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'بدء التسليم' : 'Mettre en livraison'}
                  </button>
                )}
                {transfert.statut === 'EN_LIVRAISON' && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center">
                      <Truck className={`h-5 w-5 text-orange-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span className="text-orange-800 dark:text-orange-200 font-medium">
                        {isRTL ? 'النقل في الطريق' : 'Transfert en cours de livraison'}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      {isRTL ? 'يجب على المجزر المستقبل تأكيد الاستقبال' : 'L\'abattoir destinataire doit confirmer la réception'}
                    </p>
                  </div>
                )}
                {transfert.peut_etre_annule && transfert.statut === 'EN_COURS' && (
                  <button
                    onClick={() => setShowAnnulerModal(true)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إلغاء النقل' : 'Annuler le transfert'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Contenu principal avec onglets */}
        <div className="px-6 py-6">
          <Tabs tabs={tabs} />
        </div>

        {/* Modal d'annulation */}
        {showAnnulerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold theme-text-primary mb-4">
                {isRTL ? 'إلغاء النقل' : 'Annuler le transfert'}
              </h3>
              <p className="text-sm theme-text-secondary mb-4">
                {isRTL ? 'هل أنت متأكد من إلغاء هذا النقل؟ يمكنك إضافة سبب الإلغاء أدناه.' : 'Êtes-vous sûr de vouloir annuler ce transfert ? Vous pouvez ajouter un motif d\'annulation ci-dessous.'}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  {isRTL ? 'سبب الإلغاء (اختياري):' : 'Motif d\'annulation (optionnel):'}
                </label>
                <textarea
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                  rows={3}
                  placeholder={isRTL ? 'أدخل سبب الإلغاء...' : 'Entrez le motif d\'annulation...'}
                />
              </div>
              <div className={`flex ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} justify-end`}>
                <button
                  onClick={() => {
                    setShowAnnulerModal(false);
                    setMotifAnnulation('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg theme-text-primary hover:theme-bg-secondary"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleAnnuler}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? (isRTL ? 'جاري الإلغاء...' : 'Annulation...') : (isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
