'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
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
  Square,
  Pause,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  useStabulationsByAbattoir, 
  useAllStabulations,
  useStabulationStats, 
  useDeleteStabulation,
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
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedStabulation, setSelectedStabulation] = useState<Stabulation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [animalWeights, setAnimalWeights] = useState<{[key: number]: number}>({});
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
        abattoir_id: effectiveAbattoirId || undefined,
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

  const deleteStabulationMutation = useDeleteStabulation();
  const terminerStabulationMutation = useTerminerStabulation();
  const annulerStabulationMutation = useAnnulerStabulation();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleViewStabulation = (stabulation: Stabulation) => {
    router.push(`/dashboard/stabulation/${stabulation.id}`);
  };

  const handleEditStabulation = (stabulation: Stabulation) => {
    // TODO: Implémenter la modification
    console.log('Modifier stabulation:', stabulation);
  };

  const handleDeleteStabulation = async (stabulationId: number, stabulationName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la stabulation "${stabulationName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStabulationMutation.mutateAsync(stabulationId);
      setSuccessMessage(`Stabulation "${stabulationName}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression de la stabulation:', err);
    }
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

  const handleAnnulerStabulation = (stabulation: Stabulation) => {
    setSelectedStabulation(stabulation);
    setShowCancelModal(true);
  };

  const handleCancelStabulation = async () => {
    if (!cancelReason.trim()) {
      alert(isRTL ? 'يرجى كتابة سبب الإلغاء' : 'Veuillez saisir la raison de l\'annulation');
      return;
    }

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

  const handleFinishStabulation = async () => {
    if (!selectedStabulation || !selectedStabulation.betes_info) return;

    // Vérifier que tous les poids sont saisis
    const missingWeights = selectedStabulation.betes_info.filter(bete => !animalWeights[bete.id] || animalWeights[bete.id] <= 0);
    if (missingWeights.length > 0) {
      alert(isRTL ? 'يرجى إدخال وزن جميع الحيوانات' : 'Veuillez saisir le poids de tous les animaux');
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

    setIsFinishing(true);
    try {
      // Préparer les données des poids
      const poidsData = selectedStabulation.betes_info.map(bete => ({
        bete_id: bete.id,
        poids_a_chaud: animalWeights[bete.id]
      }));

      const result = await terminerStabulationMutation.mutateAsync({
        id: selectedStabulation.id,
        poidsData: poidsData
      });
      
      setShowFinishModal(false);
      setAnimalWeights({});
      setSelectedStabulation(null);
      
      const message = isRTL 
        ? `تم إنهاء الاسطبل بنجاح. تم ذبح ${selectedStabulation.betes_info.length} حيوان`
        : `Stabulation terminée avec succès. ${selectedStabulation.betes_info.length} animaux abattus`;
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Erreur lors de la finalisation:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(isRTL ? `خطأ في إنهاء الاسطبل: ${errorMessage}` : `Erreur lors de la finalisation: ${errorMessage}`);
    } finally {
      setIsFinishing(false);
    }
  };

  // Filtrage des stabulations
  const stabulations = stabulationsData?.stabulations || [];
  const filteredStabulations = stabulations.filter(stabulation => {
    const matchesSearch = stabulation.numero_stabulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (stabulation.abattoir_nom && stabulation.abattoir_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (stabulation.notes && stabulation.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

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

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في الإسطبلات...' : 'Rechercher une stabulation...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                />
              </div>
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
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
                <option value="BOVIN">{isRTL ? 'بقر' : 'Bovin'}</option>
                <option value="OVIN">{isRTL ? 'غنم' : 'Ovin'}</option>
                <option value="CAPRIN">{isRTL ? 'ماعز' : 'Caprin'}</option>
                <option value="AUTRE">{isRTL ? 'أخرى' : 'Autre'}</option>
              </select>
              <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصفية' : 'Filtres'}
              </button>
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
                              <div className="text-sm theme-text-secondary theme-transition">
                                ID: {stabulation.abattoir || 'N/A'}
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
                            <button 
                              onClick={() => handleViewStabulation(stabulation)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {stabulation.statut === 'EN_COURS' && (
                              <>
                                <button 
                                  onClick={() => handleTerminerStabulation(stabulation)}
                                  disabled={isFinishing || isLoadingDetails}
                                  className="p-1 theme-text-tertiary hover:text-green-500 theme-transition disabled:opacity-50"
                                  title={isRTL ? 'إنهاء الإسطبل' : 'Terminer la stabulation'}
                                >
                                  {isFinishing || isLoadingDetails ? (
                                    <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleAnnulerStabulation(stabulation)}
                                  disabled={isCancelling}
                                  className="p-1 theme-text-tertiary hover:text-orange-500 theme-transition disabled:opacity-50"
                                  title={isRTL ? 'إلغاء الإسطبل' : 'Annuler la stabulation'}
                                >
                                  {isCancelling ? (
                                    <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleEditStabulation(stabulation)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل الإسطبل' : 'Modifier la stabulation'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStabulation(stabulation.id, stabulation.numero_stabulation)}
                              disabled={deleteStabulationMutation.isPending}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف الإسطبل' : 'Supprimer la stabulation'}
                            >
                              {deleteStabulationMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
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
          onClose={() => setIsCreateModalOpen(false)}
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
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={isRTL ? 'اكتب سبب الإلغاء هنا...' : 'Saisissez la raison de l\'annulation ici...'}
                  className="w-full p-3 border theme-border-primary rounded-lg theme-bg-secondary theme-text-primary theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 resize-none"
                  rows={4}
                />
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
                  disabled={isCancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإلغاء...' : 'Annulation...'}
                    </div>
                  ) : (
                    isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de finalisation de stabulation */}
        {showFinishModal && selectedStabulation && selectedStabulation.betes_info && selectedStabulation.betes_info.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'إنهاء الاسطبل' : 'Finaliser la stabulation'}
                </h3>
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    setSelectedStabulation(null);
                    setAnimalWeights({});
                  }}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="theme-text-secondary theme-transition mb-4">
                  {isRTL 
                    ? `يرجى إدخال وزن كل حيوان في الاسطبل "${selectedStabulation.numero_stabulation}" بعد الذبح. سيتم وضع جميع الحيوانات في حالة "مذبوح" بعد التأكيد.`
                    : `Veuillez saisir le poids de chaque animal de la stabulation "${selectedStabulation.numero_stabulation}" après l'abattage. Tous les animaux seront mis en statut "abattu" après confirmation.`
                  }
                </p>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                  {bete.numero_identification.slice(-2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium theme-text-primary">
                                  {bete.nom || `Animal #${bete.numero_identification}`}
                                </div>
                                <div className="text-sm theme-text-secondary">
                                  {bete.espece} • {bete.race}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="theme-text-secondary">{isRTL ? 'الوزن الحي:' : 'Poids vif:'}</span>
                                <span className="font-medium theme-text-primary">{poidsVif}kg</span>
                              </div>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                bete.etat_sante === 'BON'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {bete.etat_sante === 'BON' ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
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
                                className={`w-28 px-3 py-2 border rounded-lg theme-bg-primary theme-text-primary focus:outline-none focus:ring-2 transition-all duration-200 ${
                                  isWeightTooHigh
                                    ? 'border-red-500 focus:ring-red-500'
                                    : isWeightValid
                                      ? 'border-green-500 focus:ring-green-500'
                                      : 'theme-border-primary focus:ring-blue-500'
                                }`}
                              />
                              <span className="text-sm theme-text-secondary font-medium">kg</span>
                            </div>
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
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    setSelectedStabulation(null);
                    setAnimalWeights({});
                  }}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleFinishStabulation}
                  disabled={isFinishing}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

