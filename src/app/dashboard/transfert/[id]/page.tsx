'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  Calendar,
  User,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
  Hash,
  Weight,
  Users,
  Eye,
  Printer,
  Download,
  Truck,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import { useTransfert, useConfirmerReceptionDetaillee } from '@/lib/hooks/useTransferts';
import { Transfert } from '@/lib/api/transfertService';

const TransfertDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  const transfertId = params?.id ? parseInt(params.id as string) : null;
  const isRTL = currentLocale === 'ar';

  // État local
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  
  // État pour la réception détaillée
  const [receivedBetesCount, setReceivedBetesCount] = useState(0);
  const [missingBetesNumbers, setMissingBetesNumbers] = useState<string[]>([]);
  const [newMissingBeteNumber, setNewMissingBeteNumber] = useState('');
  const [step, setStep] = useState<'count' | 'missing' | 'confirm'>('count');

  // Hooks API
  const { 
    data: transfert, 
    isLoading: loading, 
    error, 
    refetch 
  } = useTransfert(transfertId!);

  const confirmerReceptionMutation = useConfirmerReceptionDetaillee();

  // Vérifier si l'utilisateur peut confirmer la réception
  // user.abattoir peut être soit un ID numérique, soit un objet avec une propriété id
  const userAbattoirId = typeof user?.abattoir === 'number' ? user.abattoir : user?.abattoir?.id;
  const destinataireId = transfert?.abattoir_destinataire?.id;
  
  const canConfirmReception = user && transfert && 
    user.abattoir && 
    userAbattoirId && 
    destinataireId &&
    userAbattoirId === destinataireId && 
    transfert.statut === 'EN_COURS';


  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'EN_COURS': { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/40', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        border: 'border-yellow-200 dark:border-yellow-700',
        label: isRTL ? 'قيد التنفيذ' : 'En cours',
        icon: Clock
      },
      'LIVRE': { 
        bg: 'bg-green-100 dark:bg-green-900/40', 
        text: 'text-green-800 dark:text-green-200', 
        border: 'border-green-200 dark:border-green-700',
        label: isRTL ? 'تم التسليم' : 'Livré',
        icon: CheckCircle
      },
      'ANNULE': { 
        bg: 'bg-red-100 dark:bg-red-900/40', 
        text: 'text-red-800 dark:text-red-200', 
        border: 'border-red-200 dark:border-red-700',
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['EN_COURS'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {config.label}
      </span>
    );
  };

  // Fonctions pour gérer la réception détaillée
  const addMissingBete = () => {
    if (newMissingBeteNumber.trim() && !missingBetesNumbers.includes(newMissingBeteNumber.trim())) {
      setMissingBetesNumbers([...missingBetesNumbers, newMissingBeteNumber.trim()]);
      setNewMissingBeteNumber('');
    }
  };

  const removeMissingBete = (beteNumber: string) => {
    setMissingBetesNumbers(missingBetesNumbers.filter(num => num !== beteNumber));
  };

  const resetModal = () => {
    setShowConfirmModal(false);
    setConfirmText('');
    setReceivedBetesCount(0);
    setMissingBetesNumbers([]);
    setNewMissingBeteNumber('');
    setStep('count');
  };

  const handleConfirmReception = async () => {
    if (!transfert) return;

    if (confirmText !== 'CONFIRMER') {
      toast.error(isRTL ? 'يرجى كتابة "CONFIRMER" للتأكيد' : 'Veuillez taper "CONFIRMER" pour confirmer');
      return;
    }

    setIsConfirming(true);
    try {
      // Préparer les données de réception détaillée
      const betesRecues = transfert.betes.filter(bete => !missingBetesNumbers.includes(bete.num_boucle));
      
      // Vérifier que le nombre de bêtes reçues correspond au nombre déclaré
      if (betesRecues.length !== receivedBetesCount) {
        toast.error(isRTL 
          ? `عدد البهائم المستلمة (${betesRecues.length}) لا يتطابق مع العدد المعلن (${receivedBetesCount})`
          : `Le nombre de bêtes reçues (${betesRecues.length}) ne correspond pas au nombre déclaré (${receivedBetesCount})`
        );
        setIsConfirming(false);
        return;
      }
      
      const receptionData = {
        received_count: receivedBetesCount,
        missing_betes: missingBetesNumbers,
        received_betes: betesRecues.map(bete => bete.id)
      };

      // Appeler l'API avec les données détaillées
      await confirmerReceptionMutation.mutateAsync({
        id: transfert.id,
        data: receptionData
      });
      
      resetModal();
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la confirmation:', error);
      // L'erreur est déjà gérée dans le hook
    } finally {
      setIsConfirming(false);
    }
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

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error.message || 'Erreur lors du chargement'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transfert) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{isRTL ? 'النقل غير موجود' : 'Transfert non trouvé'}</p>
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
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <ArrowRightLeft className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? 'تفاصيل النقل' : 'Détails du transfert'}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {transfert.numero_transfert}
                  </p>
                </div>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                {canConfirmReception && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 rounded-lg flex items-center bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تأكيد الاستلام' : 'Confirmer la réception'}
                  </button>
                )}
                {!canConfirmReception && user && transfert && user.abattoir && transfert.statut === 'EN_COURS' && (
                  <div className="px-4 py-2 rounded-lg flex items-center bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                    <AlertCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-sm">
                      {isRTL 
                        ? `يمكن فقط لمستخدمي ${transfert.abattoir_destinataire.nom} تأكيد الاستلام`
                        : `Seuls les utilisateurs de ${transfert.abattoir_destinataire.nom} peuvent confirmer la réception`
                      }
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary"
                >
                  <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'طباعة' : 'Imprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte principale */}
            <div className="lg:col-span-2">
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-6`}>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                    <ArrowRightLeft className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                      {isRTL ? 'معلومات النقل' : 'Informations du transfert'}
                    </h2>
                    <p className="theme-text-secondary theme-transition">
                      {transfert.numero_transfert}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Abattoir expéditeur */}
                  <div className="space-y-4">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium theme-text-primary theme-transition">
                        {isRTL ? 'المجزر المصدر' : 'Abattoir expéditeur'}
                      </h3>
                    </div>
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 theme-text-secondary" />
                        <span className="font-medium theme-text-primary theme-transition">
                          {transfert.abattoir_expediteur.nom}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 theme-text-secondary" />
                        <span className="theme-text-secondary theme-transition">
                          {transfert.abattoir_expediteur.commune}, {transfert.abattoir_expediteur.wilaya}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Abattoir destinataire */}
                  <div className="space-y-4">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <Package className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium theme-text-primary theme-transition">
                        {isRTL ? 'المجزر الوجهة' : 'Abattoir destinataire'}
                      </h3>
                    </div>
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 theme-text-secondary" />
                        <span className="font-medium theme-text-primary theme-transition">
                          {transfert.abattoir_destinataire.nom}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 theme-text-secondary" />
                        <span className="theme-text-secondary theme-transition">
                          {transfert.abattoir_destinataire.commune}, {transfert.abattoir_destinataire.wilaya}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte de statut */}
            <div>
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
                <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
                  {isRTL ? 'حالة النقل' : 'Statut du transfert'}
                </h3>
                <div className="space-y-4">
                  <div>
                    {getStatusBadge(transfert.statut)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 theme-text-secondary" />
                      <span className="text-sm theme-text-secondary theme-transition">
                        {isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'} {formatDate(transfert.date_creation)}
                      </span>
                    </div>
                    {transfert.date_livraison && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm theme-text-secondary theme-transition">
                          {isRTL ? 'تاريخ التسليم:' : 'Date de livraison:'} {formatDate(transfert.date_livraison)}
                        </span>
                      </div>
                    )}
                    {transfert.date_annulation && (
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm theme-text-secondary theme-transition">
                          {isRTL ? 'تاريخ الإلغاء:' : 'Date d\'annulation:'} {formatDate(transfert.date_annulation)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations sur les bêtes */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-6`}>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'البهائم المنقولة' : 'Bêtes transférées'}
                </h2>
                <p className="theme-text-secondary theme-transition">
                  {transfert.nombre_betes} {isRTL ? 'رأس' : 'têtes'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y theme-border-secondary theme-transition">
                <thead className="theme-bg-secondary theme-transition">
                  <tr>
                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                      {isRTL ? 'رقم التعريف' : 'N° Identification'}
                    </th>
                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                      {isRTL ? 'النوع' : 'Espèce'}
                    </th>
                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                      {isRTL ? 'الجنس' : 'Sexe'}
                    </th>
                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                      {isRTL ? 'الوزن (kg)' : 'Poids (kg)'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {transfert.betes.map((bete) => (
                    <tr key={bete.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 theme-text-secondary mr-2" />
                          <span className="text-sm font-medium theme-text-primary theme-transition">
                            {bete.num_boucle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-primary theme-transition">
                          {bete.espece_nom}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-primary theme-transition">
                          {bete.sexe}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Weight className="h-4 w-4 theme-text-secondary mr-2" />
                          <span className="text-sm theme-text-primary theme-transition">
                            {bete.poids_vif} kg
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informations sur les utilisateurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Créateur */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-4`}>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'أنشأ بواسطة' : 'Créé par'}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 theme-text-secondary" />
                  <span className="font-medium theme-text-primary theme-transition">
                    {transfert.cree_par.nom}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm theme-text-secondary theme-transition">
                    @{transfert.cree_par.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Validateur */}
            {transfert.valide_par && (
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-4`}>
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold theme-text-primary theme-transition">
                    {isRTL ? 'تم التحقق بواسطة' : 'Validé par'}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 theme-text-secondary" />
                    <span className="font-medium theme-text-primary theme-transition">
                      {transfert.valide_par.nom}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm theme-text-secondary theme-transition">
                      @{transfert.valide_par.username}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          {transfert.note && (
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-4`}>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'ملاحظة' : 'Note'}
                </h3>
              </div>
              <p className="theme-text-primary theme-transition">
                {transfert.note}
              </p>
            </div>
          )}

          {/* Informations sur les permissions */}
          {user && transfert && (
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6 theme-transition">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} mb-4`}>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'معلومات الصلاحيات' : 'Informations sur les permissions'}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="theme-text-secondary theme-transition">
                    {isRTL ? 'المجزر الخاص بك:' : 'Votre abattoir:'}
                  </span>
                  <span className="font-medium theme-text-primary theme-transition">
                    {user.abattoir ? user.abattoir.nom : (isRTL ? 'غير محدد' : 'Non défini')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="theme-text-secondary theme-transition">
                    {isRTL ? 'المجزر الوجهة:' : 'Abattoir destinataire:'}
                  </span>
                  <span className="font-medium theme-text-primary theme-transition">
                    {transfert.abattoir_destinataire.nom}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="theme-text-secondary theme-transition">
                    {isRTL ? 'يمكنك تأكيد الاستلام:' : 'Vous pouvez confirmer la réception:'}
                  </span>
                  <span className={`font-medium ${canConfirmReception ? 'text-green-600' : 'text-red-600'}`}>
                    {canConfirmReception ? (isRTL ? 'نعم' : 'Oui') : (isRTL ? 'لا' : 'Non')}
                  </span>
                </div>
                
                
                {!canConfirmReception && user.abattoir && transfert.statut === 'EN_COURS' && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {isRTL 
                        ? `لا يمكنك تأكيد استلام هذا النقل لأنك تنتمي إلى ${user.abattoir.nom} وليس إلى ${transfert.abattoir_destinataire.nom}`
                        : `Vous ne pouvez pas confirmer la réception de ce transfert car vous appartenez à ${user.abattoir.nom} et non à ${transfert.abattoir_destinataire.nom}`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmation de réception détaillée */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-xl font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'تأكيد استلام النقل' : 'Confirmer la réception'}
                </h3>
                <button
                  onClick={resetModal}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <XCircle className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              {/* Étape 1: Compter les bêtes reçues */}
              {step === 'count' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {isRTL ? 'الخطوة 1: عد البهائم المستلمة' : 'Étape 1: Compter les bêtes reçues'}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {isRTL 
                            ? `عدد البهائم في النقل: ${transfert.nombre_betes}`
                            : `Nombre de bêtes dans le transfert: ${transfert.nombre_betes}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'كم عدد البهائم التي استلمتها فعلياً؟' : 'Combien de bêtes avez-vous réellement reçues ?'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={transfert.nombre_betes}
                      value={receivedBetesCount}
                      onChange={(e) => setReceivedBetesCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-secondary theme-border-primary theme-text-primary theme-transition"
                      placeholder="0"
                    />
                    {receivedBetesCount < transfert.nombre_betes && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                        {isRTL 
                          ? `⚠️ عدد أقل من المتوقع. ${transfert.nombre_betes - receivedBetesCount} بهيمة مفقودة.`
                          : `⚠️ Nombre inférieur à celui attendu. ${transfert.nombre_betes - receivedBetesCount} bêtes manquantes.`
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={resetModal}
                      className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isRTL ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      onClick={() => {
                        if (receivedBetesCount < transfert.nombre_betes) {
                          setStep('missing');
                        } else {
                          setStep('confirm');
                        }
                      }}
                      disabled={receivedBetesCount === 0}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRTL ? 'التالي' : 'Suivant'}
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2: Identifier les bêtes manquantes */}
              {step === 'missing' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          {isRTL ? 'الخطوة 2: تحديد البهائم المفقودة' : 'Étape 2: Identifier les bêtes manquantes'}
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          {isRTL 
                            ? `يرجى إدخال أرقام الحلقات للبهائم المفقودة (${transfert.nombre_betes - receivedBetesCount} بهيمة)`
                            : `Veuillez entrer les numéros de boucles des bêtes manquantes (${transfert.nombre_betes - receivedBetesCount} bêtes)`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'رقم الحلقة للبهيمة المفقودة:' : 'Numéro de boucle de la bête manquante:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMissingBeteNumber}
                        onChange={(e) => setNewMissingBeteNumber(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 theme-bg-secondary theme-border-primary theme-text-primary theme-transition"
                        placeholder={isRTL ? 'مثال: DZ-ALG-2025-1-001171' : 'Ex: DZ-ALG-2025-1-001171'}
                        onKeyPress={(e) => e.key === 'Enter' && addMissingBete()}
                      />
                      <button
                        onClick={addMissingBete}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg theme-transition"
                      >
                        {isRTL ? 'إضافة' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                  
                  {missingBetesNumbers.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium theme-text-primary mb-2">
                        {isRTL ? 'البهائم المفقودة:' : 'Bêtes manquantes:'}
                      </h5>
                      <div className="space-y-2">
                        {missingBetesNumbers.map((beteNumber, index) => (
                          <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <span className="text-sm font-mono theme-text-primary">{beteNumber}</span>
                            <button
                              onClick={() => removeMissingBete(beteNumber)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => setStep('count')}
                      className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isRTL ? 'السابق' : 'Précédent'}
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      {isRTL ? 'التالي' : 'Suivant'}
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3: Confirmation finale */}
              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                          {isRTL ? 'الخطوة 3: تأكيد نهائي' : 'Étape 3: Confirmation finale'}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {isRTL 
                            ? 'يرجى مراجعة المعلومات قبل التأكيد النهائي'
                            : 'Veuillez vérifier les informations avant la confirmation finale'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                        <div className="text-sm theme-text-secondary">
                          {isRTL ? 'عدد البهائم في النقل:' : 'Bêtes dans le transfert:'}
                        </div>
                        <div className="text-lg font-semibold theme-text-primary">
                          {transfert.nombre_betes}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="text-sm theme-text-secondary">
                          {isRTL ? 'عدد البهائم المستلمة:' : 'Bêtes reçues:'}
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {receivedBetesCount}
                        </div>
                      </div>
                    </div>
                    
                    {missingBetesNumbers.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <div className="text-sm theme-text-secondary mb-2">
                          {isRTL ? 'البهائم المفقودة:' : 'Bêtes manquantes:'}
                        </div>
                        <div className="text-sm font-mono theme-text-primary">
                          {missingBetesNumbers.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'اكتب "CONFIRMER" للتأكيد النهائي:' : 'Tapez "CONFIRMER" pour la confirmation finale:'}
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 theme-bg-secondary theme-border-primary theme-text-primary theme-transition"
                      placeholder="CONFIRMER"
                    />
                  </div>
                  
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => setStep('missing')}
                      className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isRTL ? 'السابق' : 'Précédent'}
                    </button>
                    <button
                      onClick={handleConfirmReception}
                      disabled={isConfirming || confirmText !== 'CONFIRMER'}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isRTL ? 'جاري التأكيد...' : 'Confirmation...'}
                        </div>
                      ) : (
                        isRTL ? 'تأكيد الاستلام' : 'Confirmer la réception'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransfertDetailPage;
