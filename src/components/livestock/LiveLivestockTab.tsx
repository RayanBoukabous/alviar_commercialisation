'use client';

import React, { useState, useEffect } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { useLiveLivestock } from '@/lib/hooks/useLivestock';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Bete } from '@/lib/api/livestockService';
import UpdateBeteModal from './UpdateBeteModal';
import Pagination from '@/components/ui/Pagination';

interface LiveLivestockProps {
  isRTL: boolean;
}

// Fonction pour mapper les données de l'API vers le format du tableau
const mapBeteToTableFormat = (bete: any) => {
  // Déterminer la priorité basée sur l'urgence d'abattage
  const priority = bete.abattage_urgence ? 'HIGH' : 'MEDIUM';
  
  // Utiliser les champs directement de l'API
  const especeNom = bete.espece_nom || 'Non spécifié';
  const abattoirNom = bete.abattoir_nom || 'Non spécifié';
  
  return {
    id: bete.id.toString(),
    loopNumber: bete.numero_identification,
    type: especeNom.toUpperCase() as 'BOVIN' | 'OVIN' | 'CAPRIN',
    breed: especeNom, // Utiliser le nom de l'espèce comme race
    age: 0, // Pas d'âge dans notre modèle actuel
    weight: bete.poids_vif ? parseFloat(bete.poids_vif.toString()) : 0,
    gender: bete.sexe === 'M' ? 'MALE' : 'FEMALE',
    status: bete.statut as 'VIVANT' | 'EN_STABULATION' | 'ABATTU' | 'MALADE' | 'MORT', // Statut de vie
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

export default function LiveLivestockTab({ isRTL }: LiveLivestockProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
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

  // Préparer les filtres en excluant les valeurs undefined
  const filters: any = {
    page: currentPage,
    page_size: pageSize
  };

  if (debouncedSearchTerm) {
    filters.search = debouncedSearchTerm;
  }
  if (healthFilter !== 'ALL') {
    filters.etat_sante = healthFilter as 'BON' | 'MALADE';
  }
  if (abattoirFilter !== 'ALL') {
    filters.abattoir_id = parseInt(abattoirFilter);
  }
  if (typeFilter !== 'ALL') {
    filters.espece_nom = typeFilter;
  }

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, typeFilter, healthFilter, abattoirFilter, pageSize]);

  // Debug: afficher les filtres
  console.log('Filtres appliqués:', filters);

  // Utiliser le hook pour récupérer les bêtes vivantes avec filtres API
  const { data: livestockData, isLoading: loading, error, refetch } = useLiveLivestock(filters);

  // Mapper les données de l'API vers le format du tableau
  const liveLivestock = livestockData?.betes?.map(mapBeteToTableFormat) || [];

  // Plus besoin de filtrage côté client, tout est fait côté serveur
  const filteredLiveLivestock = liveLivestock;

  const getStatusBadge = (status: string) => {
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
  };

  const getPriorityBadge = (priority: string) => {
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
  };

  const getHealthBadge = (health: string) => {
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
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteLivestock = async (livestockId: string, loopNumber: string) => {
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
  };

  const handleOpenUpdateModal = (bete: any) => {
    setSelectedBete(bete);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedBete(null);
  };

  // Fonctions de pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Réinitialiser à la première page
  };

  // Calculer les informations de pagination
  const totalItems = livestockData?.pagination?.total_count || 0;
  const totalPages = livestockData?.pagination?.total_pages || Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Statistiques globales (basées sur les données de l'API)
  const globalTotalCount = livestockData?.statistics?.total_count || 0;
  const liveCount = livestockData?.statistics?.live_count || 0;
  const carcassCount = livestockData?.statistics?.carcass_count || 0;
  const globalTotalWeight = Math.round(livestockData?.statistics?.total_weight || 0);
  const globalAverageWeight = Math.round(livestockData?.statistics?.average_weight || 0);

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي الرؤوس' : 'Total têtes'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{globalTotalCount}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{globalTotalWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'متوسط الوزن' : 'Poids moyen'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{globalAverageWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'حي' : 'Vivantes'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {liveCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-4">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في الماشية...' : 'Rechercher dans les bêtes...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
            {especesList?.map((espece) => (
              <option key={espece.id} value={espece.nom}>
                {espece.nom}
              </option>
            ))}
          </select>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الحالات الصحية' : 'Tous les états de santé'}</option>
            <option value="BON">{isRTL ? 'جيد' : 'Bon'}</option>
            <option value="MALADE">{isRTL ? 'مريض' : 'Malade'}</option>
          </select>
          <select
            value={abattoirFilter}
            onChange={(e) => setAbattoirFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}</option>
            {abattoirsList?.map((abattoir) => (
              <option key={abattoir.id} value={abattoir.id.toString()}>
                {abattoir.nom} - {abattoir.wilaya}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
            >
              {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y theme-border-secondary theme-transition">
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
                  <tr key={item.id} className="transition-colors hover:theme-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                          <div className="text-sm font-medium theme-text-primary theme-transition">{item.loopNumber}</div>
                          <div className="text-sm theme-text-secondary theme-transition">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{item.type}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{item.breed}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {item.weight} kg
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {item.age} {isRTL ? 'شهر' : 'mois'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{item.abattoirName}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{item.origin}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getHealthBadge(item.healthStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                      {item.estimatedSlaughterDate ? formatDate(item.estimatedSlaughterDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        <button 
                          onClick={() => router.push(`/dashboard/livestock/${item.id}`)}
                          className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // Trouver la bête originale dans les données API
                            const originalBete = livestockData?.betes?.find((b: any) => b.id.toString() === item.id);
                            handleOpenUpdateModal(originalBete);
                          }}
                          className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                          title={isRTL ? 'تعديل البête' : 'Modifier la bête'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLivestock(item.id, item.loopNumber)}
                          disabled={deletingLivestockId === item.id}
                          className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                          title={isRTL ? 'حذف البête' : 'Supprimer la bête'}
                        >
                          {deletingLivestockId === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredLiveLivestock.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
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
}
