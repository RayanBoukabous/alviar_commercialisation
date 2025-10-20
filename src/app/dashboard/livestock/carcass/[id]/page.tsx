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
import { PrintCarcassDocument } from '@/components/livestock/PrintCarcassDocument';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Skull, 
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
  RefreshCw,
  Printer,
  Share2,
  Droplets,
  Thermometer,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CarcassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beteId = parseInt(params.id as string);
  
  useRequireAuth();
  const { currentLocale } = useLanguage();
  const isRTLMode = currentLocale === 'ar';
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const { data: bete, isLoading, error, refetch } = useBeteDetails(beteId);
  const { data: especesList } = useEspeces();
  const { data: abattoirsList } = useAbattoirsList();
  const { data: userProfile, isLoading: authLoading } = useProfile();
  const updateBeteMutation = useUpdateBete();

  // Debug: vérifier les données chargées
  console.log('=== COMPONENT RENDER ===');
  console.log('bete:', bete);
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('========================');

  // Déterminer les permissions
  const isSuperuser = userProfile?.is_superuser || false;
  const canEditAll = isSuperuser;
  const canEditPostAbattageNumber = true; // Tous les utilisateurs peuvent modifier le numéro post-abattage

  // Initialiser les données du formulaire quand les données de la bête sont chargées
  React.useEffect(() => {
    if (bete) {
      console.log('=== INIT FORM DATA ===');
      console.log('Bete espece:', bete.espece);
      console.log('Bete sexe:', bete.sexe);
      console.log('Bete sexe type:', typeof bete.sexe);
      console.log('Bete abattoir:', bete.abattoir);
      
      const initialData = {
        num_boucle: bete.numero_identification || '',
        num_boucle_post_abattage: (bete as any).num_boucle_post_abattage || bete.numero_identification || '',
        espece: typeof bete.espece === 'object' ? bete.espece?.id : bete.espece || '',
        sexe: bete.sexe || '',
        poids_vif: bete.poids_vif || '',
        poids_a_chaud: bete.poids_a_chaud || '',
        poids_a_froid: bete.poids_a_froid || '',
        statut: bete.statut || 'ABATTU',
        etat_sante: bete.etat_sante || 'BON',
        abattage_urgence: bete.abattage_urgence || false,
        abattoir: typeof bete.abattoir === 'object' ? bete.abattoir?.id : bete.abattoir || '',
        notes: '',
      };
      
      console.log('Initial form data:', initialData);
      console.log('Specifically sexe in formData:', initialData.sexe);
      console.log('=====================');
      
      setFormData(initialData);
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
      
      const originalPostAbattage = (bete as any)?.num_boucle_post_abattage || bete?.numero_identification;
      
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
        
        // Numéro post-abattage
        if (formData.num_boucle_post_abattage && formData.num_boucle_post_abattage !== originalPostAbattage) {
          updateData.num_boucle_post_abattage = formData.num_boucle_post_abattage;
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
        // Utilisateur normal peut seulement modifier le numéro post-abattage
        if (formData.num_boucle_post_abattage && formData.num_boucle_post_abattage !== originalPostAbattage) {
          updateData.num_boucle_post_abattage = formData.num_boucle_post_abattage;
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
      
      // Message de succès avec détails
      if (!canEditAll && updateData.num_boucle_post_abattage) {
        toast.success(
          isRTLMode 
            ? 'تم تحديث رقم ما بعد الذبح بنجاح' 
            : 'Numéro post-abattage mis à jour avec succès'
        );
      } else {
        toast.success(
          isRTLMode 
            ? 'تم تحديث الذبيحة بنجاح' 
            : 'Carcasse mise à jour avec succès'
        );
      }
      
      setIsEditing(false);
      
      // Rafraîchir les données et l'historique
      refetch();
      
      // Petit délai pour s'assurer que l'historique est à jour
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 300);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    if (bete) {
      setFormData({
        num_boucle: bete.numero_identification || '',
        num_boucle_post_abattage: (bete as any).num_boucle_post_abattage || bete.numero_identification || '',
        espece: typeof bete.espece === 'object' ? bete.espece?.id : bete.espece || '',
        sexe: bete.sexe || '',
        poids_vif: bete.poids_vif || '',
        poids_a_chaud: bete.poids_a_chaud || '',
        poids_a_froid: bete.poids_a_froid || '',
        statut: bete.statut || 'ABATTU',
        etat_sante: bete.etat_sante || 'BON',
        abattage_urgence: bete.abattage_urgence || false,
        abattoir: typeof bete.abattoir === 'object' ? bete.abattoir?.id : bete.abattoir || '',
        notes: '',
      });
    }
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
        label: isRTLMode ? 'حي' : 'Vivant'
      },
      EN_STABULATION: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        icon: Home,
        label: isRTLMode ? 'في الحظيرة' : 'En stabulation'
      },
      ABATTU: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        icon: Skull,
        label: isRTLMode ? 'مذبوح' : 'Abattu'
      },
      MORT: { 
        bg: 'bg-gray-200 dark:bg-gray-900/50', 
        text: 'text-gray-900 dark:text-gray-100', 
        border: 'border-gray-300 dark:border-gray-700',
        icon: AlertTriangle,
        label: isRTLMode ? 'ميت' : 'Mort'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ABATTU;
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
        label: isRTLMode ? 'جيد' : 'Bon'
      },
      MALADE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-300 dark:border-red-700',
        icon: AlertTriangle,
        label: isRTLMode ? 'مريض' : 'Malade'
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

  const getCarcassStatus = (slaughterDate: string) => {
    const slaughter = new Date(slaughterDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - slaughter.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return {
        bg: 'bg-green-200 dark:bg-green-900/50',
        text: 'text-green-900 dark:text-green-100',
        border: 'border-green-300 dark:border-green-700',
        icon: CheckCircle,
        label: isRTLMode ? 'طازج' : 'Frais'
      };
    } else if (daysDiff <= 30) {
      return {
        bg: 'bg-blue-200 dark:bg-blue-900/50',
        text: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-300 dark:border-blue-700',
        icon: Thermometer,
        label: isRTLMode ? 'مبرد' : 'Réfrigéré'
      };
    } else {
      return {
        bg: 'bg-purple-200 dark:bg-purple-900/50',
        text: 'text-purple-900 dark:text-purple-100',
        border: 'border-purple-300 dark:border-purple-700',
        icon: Droplets,
        label: isRTLMode ? 'مجمد' : 'Congelé'
      };
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTLMode ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 theme-bg-elevated rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-6">
                  <div className="h-64 theme-bg-elevated rounded-lg"></div>
                  <div className="h-32 theme-bg-elevated rounded-lg"></div>
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
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTLMode ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {isRTLMode ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
              </h3>
              <p className="theme-text-secondary mb-4">
                {error.message || (isRTLMode ? 'حدث خطأ أثناء تحميل تفاصيل الذبيحة' : 'Une erreur est survenue lors du chargement des détails de la carcasse')}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isRTLMode ? 'إعادة المحاولة' : 'Réessayer'}
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
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTLMode ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Skull className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {isRTLMode ? 'الذبيحة غير موجودة' : 'Carcasse non trouvée'}
              </h3>
              <p className="theme-text-secondary">
                {isRTLMode ? 'الذبيحة المطلوبة غير موجودة أو تم حذفها' : 'La carcasse demandée n\'existe pas ou a été supprimée'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Vérifier que c'est bien une carcasse (statut ABATTU)
  if (bete.statut !== 'ABATTU') {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTLMode ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {isRTLMode ? 'ليس ذبيحة' : 'Pas une carcasse'}
              </h3>
              <p className="theme-text-secondary">
                {isRTLMode ? 'هذا الحيوان لم يتم ذبحه بعد' : 'Cet animal n\'a pas encore été abattu'}
              </p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isRTLMode ? 'العودة' : 'Retour'}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const carcassStatus = getCarcassStatus(bete.updated_at);

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition print:bg-white" dir={isRTLMode ? 'rtl' : 'ltr'}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
          {/* Header */}
          <div className="mb-4 print:hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg theme-bg-elevated hover:theme-bg-hover theme-transition"
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold theme-text-primary flex items-center">
                    <Skull className="h-7 w-7 md:h-8 w-8 mr-3 text-red-600" />
                    {isRTLMode ? 'تفاصيل الذبيحة' : 'Détails de la carcasse'}
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    {bete.numero_identification} - {bete.espece_nom} (
                    {(() => {
                      console.log('Display sexe - bete.sexe:', bete.sexe, 'type:', typeof bete.sexe);
                      return bete.sexe === 'M' ? (isRTLMode ? 'ذكر' : 'Mâle') : (isRTLMode ? 'أنثى' : 'Femelle');
                    })()}
                    )
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* Quick actions */}
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition"
                  title={isRTLMode ? 'تحديث' : 'Actualiser'}
                >
                  <RefreshCw className="h-5 w-5" />
                </button>

                {/* Indicateur de permissions */}
                <div className="text-sm theme-text-secondary">
                  {isSuperuser ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100 border border-purple-400 dark:border-purple-700">
                      {isRTLMode ? 'مدير عام - تعديل كامل' : 'Superuser - Modification complète'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 border border-blue-400 dark:border-blue-700">
                      {isRTLMode ? 'مستخدم - تعديل رقم ما بعد الذبح' : 'Utilisateur - Modification n° post-abattage'}
                    </span>
                  )}
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl font-medium"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isRTLMode ? 'تعديل' : 'Modifier'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isRTLMode ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateBeteMutation.isPending}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateBeteMutation.isPending ? (isRTLMode ? 'جاري الحفظ...' : 'Sauvegarde...') : (isRTLMode ? 'حفظ' : 'Sauvegarder')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {isEditing && !canEditAll && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg print:hidden">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {isRTLMode ? 'معلومات التعديل' : 'Informations de modification'}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      {isRTLMode 
                        ? 'بصفتك مستخدم عادي، يمكنك تعديل رقم ما بعد الذبح فقط. الحقول الأخرى معطلة ولا يمكن تعديلها.'
                        : 'En tant qu\'utilisateur normal, vous pouvez uniquement modifier le numéro post-abattage. Les autres champs sont désactivés et ne peuvent pas être modifiés.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Informations de stabulation (si applicable) */}
              {(bete as any).stabulation_info && (
                <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 print:break-inside-avoid">
                  <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    {isRTLMode ? 'معلومات الحظيرة' : 'Informations de stabulation'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'رقم الحظيرة' : 'Numéro de stabulation'}
                      </label>
                      <p className="font-medium theme-text-primary">{(bete as any).stabulation_info.numero_stabulation}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'تاريخ البدء' : 'Date de début'}
                      </label>
                      <p className="font-medium theme-text-primary">
                        {new Date((bete as any).stabulation_info.date_debut).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'المسلخ' : 'Abattoir'}
                      </label>
                      <p className="font-medium theme-text-primary">{(bete as any).stabulation_info.abattoir_nom}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'أنشأ بواسطة' : 'Créé par'}
                      </label>
                      <p className="font-medium theme-text-primary">{(bete as any).stabulation_info.created_by}</p>
                    </div>

                    {(bete as any).stabulation_info.notes && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium theme-text-secondary mb-1">
                          {isRTLMode ? 'ملاحظات' : 'Notes'}
                        </label>
                        <p className="theme-text-primary">{(bete as any).stabulation_info.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 print:break-inside-avoid">
                <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                  <Skull className="h-5 w-5 mr-2" />
                  {isRTLMode ? 'معلومات الذبيحة' : 'Informations de la carcasse'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTLMode ? 'رقم الحلقة' : 'Numéro de boucle'}
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
                      {isRTLMode ? 'رقم ما بعد الذبح' : 'Numéro post-abattage'}
                      {isEditing && <span className="text-green-600 text-xs ml-2">({isRTLMode ? 'قابل للتعديل' : 'Modifiable'})</span>}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.num_boucle_post_abattage}
                        onChange={(e) => handleInputChange('num_boucle_post_abattage', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                        placeholder={isRTLMode ? 'أدخل رقم ما بعد الذبح' : 'Entrez le numéro post-abattage'}
                      />
                    ) : (
                      <p className="font-medium theme-text-primary">
                        {(bete as any).num_boucle_post_abattage || bete.numero_identification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTLMode ? 'النوع' : 'Espèce'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.espece}
                        onChange={(e) => handleInputChange('espece', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="">{isRTLMode ? 'اختر النوع' : 'Sélectionner une espèce'}</option>
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
                      {isRTLMode ? 'الجنس' : 'Sexe'}
                    </label>
                    {isEditing && canEditAll ? (
                      <select
                        value={formData.sexe}
                        onChange={(e) => handleInputChange('sexe', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                      >
                        <option value="M">{isRTLMode ? 'ذكر' : 'Mâle'}</option>
                        <option value="F">{isRTLMode ? 'أنثى' : 'Femelle'}</option>
                      </select>
                    ) : (
                      <p className={`font-medium ${isEditing && !canEditAll ? 'text-gray-400 dark:text-gray-600' : 'theme-text-primary'}`}>
                        {bete.sexe === 'M' ? (isRTLMode ? 'ذكر' : 'Mâle') : (isRTLMode ? 'أنثى' : 'Femelle')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Slaughter & Weight Information in horizontal layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weight Information */}
                <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 print:break-inside-avoid">
                  <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    {isRTLMode ? 'الأوزان' : 'Poids'}
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'الوزن الحي (كغ)' : 'Poids vif (kg)'}
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
                        {isRTLMode ? 'الوزن الساخن (كغ)' : 'Poids à chaud (kg)'}
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
                        {isRTLMode ? 'الوزن البارد (كغ)' : 'Poids à froid (kg)'}
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

                    {bete.poids_vif && bete.poids_a_chaud && (
                      <div className="pt-3 border-t theme-border-primary">
                        <label className="block text-sm font-medium theme-text-secondary mb-1">
                          {isRTLMode ? 'نسبة الذبح (%)' : 'Rendement (%)'}
                        </label>
                        <p className="font-medium theme-text-primary text-lg">
                          {((bete.poids_a_chaud / bete.poids_vif) * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slaughter Information */}
                <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 print:break-inside-avoid">
                  <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    {isRTLMode ? 'معلومات الذبح' : 'Abattage'}
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'تاريخ الذبح' : 'Date d\'abattage'}
                      </label>
                      <p className="theme-text-primary font-medium text-sm">
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
                        {isRTLMode ? 'حالة الذبيحة' : 'État'}
                      </label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${carcassStatus.bg} ${carcassStatus.text} ${carcassStatus.border}`}>
                          <carcassStatus.icon className="w-3 h-3 mr-1" />
                          {carcassStatus.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'الحالة الصحية' : 'État de santé'}
                      </label>
                      {isEditing && canEditAll ? (
                        <select
                          value={formData.etat_sante}
                          onChange={(e) => handleInputChange('etat_sante', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                        >
                          <option value="BON">{isRTLMode ? 'جيد' : 'Bon'}</option>
                          <option value="MALADE">{isRTLMode ? 'مريض' : 'Malade'}</option>
                        </select>
                      ) : (
                        <div className="mt-1">{getHealthBadge(bete.etat_sante)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 print:break-inside-avoid">
                  <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {isRTLMode ? 'الموقع' : 'Localisation'}
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'المسلخ' : 'Abattoir'}
                      </label>
                      {isEditing && canEditAll ? (
                        <select
                          value={formData.abattoir}
                          onChange={(e) => handleInputChange('abattoir', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                        >
                          <option value="">{isRTLMode ? 'اختر المسلخ' : 'Sélectionner un abattoir'}</option>
                          {abattoirsList?.map((abattoir: any) => (
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
                        {isRTLMode ? 'تاريخ الإنشاء' : 'Créé le'}
                      </label>
                      <p className="theme-text-primary text-sm">
                        {new Date(bete.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-1">
                        {isRTLMode ? 'أنشأ بواسطة' : 'Créé par'}
                      </label>
                      <p className="theme-text-primary text-sm">{bete.created_by?.full_name || 'Système'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6 print:hidden">
              {/* Quick Actions */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-4">
                <h3 className="text-sm font-semibold mb-3 theme-text-primary">
                  {isRTLMode ? 'إجراءات سريعة' : 'Actions rapides'}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isRTLMode ? 'تعديل' : 'Modifier'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isRTLMode ? 'طباعة' : 'Imprimer'}
                  </button>
                  <button
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {isRTLMode ? 'مشاركة' : 'Partager'}
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-4">
                <h3 className="text-sm font-semibold mb-3 theme-text-primary">
                  {isRTLMode ? 'إحصائيات' : 'Statistiques'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary">{isRTLMode ? 'حالة الذبيحة' : 'État'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${carcassStatus.bg} ${carcassStatus.text}`}>
                      {carcassStatus.label}
                    </span>
                  </div>
                  {bete.poids_vif && bete.poids_a_chaud && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm theme-text-secondary">{isRTLMode ? 'نسبة الذبح' : 'Rendement'}</span>
                      <span className="text-sm font-medium theme-text-primary">
                        {((bete.poids_a_chaud / bete.poids_vif) * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Alerts */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-4">
                <h3 className="text-sm font-semibold mb-3 theme-text-primary">
                  {isRTLMode ? 'تنبيهات وإشعارات' : 'Alertes & Notifications'}
                </h3>
                <div className="space-y-2">
                  {bete.etat_sante === 'MALADE' && (
                    <div className="flex items-start p-2 bg-red-200 dark:bg-red-900/50 border border-red-400 dark:border-red-700 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-800 dark:text-red-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-900 dark:text-red-100">
                          {isRTLMode ? 'جودة سيئة' : 'Qualité mauvaise'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {bete.etat_sante === 'BON' && (
                    <div className="flex items-start p-2 bg-green-200 dark:bg-green-900/50 border border-green-400 dark:border-green-700 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-800 dark:text-green-300 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-900 dark:text-green-100">
                          {isRTLMode ? 'جودة جيدة' : 'Bonne qualité'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Historique des modifications */}
          <div className="mt-6 lg:col-span-4 print:hidden">
            <BeteHistoryPanel beteId={beteId} isRTL={isRTLMode} />
          </div>
        </div>
      </div>
      
      {/* Template d'impression */}
      <PrintCarcassDocument bete={bete} isRTL={isRTLMode} />
    </Layout>
  );
}
