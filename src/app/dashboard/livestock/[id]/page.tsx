'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBeteDetails, useUpdateBete } from '@/lib/hooks/useLivestock';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useProfile } from '@/lib/hooks/useDjangoAuth';
import { Layout } from '@/components/layout/Layout';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { BeteHistoryPanel } from '@/components/bete/BeteHistoryPanel';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Heart, 
  Scale, 
  Calendar, 
  User, 
  Building2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Home,
  FileText,
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Target,
  RefreshCw,
  Download,
  Share2,
  Bell,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PrintBeteDocument } from '@/components/livestock/PrintBeteDocument';

export default function BeteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beteId = parseInt(params.id as string);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const { data: bete, isLoading, error, refetch } = useBeteDetails(beteId);
  const { data: especesList } = useEspeces();
  const { data: abattoirsList } = useAbattoirsList();
  const { data: userProfile } = useProfile();
  const updateBeteMutation = useUpdateBete();

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Déterminer les permissions
  const isSuperuser = userProfile?.is_superuser || false;
  const canEditAll = isSuperuser;
  const canEditHealth = true;

  // Initialiser les données du formulaire
  React.useEffect(() => {
    if (bete) {
      setFormData({
        num_boucle: bete.numero_identification || '',
        num_boucle_post_abattage: (bete as any).num_boucle_post_abattage || bete.numero_identification || '',
        espece: typeof bete.espece === 'object' ? bete.espece?.id : bete.espece || '',
        sexe: bete.sexe || '',
        poids_vif: bete.poids_vif || '',
        poids_a_chaud: bete.poids_a_chaud || '',
        poids_a_froid: bete.poids_a_froid || '',
        statut: bete.statut || 'VIVANT',
        etat_sante: bete.etat_sante || 'BON',
        abattage_urgence: bete.abattage_urgence || false,
        abattoir: typeof bete.abattoir === 'object' ? bete.abattoir?.id : bete.abattoir || '',
        client: bete.responsable?.full_name || '',
        notes: '',
      });
    }
  }, [bete]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si on change le statut vers ABATTU, vider le num_boucle_post_abattage pour permettre sa saisie
      if (field === 'statut' && value === 'ABATTU' && !prev.num_boucle_post_abattage) {
        newData.num_boucle_post_abattage = '';
      }
      
      // Si on change le statut depuis ABATTU vers autre chose, vider le num_boucle_post_abattage
      if (field === 'statut' && value !== 'ABATTU' && prev.statut === 'ABATTU') {
        newData.num_boucle_post_abattage = prev.num_boucle;
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const updateData: any = {};
      
      if (canEditAll) {
        // Superuser peut tout modifier - N'envoyer que les champs qui ont changé
        
        // Champs simples
        if (formData.etat_sante !== bete?.etat_sante) {
          updateData.etat_sante = formData.etat_sante;
        }
        if (formData.statut !== bete?.statut) {
          updateData.statut = formData.statut;
        }
        if (formData.poids_vif !== bete?.poids_vif) {
          updateData.poids_vif = formData.poids_vif;
        }
        if (formData.poids_a_chaud !== bete?.poids_a_chaud) {
          updateData.poids_a_chaud = formData.poids_a_chaud;
        }
        if (formData.poids_a_froid !== bete?.poids_a_froid) {
          updateData.poids_a_froid = formData.poids_a_froid;
        }
        if (formData.abattage_urgence !== bete?.abattage_urgence) {
          updateData.abattage_urgence = formData.abattage_urgence;
        }
        
        // Numéro de boucle
        if (formData.num_boucle !== bete?.numero_identification) {
          updateData.num_boucle = formData.num_boucle;
        }
        
        // Numéro post-abattage (seulement si statut ABATTU)
        if (formData.statut === 'ABATTU' && formData.num_boucle_post_abattage) {
          const originalPostAbattage = (bete as any)?.num_boucle_post_abattage || bete?.numero_identification;
          if (formData.num_boucle_post_abattage !== originalPostAbattage) {
            updateData.num_boucle_post_abattage = formData.num_boucle_post_abattage;
          }
        }
        
        // Relations (espèce, sexe, abattoir)
        const currentEspece = typeof bete?.espece === 'object' ? bete?.espece?.id : bete?.espece;
        const currentAbattoir = typeof bete?.abattoir === 'object' ? bete?.abattoir?.id : bete?.abattoir;
        
        if (formData.espece !== currentEspece) {
          updateData.espece = formData.espece;
        }
        if (formData.sexe !== bete?.sexe) {
          updateData.sexe = formData.sexe;
        }
        if (formData.abattoir !== currentAbattoir) {
          updateData.abattoir = formData.abattoir;
        }
      } else {
        // Utilisateur normal peut seulement modifier l'état de santé
        if (formData.etat_sante !== bete?.etat_sante) {
          updateData.etat_sante = formData.etat_sante;
        }
      }
      
      // Debug: vérifier les données envoyées
      console.log('=== UPDATE DATA ===');
      console.log('Data to send:', updateData);
      console.log('==================');
      
      await updateBeteMutation.mutateAsync({
        id: beteId,
        data: updateData
      });
      
      toast.success('Bête mise à jour avec succès');
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setFormData({
      num_boucle: bete?.numero_identification || '',
      num_boucle_post_abattage: (bete as any)?.num_boucle_post_abattage || bete?.numero_identification || '',
      espece: typeof bete?.espece === 'object' ? bete?.espece?.id : bete?.espece || '',
      sexe: bete?.sexe || '',
      poids_vif: bete?.poids_vif || '',
      poids_a_chaud: bete?.poids_a_chaud || '',
      poids_a_froid: bete?.poids_a_froid || '',
      statut: bete?.statut || 'VIVANT',
      etat_sante: bete?.etat_sante || 'BON',
      abattage_urgence: bete?.abattage_urgence || false,
      abattoir: typeof bete?.abattoir === 'object' ? bete?.abattoir?.id : bete?.abattoir || '',
      client: bete?.responsable?.full_name || '',
      notes: '',
    });
    setIsEditing(false);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      VIVANT: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100',
        border: 'border-green-300 dark:border-green-700',
        icon: CheckCircle,
        label: isRTL ? 'حي' : 'Vivant'
      },
      EN_STABULATION: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100',
        border: 'border-orange-300 dark:border-orange-700',
        icon: Home,
        label: isRTL ? 'في الحظيرة' : 'En stabulation'
      },
      ABATTU: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-300 dark:border-red-700',
        icon: Activity,
        label: isRTL ? 'مذبوح' : 'Abattu'
      },
      MORT: { 
        bg: 'bg-gray-200 dark:bg-gray-900/50', 
        text: 'text-gray-900 dark:text-gray-100',
        border: 'border-gray-300 dark:border-gray-700',
        icon: AlertTriangle,
        label: isRTL ? 'ميت' : 'Mort'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.VIVANT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      BON: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100',
        border: 'border-green-300 dark:border-green-700',
        icon: CheckCircle,
        label: isRTL ? 'جيد' : 'Bon'
      },
      MALADE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-300 dark:border-red-700',
        icon: AlertTriangle,
        label: isRTL ? 'مريض' : 'Malade'
      },
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (authLoading || translationLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
              </h3>
              <p className="theme-text-secondary mb-4">
                {error.message || (isRTL ? 'حدث خطأ أثناء تحميل تفاصيل البقرة' : 'Une erreur est survenue lors du chargement des détails de la bête')}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!bete) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {isRTL ? 'البقرة غير موجودة' : 'Bête non trouvée'}
              </h3>
              <p className="theme-text-secondary">
                {isRTL ? 'البقرة المطلوبة غير موجودة أو تم حذفها' : 'La bête demandée n\'existe pas ou a été supprimée'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Print Document - Hidden on screen, visible on print */}
      {bete && <PrintBeteDocument bete={bete} isRTL={isRTL} />}
      
      <div className="min-h-screen theme-bg-secondary theme-transition print:hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition mb-8">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg theme-bg-secondary theme-border-primary hover:theme-bg-elevated theme-transition border"
                  >
                    <ArrowLeft className="h-5 w-5 theme-text-primary" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold theme-text-primary flex items-center">
                      <Heart className="h-8 w-8 text-primary-600 mr-3" />
                      {isRTL ? 'تفاصيل البقرة' : 'Détails de la bête'}
                    </h1>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="theme-text-secondary">
                        {isRTL ? 'رقم الحلقة' : 'Numéro de boucle'}: <strong className="theme-text-primary">{bete.numero_identification}</strong>
                      </span>
                      <span className="theme-text-secondary">
                        {isRTL ? 'النوع' : 'Espèce'}: <strong className="theme-text-primary">{bete.espece_nom}</strong>
                      </span>
                      <span className="theme-text-secondary">
                        {isRTL ? 'المسلخ' : 'Abattoir'}: <strong className="theme-text-primary">{bete.abattoir_nom}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Indicateur de permissions */}
                  <div className="text-sm theme-text-secondary">
                    {isSuperuser ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100 border border-purple-400 dark:border-purple-700">
                        <Shield className="h-3 w-3 mr-1" />
                        {isRTL ? 'مدير عام' : 'Superuser'} - {isRTL ? 'تعديل كامل' : 'Modification complète'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 border border-blue-400 dark:border-blue-700">
                        <User className="h-3 w-3 mr-1" />
                        {isRTL ? 'مستخدم عادي' : 'Utilisateur'} - {isRTL ? 'تعديل الحالة الصحية فقط' : 'Modification santé uniquement'}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-border-primary border rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isRTL ? 'تحديث' : 'Actualiser'}
                  </button>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl font-medium"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isRTL ? 'تعديل' : 'Modifier'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-border-primary border rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {isRTL ? 'إلغاء' : 'Annuler'}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateBeteMutation.isPending}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateBeteMutation.isPending ? (isRTL ? 'جاري الحفظ...' : 'Sauvegarde...') : (isRTL ? 'حفظ' : 'Sauvegarder')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isEditing && !canEditAll && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {isRTL ? 'معلومات التعديل' : 'Informations de modification'}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      {isRTL 
                        ? 'بصفتك مستخدم عادي، يمكنك تعديل الحالة الصحية للحيوان فقط. الحقول الأخرى معطلة ولا يمكن تعديلها.'
                        : 'En tant qu\'utilisateur normal, vous pouvez uniquement modifier l\'état de santé de l\'animal. Les autres champs sont désactivés et ne peuvent pas être modifiés.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  {isRTL ? 'المعلومات الأساسية' : 'Informations de base'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'رقم الحلقة' : 'Numéro de boucle'}
                    </label>
                    {isEditing && canEditAll ? (
                      <input
                        type="text"
                        value={formData.num_boucle}
                        onChange={(e) => handleInputChange('num_boucle', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      />
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.numero_identification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'رقم ما بعد الذبح' : 'Numéro post-abattage'}
                      {isEditing && canEditAll && formData.statut !== 'ABATTU' && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({isRTL ? 'متاح فقط للحيوانات المذبوحة' : 'Disponible uniquement pour les animaux abattus'})
                        </span>
                      )}
                    </label>
                    {isEditing && canEditAll ? (
                      <input
                        type="text"
                        value={formData.num_boucle_post_abattage}
                        onChange={(e) => handleInputChange('num_boucle_post_abattage', e.target.value)}
                        disabled={formData.statut !== 'ABATTU'}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={formData.statut !== 'ABATTU' ? (isRTL ? 'غير متاح' : 'Non disponible') : ''}
                      />
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.statut === 'ABATTU' ? bete.numero_identification : (isRTL ? 'غير متاح' : 'Non applicable')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'النوع' : 'Espèce'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.espece}
                        onChange={(e) => handleInputChange('espece', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="">{isRTL ? 'اختر النوع' : 'Sélectionner une espèce'}</option>
                        {especesList?.map((espece) => (
                          <option key={espece.id} value={espece.id}>
                            {espece.nom}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.espece_nom || 'Non spécifié'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الجنس' : 'Sexe'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.sexe}
                        onChange={(e) => handleInputChange('sexe', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="M">{isRTL ? 'ذكر' : 'Mâle'}</option>
                        <option value="F">{isRTL ? 'أنثى' : 'Femelle'}</option>
                      </select>
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.sexe === 'M' ? (isRTL ? 'ذكر' : 'Mâle') : (isRTL ? 'أنثى' : 'Femelle')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Health */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  {isRTL ? 'الحالة والصحة' : 'Statut et santé'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الحالة' : 'Statut'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.statut}
                        onChange={(e) => handleInputChange('statut', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="VIVANT">{isRTL ? 'حي' : 'Vivant'}</option>
                        <option value="EN_STABULATION">{isRTL ? 'في الحظيرة' : 'En stabulation'}</option>
                        <option value="ABATTU">{isRTL ? 'مذبوح' : 'Abattu'}</option>
                        <option value="MORT">{isRTL ? 'ميت' : 'Mort'}</option>
                      </select>
                    ) : (
                      <div className={`mt-1 ${isEditing && !canEditAll ? 'opacity-50' : ''}`}>
                        {getStatusBadge(bete.statut)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الحالة الصحية' : 'État de santé'} {isEditing && canEditHealth && <span className="text-green-600 text-xs">({isRTL ? 'قابل للتعديل' : 'Modifiable'})</span>}
                    </label>
                    {isEditing && canEditHealth ? (
                      <select
                        value={formData.etat_sante}
                        onChange={(e) => handleInputChange('etat_sante', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="BON">{isRTL ? 'جيد' : 'Bon'}</option>
                        <option value="MALADE">{isRTL ? 'مريض' : 'Malade'}</option>
                      </select>
                    ) : (
                      <div className="mt-1">{getHealthBadge(bete.etat_sante)}</div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isEditing ? formData.abattage_urgence : bete.abattage_urgence}
                        onChange={(e) => handleInputChange('abattage_urgence', e.target.checked)}
                        disabled={!isEditing || !canEditAll}
                        className={`mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${isEditing && !canEditAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <span className={`text-sm font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-secondary'}`}>
                        {isRTL ? 'ذبح عاجل' : 'Abattage urgent'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Stabulation Information */}
              {bete.statut === 'EN_STABULATION' && (
                <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                  <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    {isRTL ? 'معلومات الحظيرة' : 'Informations de stabulation'}
                  </h2>
                  
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 mx-auto mb-4 text-primary-600" />
                    <p className="theme-text-secondary">
                      {isRTL ? 'هذا الحيوان في الحظيرة' : 'Cet animal est en stabulation'}
                    </p>
                    <p className="text-sm theme-text-tertiary mt-2">
                      {isRTL ? 'تفاصيل الحظيرة ستظهر هنا قريباً' : 'Les détails de la stabulation apparaîtront bientôt'}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </h2>
                
                {isEditing && canEditAll ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    placeholder={isRTL ? 'أدخل ملاحظات إضافية...' : 'Entrez des notes supplémentaires...'}
                  />
                ) : (
                  <p className={`${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                    {isRTL ? 'لا توجد ملاحظات' : 'Aucune note'}
                  </p>
                )}
              </div>

              {/* Weight Information */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  {isRTL ? 'الأوزان' : 'Poids'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن الحي (كغ)' : 'Poids vif (kg)'}
                    </label>
                    {isEditing && canEditAll ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formData.poids_vif}
                        onChange={(e) => handleInputChange('poids_vif', parseFloat(e.target.value) || '')}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      />
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.poids_vif ? `${bete.poids_vif} kg` : 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن الساخن (كغ)' : 'Poids à chaud (kg)'}
                    </label>
                    {isEditing && canEditAll ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formData.poids_a_chaud}
                        onChange={(e) => handleInputChange('poids_a_chaud', parseFloat(e.target.value) || '')}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      />
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.poids_a_chaud ? `${bete.poids_a_chaud} kg` : 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن البارد (كغ)' : 'Poids à froid (kg)'}
                    </label>
                    {isEditing && canEditAll ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formData.poids_a_froid}
                        onChange={(e) => handleInputChange('poids_a_froid', parseFloat(e.target.value) || '')}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      />
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.poids_a_froid ? `${bete.poids_a_froid} kg` : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {isRTL ? 'الموقع' : 'Localisation'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'المسلخ' : 'Abattoir'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.abattoir}
                        onChange={(e) => handleInputChange('abattoir', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="">{isRTL ? 'اختر المسلخ' : 'Sélectionner un abattoir'}</option>
                        {abattoirsList?.map((abattoir) => (
                          <option key={abattoir.id} value={abattoir.id}>
                            {abattoir.nom}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.abattoir_nom || 'Non assigné'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'العميل' : 'Client'}
                    </label>
                    <p className="theme-text-primary font-medium">{bete.responsable?.full_name || 'Non assigné'}</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {isRTL ? 'معلومات النظام' : 'Métadonnées'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                    </label>
                    <p className="theme-text-primary text-sm">
                      {new Date(bete.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'آخر تحديث' : 'Dernière modification'}
                    </label>
                    <p className="theme-text-primary text-sm">
                      {new Date(bete.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'أنشأ بواسطة' : 'Créé par'}
                    </label>
                    <p className="theme-text-primary text-sm">{bete.created_by?.full_name || 'Système'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  {isRTL ? 'إجراءات سريعة' : 'Actions rapides'}
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl font-medium"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isRTL ? 'تعديل' : 'Modifier'}
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isRTL ? 'طباعة' : 'Imprimer'}
                  </button>
                  
                  <button
                    onClick={() => navigator.share?.({ title: `Bête ${bete.numero_identification}`, url: window.location.href })}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {isRTL ? 'مشاركة' : 'Partager'}
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {isRTL ? 'إحصائيات' : 'Statistiques'}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary">{isRTL ? 'العمر في النظام' : 'Âge dans le système'}</span>
                    <span className="font-medium theme-text-primary">
                      {Math.floor((new Date().getTime() - new Date(bete.created_at).getTime()) / (1000 * 60 * 60 * 24))} {isRTL ? 'يوم' : 'jours'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary">{isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}</span>
                    <span className="font-medium theme-text-primary">
                      {Math.floor((new Date().getTime() - new Date(bete.updated_at).getTime()) / (1000 * 60 * 60))} {isRTL ? 'ساعة' : 'h'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary">{isRTL ? 'حالة الصحة' : 'État de santé'}</span>
                    <div className="mt-1">
                      {getHealthBadge(bete.etat_sante)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary">{isRTL ? 'أولوية الذبح' : 'Priorité d\'abattage'}</span>
                    <span className={`font-medium ${bete.abattage_urgence ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {bete.abattage_urgence ? (isRTL ? 'عاجل' : 'Urgent') : (isRTL ? 'عادي' : 'Normal')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts & Notifications */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {isRTL ? 'تنبيهات' : 'Alertes'}
                </h2>
                
                <div className="space-y-3">
                  {bete.abattage_urgence && (
                    <div className="flex items-start p-3 bg-red-200 dark:bg-red-900/50 border border-red-400 dark:border-red-700 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-800 dark:text-red-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          {isRTL ? 'ذبح عاجل مطلوب' : 'Abattage urgent requis'}
                        </p>
                        <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                          {isRTL ? 'هذا الحيوان يحتاج إلى ذبح فوري' : 'Cet animal nécessite un abattage immédiat'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {bete.etat_sante === 'MALADE' && (
                    <div className="flex items-start p-3 bg-orange-200 dark:bg-orange-900/50 border border-orange-400 dark:border-orange-700 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-800 dark:text-orange-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {isRTL ? 'حيوان مريض' : 'Animal malade'}
                        </p>
                        <p className="text-xs text-orange-800 dark:text-orange-200 mt-1">
                          {isRTL ? 'يحتاج إلى مراقبة طبية' : 'Nécessite une surveillance médicale'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {bete.statut === 'EN_STABULATION' && (
                    <div className="flex items-start p-3 bg-blue-200 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-700 rounded-lg">
                      <Home className="h-5 w-5 text-blue-800 dark:text-blue-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {isRTL ? 'في الحظيرة' : 'En stabulation'}
                        </p>
                        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                          {isRTL ? 'هذا الحيوان في انتظار الذبح' : 'Cet animal est en attente d\'abattage'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!bete.abattage_urgence && bete.etat_sante === 'BON' && bete.statut === 'VIVANT' && (
                    <div className="flex items-start p-3 bg-green-200 dark:bg-green-900/50 border border-green-400 dark:border-green-700 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-800 dark:text-green-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {isRTL ? 'حالة طبيعية' : 'État normal'}
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                          {isRTL ? 'الحيوان في حالة جيدة' : 'L\'animal est en bon état'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Historique des modifications */}
          <div className="lg:col-span-3">
            <BeteHistoryPanel beteId={beteId} isRTL={isRTL} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
