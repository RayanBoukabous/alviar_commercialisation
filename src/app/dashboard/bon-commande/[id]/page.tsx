'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Printer, 
  FileText,
  Building2,
  User,
  Package,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
  Download,
  Share2,
  Copy,
  History,
  Settings,
  Shield,
  Truck,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  useBonDeCommandeDetails,
  useUpdateBonDeCommande,
  useUpdateBonStatus,
  useAnnulerBon,
  useDeleteBonDeCommande
} from '@/lib/hooks/useBonsCommande';
import { BonDeCommande } from '@/lib/api/bonCommandeService';
import toast from 'react-hot-toast';

export default function BonCommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  const bonId = parseInt(params.id as string);
  const isRTL = currentLocale === 'ar';
  
  // État local
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [originalData, setOriginalData] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hooks API
  const { 
    data: bon, 
    isLoading: loading, 
    error, 
    refetch 
  } = useBonDeCommandeDetails(bonId);

  const updateBonMutation = useUpdateBonDeCommande();
  const updateStatusMutation = useUpdateBonStatus();
  const annulerBonMutation = useAnnulerBon();
  const deleteBonMutation = useDeleteBonDeCommande();

  // Initialiser les données du formulaire
  useEffect(() => {
    if (bon) {
      const initialData = {
        type_quantite: bon.type_quantite,
        quantite: bon.quantite,
        type_bete: bon.type_bete,
        type_produit: bon.type_produit,
        avec_cinquieme_quartier: bon.avec_cinquieme_quartier,
        source: bon.source,
        abattoir: bon.abattoir,
        client: bon.client,
        notes: bon.notes,
        versement: bon.versement,
        date_livraison_prevue: bon.date_livraison_prevue,
        statut: bon.statut
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [bon]);

  // Fonctions utilitaires
  const formatDate = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'Non défini';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-DZ' : 'fr-FR');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return isRTL ? 'غير محدد' : 'Non défini';
    return `${amount.toLocaleString()} DA`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'BROUILLON': { 
        label: isRTL ? 'مسودة' : 'Brouillon', 
        bg: 'bg-gray-200 dark:bg-gray-900/50',
        text: 'text-gray-900 dark:text-gray-100',
        border: 'border-gray-300 dark:border-gray-700',
        icon: FileText
      },
      'CONFIRME': { 
        label: isRTL ? 'مؤكد' : 'Confirmé', 
        bg: 'bg-blue-200 dark:bg-blue-900/50',
        text: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-300 dark:border-blue-700',
        icon: CheckCircle
      },
      'EN_COURS': { 
        label: isRTL ? 'قيد التنفيذ' : 'En cours', 
        bg: 'bg-yellow-200 dark:bg-yellow-900/50',
        text: 'text-yellow-900 dark:text-yellow-100',
        border: 'border-yellow-300 dark:border-yellow-700',
        icon: Clock
      },
      'LIVRE': { 
        label: isRTL ? 'تم التسليم' : 'Livré', 
        bg: 'bg-green-200 dark:bg-green-900/50',
        text: 'text-green-900 dark:text-green-100',
        border: 'border-green-300 dark:border-green-700',
        icon: Truck
      },
      'ANNULE': { 
        label: isRTL ? 'ملغي' : 'Annulé', 
        bg: 'bg-red-200 dark:bg-red-900/50',
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-300 dark:border-red-700',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['BROUILLON'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };


  const getSourceBadge = (source: string) => {
    const isProduction = source === 'PRODUCTION';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isProduction 
          ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700'
          : 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700'
      }`}>
        <Building2 className="w-3 h-3 mr-1" />
        {isProduction ? (isRTL ? 'إنتاج' : 'Production') : (isRTL ? 'مسلخ' : 'Abattoir')}
      </span>
    );
  };

  // Gestion des actions
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!bon) return;

    setIsSaving(true);
    try {
      // Préparer les données à envoyer (seulement les champs modifiés)
      const updateData: any = {};
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          updateData[key] = formData[key];
        }
      });

      if (Object.keys(updateData).length > 0) {
        await updateBonMutation.mutateAsync({ id: bon.id, data: updateData });
        toast.success(isRTL ? 'تم تحديث طلب الشراء بنجاح' : 'Bon de commande mis à jour avec succès');
        setOriginalData(formData);
        refetch();
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في التحديث' : 'Erreur lors de la mise à jour'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmBon = async () => {
    if (!bon) return;

    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({ id: bon.id, statut: 'CONFIRME' });
      toast.success(isRTL ? 'تم تأكيد الطلب بنجاح' : 'Bon de commande confirmé avec succès');
      setShowConfirmModal(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la confirmation:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في التأكيد' : 'Erreur lors de la confirmation'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartBon = async () => {
    if (!bon) return;

    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({ id: bon.id, statut: 'EN_COURS' });
      toast.success(isRTL ? 'تم بدء تنفيذ الطلب بنجاح' : 'Bon de commande mis en cours avec succès');
      setShowStartModal(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la mise en cours:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في بدء التنفيذ' : 'Erreur lors de la mise en cours'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeliverBon = async () => {
    if (!bon) return;

    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({ id: bon.id, statut: 'LIVRE' });
      toast.success(isRTL ? 'تم تسليم الطلب بنجاح' : 'Bon de commande livré avec succès');
      setShowDeliverModal(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la livraison:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في التسليم' : 'Erreur lors de la livraison'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!bon) return;

    try {
      await updateStatusMutation.mutateAsync({ id: bon.id, statut: status });
      toast.success(isRTL ? 'تم تحديث الحالة بنجاح' : 'Statut mis à jour avec succès');
      setShowStatusModal(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في تحديث الحالة' : 'Erreur lors de la mise à jour du statut'));
    }
  };

  const handleAnnuler = async () => {
    if (!bon) return;

    try {
      await annulerBonMutation.mutateAsync(bon.id);
      toast.success(isRTL ? 'تم إلغاء طلب الشراء' : 'Bon de commande annulé');
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في الإلغاء' : 'Erreur lors de l\'annulation'));
    }
  };

  const handleDelete = async () => {
    if (!bon) return;

    try {
      await deleteBonMutation.mutateAsync(bon.id);
      toast.success(isRTL ? 'تم حذف طلب الشراء' : 'Bon de commande supprimé');
      router.push('/dashboard/bon-commande');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.detail || (isRTL ? 'خطأ في الحذف' : 'Erreur lors de la suppression'));
    }
  };

  const handlePrint = () => {
    // Ajouter une classe pour forcer l'impression
    document.body.classList.add('printing');
    window.print();
    // Retirer la classe après impression
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 1000);
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 theme-bg-elevated rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="h-64 theme-bg-elevated rounded-lg"></div>
                  <div className="h-32 theme-bg-elevated rounded-lg"></div>
                  <div className="h-48 theme-bg-elevated rounded-lg"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 theme-bg-elevated rounded-lg"></div>
                  <div className="h-32 theme-bg-elevated rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold theme-text-primary mb-2">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || (isRTL ? 'حدث خطأ أثناء تحميل طلب الشراء' : 'Une erreur est survenue lors du chargement du bon de commande')}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!bon) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold theme-text-primary mb-2">
              {isRTL ? 'طلب شراء غير موجود' : 'Bon de commande introuvable'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isRTL ? 'طلب الشراء المطلوب غير موجود أو تم حذفه' : 'Le bon de commande demandé n\'existe pas ou a été supprimé'}
            </p>
            <button
              onClick={() => router.push('/dashboard/bon-commande')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {isRTL ? 'العودة إلى القائمة' : 'Retour à la liste'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Styles d'impression */}
        <style jsx global>{`
          @media print {
            .print\\:hidden { display: none !important; }
            .print\\:block { display: block !important; }
            .print\\:text-black { color: black !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:border-black { border-color: black !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:m-0 { margin: 0 !important; }
            .print\\:text-sm { font-size: 0.875rem !important; }
            .print\\:text-xs { font-size: 0.75rem !important; }
            .print\\:font-bold { font-weight: 700 !important; }
            .print\\:border { border: 1px solid #000 !important; }
            .print\\:border-t { border-top: 1px solid #000 !important; }
            .print\\:border-b { border-bottom: 1px solid #000 !important; }
            .print\\:py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
            .print\\:px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
            .print\\:mb-4 { margin-bottom: 1rem !important; }
            .print\\:mb-6 { margin-bottom: 1.5rem !important; }
            .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .print\\:gap-4 { gap: 1rem !important; }
            .print\\:text-center { text-align: center !important; }
            .print\\:text-right { text-align: right !important; }
            .print\\:w-full { width: 100% !important; }
            .print\\:h-auto { height: auto !important; }
            .print\\:max-w-none { max-width: none !important; }
            .print\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
            .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
            .print\\:break-inside-avoid { break-inside: avoid !important; }
            .print\\:page-break-before { page-break-before: always !important; }
            .print\\:page-break-after { page-break-after: always !important; }
            .print\\:page-break-inside-avoid { page-break-inside: avoid !important; }
            
            body { 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .print-header {
              border-bottom: 2px solid #000 !important;
              margin-bottom: 2rem !important;
              padding-bottom: 1rem !important;
            }
            
            .print-section {
              margin-bottom: 1.5rem !important;
              break-inside: avoid !important;
            }
            
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 1rem !important;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #000 !important;
              padding: 0.3rem !important;
              text-align: left !important;
            }
            
            .print-table th {
              background-color: #1f2937 !important;
              color: white !important;
              font-weight: bold !important;
              font-size: 0.5rem !important;
              padding: 0.1rem !important;
            }
            
            .print-table td {
              font-size: 0.5rem !important;
              padding: 0.1rem !important;
              color: black !important;
            }
            
            .print-signature {
              margin-top: 3rem !important;
              display: flex !important;
              justify-content: space-between !important;
            }
            
            .print-signature div {
              width: 45% !important;
              text-align: center !important;
            }
            
            .print-signature-line {
              border-bottom: 1px solid #000 !important;
              height: 2rem !important;
              margin-bottom: 0.5rem !important;
            }
            
            .print-header {
              border-bottom: 3px solid #000 !important;
              margin-bottom: 1.5rem !important;
              padding-bottom: 1rem !important;
            }
            
            .print-section {
              margin-bottom: 1rem !important;
              break-inside: avoid !important;
            }
            
            .print-official {
              font-family: 'Times New Roman', serif !important;
            }
            
            .print-arabic {
              font-family: 'Arial', sans-serif !important;
              direction: rtl !important;
            }
            
            .print-compact {
              margin-bottom: 0.5rem !important;
            }
            
            .print-refined {
              font-size: 0.7rem !important;
              line-height: 1.2 !important;
            }
            
            .print-elegant {
              border: 1px solid #333 !important;
              border-radius: 2px !important;
            }
            
            .print-force-black {
              color: black !important;
            }
            
            .print-force-black * {
              color: black !important;
            }
            
            .print-compact-text {
              font-size: 0.5rem !important;
              line-height: 1.1 !important;
            }
            
            .print-ultra-mini {
              font-size: 0.5rem !important;
              line-height: 1.0 !important;
            }
            
            .print-ultra-mini * {
              font-size: 0.5rem !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className="theme-bg-elevated theme-border-primary border-b theme-transition print:hidden">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard/bon-commande')}
                  className={`flex items-center theme-text-secondary hover:theme-text-primary theme-transition ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'العودة' : 'Retour'}
                </button>
                <div className={`h-6 w-px theme-border-secondary ${isRTL ? 'mr-4' : 'ml-4'}`} />
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
                    <h1 className="text-lg font-semibold theme-text-primary">
                      {isRTL ? 'تفاصيل طلب الشراء' : 'Détails du bon de commande'}
                    </h1>
                    <p className="text-sm theme-text-secondary">
                      {bon.numero_bon}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <>
                    {bon.est_modifiable && (
                      <button
                        onClick={handleEdit}
                        className="flex items-center px-3 py-2 text-sm font-medium theme-text-primary theme-bg-elevated theme-border-primary border rounded-lg hover:theme-bg-secondary theme-transition"
                      >
                        <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تعديل' : 'Modifier'}
                      </button>
                    )}
                    <button
                      onClick={handlePrint}
                      className="flex items-center px-3 py-2 text-sm font-medium theme-text-primary theme-bg-elevated theme-border-primary border rounded-lg hover:theme-bg-secondary theme-transition"
                    >
                      <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'طباعة' : 'Imprimer'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-2 text-sm font-medium theme-text-primary theme-bg-elevated theme-border-primary border rounded-lg hover:theme-bg-secondary theme-transition"
                    >
                      <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed theme-transition"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      )}
                      {isRTL ? 'حفظ' : 'Enregistrer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template d'impression raffiné */}
        <div className="hidden print:block print:max-w-none print:mx-0 print:px-6 print:py-4 print:bg-white">
          {/* En-tête ultra mini */}
          <div className="print-header">
            <div className="text-center mb-1">
              <div className="text-xs font-bold print:text-black mb-0.5 print-arabic" style={{ fontSize: '0.6rem' }}>
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div className="text-xs font-bold print:text-black mb-0.5 print-official" style={{ fontSize: '0.6rem' }}>
                République Algérienne Démocratique et Populaire
              </div>
              <div className="text-xs font-bold print:text-black mb-0.5 print-arabic" style={{ fontSize: '0.6rem' }}>
                وزارة الفلاحة والتنمية الريفية
              </div>
              <div className="text-xs font-bold print:text-black mb-0.5 print-official" style={{ fontSize: '0.6rem' }}>
                Ministère de l'Agriculture et du Développement Rural
              </div>
              
              {/* Logo et titre */}
              <div className="flex justify-center items-center mb-0.5">
                <img 
                  src="/ALVIAR-Logo.svg" 
                  alt="ALVIAR" 
                  className="h-4 w-auto print:h-3"
                />
              </div>
              <h1 className="text-xs font-bold print:text-black mb-0.5" style={{ fontSize: '0.7rem' }}>
                {isRTL ? 'طلب شراء لحوم حمراء' : 'BON DE COMMANDE - VIANDES ROUGES'}
              </h1>
              <div className="text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                {isRTL ? 'نظام إدارة المسالخ واللحوم' : 'Système de Gestion des Abattoirs et Viandes'}
              </div>
            </div>
          </div>

          {/* Informations du bon - Design ultra mini */}
          <div className="print-section">
            <div className="print:flex print:justify-between print:items-start print:mb-1">
              <div className="print:w-1/2">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'معلومات الطلب' : 'INFORMATIONS DU BON DE COMMANDE'}
                </div>
                <div className="print:text-xs print:text-black print-force-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'رقم الطلب:' : 'N° Bon:'}</span>
                    <span style={{ color: 'black' }}>{bon.numero_bon}</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'التاريخ:' : 'Date:'}</span>
                    <span style={{ color: 'black' }}>{formatDate(bon.created_at)}</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                    <span style={{ color: 'black' }}>{bon.statut_display}</span>
                  </div>
                  <div className="print:flex print:justify-between">
                    <span className="print:font-bold">{isRTL ? 'المصدر:' : 'Source:'}</span>
                    <span style={{ color: 'black' }}>{bon.source_display}</span>
                  </div>
                </div>
              </div>
              
              <div className="print:w-1/2 print:pl-4">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'تفاصيل الطلب' : 'DÉTAILS DE LA COMMANDE'}
                </div>
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'نوع الكمية:' : 'Type quantité:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_quantite_display}</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الكمية:' : 'Quantité:'}</span>
                    <span style={{ color: 'black' }}>{bon.quantite} {bon.type_quantite === 'NOMBRE' ? (isRTL ? 'رأس' : 'têtes') : 'kg'}</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'نوع الحيوان:' : 'Type animal:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_bete_display}</span>
                  </div>
                  <div className="print:flex print:justify-between">
                    <span className="print:font-bold">{isRTL ? 'نوع المنتج:' : 'Type produit:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_produit_display}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Client et Abattoir - Design ultra mini */}
          <div className="print-section">
            <div className="print:flex print:justify-between print:items-start print:mb-1">
              <div className="print:w-1/2">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'معلومات العميل' : 'INFORMATIONS CLIENT'}
                </div>
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                    <span style={{ color: 'black' }}>{bon.client_nom}</span>
                  </div>
                  {bon.client_info && (
                    <>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'النوع:' : 'Type:'}</span>
                        <span style={{ color: 'black' }}>{(bon.client_info as any).type_client || 'N/A'}</span>
                      </div>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                        <span style={{ color: 'black' }}>{bon.client_info.telephone}</span>
                      </div>
                      {bon.client_info.email && (
                        <div className="print:flex print:justify-between print:mb-0.5">
                          <span className="print:font-bold">{isRTL ? 'البريد:' : 'Email:'}</span>
                          <span style={{ color: 'black' }}>{bon.client_info.email}</span>
                        </div>
                      )}
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'NIF:' : 'NIF:'}</span>
                        <span style={{ color: 'black' }}>{(bon.client_info as any).nif || 'N/A'}</span>
                      </div>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'NIS:' : 'NIS:'}</span>
                        <span style={{ color: 'black' }}>{(bon.client_info as any).nis || 'N/A'}</span>
                      </div>
                      <div className="print:flex print:justify-between">
                        <span className="print:font-bold">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                        <span style={{ color: 'black' }}>{(bon.client_info as any).adresse || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="print:w-1/2 print:pl-4">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'معلومات المسلخ' : 'INFORMATIONS ABATTOIR'}
                </div>
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                    <span style={{ color: 'black' }}>{bon.abattoir_nom}</span>
                  </div>
                  {bon.abattoir_info && (
                    <>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'الولاية:' : 'Wilaya:'}</span>
                        <span style={{ color: 'black' }}>{bon.abattoir_info.wilaya}</span>
                      </div>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'البلدية:' : 'Commune:'}</span>
                        <span style={{ color: 'black' }}>{bon.abattoir_info.commune}</span>
                      </div>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'NIF:' : 'NIF:'}</span>
                        <span style={{ color: 'black' }}>{(bon.abattoir_info as any).nif || 'N/A'}</span>
                      </div>
                      <div className="print:flex print:justify-between print:mb-0.5">
                        <span className="print:font-bold">{isRTL ? 'NIS:' : 'NIS:'}</span>
                        <span style={{ color: 'black' }}>{(bon.abattoir_info as any).nis || 'N/A'}</span>
                      </div>
                      <div className="print:flex print:justify-between">
                        <span className="print:font-bold">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                        <span style={{ color: 'black' }}>{(bon.abattoir_info as any).adresse || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Prix et Calculs - Design ultra mini */}
          <div className="print-section">
            <div className="print:mb-2">
              <div className="print:text-xs print:font-bold print:text-black print:mb-1" style={{ fontSize: '0.6rem' }}>
                {isRTL ? 'تفاصيل الأسعار والحسابات' : 'DÉTAILS DES PRIX ET CALCULS'}
              </div>
              
              {/* Tableau des prix */}
              <table className="print-table w-full">
                <thead>
                  <tr style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    <th className="print:font-bold print:text-center print:py-1 print:px-2 print:text-xs" style={{ backgroundColor: '#1f2937', color: 'white', fontSize: '0.5rem' }}>
                      {isRTL ? 'الكمية' : 'QTÉ'}
                    </th>
                    <th className="print:font-bold print:text-center print:py-1 print:px-2 print:text-xs" style={{ backgroundColor: '#1f2937', color: 'white', fontSize: '0.5rem' }}>
                      {isRTL ? 'الوحدة' : 'UNITÉ'}
                    </th>
                    <th className="print:font-bold print:text-center print:py-1 print:px-2 print:text-xs" style={{ backgroundColor: '#1f2937', color: 'white', fontSize: '0.5rem' }}>
                      {isRTL ? 'الوصف' : 'DESCRIPTION'}
                    </th>
                    <th className="print:font-bold print:text-center print:py-1 print:px-2 print:text-xs" style={{ backgroundColor: '#1f2937', color: 'white', fontSize: '0.5rem' }}>
                      {isRTL ? 'السعر الوحدة' : 'PRIX UNITAIRE'}
                    </th>
                    <th className="print:font-bold print:text-center print:py-1 print:px-2 print:text-xs" style={{ backgroundColor: '#1f2937', color: 'white', fontSize: '0.5rem' }}>
                      {isRTL ? 'المجموع' : 'TOTAL'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="print:text-center print:py-1 print:px-2 print:text-xs" style={{ color: 'black', fontSize: '0.5rem' }}>
                      {bon.quantite}
                    </td>
                    <td className="print:text-center print:py-1 print:px-2 print:text-xs" style={{ color: 'black', fontSize: '0.5rem' }}>
                      {bon.type_quantite === 'NOMBRE' ? (isRTL ? 'رأس' : 'têtes') : 'kg'}
                    </td>
                    <td className="print:py-1 print:px-2 print:text-xs" style={{ color: 'black', fontSize: '0.5rem' }}>
                      {bon.type_bete_display} - {bon.type_produit_display}
                      {bon.avec_cinquieme_quartier && (isRTL ? ' (مع الأحشاء)' : ' (avec abats)')}
                    </td>
                    <td className="print:text-right print:py-1 print:px-2 print:text-xs" style={{ color: 'black', fontSize: '0.5rem' }}>
                      {bon.type_quantite === 'NOMBRE' ? '2,500 DA' : '180 DA/kg'}
                    </td>
                    <td className="print:text-right print:py-1 print:px-2 print:text-xs print:font-bold" style={{ color: 'black', fontSize: '0.5rem' }}>
                      {bon.type_quantite === 'NOMBRE' 
                        ? `${(bon.quantite * 2500).toLocaleString()} DA`
                        : `${(bon.quantite * 180).toLocaleString()} DA`
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Calculs financiers */}
            <div className="print:flex print:justify-end print:mb-1">
              <div className="print:w-1/3">
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'المجموع الفرعي:' : 'SOUSTOTAL:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_quantite === 'NOMBRE' 
                      ? `${(bon.quantite * 2500).toLocaleString()} DA`
                      : `${(bon.quantite * 180).toLocaleString()} DA`
                    }</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الضريبة:' : 'TAXE:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_quantite === 'NOMBRE' 
                      ? `${(bon.quantite * 2500 * 0.19).toLocaleString()} DA`
                      : `${(bon.quantite * 180 * 0.19).toLocaleString()} DA`
                    }</span>
                  </div>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'النقل والتداول:' : 'TRANSP. & MANUTENTION:'}</span>
                    <span style={{ color: 'black' }}>{bon.type_quantite === 'NOMBRE' 
                      ? `${(bon.quantite * 2500 * 0.05).toLocaleString()} DA`
                      : `${(bon.quantite * 180 * 0.05).toLocaleString()} DA`
                    }</span>
                  </div>
                  <div className="print:flex print:justify-between print:border-t print:border-black print:pt-0.5">
                    <span className="print:font-bold">{isRTL ? 'المجموع الكلي:' : 'TOTAL:'}</span>
                    <span className="print:font-bold" style={{ color: 'black' }}>
                      {bon.type_quantite === 'NOMBRE' 
                        ? `${(bon.quantite * 2500 * 1.24).toLocaleString()} DA`
                        : `${(bon.quantite * 180 * 1.24).toLocaleString()} DA`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Livraison et Paiement - Design ultra mini */}
          <div className="print-section">
            <div className="print:flex print:justify-between print:items-start print:mb-1">
              <div className="print:w-1/2">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'معلومات التسليم' : 'INFORMATIONS DE LIVRAISON'}
                </div>
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'تاريخ التسليم المخطط:' : 'Date livraison prévue:'}</span>
                    <span style={{ color: 'black' }}>{formatDate(bon.date_livraison_prevue)}</span>
                  </div>
                  <div className="print:flex print:justify-between">
                    <span className="print:font-bold">{isRTL ? 'تاريخ التسليم الفعلي:' : 'Date livraison réelle:'}</span>
                    <span style={{ color: 'black' }}>{formatDate(bon.date_livraison_reelle)}</span>
                  </div>
                </div>
              </div>
              
              <div className="print:w-1/2 print:pl-4">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'معلومات الدفع' : 'INFORMATIONS DE PAIEMENT'}
                </div>
                <div className="print:text-xs print:text-black" style={{ fontSize: '0.5rem' }}>
                  <div className="print:flex print:justify-between print:mb-0.5">
                    <span className="print:font-bold">{isRTL ? 'الدفعة المقدمة:' : 'Versement:'}</span>
                    <span className="print:font-bold" style={{ color: 'black' }}>{formatCurrency(bon.versement)}</span>
                  </div>
                  <div className="print:flex print:justify-between">
                    <span className="print:font-bold">{isRTL ? 'طريقة الدفع:' : 'Mode de paiement:'}</span>
                    <span style={{ color: 'black' }}>{isRTL ? 'عند التسليم' : 'À la livraison'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes - Design ultra mini */}
          {bon.notes && (
            <div className="print-section">
              <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                {isRTL ? 'الملاحظات' : 'NOTES'}
              </div>
              <div className="print:text-xs print:text-black print:border print:border-black print:p-1 print:min-h-8" style={{ color: 'black', fontSize: '0.5rem' }}>
                {bon.notes}
              </div>
            </div>
          )}

          {/* Signatures ultra mini */}
          <div className="print-section">
            <div className="print:flex print:justify-between print:items-start print:mt-1">
              <div className="print:w-1/2 print:pr-4">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'توقيع العميل' : 'Signature Client'}
                </div>
                <div className="print:border print:border-black print:p-1 print:h-8 print:mb-0.5">
                  <div className="print:text-xs print:text-black print:mb-0.5" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'الاسم:' : 'Nom:'} ________________
                  </div>
                  <div className="print:text-xs print:text-black" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'التوقيع:' : 'Signature:'} ________________
                  </div>
                </div>
                <div className="print:border print:border-black print:p-1 print:h-4">
                  <div className="print:text-xs print:text-black" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'ختم العميل' : 'Cachet Client'}
                  </div>
                </div>
              </div>
              
              <div className="print:w-1/2 print:pl-4">
                <div className="print:text-xs print:font-bold print:text-black print:mb-0.5" style={{ fontSize: '0.6rem' }}>
                  {isRTL ? 'توقيع المسؤول' : 'Signature Responsable'}
                </div>
                <div className="print:border print:border-black print:p-1 print:h-8 print:mb-0.5">
                  <div className="print:text-xs print:text-black print:mb-0.5" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'الاسم:' : 'Nom:'} ________________
                  </div>
                  <div className="print:text-xs print:text-black" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'التوقيع:' : 'Signature:'} ________________
                  </div>
                </div>
                <div className="print:border print:border-black print:p-1 print:h-4">
                  <div className="print:text-xs print:text-black" style={{ color: 'black', fontSize: '0.5rem' }}>
                    {isRTL ? 'ختم المسلخ' : 'Cachet Abattoir'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page ultra mini */}
          <div className="print:mt-2 print:pt-1 print:border-t print:border-black print:text-center print:text-xs print:text-black">
            <div className="print:mb-0.5">
              <p className="print:font-bold" style={{ color: 'black', fontSize: '0.5rem' }}>
                {isRTL 
                  ? 'هذا المستند رسمي ومعتمد من وزارة الفلاحة والتنمية الريفية'
                  : 'Ce document est officiel et certifié par le Ministère de l\'Agriculture et du Développement Rural'
                }
              </p>
            </div>
            <div className="print:flex print:justify-between print:items-center print:mt-0.5">
              <div className="print:text-left">
                <p className="print:font-bold" style={{ color: 'black', fontSize: '0.5rem' }}>
                  {isRTL ? 'تاريخ الإصدار:' : 'Date d\'émission:'} {formatDate(bon.created_at)}
                </p>
              </div>
              <div className="print:text-center">
                <p className="print:font-bold" style={{ color: 'black', fontSize: '0.5rem' }}>
                  ALVIAR - {isRTL ? 'الجزائر' : 'Algérie'}
                </p>
              </div>
              <div className="print:text-right">
                <p className="print:font-bold" style={{ color: 'black', fontSize: '0.5rem' }}>
                  {isRTL ? 'رقم الوثيقة:' : 'N° Document:'} {bon.numero_bon}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Informations générales */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200 hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h2 className="text-lg font-semibold theme-text-primary flex items-center">
                    <FileText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'المعلومات العامة' : 'Informations générales'}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'رقم طلب الشراء' : 'Numéro de bon'}
                      </label>
                      <div className="text-lg font-mono theme-text-primary theme-bg-secondary px-3 py-2 rounded-lg">
                        {bon.numero_bon}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'الحالة' : 'Statut'}
                      </label>
                      {getStatusBadge(bon.statut)}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'المصدر' : 'Source'}
                      </label>
                      {getSourceBadge(bon.source)}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                      </label>
                      <div className="theme-text-primary">
                        {formatDate(bon.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la commande */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200 hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h2 className="text-lg font-semibold theme-text-primary flex items-center">
                    <Package className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'تفاصيل الطلب' : 'Détails de la commande'}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'نوع الكمية' : 'Type de quantité'}
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.type_quantite}
                          onChange={(e) => handleInputChange('type_quantite', e.target.value)}
                          className="w-full px-3 py-2 theme-border-primary border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition"
                        >
                          <option value="NOMBRE">{isRTL ? 'عدد الرؤوس' : 'Nombre de têtes'}</option>
                          <option value="POIDS">{isRTL ? 'الوزن (كغ)' : 'Poids (kg)'}</option>
                        </select>
                      ) : (
                        <div className="theme-text-primary">
                          {bon.type_quantite_display}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'الكمية' : 'Quantité'}
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.quantite}
                          onChange={(e) => handleInputChange('quantite', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 theme-border-primary border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition"
                        />
                      ) : (
                        <div className="theme-text-primary">
                          {bon.quantite} {bon.type_quantite === 'NOMBRE' ? (isRTL ? 'رأس' : 'têtes') : 'kg'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'نوع الحيوان' : 'Type d\'animal'}
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.type_bete}
                          onChange={(e) => handleInputChange('type_bete', e.target.value)}
                          className="w-full px-3 py-2 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                        >
                          <option value="BOVIN">{isRTL ? 'بقر' : 'Bovin'}</option>
                          <option value="OVIN">{isRTL ? 'غنم' : 'Ovin'}</option>
                          <option value="CAPRIN">{isRTL ? 'ماعز' : 'Caprin'}</option>
                        </select>
                      ) : (
                        <div className="theme-text-primary">
                          {bon.type_bete_display}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'نوع المنتج' : 'Type de produit'}
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.type_produit}
                          onChange={(e) => handleInputChange('type_produit', e.target.value)}
                          className="w-full px-3 py-2 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                        >
                          <option value="CARCASSE">{isRTL ? 'ذبيحة' : 'Carcasse'}</option>
                          <option value="VIF">{isRTL ? 'حي' : 'Vif'}</option>
                        </select>
                      ) : (
                        <div className="theme-text-primary">
                          {bon.type_produit_display}
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isEditing ? formData.avec_cinquieme_quartier : bon.avec_cinquieme_quartier}
                          onChange={(e) => handleInputChange('avec_cinquieme_quartier', e.target.checked)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 text-sm theme-text-secondary ${isRTL ? 'mr-2 ml-0' : ''}`}>
                          {isRTL ? 'مع الأحشاء (الخامس الربع)' : 'Avec cinquième quartier (abats)'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relations */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h2 className="text-lg font-semibold theme-text-primary flex items-center">
                    <User className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'العلاقات' : 'Relations'}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'العميل' : 'Client'}
                      </label>
                      <div className="theme-bg-secondary rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
                            <div className="text-sm font-medium theme-text-primary">
                              {bon.client_nom}
                            </div>
                            {bon.client_info && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {(bon.client_info as any).type_client || 'N/A'}
                              </div>
                            )}
                          </div>
                        </div>
                        {bon.client_info && (
                          <div className="mt-3 space-y-1">
                            {bon.client_info.telephone && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Phone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {bon.client_info.telephone}
                              </div>
                            )}
                            {bon.client_info.email && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {bon.client_info.email}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'المسلخ' : 'Abattoir'}
                      </label>
                      <div className="theme-bg-secondary rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
                            <div className="text-sm font-medium theme-text-primary">
                              {bon.abattoir_nom}
                            </div>
                            {bon.abattoir_info && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {bon.abattoir_info.wilaya}, {bon.abattoir_info.commune}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Livraison et versement */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h2 className="text-lg font-semibold theme-text-primary flex items-center">
                    <Truck className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'التسليم والدفع' : 'Livraison et paiement'}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'تاريخ التسليم المخطط' : 'Date de livraison prévue'}
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.date_livraison_prevue || ''}
                          onChange={(e) => handleInputChange('date_livraison_prevue', e.target.value)}
                          className="w-full px-3 py-2 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                        />
                      ) : (
                        <div className="theme-text-primary">
                          {formatDate(bon.date_livraison_prevue)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'تاريخ التسليم الفعلي' : 'Date de livraison réelle'}
                      </label>
                      <div className="theme-text-primary">
                        {formatDate(bon.date_livraison_reelle)}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'الدفعة المقدمة' : 'Versement'}
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.versement || ''}
                            onChange={(e) => handleInputChange('versement', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full px-3 py-2 pl-8 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                            placeholder={isRTL ? 'مبلغ الدفعة' : 'Montant du versement'}
                          />
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      ) : (
                        <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(bon.versement)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h2 className="text-lg font-semibold theme-text-primary flex items-center">
                    <FileText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'الملاحظات' : 'Notes'}
                  </h2>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                      placeholder={isRTL ? 'أدخل ملاحظات إضافية...' : 'Entrez des notes supplémentaires...'}
                    />
                  ) : (
                    <div className="theme-text-primary whitespace-pre-wrap">
                      {bon.notes || (isRTL ? 'لا توجد ملاحظات' : 'Aucune note')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h3 className="text-lg font-semibold theme-text-primary flex items-center">
                    <Settings className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {/* Boutons d'action selon le statut */}
                  {bon.statut === 'BROUILLON' && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 theme-transition"
                    >
                      <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'تأكيد الطلب' : 'Confirmer le bon'}
                    </button>
                  )}
                  
                  {bon.statut === 'CONFIRME' && (
                    <button
                      onClick={() => setShowStartModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 theme-transition"
                    >
                      <Clock className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'بدء التنفيذ' : 'Mettre en cours'}
                    </button>
                  )}
                  
                  {bon.statut === 'EN_COURS' && (
                    <button
                      onClick={() => setShowDeliverModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 theme-transition"
                    >
                      <Truck className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'تسليم الطلب' : 'Marquer comme livré'}
                    </button>
                  )}
                  
                  {bon.est_annulable && (
                    <button
                      onClick={handleAnnuler}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 theme-transition"
                    >
                      <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إلغاء الطلب' : 'Annuler le bon'}
                    </button>
                  )}
                  
                  <button
                    onClick={handlePrint}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium theme-text-primary theme-bg-elevated border theme-border-primary rounded-lg hover:theme-bg-secondary theme-transition"
                  >
                    <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'طباعة' : 'Imprimer'}
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 theme-transition"
                  >
                    <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'حذف' : 'Supprimer'}
                  </button>
                </div>
              </div>

              {/* Informations système */}
              <div className="theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-4 theme-border-secondary border-b">
                  <h3 className="text-lg font-semibold theme-text-primary flex items-center">
                    <History className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
                    {isRTL ? 'معلومات النظام' : 'Informations système'}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'أنشئ بواسطة' : 'Créé par'}
                    </label>
                    <div className="text-sm theme-text-primary">
                      {bon.created_by_nom}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                    </label>
                    <div className="text-sm theme-text-primary">
                      {formatDate(bon.created_at)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}
                    </label>
                    <div className="text-sm theme-text-primary">
                      {formatDate(bon.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals de confirmation avec double validation */}
        
        {/* Modal de confirmation du bon */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative theme-bg-elevated rounded-2xl shadow-2xl w-full max-w-md mx-auto">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">
                  {isRTL ? 'تأكيد الطلب' : 'Confirmer le bon de commande'}
                </h3>
                <p className="text-sm theme-text-secondary mb-6">
                  {isRTL 
                    ? 'هل أنت متأكد من تأكيد هذا الطلب؟ سيتم تغيير الحالة من "مسودة" إلى "مؤكد".'
                    : 'Êtes-vous sûr de vouloir confirmer ce bon de commande ? Le statut passera de "Brouillon" à "Confirmé".'
                  }
                </p>
                <div className="mb-4 p-4 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {isRTL 
                        ? 'هذا الإجراء لا رجعة فيه. تأكد من صحة جميع المعلومات قبل التأكيد.'
                        : 'Cette action est irréversible. Vérifiez toutes les informations avant de confirmer.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium theme-text-secondary theme-bg-secondary hover:theme-bg-secondary-hover rounded-lg transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    onClick={handleConfirmBon}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isRTL ? 'جاري التأكيد...' : 'Confirmation...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>{isRTL ? 'تأكيد' : 'Confirmer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de mise en cours */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative theme-bg-elevated rounded-2xl shadow-2xl w-full max-w-md mx-auto">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-4">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">
                  {isRTL ? 'بدء تنفيذ الطلب' : 'Mettre en cours d\'exécution'}
                </h3>
                <p className="text-sm theme-text-secondary mb-6">
                  {isRTL 
                    ? 'هل أنت متأكد من بدء تنفيذ هذا الطلب؟ سيتم تغيير الحالة من "مؤكد" إلى "قيد التنفيذ".'
                    : 'Êtes-vous sûr de vouloir commencer l\'exécution de ce bon ? Le statut passera de "Confirmé" à "En cours".'
                  }
                </p>
                <div className="mb-4 p-4 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {isRTL 
                        ? 'هذا الإجراء لا رجعة فيه. تأكد من استعداد جميع الموارد قبل البدء.'
                        : 'Cette action est irréversible. Assurez-vous que toutes les ressources sont prêtes.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowStartModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium theme-text-secondary theme-bg-secondary hover:theme-bg-secondary-hover rounded-lg transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    onClick={handleStartBon}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isRTL ? 'جاري البدء...' : 'Démarrage...'}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>{isRTL ? 'بدء التنفيذ' : 'Commencer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de livraison */}
        {showDeliverModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative theme-bg-elevated rounded-2xl shadow-2xl w-full max-w-md mx-auto">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                  <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">
                  {isRTL ? 'تسليم الطلب' : 'Marquer comme livré'}
                </h3>
                <p className="text-sm theme-text-secondary mb-6">
                  {isRTL 
                    ? 'هل أنت متأكد من تسليم هذا الطلب؟ سيتم تغيير الحالة من "قيد التنفيذ" إلى "تم التسليم".'
                    : 'Êtes-vous sûr de vouloir marquer ce bon comme livré ? Le statut passera de "En cours" à "Livré".'
                  }
                </p>
                <div className="mb-4 p-4 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {isRTL 
                        ? 'هذا الإجراء لا رجعة فيه. تأكد من اكتمال التسليم قبل التأكيد.'
                        : 'Cette action est irréversible. Assurez-vous que la livraison est complète.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeliverModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium theme-text-secondary theme-bg-secondary hover:theme-bg-secondary-hover rounded-lg transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    onClick={handleDeliverBon}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isRTL ? 'جاري التسليم...' : 'Livraison...'}</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        <span>{isRTL ? 'تسليم' : 'Livrer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md theme-bg-elevated">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-lg font-medium theme-text-primary">
                    {isRTL ? 'تأكيد الحذف' : 'Confirmer la suppression'}
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm theme-text-secondary">
                      {isRTL 
                        ? 'هل أنت متأكد من حذف هذا طلب الشراء؟ لا يمكن التراجع عن هذا الإجراء.'
                        : 'Êtes-vous sûr de vouloir supprimer ce bon de commande ? Cette action est irréversible.'
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium theme-text-primary theme-bg-secondary rounded-lg hover:theme-bg-elevated theme-transition"
                  >
                    {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 theme-transition"
                  >
                    {isRTL ? 'حذف' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}