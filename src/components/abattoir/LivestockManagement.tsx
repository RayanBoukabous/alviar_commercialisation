'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveLivestock } from '@/lib/hooks/useLivestock';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Bete } from '@/lib/api/livestockService';
import Pagination from '@/components/ui/Pagination';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Activity,
  Calendar,
  User,
  RefreshCw,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Download,
  Printer,
  Heart,
  Skull,
  TrendingUp,
  Users,
  Tag,
  Scale
} from 'lucide-react';

// Interface pour le bétail
interface Livestock {
  id: string;
  loopNumber: string; // Numéro de boucle
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  age: number; // en mois
  weight: number; // en kg
  gender: 'MALE' | 'FEMALE';
  status: 'EN_ATTENTE' | 'EN_TRAITEMENT' | 'ABATTU' | 'TRANSFERE' | 'REJETE';
  arrivalDate: string;
  lastActivity: string;
  origin: string;
  healthStatus: 'BON' | 'MALADE';
  notes?: string;
  transferHistory?: TransferRecord[];
}

// Fonction pour mapper les données API vers le format de l'interface
const mapBeteToLivestock = (bete: Bete): Livestock => {
  return {
    id: bete.id.toString(),
    loopNumber: bete.numero_identification || 'N/A',
    type: (bete.espece_nom || bete.espece?.nom || 'BOVIN').toUpperCase() as 'BOVIN' | 'OVIN' | 'CAPRIN',
    breed: bete.espece_nom || bete.espece?.nom || 'Non spécifié',
    age: 0, // Pas disponible dans l'API actuelle
    weight: bete.poids_vif || 0,
    gender: bete.sexe === 'M' ? 'MALE' : 'FEMALE',
    status: bete.statut as 'EN_ATTENTE' | 'EN_TRAITEMENT' | 'ABATTU' | 'TRANSFERE' | 'REJETE' || 'EN_ATTENTE',
    arrivalDate: bete.created_at,
    lastActivity: bete.updated_at,
    origin: bete.abattoir_nom || bete.abattoir?.nom || 'Non spécifié',
    healthStatus: bete.etat_sante as 'BON' | 'MALADE' || 'BON',
    notes: '',
    transferHistory: []
  };
};

// Interface pour les transferts
interface TransferRecord {
  id: string;
  livestockId: string;
  fromAbattoir: string;
  toAbattoir: string;
  transferDate: string;
  reason: string;
  authorizedBy: string;
  transferDocument: string;
  status: 'EN_COURS' | 'COMPLETE' | 'ANNULE';
}

// Interface pour les bons de transfert
interface TransferDocument {
  id: string;
  documentNumber: string;
  transferDate: string;
  fromAbattoir: {
    name: string;
    address: string;
    manager: string;
    phone: string;
  };
  toAbattoir: {
    name: string;
    address: string;
    manager: string;
    phone: string;
  };
  livestock: {
    loopNumber: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    gender: string;
  };
  reason: string;
  authorizedBy: string;
  status: 'DRAFT' | 'SIGNED' | 'COMPLETED';
  createdAt: string;
}

// Données mock pour le bétail
const mockLivestock: Livestock[] = [
  {
    id: 'LIV001',
    loopNumber: 'DZ-ALG-2024-001234',
    type: 'BOVIN',
    breed: 'Holstein',
    age: 24,
    weight: 450,
    gender: 'FEMALE',
    status: 'EN_ATTENTE',
    arrivalDate: '2024-01-15T08:30:00Z',
    lastActivity: '2024-01-15T08:30:00Z',
    origin: 'Ferme de Blida',
    healthStatus: 'BON',
    notes: 'Animal en bonne santé, prêt pour l\'abattage'
  },
  {
    id: 'LIV002',
    loopNumber: 'DZ-ALG-2024-001235',
    type: 'BOVIN',
    breed: 'Charolais',
    age: 30,
    weight: 520,
    gender: 'MALE',
    status: 'EN_TRAITEMENT',
    arrivalDate: '2024-01-14T10:15:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
    origin: 'Ferme de Tipaza',
    healthStatus: 'BON',
    notes: 'En cours de traitement'
  },
  {
    id: 'LIV003',
    loopNumber: 'DZ-ALG-2024-001236',
    type: 'OVIN',
    breed: 'Ouled Djellal',
    age: 12,
    weight: 35,
    gender: 'FEMALE',
    status: 'ABATTU',
    arrivalDate: '2024-01-13T09:00:00Z',
    lastActivity: '2024-01-14T16:45:00Z',
    origin: 'Ferme de Médéa',
    healthStatus: 'BON',
    notes: 'Abattage terminé avec succès'
  },
  {
    id: 'LIV004',
    loopNumber: 'DZ-ALG-2024-001237',
    type: 'BOVIN',
    breed: 'Limousine',
    age: 28,
    weight: 480,
    gender: 'MALE',
    status: 'TRANSFERE',
    arrivalDate: '2024-01-12T11:30:00Z',
    lastActivity: '2024-01-13T10:20:00Z',
    origin: 'Ferme de Boumerdès',
    healthStatus: 'BON',
    notes: 'Transféré vers Abattoir de Blida',
    transferHistory: [
      {
        id: 'TRF001',
        livestockId: 'LIV004',
        fromAbattoir: 'Abattoir Central d\'Alger',
        toAbattoir: 'Abattoir de Blida',
        transferDate: '2024-01-13T10:20:00Z',
        reason: 'Capacité insuffisante',
        authorizedBy: 'Ahmed Benali',
        transferDocument: 'TRF-2024-001',
        status: 'COMPLETE'
      }
    ]
  },
  {
    id: 'LIV005',
    loopNumber: 'DZ-ALG-2024-001238',
    type: 'CAPRIN',
    breed: 'Chèvre locale',
    age: 18,
    weight: 25,
    gender: 'FEMALE',
    status: 'REJETE',
    arrivalDate: '2024-01-11T14:45:00Z',
    lastActivity: '2024-01-12T09:15:00Z',
    origin: 'Ferme de Chéraga',
    healthStatus: 'MALADE',
    notes: 'Rejeté pour problèmes de santé'
  }
];

interface LivestockManagementProps {
  abattoirId: number;
  isRTL: boolean;
}

export default function LivestockManagement({ abattoirId, isRTL }: LivestockManagementProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedLivestock, setSelectedLivestock] = useState<Livestock | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSlaughterModal, setShowSlaughterModal] = useState(false);
  const [transferDocuments, setTransferDocuments] = useState<TransferDocument[]>([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce pour la recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Récupérer la liste des espèces depuis le backend
  const { data: especesList } = useEspeces();

  // Préparer les filtres pour l'API
  const filters: any = {
    abattoir_id: abattoirId,
    page: currentPage,
    page_size: pageSize
  };

  if (debouncedSearchTerm) {
    filters.search = debouncedSearchTerm;
  }
  if (statusFilter !== 'ALL') {
    filters.statut = statusFilter;
  }
  if (typeFilter !== 'ALL') {
    filters.espece_nom = typeFilter;
  }

  // Hook pour récupérer les bêtes de cet abattoir (pour la liste paginée et les statistiques)
  const { data: livestockData, isLoading: loading, error, refetch } = useLiveLivestock(filters);
  
  // Mapper les données API vers le format de l'interface
  const livestock = livestockData?.betes?.map(mapBeteToLivestock) || [];

  // Debug: afficher les données reçues
  console.log('Debug - Filtres appliqués:', filters);
  console.log('Debug - Données API reçues:', livestockData?.betes?.length, 'bêtes');
  console.log('Debug - Première bête (structure):', livestockData?.betes?.[0]);
  console.log('Debug - Types d\'espèces dans les données:', livestockData?.betes?.map(b => b.espece?.nom).filter((v, i, a) => a.indexOf(v) === i));

  // Les filtres sont maintenant gérés côté serveur
  const filteredLivestock = livestock;

  // Utiliser les statistiques filtrées (cohérentes avec le tableau)
  const stats = livestockData ? {
    total: livestockData.statistics.total_count,
    healthy: livestockData.statistics.live_count, // Les bêtes vivantes
    sick: 0, // Pas de données spécifiques pour les malades dans l'API actuelle
    slaughteredToday: 0, // Toujours 0 comme demandé
    carcasses: livestockData.statistics.carcass_count, // Les carcasses
    speciesCount: livestockData.statistics.especes_stats.reduce((acc, espece) => {
      acc[espece.espece__nom.toUpperCase()] = { total: espece.count, healthy: espece.count, sick: 0 };
      return acc;
    }, {} as Record<string, { total: number; healthy: number; sick: number }>)
  } : {
    total: 0,
    healthy: 0,
    sick: 0,
    slaughteredToday: 0,
    carcasses: 0,
    speciesCount: {}
  };


  // Statistiques de poids (basées sur les données filtrées)
  const weightStats = livestockData ? {
    totalWeight: Math.round(livestockData.statistics.total_weight || 0),
    averageWeight: Math.round(livestockData.statistics.average_weight || 0)
  } : {
    totalWeight: 0,
    averageWeight: 0
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      VIVANT: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'حي' : 'Vivant',
        icon: Heart
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
      },
      MALADE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'مريض' : 'Malade',
        icon: AlertTriangle
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
      },
      MOYEN: { 
        bg: 'bg-yellow-200 dark:bg-yellow-900/50', 
        text: 'text-yellow-900 dark:text-yellow-100', 
        border: 'border-yellow-300 dark:border-yellow-700',
        label: isRTL ? 'متوسط' : 'Moyen'
      },
      MAUVAIS: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'سيء' : 'Mauvais'
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSlaughter = (animal: Livestock) => {
    setSelectedLivestock(animal);
    setShowSlaughterModal(true);
  };

  const handleTransfer = (animal: Livestock) => {
    setSelectedLivestock(animal);
    setShowTransferModal(true);
  };

  const confirmSlaughter = async () => {
    if (!selectedLivestock) return;

    try {
      // TODO: Implémenter l'appel API pour l'abattage
      console.log(`Animal ${selectedLivestock.loopNumber} abattu avec succès`);
      
      setShowSlaughterModal(false);
      setSelectedLivestock(null);
      
      // Rafraîchir les données
      await refetch();
    } catch (err) {
      console.error('Erreur lors de l\'abattage:', err);
    }
  };

  const confirmTransfer = async (transferData: any) => {
    if (!selectedLivestock) return;

    try {
      // Générer un bon de transfert
      const transferDoc: TransferDocument = {
        id: `TRF-${Date.now()}`,
        documentNumber: `TRF-2024-${String(transferDocuments.length + 1).padStart(3, '0')}`,
        transferDate: new Date().toISOString(),
        fromAbattoir: {
          name: 'Abattoir Central d\'Alger',
          address: 'Route de l\'Abattoir, Alger Centre',
          manager: 'Ahmed Benali',
          phone: '+213 21 45 67 89'
        },
        toAbattoir: {
          name: transferData.toAbattoir,
          address: transferData.toAddress,
          manager: transferData.toManager,
          phone: transferData.toPhone
        },
        livestock: {
          loopNumber: selectedLivestock.loopNumber,
          type: selectedLivestock.type,
          breed: selectedLivestock.breed,
          age: selectedLivestock.age,
          weight: selectedLivestock.weight,
          gender: selectedLivestock.gender
        },
        reason: transferData.reason,
        authorizedBy: 'Ahmed Benali',
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };

      setTransferDocuments(prev => [...prev, transferDoc]);
      
      setShowTransferModal(false);
      setSelectedLivestock(null);
      
      // Rafraîchir les données
      await refetch();
      
      console.log(`Animal ${selectedLivestock.loopNumber} transféré avec succès`);
    } catch (err) {
      console.error('Erreur lors du transfert:', err);
    }
  };

  const printTransferDocument = (doc: TransferDocument) => {
    // Simulation d'impression
    console.log('Impression du bon de transfert:', doc.documentNumber);
    // Ici vous pourriez ouvrir une nouvelle fenêtre avec le document formaté
  };

  const downloadTransferDocument = (doc: TransferDocument) => {
    // Simulation de téléchargement
    console.log('Téléchargement du bon de transfert:', doc.documentNumber);
    // Ici vous pourriez générer un PDF et le télécharger
  };

  return (
    <div className="space-y-6">
      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading pour les statistiques
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-6 w-6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Erreur dans le chargement des statistiques
          <div className="col-span-full theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'خطأ في تحميل الإحصائيات' : 'Erreur lors du chargement des statistiques'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Total */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'المجموع' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary theme-transition">
                    {stats.total}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(stats.speciesCount).slice(0, 3).map(([species, speciesData]) => (
                      <span 
                        key={species} 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white shadow-sm"
                      >
                        {species}: {typeof speciesData === 'number' ? speciesData : speciesData.total}
                      </span>
                    ))}
                    {Object.keys(stats.speciesCount).length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500 text-white shadow-sm">
                        +{Object.keys(stats.speciesCount).length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

        {/* Bonne santé */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'بصحة جيدة' : 'Bonne santé'}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.healthy}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Carcasses */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'الذبائح' : 'Carcasses'}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.carcasses}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Skull className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Abattage aujourd'hui */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'ذبح اليوم' : 'Abattage aujourd\'hui'}
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.slaughteredToday}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Skull className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

          </>
        )}
      </div>

      {/* Statistiques de poids - Deuxième ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          // Skeleton loading pour les cartes de poids
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-6 w-6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-600">{error.message || 'Erreur lors du chargement des statistiques'}</p>
          </div>
        ) : (
          <>
            {/* Poids total */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary theme-transition">
                    {weightStats.totalWeight} kg
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Scale className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Poids moyen */}
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-medium theme-text-secondary theme-transition">
                    {isRTL ? 'متوسط الوزن' : 'Poids moyen'}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary theme-transition">
                    {weightStats.averageWeight} kg
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إدارة الماشية' : 'Gestion du bétail'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Actualiser'}
            </button>
            <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إضافة ماشية' : 'Ajouter du bétail'}
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث برقم البوق...' : 'Rechercher par numéro de boucle...'}
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
            <option value="EN_ATTENTE">{isRTL ? 'في الانتظار' : 'En attente'}</option>
            <option value="EN_TRAITEMENT">{isRTL ? 'قيد المعالجة' : 'En traitement'}</option>
            <option value="ABATTU">{isRTL ? 'مذبوح' : 'Abattu'}</option>
            <option value="TRANSFERE">{isRTL ? 'منقول' : 'Transféré'}</option>
            <option value="REJETE">{isRTL ? 'مرفوض' : 'Rejeté'}</option>
          </select>
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
        </div>
      </div>

      {/* Tableau du bétail */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error.message || 'Erreur lors du chargement des bêtes'}</p>
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
                    {isRTL ? 'تاريخ الوصول' : 'Date d\'arrivée'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredLivestock.map((animal) => (
                  <tr key={animal.id} className="transition-colors hover:theme-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                          <div className="text-sm font-medium theme-text-primary theme-transition">{animal.loopNumber}</div>
                          <div className="text-sm theme-text-secondary theme-transition">ID: {animal.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{animal.type}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{animal.breed}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {animal.weight} kg
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {animal.age} {isRTL ? 'شهر' : 'mois'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{animal.origin}</div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {animal.gender === 'MALE' ? (isRTL ? 'ذكر' : 'Mâle') : (isRTL ? 'أنثى' : 'Femelle')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(animal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getHealthBadge(animal.healthStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                      {formatDate(animal.arrivalDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        {animal.status === 'EN_ATTENTE' && (
                          <>
                            <button 
                              onClick={() => handleSlaughter(animal)}
                              className="p-1 text-green-600 hover:text-green-700 theme-transition"
                              title={isRTL ? 'ذبح' : 'Abattre'}
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleTransfer(animal)}
                              className="p-1 text-blue-600 hover:text-blue-700 theme-transition"
                              title={isRTL ? 'نقل' : 'Transférer'}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => router.push(`/dashboard/livestock/${animal.id}`)}
                          className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
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
        
        {filteredLivestock.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لم يتم العثور على ماشية' : 'Aucun animal trouvé'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'ابدأ بإضافة ماشية جديدة' : 'Commencez par ajouter de nouveaux animaux'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {livestockData && livestockData.pagination.total_count > pageSize && (
          <div className="px-6 py-4 border-t theme-border-primary theme-transition">
            <Pagination
              currentPage={currentPage}
              totalPages={livestockData.pagination.total_pages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={livestockData.pagination.total_count}
              isRTL={isRTL}
            />
          </div>
        )}
      </div>

      {/* Bons de transfert */}
      {transferDocuments.length > 0 && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'أذونات النقل' : 'Bons de transfert'}
          </h3>
          
          <div className="space-y-4">
            {transferDocuments.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg theme-border-primary theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h4 className="font-medium theme-text-primary theme-transition">
                      {isRTL ? 'وثيقة النقل' : 'Bon de transfert'} {doc.documentNumber}
                    </h4>
                    <p className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'من' : 'De'} {doc.fromAbattoir.name} {isRTL ? 'إلى' : 'vers'} {doc.toAbattoir.name}
                    </p>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <button 
                      onClick={() => printTransferDocument(doc)}
                      className="p-2 text-primary-600 hover:text-primary-700 theme-transition"
                      title={isRTL ? 'طباعة' : 'Imprimer'}
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => downloadTransferDocument(doc)}
                      className="p-2 text-primary-600 hover:text-primary-700 theme-transition"
                      title={isRTL ? 'تحميل' : 'Télécharger'}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'رقم البوق' : 'Numéro de boucle'}: {doc.livestock.loopNumber}
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'النوع' : 'Type'}: {doc.livestock.type} - {doc.livestock.breed}
                    </p>
                  </div>
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'الوزن' : 'Poids'}: {doc.livestock.weight} kg
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'العمر' : 'Âge'}: {doc.livestock.age} {isRTL ? 'شهر' : 'mois'}
                    </p>
                  </div>
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'السبب' : 'Raison'}: {doc.reason}
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'تاريخ النقل' : 'Date de transfert'}: {formatDate(doc.transferDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'abattage */}
      {showSlaughterModal && selectedLivestock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
              <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                {isRTL ? 'تأكيد الذبح' : 'Confirmer l\'abattage'}
              </h3>
              <button 
                onClick={() => setShowSlaughterModal(false)}
                className="text-gray-500 hover:text-gray-700 theme-transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="theme-text-secondary theme-transition mb-2">
                {isRTL ? 'هل أنت متأكد من ذبح هذا الحيوان؟' : 'Êtes-vous sûr de vouloir abattre cet animal ?'}
              </p>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="font-medium theme-text-primary theme-transition">
                  {selectedLivestock.loopNumber}
                </p>
                <p className="text-sm theme-text-secondary theme-transition">
                  {selectedLivestock.type} - {selectedLivestock.breed} ({selectedLivestock.weight} kg)
                </p>
              </div>
            </div>
            
            <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
              <button 
                onClick={() => setShowSlaughterModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 theme-transition"
              >
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={confirmSlaughter}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 theme-transition"
              >
                {isRTL ? 'تأكيد الذبح' : 'Confirmer l\'abattage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de transfert */}
      {showTransferModal && selectedLivestock && (
        <TransferModal 
          animal={selectedLivestock}
          isRTL={isRTL}
          onClose={() => setShowTransferModal(false)}
          onConfirm={confirmTransfer}
        />
      )}
    </div>
  );
}

// Composant Modal de transfert
interface TransferModalProps {
  animal: Livestock;
  isRTL: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

function TransferModal({ animal, isRTL, onClose, onConfirm }: TransferModalProps) {
  const [transferData, setTransferData] = useState({
    toAbattoir: '',
    toAddress: '',
    toManager: '',
    toPhone: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(transferData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h3 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'نقل الحيوان' : 'Transférer l\'animal'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 theme-transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg mb-4">
            <p className="font-medium theme-text-primary theme-transition">
              {animal.loopNumber}
            </p>
            <p className="text-sm theme-text-secondary theme-transition">
              {animal.type} - {animal.breed} ({animal.weight} kg)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'اسم المجزر الوجهة' : 'Nom de l\'abattoir de destination'}
            </label>
            <input
              type="text"
              required
              value={transferData.toAbattoir}
              onChange={(e) => setTransferData(prev => ({ ...prev, toAbattoir: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'عنوان المجزر' : 'Adresse de l\'abattoir'}
            </label>
            <input
              type="text"
              required
              value={transferData.toAddress}
              onChange={(e) => setTransferData(prev => ({ ...prev, toAddress: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                {isRTL ? 'اسم المدير' : 'Nom du directeur'}
              </label>
              <input
                type="text"
                required
                value={transferData.toManager}
                onChange={(e) => setTransferData(prev => ({ ...prev, toManager: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                {isRTL ? 'رقم الهاتف' : 'Numéro de téléphone'}
              </label>
              <input
                type="tel"
                required
                value={transferData.toPhone}
                onChange={(e) => setTransferData(prev => ({ ...prev, toPhone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'سبب النقل' : 'Raison du transfert'}
            </label>
            <textarea
              required
              rows={3}
              value={transferData.reason}
              onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 theme-transition"
            >
              {isRTL ? 'تأكيد النقل' : 'Confirmer le transfert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
