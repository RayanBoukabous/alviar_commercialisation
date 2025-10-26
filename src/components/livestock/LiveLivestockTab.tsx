'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye,
  Activity,
  Heart,
  Tag,
  Scale,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLiveLivestock } from '@/lib/hooks/useLivestock';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Bete } from '@/lib/api/livestockService';
import UpdateBeteModal from './UpdateBeteModal';
import Pagination from '@/components/ui/Pagination';
import StatisticsCards from './StatisticsCards';
import LivestockTableRow from './LivestockTableRow';

interface LiveLivestockProps {
  isRTL: boolean;
}

// Fonction pour mapper les données de l'API vers le format du tableau - mémorisée
const mapBeteToTableFormat = (bete: any) => {
  // Déterminer la priorité basée sur l'urgence d'abattage
  const priority = bete.abattage_urgence ? 'HIGH' : 'MEDIUM';
  
  // Utiliser les champs directement de l'API
  const especeNom = bete.espece_nom || 'Non spécifié';
  const abattoirNom = bete.abattoir_nom || 'Non spécifié';
  
  // Déterminer le statut correct - vérifier plusieurs champs possibles
  let status = 'VIVANT'; // Par défaut
  if (bete.statut) {
    status = bete.statut;
  } else if (bete.etat) {
    status = bete.etat;
  } else if (bete.etat_sante === 'MALADE') {
    status = 'MALADE';
  }
  
  // Normaliser le statut pour correspondre aux valeurs attendues
  const normalizedStatus = status.toUpperCase();
  
  return {
    id: bete.id.toString(),
    loopNumber: bete.numero_identification,
    type: especeNom.toUpperCase() as 'BOVIN' | 'OVIN' | 'CAPRIN',
    breed: especeNom, // Utiliser le nom de l'espèce comme race
    age: 0, // Pas d'âge dans notre modèle actuel
    weight: bete.poids_vif ? parseFloat(bete.poids_vif.toString()) : 0,
    gender: bete.sexe === 'M' ? 'MALE' : 'FEMALE',
    status: normalizedStatus as 'VIVANT' | 'EN_STABULATION' | 'ABATTU' | 'MALADE' | 'MORT',
    arrivalDate: bete.created_at,
    origin: abattoirNom,
    healthStatus: bete.etat_sante as 'BON' | 'MALADE', // État de santé
    abattoirId: bete.abattoir || 0,
    abattoirName: abattoirNom,
    estimatedSlaughterDate: undefined, // Pas de date d'abattage prévue dans notre modèle
    priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
    notes: bete.abattage_urgence ? 'Abattage urgent requis' : undefined
  };
};

const LiveLivestockTab = memo(function LiveLivestockTab({ isRTL }: LiveLivestockProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deletingLivestockId, setDeletingLivestockId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBete, setSelectedBete] = useState<any>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce pour la recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Récupérer la liste des abattoirs et des espèces
  const { data: abattoirsList } = useAbattoirsList();
  const { data: especesList } = useEspeces();

  // Optimisation: mémoriser les filtres pour éviter les recalculs
  const filters = useMemo(() => {
    const baseFilters: any = {
      page: currentPage,
      page_size: pageSize
    };

    if (debouncedSearchTerm) {
      baseFilters.search = debouncedSearchTerm;
    }
    if (healthFilter !== 'ALL') {
      baseFilters.etat_sante = healthFilter as 'BON' | 'MALADE';
    }
    if (abattoirFilter !== 'ALL') {
      baseFilters.abattoir_id = parseInt(abattoirFilter);
    }
    if (typeFilter !== 'ALL') {
      baseFilters.espece_nom = typeFilter;
    }
    if (statusFilter !== 'ALL') {
      baseFilters.statut = statusFilter;
    }

    return baseFilters;
  }, [currentPage, pageSize, debouncedSearchTerm, healthFilter, abattoirFilter, typeFilter, statusFilter]);

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, typeFilter, healthFilter, abattoirFilter, statusFilter, pageSize]);

  // Utiliser le hook pour récupérer les bêtes vivantes avec filtres API
  const { data: livestockData, isLoading: loading, error, refetch } = useLiveLivestock(filters);

  // Optimisation: mémoriser le mapping des données
  const liveLivestock = useMemo(() => 
    livestockData?.betes?.map(mapBeteToTableFormat) || [], 
    [livestockData?.betes]
  );

  // Plus besoin de filtrage côté client, tout est fait côté serveur
  const filteredLiveLivestock = liveLivestock;

  // Optimisation: mémoriser les fonctions de rendu des badges
  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      VIVANT: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'حي' : 'Vivant',
        icon: Heart
      },
      EN_STABULATION: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'في الحظيرة' : 'En stabulation',
        icon: Building2
      },
      ABATTU: { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'مذبوح' : 'Abattu',
        icon: Activity
      },
      MORT: { 
        bg: 'bg-gray-200 dark:bg-gray-900/50', 
        text: 'text-gray-900 dark:text-gray-100', 
        border: 'border-gray-300 dark:border-gray-700',
        label: isRTL ? 'ميت' : 'Mort',
        icon: X
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.VIVANT;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  }, [isRTL]);

  const getPriorityBadge = useCallback((priority: string) => {
    const priorityConfig = {
      HIGH: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'عالي' : 'Élevée'
      },
      MEDIUM: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'متوسط' : 'Moyenne'
      },
      LOW: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'منخفض' : 'Faible'
      }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  }, [isRTL]);

  const getHealthBadge = useCallback((health: string) => {
    const healthConfig = {
      BON: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'جيد' : 'Bon'
      },
      MALADE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'مريض' : 'Malade'
      }
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  }, [isRTL]);

  const formatDate = useCallback((dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const handleDeleteLivestock = useCallback(async (livestockId: string, loopNumber: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la bête "${loopNumber}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingLivestockId(livestockId);
      // TODO: Implémenter l'appel API pour supprimer la bête
      // await livestockService.deleteLivestock(parseInt(livestockId));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rafraîchir les données après suppression
      refetch();
      console.log(`Bête ${loopNumber} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la bête:', err);
    } finally {
      setDeletingLivestockId(null);
    }
  }, [refetch]);

  const handleOpenUpdateModal = useCallback((bete: any) => {
    setSelectedBete(bete);
    setIsUpdateModalOpen(true);
  }, []);

  const handleCloseUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    setSelectedBete(null);
  }, []);

  // Fonctions de pagination - optimisées avec useCallback
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Réinitialiser à la première page
  }, []);

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setHealthFilter('ALL');
    setAbattoirFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  }, []);

  // Optimisation: mémoriser le calcul des filtres actifs
  const activeFiltersCount = useMemo(() => [
    searchTerm,
    typeFilter !== 'ALL',
    healthFilter !== 'ALL',
    abattoirFilter !== 'ALL',
    statusFilter !== 'ALL'
  ].filter(Boolean).length, [searchTerm, typeFilter, healthFilter, abattoirFilter, statusFilter]);

  // Optimisation: mémoriser les calculs de pagination
  const paginationInfo = useMemo(() => {
    const totalItems = livestockData?.pagination?.total_count || 0;
    const totalPages = livestockData?.pagination?.total_pages || Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return { totalItems, totalPages, startItem, endItem };
  }, [livestockData?.pagination, currentPage, pageSize]);

  // Optimisation: mémoriser les statistiques
  const statistics = useMemo(() => ({
    globalTotalCount: livestockData?.statistics?.total_count || 0,
    liveCount: livestockData?.statistics?.live_count || 0,
    carcassCount: livestockData?.statistics?.carcass_count || 0,
    globalTotalWeight: Math.round(livestockData?.statistics?.total_weight || 0),
    globalAverageWeight: Math.round(livestockData?.statistics?.average_weight || 0)
  }), [livestockData?.statistics]);

  return (
    <div className="space-y-6">
      {/* Statistiques rapides - composant optimisé */}
      <StatisticsCards statistics={statistics} isRTL={isRTL} />

      {/* Filtres améliorés */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
        {/* En-tête des filtres */}
        <div className="px-6 py-4 border-b theme-border-secondary">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="flex items-center">
                <Filter className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <h3 className="text-lg font-semibold theme-text-primary">
                  {isRTL ? 'الفلاتر' : 'Filtres'}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={resetAllFilters}
                disabled={activeFiltersCount === 0}
                className={`flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeFiltersCount > 0 
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
              </button>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg border theme-border-primary hover:theme-bg-secondary transition-colors`}
            >
              {isRTL ? 'فلاتر متقدمة' : 'Filtres avancés'}
              {showAdvancedFilters ? (
                <ChevronUp className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
              ) : (
                <ChevronDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Filtres de base */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
              <input
                type="text"
                placeholder={isRTL ? 'البحث في الماشية...' : 'Rechercher dans les bêtes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
              />
            </div>

            {/* Type/Espèce */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                {isRTL ? 'النوع' : 'Type'}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
                {especesList?.map((espece) => (
                  <option key={espece.id} value={espece.nom}>
                    {espece.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* État de santé */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                {isRTL ? 'الحالة الصحية' : 'État de santé'}
              </label>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les états'}</option>
                <option value="BON">{isRTL ? 'جيد' : 'Bon'}</option>
                <option value="MALADE">{isRTL ? 'مريض' : 'Malade'}</option>
              </select>
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t theme-border-secondary">
              <h4 className="text-sm font-medium theme-text-primary mb-4">
                {isRTL ? 'فلاتر إضافية' : 'Filtres supplémentaires'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Abattoir */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'المجزر' : 'Abattoir'}
                  </label>
                  <select
                    value={abattoirFilter}
                    onChange={(e) => setAbattoirFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                  >
                    <option value="ALL">{isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}</option>
                    {abattoirsList?.map((abattoir) => (
                      <option key={abattoir.id} value={abattoir.id.toString()}>
                        {abattoir.nom} - {abattoir.wilaya}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'الحالة' : 'Statut'}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                  >
                    <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                    <option value="VIVANT">{isRTL ? 'حي' : 'Vivant'}</option>
                    <option value="EN_STABULATION">{isRTL ? 'في الحظيرة' : 'En stabulation'}</option>
                    {/* Suppression des options ABATTU et MORT car cette page ne concerne que les bêtes vivantes */}
                  </select>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Chargement des bêtes">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="sr-only">Chargement des bêtes en cours...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <X className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}
            </h3>
            <p className="theme-text-secondary mb-4">
              {isRTL ? 'حدث خطأ أثناء تحميل بيانات الماشية' : 'Une erreur est survenue lors du chargement des données'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              aria-label={isRTL ? 'إعادة المحاولة' : 'Réessayer le chargement'}
            >
              {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y theme-border-secondary theme-transition" role="table" aria-label={isRTL ? 'جدول الماشية الحية' : 'Tableau des bêtes vivantes'}>
              <thead className="theme-bg-secondary theme-transition">
                <tr>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'رقم البوق' : 'Numéro de boucle'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'النوع والعرق' : 'Type & Race'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الوزن والعمر' : 'Poids & Âge'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'المجزر' : 'Abattoir'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة' : 'Statut'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة الصحية' : 'État de santé'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'تاريخ الذبح المتوقع' : 'Date abattage prévue'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredLiveLivestock.map((item) => (
                  <LivestockTableRow
                    key={item.id}
                    item={item}
                    isRTL={isRTL}
                    deletingLivestockId={deletingLivestockId}
                    onDelete={handleDeleteLivestock}
                    onEdit={(bete) => {
                      // Trouver la bête originale dans les données API
                      const originalBete = livestockData?.betes?.find((b: any) => b.id.toString() === bete.id);
                      handleOpenUpdateModal(originalBete);
                    }}
                    getStatusBadge={getStatusBadge}
                    getHealthBadge={getHealthBadge}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredLiveLivestock.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isRTL={isRTL}
          />
        )}
        
        {filteredLiveLivestock.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا توجد ماشية' : 'Aucune bête'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لا توجد حيوانات تطابق المعايير المحددة' : 'Aucun animal ne correspond aux critères sélectionnés'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de mise à jour */}
      <UpdateBeteModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        bete={selectedBete}
        isRTL={isRTL}
        onUpdateSuccess={refetch}
      />
    </div>
  );
});

export default LiveLivestockTab;
