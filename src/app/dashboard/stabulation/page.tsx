'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Warehouse,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Calendar as CalendarIcon,
  Building2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  useStabulationsByAbattoir, 
  useAllStabulations,
  useStabulationStats, 
  useTerminerStabulation,
  useAnnulerStabulation
} from '@/lib/hooks/useStabulations';
import { Stabulation, stabulationService } from '@/lib/api/stabulationService';
import { CreateStabulationModal } from '@/components/stabulation';


export default function StabulationPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  
  // Récupérer l'utilisateur depuis localStorage si useAuth ne fonctionne pas
  const [localUser, setLocalUser] = useState<any>(null);
  const [abattoirId, setAbattoirId] = useState<number | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Debug localStorage
      console.log('=== DEBUG LOCALSTORAGE ===');
      console.log('django_user:', localStorage.getItem('django_user'));
      console.log('django_token:', localStorage.getItem('django_token'));
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('========================');
      
      const userStr = localStorage.getItem('django_user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setLocalUser(parsedUser);
          
          // Extraire l'ID de l'abattoir directement
          if (parsedUser?.abattoir?.id) {
            setAbattoirId(parsedUser.abattoir.id);
          }
        } catch (error) {
          console.error('Erreur parsing user from localStorage:', error);
        }
      } else {
        console.log('❌ Aucune donnée utilisateur trouvée dans localStorage');
      }
    }
  }, []);
  
  // Utiliser l'utilisateur local si useAuth ne retourne rien
  const effectiveUser = user || localUser;
  
  // Gérer le cas où abattoir est un nombre ou un objet
  const getAbattoirId = (userData: any) => {
    if (!userData?.abattoir) return null;
    
    // Si abattoir est un nombre
    if (typeof userData.abattoir === 'number') {
      return userData.abattoir;
    }
    
    // Si abattoir est un objet
    if (typeof userData.abattoir === 'object' && userData.abattoir.id) {
      return userData.abattoir.id;
    }
    
    return null;
  };
  
  // Utiliser l'ID de l'abattoir directement si disponible
  const effectiveAbattoirId = getAbattoirId(effectiveUser) || abattoirId;
  
  // Debug logs pour l'utilisateur
  console.log('=== DEBUG USER ===');
  console.log('User data:', user);
  console.log('Local user:', localUser);
  console.log('Effective user:', effectiveUser);
  console.log('Abattoir ID from state:', abattoirId);
  console.log('Effective Abattoir ID:', effectiveAbattoirId);
  console.log('User abattoir:', effectiveUser?.abattoir);
  console.log('Abattoir type:', typeof effectiveUser?.abattoir);
  console.log('Abattoir ID (direct):', effectiveUser?.abattoir?.id);
  console.log('Abattoir ID (number):', typeof effectiveUser?.abattoir === 'number' ? effectiveUser.abattoir : 'N/A');
  console.log('Abattoir nom:', effectiveUser?.abattoir?.nom);
  console.log('Capacité ovin:', effectiveUser?.abattoir?.capacite_stabulation_ovin);
  console.log('Capacité bovin:', effectiveUser?.abattoir?.capacite_stabulation_bovin);
  console.log('==================');
  
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  
  // États pour les options des filtres
  const [abattoirOptions, setAbattoirOptions] = useState<string[]>([]);
  const [especeOptions, setEspeceOptions] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedStabulation, setSelectedStabulation] = useState<Stabulation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [animalWeights, setAnimalWeights] = useState<{[key: number]: number}>({});
  const [animalPostNumbers, setAnimalPostNumbers] = useState<{[key: number]: string}>({});
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [postNumberErrors, setPostNumberErrors] = useState<{[key: number]: string}>({});

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Déterminer si l'utilisateur est superuser
  const isSuperuser = effectiveUser?.is_superuser || false;
  
  // Hooks API - utiliser le bon hook selon le statut de l'utilisateur
  const { 
    data: stabulationsData, 
    isLoading: loading, 
    error, 
    refetch 
  } = isSuperuser 
    ? useAllStabulations({
        statut: statusFilter === 'ALL' ? undefined : statusFilter,
        type_bete: typeFilter === 'ALL' ? undefined : typeFilter,
        abattoir_id: undefined, // Superuser voit toutes les stabulations
      })
    : useStabulationsByAbattoir(effectiveAbattoirId || 0, {
        statut: statusFilter === 'ALL' ? undefined : statusFilter,
        type_bete: typeFilter === 'ALL' ? undefined : typeFilter,
      });

  const { data: statsData } = useStabulationStats({
    abattoir_id: isSuperuser ? undefined : effectiveAbattoirId
  });

  // Debug API calls
  console.log('=== DEBUG API ===');
  console.log('isSuperuser:', isSuperuser);
  console.log('effectiveAbattoirId for API:', effectiveAbattoirId);
  console.log('API will be called:', !!effectiveAbattoirId || isSuperuser);
  console.log('Using hook:', isSuperuser ? 'useAllStabulations' : 'useStabulationsByAbattoir');
  console.log('stabulationsData:', stabulationsData);
  console.log('statsData:', statsData);
  console.log('error:', error);
  console.log('================');

  const terminerStabulationMutation = useTerminerStabulation();
  const annulerStabulationMutation = useAnnulerStabulation();

  // Récupérer les options des filtres depuis les données
  useEffect(() => {
    if (stabulationsData?.stabulations) {
      // Récupérer les abattoirs uniques
      const abattoirs = Array.from(new Set(
        stabulationsData.stabulations
          .map(s => s.abattoir_nom)
          .filter(Boolean)
      ));
      setAbattoirOptions(abattoirs);

      // Récupérer les espèces uniques
      const especes = Array.from(new Set(
        stabulationsData.stabulations
          .map(s => s.type_bete)
          .filter(Boolean)
      ));
      setEspeceOptions(especes);
    }
  }, [stabulationsData]);


  const handleRefresh = async () => {
    await refetch();
  };

  // Fonction pour fermer le modal et rafraîchir la liste
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    // Rafraîchir la liste après création
    refetch();
  };

  const handleViewStabulation = (stabulation: Stabulation) => {
    router.push(`/dashboard/stabulation/${stabulation.id}`);
  };


  const handleTerminerStabulation = async (stabulation: Stabulation) => {
    setIsLoadingDetails(true);
    try {
      // Récupérer les détails complets de la stabulation avec les bêtes
      const fullStabulation = await stabulationService.getStabulation(stabulation.id);
      
      // Vérifier qu'il y a des bêtes dans la stabulation
      if (!fullStabulation.betes_info || fullStabulation.betes_info.length === 0) {
        alert(isRTL ? 'لا توجد حيوانات في هذه الاسطبل' : 'Aucun animal dans cette stabulation');
        return;
      }
      
      setSelectedStabulation(fullStabulation);
      setShowFinishModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      alert(isRTL ? 'خطأ في جلب تفاصيل الاسطبل' : 'Erreur lors de la récupération des détails de la stabulation');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Fonction de validation du motif d'annulation
  const validateCancelReason = (reason: string) => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return isRTL ? 'يرجى كتابة سبب الإلغاء' : 'Veuillez saisir la raison de l\'annulation';
    }
    if (trimmedReason.length < 10) {
      return isRTL ? 'يجب أن يكون السبب 10 أحرف على الأقل' : 'La raison doit contenir au moins 10 caractères';
    }
    if (trimmedReason.length > 500) {
      return isRTL ? 'يجب أن يكون السبب أقل من 500 حرف' : 'La raison doit contenir moins de 500 caractères';
    }
    return '';
  };

  const handleAnnulerStabulation = (stabulation: Stabulation) => {
    setSelectedStabulation(stabulation);
    setCancelReason('');
    setCancelReasonError('');
    setShowCancelModal(true);
  };

  const handleCancelStabulation = async () => {
    // Valider le motif
    const validationError = validateCancelReason(cancelReason);
    if (validationError) {
      setCancelReasonError(validationError);
      return;
    }
    
    setCancelReasonError('');

    if (!selectedStabulation) return;

    setIsCancelling(true);
    try {
      const result = await annulerStabulationMutation.mutateAsync({
        id: selectedStabulation.id,
        raisonAnnulation: cancelReason
      });
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedStabulation(null);
      
      const message = isRTL 
        ? `تم إلغاء الاسطبل بنجاح. تم إرجاع ${result.betes_affectees} حيوان إلى حالة "حي"`
        : `Stabulation annulée avec succès. ${result.betes_affectees} animaux remis en statut "vivant"`;
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(isRTL ? `خطأ في إلغاء الاسطبل: ${errorMessage}` : `Erreur lors de l'annulation: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Fonction pour vérifier si tous les champs sont remplis
  const isAllFieldsFilled = () => {
    if (!selectedStabulation || !selectedStabulation.betes_info) return false;
    
    return selectedStabulation.betes_info.every(bete => {
      const weight = animalWeights[bete.id];
      const postNumber = animalPostNumbers[bete.id];
      const poidsVif = bete.poids || 0;
      
      return weight && weight > 0 && weight <= poidsVif && 
             postNumber && postNumber.trim() !== '' &&
             !postNumberErrors[bete.id];
    });
  };

  // Fonction pour vérifier l'unicité locale des numéros de poste
  const checkLocalPostNumberUniqueness = (beteId: number, postNumber: string) => {
    if (!postNumber.trim()) return;
    
    // Vérifier d'abord les doublons dans la stabulation actuelle
    const duplicateIds = Object.entries(animalPostNumbers)
      .filter(([id, num]) => parseInt(id) !== beteId && num === postNumber)
      .map(([id]) => parseInt(id));
    
    if (duplicateIds.length > 0) {
      setPostNumberErrors(prev => ({
        ...prev,
        [beteId]: isRTL ? 'رقم البوست موجود بالفعل في هذه الاسطبل' : 'Ce numéro de poste existe déjà dans cette stabulation'
      }));
    } else {
      setPostNumberErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[beteId];
        return newErrors;
      });
    }
  };

  // Fonction simple pour vérifier l'unicité des numéros de poste
  const checkPostNumberUniqueness = async () => {
    if (!selectedStabulation || !selectedStabulation.betes_info) return true;
    
    try {
      // Vérifier chaque numéro de poste avec l'API
      for (const bete of selectedStabulation.betes_info) {
        const postNumber = animalPostNumbers[bete.id];
        if (postNumber && postNumber.trim()) {
          // Faire une requête pour vérifier l'unicité
          const response = await fetch(`/api/betes/check-post-number/?num_boucle_post_abattage=${encodeURIComponent(postNumber)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('django_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.exists) {
              alert(isRTL ? `رقم البوست "${postNumber}" موجود بالفعل` : `Le numéro de poste "${postNumber}" existe déjà`);
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification des numéros de poste:', error);
      return false; // Arrêter en cas d'erreur de vérification
    }
  };

  const handleFinishStabulation = async () => {
    if (!selectedStabulation || !selectedStabulation.betes_info) return;

    // Vérifier que tous les poids sont saisis
    const missingWeights = selectedStabulation.betes_info.filter(bete => !animalWeights[bete.id] || animalWeights[bete.id] <= 0);
    if (missingWeights.length > 0) {
      alert(isRTL ? 'يرجى إدخال وزن جميع الحيوانات' : 'Veuillez saisir le poids de tous les animaux');
      return;
    }

    // Vérifier que tous les numéros poste abattage sont saisis
    const missingPostNumbers = selectedStabulation.betes_info.filter(bete => !animalPostNumbers[bete.id] || animalPostNumbers[bete.id].trim() === '');
    if (missingPostNumbers.length > 0) {
      alert(isRTL ? 'يرجى إدخال رقم البوست لجميع الحيوانات' : 'Veuillez saisir le numéro poste abattage de tous les animaux');
      return;
    }

    // Vérifier que les poids à chaud ne dépassent pas les poids vifs
    const invalidWeights = selectedStabulation.betes_info.filter(bete => {
      const poidsChaud = animalWeights[bete.id];
      const poidsVif = bete.poids || 0;
      return poidsChaud > poidsVif;
    });
    
    if (invalidWeights.length > 0) {
      alert(isRTL 
        ? 'لا يمكن أن يكون الوزن الساخن أعلى من الوزن الحي' 
        : 'Le poids à chaud ne peut pas être supérieur au poids vif'
      );
      return;
    }

    // Vérifier qu'il n'y a pas d'erreurs de numéros de poste
    const hasPostNumberErrors = Object.keys(postNumberErrors).length > 0;
    if (hasPostNumberErrors) {
      alert(isRTL ? 'يرجى تصحيح أخطاء أرقام البوست' : 'Veuillez corriger les erreurs de numéros de poste');
      return;
    }

    // Vérifier l'unicité des numéros de poste AVANT d'appeler l'API
    const isUnique = await checkPostNumberUniqueness();
    if (!isUnique) {
      return; // Arrêter ici si les numéros ne sont pas uniques
    }

    setIsFinishing(true);
    try {
      // Préparer les données des poids et numéros poste abattage
      const poidsData = selectedStabulation.betes_info.map(bete => ({
        bete_id: bete.id,
        poids_a_chaud: animalWeights[bete.id],
        num_boucle_post_abattage: animalPostNumbers[bete.id]
      }));

      const result = await terminerStabulationMutation.mutateAsync({
        id: selectedStabulation.id,
        poidsData: poidsData
      });
      
      // Seulement fermer le modal et nettoyer les états en cas de succès
      setShowFinishModal(false);
      setAnimalWeights({});
      setAnimalPostNumbers({});
      setPostNumberErrors({});
      setSelectedStabulation(null);
      
      const message = isRTL 
        ? `تم إنهاء الاسطبل بنجاح. تم ذبح ${selectedStabulation.betes_info.length} حيوان`
        : `Stabulation terminée avec succès. ${selectedStabulation.betes_info.length} animaux abattus`;
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Note: Le hook useTerminerStabulation invalide automatiquement les requêtes en cas de succès
      // Pas besoin d'appeler refetch() manuellement
    } catch (error: any) {
      console.error('Erreur lors de la finalisation:', error);
      
      // Afficher l'erreur et arrêter
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorDetails = error.response.data.details;
        const errorMessage = errorDetails.join('\n');
        alert(isRTL ? `خطأ في التحقق من صحة البيانات:\n${errorMessage}` : `Erreurs de validation:\n${errorMessage}`);
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
        alert(isRTL ? `خطأ في إنهاء الاسطبل: ${errorMessage}` : `Erreur lors de la finalisation: ${errorMessage}`);
      }
      
      // Le modal reste ouvert, la stabulation reste "EN_COURS"
      return;
    } finally {
      setIsFinishing(false);
    }
  };

  // Filtrage des stabulations
  const stabulations = stabulationsData?.stabulations || [];
  
  // Fonction pour filtrer par période
  const filterByPeriod = (stabulation: Stabulation, period: string) => {
    if (period === 'ALL') return true;
    
    const now = new Date();
    const stabulationDate = new Date(stabulation.date_debut);
    
    switch (period) {
      case 'TODAY':
        return stabulationDate.toDateString() === now.toDateString();
      case 'THIS_WEEK':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return stabulationDate >= startOfWeek;
      case 'THIS_MONTH':
        return stabulationDate.getMonth() === now.getMonth() && 
               stabulationDate.getFullYear() === now.getFullYear();
      case 'LAST_7_DAYS':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return stabulationDate >= sevenDaysAgo;
      case 'LAST_30_DAYS':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return stabulationDate >= thirtyDaysAgo;
      default:
        return true;
    }
  };
  
  const filteredStabulations = stabulations.filter(stabulation => {
    const matchesSearch = stabulation.numero_stabulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (stabulation.abattoir_nom && stabulation.abattoir_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (stabulation.notes && stabulation.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || stabulation.statut === statusFilter;
    const matchesType = typeFilter === 'ALL' || stabulation.type_bete === typeFilter;
    const matchesAbattoir = abattoirFilter === 'ALL' || stabulation.abattoir_nom === abattoirFilter;
    const matchesPeriod = filterByPeriod(stabulation, periodFilter);
    
    return matchesSearch && matchesStatus && matchesType && matchesAbattoir && matchesPeriod;
  });

  // Calcul des statistiques basées sur les filtres
  const calculateStats = () => {
    const total = filteredStabulations.length;
    const enCours = filteredStabulations.filter(s => s.statut === 'EN_COURS').length;
    const terminees = filteredStabulations.filter(s => s.statut === 'TERMINE').length;
    const annulees = filteredStabulations.filter(s => s.statut === 'ANNULE').length;
    
    const totalAnimaux = filteredStabulations.reduce((sum, s) => sum + s.nombre_betes_actuelles, 0);
    const animauxEnCours = filteredStabulations
      .filter(s => s.statut === 'EN_COURS')
      .reduce((sum, s) => sum + s.nombre_betes_actuelles, 0);
    
    // Calcul des pourcentages d'annulation et de finalisation
    let tauxAnnulation = 0;
    let tauxFinalisation = 0;
    let tauxAnnulationMessage = '';
    let tauxFinalisationMessage = '';
    
    if (filteredStabulations.length > 0) {
      // Calculer le pourcentage d'annulation
      tauxAnnulation = Math.round((annulees / total) * 100);
      
      // Calculer le pourcentage de finalisation
      tauxFinalisation = Math.round((terminees / total) * 100);
    } else {
      tauxAnnulationMessage = isRTL ? 'لا توجد بيانات كافية' : 'Données insuffisantes';
      tauxFinalisationMessage = isRTL ? 'لا توجد بيانات كافية' : 'Données insuffisantes';
    }
    
    return {
      total,
      enCours,
      terminees,
      annulees,
      totalAnimaux,
      animauxEnCours,
      tauxAnnulation,
      tauxFinalisation,
      tauxAnnulationMessage,
      tauxFinalisationMessage
    };
  };

  const stats = calculateStats();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      EN_COURS: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        label: isRTL ? 'جاري' : 'En cours',
        icon: Play
      },
      TERMINE: { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        label: isRTL ? 'منتهي' : 'Terminé',
        icon: CheckCircle
      },
      ANNULE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_COURS;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
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
      month: 'short',
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

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Warehouse className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الإسطبلات' : 'Stabulation'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة إسطبلات الماشية في انتظار الذبح' : 'Gestion des stabulations pour bétail en attente d\'abattage'}
                </p>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'نظام إسطبل جديد' : 'Nouvel ordre d\'abattage'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total des stabulations */}
            <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'إجمالي الإسطبلات' : 'Total Stabulations'}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary theme-transition">
                    {isLoading ? '...' : stats.total}
                  </p>
                  <p className="text-xs theme-text-tertiary theme-transition mt-1">
                    {isRTL ? 'جميع الحالات' : 'Tous statuts confondus'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Stabulations en cours */}
            <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'جاري' : 'En cours'}
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isLoading ? '...' : stats.enCours}
                  </p>
                  <p className="text-xs theme-text-tertiary theme-transition mt-1">
                    {isRTL ? 'نشط حالياً' : 'Actuellement actif'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Animaux en stabulation */}
            <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'الحيوانات في الإسطبل' : 'Animaux en stabulation'}
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {isLoading ? '...' : stats.animauxEnCours}
                  </p>
                  <p className="text-xs theme-text-tertiary theme-transition mt-1">
                    {isRTL ? 'حالياً في الإسطبل' : 'Actuellement en stabulation'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Taux d'annulation */}
            <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'معدل الإلغاء' : 'Taux d\'annulation'}
                  </p>
                  {stats.tauxAnnulationMessage ? (
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {stats.tauxAnnulationMessage}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {isLoading ? '...' : `${stats.tauxAnnulation}%`}
                    </p>
                  )}
                  <p className="text-xs theme-text-tertiary theme-transition mt-1">
                    {stats.tauxAnnulationMessage ? 
                      (isRTL ? 'حساب الإلغاء' : 'Calcul d\'annulation') :
                      (isRTL ? 'نسبة الإلغاء' : 'Pourcentage d\'annulation')
                    }
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistiques supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stabulations terminées */}
            <div className="theme-bg-elevated theme-transition p-4 rounded-lg border theme-border-primary theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'منتهي' : 'Terminées'}
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {isLoading ? '...' : stats.terminees}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Stabulations annulées */}
            <div className="theme-bg-elevated theme-transition p-4 rounded-lg border theme-border-primary theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'ملغي' : 'Annulées'}
                  </p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {isLoading ? '...' : stats.annulees}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Total animaux */}
            <div className="theme-bg-elevated theme-transition p-4 rounded-lg border theme-border-primary theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'إجمالي الحيوانات' : 'Total Animaux'}
                  </p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {isLoading ? '...' : stats.totalAnimaux}
                  </p>
                </div>
                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            {/* Taux de finalisation */}
            <div className="theme-bg-elevated theme-transition p-4 rounded-lg border theme-border-primary theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'معدل الإنجاز' : 'Taux de finalisation'}
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {isLoading ? '...' : 
                      stats.tauxFinalisationMessage ? 
                        'N/A' : 
                        `${stats.tauxFinalisation}%`
                    }
                  </p>
                  <p className="text-xs theme-text-tertiary theme-transition">
                    {isRTL ? 'نسبة الإنجاز' : 'Pourcentage de finalisation'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="lg:col-span-2 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في الإسطبلات...' : 'Rechercher une stabulation...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                />
              </div>
              
              {/* Filtre par statut */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="EN_COURS">{isRTL ? 'جاري' : 'En cours'}</option>
                <option value="TERMINE">{isRTL ? 'منتهي' : 'Terminé'}</option>
                <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              
              {/* Filtre par type */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
                {especeOptions.map(espece => (
                  <option key={espece} value={espece}>
                    {espece === 'BOVIN' ? (isRTL ? 'بقر' : 'Bovin') :
                     espece === 'OVIN' ? (isRTL ? 'غنم' : 'Ovin') :
                     espece === 'CAPRIN' ? (isRTL ? 'ماعز' : 'Caprin') :
                     espece === 'AUTRE' ? (isRTL ? 'أخرى' : 'Autre') : espece}
                  </option>
                ))}
              </select>
              
              {/* Filtre par abattoir (seulement pour superusers) */}
              {isSuperuser && (
                <select
                  value={abattoirFilter}
                  onChange={(e) => setAbattoirFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                >
                  <option value="ALL">{isRTL ? 'جميع المسالخ' : 'Tous les abattoirs'}</option>
                  {abattoirOptions.map(abattoir => (
                    <option key={abattoir} value={abattoir}>{abattoir}</option>
                  ))}
                </select>
              )}
              
              {/* Filtre par période */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الفترات' : 'Toutes les périodes'}</option>
                <option value="TODAY">{isRTL ? 'اليوم' : 'Aujourd\'hui'}</option>
                <option value="THIS_WEEK">{isRTL ? 'هذا الأسبوع' : 'Cette semaine'}</option>
                <option value="THIS_MONTH">{isRTL ? 'هذا الشهر' : 'Ce mois'}</option>
                <option value="LAST_7_DAYS">{isRTL ? 'آخر 7 أيام' : '7 derniers jours'}</option>
                <option value="LAST_30_DAYS">{isRTL ? 'آخر 30 يوم' : '30 derniers jours'}</option>
              </select>
            </div>
            
            {/* Bouton pour réinitialiser les filtres */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' || abattoirFilter !== 'ALL' || periodFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      setTypeFilter('ALL');
                      setAbattoirFilter('ALL');
                      setPeriodFilter('ALL');
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    {isRTL ? 'إعادة تعيين الفلاتر' : 'Réinitialiser les filtres'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Indicateur de résultats filtrés */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'عرض' : 'Affichage'} {filteredStabulations.length} {isRTL ? 'من أصل' : 'sur'} {stabulations.length} {isRTL ? 'إسطبل' : 'stabulation(s)'}
              </div>
              <div className="flex items-center gap-2 text-sm theme-text-tertiary theme-transition">
                <Activity className="h-4 w-4" />
                {isRTL ? 'آخر تحديث:' : 'Dernière mise à jour:'} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`h-5 w-5 text-green-500 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-6 py-6">
          <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error.message || 'Erreur lors du chargement des stabulations'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y theme-border-secondary theme-transition">
                  <thead className="theme-bg-secondary theme-transition">
                    <tr>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإسطبل' : 'Stabulation'}
                      </th>
                      {isSuperuser && (
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                          {isRTL ? 'المسلخ' : 'Abattoir'}
                        </th>
                      )}
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'النوع' : 'Type'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'السعة' : 'Capacité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحيوانات' : 'Animaux'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'تاريخ البداية' : 'Date début'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المدة' : 'Durée'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredStabulations.map((stabulation) => (
                      <tr key={stabulation.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Warehouse className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{stabulation.numero_stabulation}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {stabulation.id}</div>
                            </div>
                          </div>
                        </td>
                        {isSuperuser && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">
                                {stabulation.abattoir_nom || 'N/A'}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {stabulation.type_bete}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {stabulation.nombre_betes_actuelles} / {stabulation.capacite_maximale}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {stabulation.taux_occupation}% {isRTL ? 'إشغال' : 'occupé'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {stabulation.nombre_betes_actuelles} {isRTL ? 'رأس' : 'têtes'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {stabulation.places_disponibles} {isRTL ? 'مكان متاح' : 'places libres'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {formatDate(stabulation.date_debut)}
                            </div>
                            {stabulation.date_fin && (
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'انتهى' : 'Fin'}: {formatDate(stabulation.date_fin)}
                              </div>
                            )}
                            {/* Informations de suivi des actions */}
                            {stabulation.statut === 'ANNULE' && stabulation.annule_par_nom && (
                              <div className="text-xs theme-text-tertiary theme-transition mt-1">
                                {isRTL ? 'ألغاه' : 'Annulé par'}: {stabulation.annule_par_nom}
                                {stabulation.date_annulation && (
                                  <span className="ml-1">
                                    ({formatDate(stabulation.date_annulation)})
                                  </span>
                                )}
                              </div>
                            )}
                            {stabulation.statut === 'TERMINE' && stabulation.finalise_par_nom && (
                              <div className="text-xs theme-text-tertiary theme-transition mt-1">
                                {isRTL ? 'أنهاه' : 'Finalisé par'}: {stabulation.finalise_par_nom}
                                {stabulation.date_finalisation && (
                                  <span className="ml-1">
                                    ({formatDate(stabulation.date_finalisation)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(stabulation.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {stabulation.duree_stabulation_formatee || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            {/* Bouton Voir */}
                            <button 
                              onClick={() => handleViewStabulation(stabulation)}
                              className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {/* Actions pour stabulations EN_COURS */}
                            {stabulation.statut === 'EN_COURS' && (
                              <>
                                <button 
                                  onClick={() => handleTerminerStabulation(stabulation)}
                                  disabled={isFinishing || isLoadingDetails}
                                  className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white theme-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                  title={isRTL ? 'إنهاء الإسطبل' : 'Terminer la stabulation'}
                                >
                                  {isFinishing || isLoadingDetails ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {isRTL ? 'إنهاء' : 'Terminer'}
                                  </span>
                                </button>
                                
                                <button 
                                  onClick={() => handleAnnulerStabulation(stabulation)}
                                  disabled={isCancelling}
                                  className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white theme-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                  title={isRTL ? 'إلغاء الإسطبل' : 'Annuler la stabulation'}
                                >
                                  {isCancelling ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {isRTL ? 'إلغاء' : 'Annuler'}
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredStabulations.length === 0 && !loading && (
              <div className="text-center py-12">
                <Warehouse className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على إسطبلات' : 'Aucune stabulation trouvée'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة إسطبلات جديدة' : 'Commencez par ajouter de nouvelles stabulations'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de création */}
        <CreateStabulationModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          abattoirId={effectiveAbattoirId || 1} // Utiliser 1 par défaut
          abattoirNom={effectiveUser?.abattoir?.nom || 'Abattoir par défaut'}
          capaciteStabulationOvin={effectiveUser?.abattoir?.capacite_stabulation_ovin || 100}
          capaciteStabulationBovin={effectiveUser?.abattoir?.capacite_stabulation_bovin || 50}
        />

        {/* Modal de confirmation d'annulation */}
        {showCancelModal && selectedStabulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-md mx-4">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                </h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedStabulation(null);
                    setCancelReason('');
                  }}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="theme-text-secondary theme-transition mb-3">
                  {isRTL 
                    ? `يرجى كتابة سبب إلغاء الاسطبل "${selectedStabulation.numero_stabulation}". سيتم إرجاع جميع الحيوانات إلى حالة "حي" بعد الإلغاء.`
                    : `Veuillez saisir la raison de l'annulation de la stabulation "${selectedStabulation.numero_stabulation}". Tous les animaux seront remis en statut "vivant" après l'annulation.`
                  }
                </p>
                {/* Afficher la raison d'annulation existante si elle existe */}
                {selectedStabulation.raison_annulation && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border theme-border-primary">
                    <div className="text-sm font-medium theme-text-primary mb-1">
                      {isRTL ? 'السبب الحالي للإلغاء:' : 'Raison actuelle d\'annulation:'}
                    </div>
                    <div className="text-sm theme-text-secondary">
                      {selectedStabulation.raison_annulation}
                    </div>
                  </div>
                )}
                <textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    // Valider en temps réel
                    const error = validateCancelReason(e.target.value);
                    setCancelReasonError(error);
                  }}
                  placeholder={isRTL ? 'اكتب سبب الإلغاء هنا (10 أحرف على الأقل)...' : 'Saisissez la raison de l\'annulation ici (minimum 10 caractères)...'}
                  className={`w-full p-3 border rounded-lg theme-bg-secondary theme-text-primary theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${
                    cancelReasonError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : cancelReason.trim() && !cancelReasonError 
                        ? 'border-green-500 focus:ring-green-500' 
                        : 'theme-border-primary focus:ring-red-500'
                  }`}
                  rows={4}
                />
                
                {/* Affichage des erreurs et du compteur */}
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex-1">
                    {cancelReasonError && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {cancelReasonError}
                      </p>
                    )}
                    {!cancelReasonError && cancelReason.trim() && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {isRTL ? 'السبب صحيح' : 'Raison valide'}
                      </p>
                    )}
                  </div>
                  <div className="text-xs theme-text-secondary">
                    {cancelReason.length}/500
                  </div>
                </div>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedStabulation(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleCancelStabulation}
                  disabled={isCancelling || !cancelReason.trim() || !!cancelReasonError}
                  className={`flex-1 px-4 py-2 rounded-lg text-white theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !cancelReason.trim() || cancelReasonError
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {isCancelling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإلغاء...' : 'Annulation...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {!cancelReason.trim() || cancelReasonError ? (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Activity className="h-4 w-4 mr-2" />
                      )}
                      {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de finalisation de stabulation */}
        {showFinishModal && selectedStabulation && selectedStabulation.betes_info && selectedStabulation.betes_info.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b theme-border-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-xl font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'إنهاء الاسطبل' : 'Finaliser la stabulation'}
                </h3>
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    setSelectedStabulation(null);
                    setAnimalWeights({});
                    setAnimalPostNumbers({});
                  }}
                  className="p-2 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="theme-text-secondary theme-transition text-sm leading-relaxed">
                    {isRTL 
                      ? `يرجى إدخال وزن كل حيوان في الاسطبل "${selectedStabulation.numero_stabulation}" بعد الذبح. سيتم وضع جميع الحيوانات في حالة "مذبوح" بعد التأكيد.`
                      : `Veuillez saisir le poids de chaque animal de la stabulation "${selectedStabulation.numero_stabulation}" après l'abattage. Tous les animaux seront mis en statut "abattu" après confirmation.`
                    }
                  </p>
                </div>
                
                {/* Liste des animaux */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {selectedStabulation.betes_info.map((bete) => {
                    const currentWeight = animalWeights[bete.id] || 0;
                    const poidsVif = bete.poids || 0;
                    const isWeightValid = currentWeight > 0 && currentWeight <= poidsVif;
                    const isWeightTooHigh = currentWeight > poidsVif;
                    
                    return (
                      <div key={bete.id} className={`p-4 border rounded-lg theme-bg-secondary transition-all duration-200 ${
                        isWeightTooHigh 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                          : isWeightValid 
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                            : 'theme-border-primary'
                      }`}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Informations de l'animal */}
                          <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                  {bete.num_boucle.slice(-2)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium theme-text-primary truncate">
                                  {bete.nom || `Animal #${bete.num_boucle}`}
                                </div>
                                <div className="text-sm theme-text-secondary">
                                  {bete.espece} • {bete.race}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="theme-text-secondary">{isRTL ? 'الوزن الحي:' : 'Poids vif:'}</span>
                                <span className="font-medium theme-text-primary">{poidsVif}kg</span>
                              </div>
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                                bete.etat_sante === 'BON'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {bete.etat_sante === 'BON' ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                              </div>
                            </div>
                          </div>

                          {/* Champs de saisie */}
                          <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Champ poids à chaud */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text-secondary">
                                  {isRTL ? 'الوزن الساخن (كغ)' : 'Poids à chaud (kg)'}
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max={poidsVif}
                                    step="0.1"
                                    placeholder={isRTL ? 'الوزن' : 'Poids'}
                                    value={animalWeights[bete.id] || ''}
                                    onChange={(e) => setAnimalWeights(prev => ({
                                      ...prev,
                                      [bete.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className={`w-full px-3 py-2.5 border rounded-lg theme-bg-primary theme-text-primary focus:outline-none focus:ring-2 transition-all duration-200 ${
                                      isWeightTooHigh
                                        ? 'border-red-500 focus:ring-red-500'
                                        : isWeightValid
                                          ? 'border-green-500 focus:ring-green-500'
                                          : 'theme-border-primary focus:ring-blue-500'
                                    }`}
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm theme-text-secondary font-medium">
                                    kg
                                  </span>
                                </div>
                              </div>

                              {/* Champ numéro poste abattage */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text-secondary">
                                  {isRTL ? 'رقم البوست' : 'N° Poste abattage'}
                                </label>
                                <input
                                  type="text"
                                  placeholder={isRTL ? 'رقم البوست' : 'N° Poste'}
                                  value={animalPostNumbers[bete.id] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setAnimalPostNumbers(prev => ({
                                      ...prev,
                                      [bete.id]: value
                                    }));
                                    // Vérifier l'unicité en temps réel
                                    checkLocalPostNumberUniqueness(bete.id, value);
                                  }}
                                  className={`w-full px-3 py-2.5 border rounded-lg theme-bg-primary theme-text-primary focus:outline-none focus:ring-2 transition-all duration-200 ${
                                    postNumberErrors[bete.id] 
                                      ? 'border-red-500 focus:ring-red-500' 
                                      : 'theme-border-primary focus:ring-blue-500'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Messages de validation */}
                            <div className="mt-3 space-y-1">
                              {isWeightTooHigh && (
                                <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {isRTL ? 'أعلى من الوزن الحي' : 'Supérieur au poids vif'}
                                </div>
                              )}
                              {isWeightValid && (
                                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  {isRTL ? 'صحيح' : 'Valide'}
                                </div>
                              )}
                              {postNumberErrors[bete.id] && (
                                <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {postNumberErrors[bete.id]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer */}
              <div className={`flex gap-3 p-6 border-t theme-border-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    setSelectedStabulation(null);
                    setAnimalWeights({});
                    setAnimalPostNumbers({});
                    setPostNumberErrors({});
                  }}
                  className="flex-1 px-6 py-3 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleFinishStabulation}
                  disabled={isFinishing || !isAllFieldsFilled()}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isFinishing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإنهاء...' : 'Finalisation...'}
                    </div>
                  ) : (
                    isRTL ? 'تأكيد الإنهاء' : 'Confirmer la finalisation'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

