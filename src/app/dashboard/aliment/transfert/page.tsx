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
  ArrowRightLeft,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Package,
  Weight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les transferts d'aliments
interface FeedTransfer {
  id: string;
  transferNumber: string;
  fromWarehouse: string;
  toAbattoir: string;
  toAbattoirId: number;
  feedItems: {
    id: string;
    name: string;
    type: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalValue: number;
  }[];
  totalQuantity: number;
  totalValue: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  requestedBy: string;
  approvedBy: string;
  driver: string;
  vehicle: string;
  scheduledDate: string;
  actualDate: string;
  notes: string;
  createdAt: string;
  lastActivity: string;
}

// Données mock pour les transferts d'aliments
const mockFeedTransfers: FeedTransfer[] = [
  {
    id: 'TRANS001',
    transferNumber: 'TR-2024-001',
    fromWarehouse: 'Entrepôt Central Alger',
    toAbattoir: 'Abattoir Central Alger',
    toAbattoirId: 1,
    feedItems: [
      {
        id: 'FEED001',
        name: 'Foin de Luzerne Premium',
        type: 'FOIN',
        quantity: 500,
        unit: 'kg',
        unitPrice: 45,
        totalValue: 22500
      },
      {
        id: 'FEED002',
        name: 'Concentré Bovins 18%',
        type: 'CONCENTRE',
        quantity: 200,
        unit: 'kg',
        unitPrice: 120,
        totalValue: 24000
      }
    ],
    totalQuantity: 700,
    totalValue: 46500,
    status: 'DELIVERED',
    requestedBy: 'Ahmed Benali',
    approvedBy: 'Mohamed Khelil',
    driver: 'Omar Boudjema',
    vehicle: 'Camion-ALG-001',
    scheduledDate: '2024-01-15T08:00:00Z',
    actualDate: '2024-01-15T08:30:00Z',
    notes: 'Livraison effectuée avec succès, tous les produits conformes',
    createdAt: '2024-01-14T16:00:00Z',
    lastActivity: '2024-01-15T08:30:00Z'
  },
  {
    id: 'TRANS002',
    transferNumber: 'TR-2024-002',
    fromWarehouse: 'Entrepôt Oran',
    toAbattoir: 'Abattoir d\'Oran',
    toAbattoirId: 4,
    feedItems: [
      {
        id: 'FEED004',
        name: 'Foin de Trèfle',
        type: 'FOIN',
        quantity: 300,
        unit: 'kg',
        unitPrice: 42,
        totalValue: 12600
      },
      {
        id: 'FEED005',
        name: 'Complément Minéral',
        type: 'COMPLEMENT',
        quantity: 50,
        unit: 'kg',
        unitPrice: 85,
        totalValue: 4250
      }
    ],
    totalQuantity: 350,
    totalValue: 16850,
    status: 'IN_TRANSIT',
    requestedBy: 'Aicha Boudjedra',
    approvedBy: 'Fatima Zohra',
    driver: 'Karim Amrani',
    vehicle: 'Camion-ORN-002',
    scheduledDate: '2024-01-16T10:00:00Z',
    actualDate: '',
    notes: 'En cours de transport vers l\'abattoir',
    createdAt: '2024-01-15T14:00:00Z',
    lastActivity: '2024-01-16T10:15:00Z'
  },
  {
    id: 'TRANS003',
    transferNumber: 'TR-2024-003',
    fromWarehouse: 'Entrepôt Blida',
    toAbattoir: 'Abattoir de Blida',
    toAbattoirId: 2,
    feedItems: [
      {
        id: 'FEED006',
        name: 'Maïs Concassé',
        type: 'CEREALE',
        quantity: 800,
        unit: 'kg',
        unitPrice: 38,
        totalValue: 30400
      }
    ],
    totalQuantity: 800,
    totalValue: 30400,
    status: 'PENDING',
    requestedBy: 'Mohamed Khelil',
    approvedBy: '',
    driver: '',
    vehicle: '',
    scheduledDate: '2024-01-17T09:00:00Z',
    actualDate: '',
    notes: 'En attente d\'approbation et d\'assignation du véhicule',
    createdAt: '2024-01-16T11:00:00Z',
    lastActivity: '2024-01-16T11:00:00Z'
  },
  {
    id: 'TRANS004',
    transferNumber: 'TR-2024-004',
    fromWarehouse: 'Entrepôt Central Alger',
    toAbattoir: 'Abattoir de Tizi Ouzou',
    toAbattoirId: 5,
    feedItems: [
      {
        id: 'FEED001',
        name: 'Foin de Luzerne Premium',
        type: 'FOIN',
        quantity: 400,
        unit: 'kg',
        unitPrice: 45,
        totalValue: 18000
      },
      {
        id: 'FEED002',
        name: 'Concentré Bovins 18%',
        type: 'CONCENTRE',
        quantity: 150,
        unit: 'kg',
        unitPrice: 120,
        totalValue: 18000
      },
      {
        id: 'FEED005',
        name: 'Complément Minéral',
        type: 'COMPLEMENT',
        quantity: 30,
        unit: 'kg',
        unitPrice: 85,
        totalValue: 2550
      }
    ],
    totalQuantity: 580,
    totalValue: 38550,
    status: 'CANCELLED',
    requestedBy: 'Karim Amrani',
    approvedBy: 'Ahmed Benali',
    driver: 'Nadia Kaci',
    vehicle: 'Camion-TIZ-003',
    scheduledDate: '2024-01-14T15:00:00Z',
    actualDate: '',
    notes: 'Annulé - Problème de transport, reporté au lendemain',
    createdAt: '2024-01-13T10:00:00Z',
    lastActivity: '2024-01-14T14:30:00Z'
  },
  {
    id: 'TRANS005',
    transferNumber: 'TR-2024-005',
    fromWarehouse: 'Entrepôt Oran',
    toAbattoir: 'Abattoir de Sétif',
    toAbattoirId: 7,
    feedItems: [
      {
        id: 'FEED004',
        name: 'Foin de Trèfle',
        type: 'FOIN',
        quantity: 600,
        unit: 'kg',
        unitPrice: 42,
        totalValue: 25200
      },
      {
        id: 'FEED006',
        name: 'Maïs Concassé',
        type: 'CEREALE',
        quantity: 400,
        unit: 'kg',
        unitPrice: 38,
        totalValue: 15200
      }
    ],
    totalQuantity: 1000,
    totalValue: 40400,
    status: 'PENDING',
    requestedBy: 'Omar Boukhelifa',
    approvedBy: '',
    driver: '',
    vehicle: '',
    scheduledDate: '2024-01-18T07:00:00Z',
    actualDate: '',
    notes: 'Transfert urgent pour approvisionnement de l\'abattoir',
    createdAt: '2024-01-16T15:30:00Z',
    lastActivity: '2024-01-16T15:30:00Z'
  }
];

export default function FeedTransferPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [feedTransfers, setFeedTransfers] = useState<FeedTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingTransferId, setDeletingTransferId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchFeedTransfers = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeedTransfers(mockFeedTransfers);
        console.log('Transferts d\'aliments récupérés:', mockFeedTransfers);
      } catch (err) {
        setError('Erreur lors du chargement des transferts d\'aliments');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFeedTransfers();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setFeedTransfers(mockFeedTransfers);
      console.log('Transferts d\'aliments rafraîchis:', mockFeedTransfers);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewTransfer = (transfer: FeedTransfer) => {
    router.push(`/dashboard/aliment/transfert/${transfer.id}`);
  };

  const handleEditTransfer = (transfer: FeedTransfer) => {
    // TODO: Implémenter la modification
    console.log('Modifier transfert:', transfer);
  };

  const handleDeleteTransfer = async (transferId: string, transferNumber: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le transfert "${transferNumber}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTransferId(transferId);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeedTransfers(prevTransfers => prevTransfers.filter(transfer => transfer.id !== transferId));
      setSuccessMessage(`Transfert "${transferNumber}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Transfert ${transferNumber} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression du transfert:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingTransferId(null);
    }
  };

  const filteredFeedTransfers = feedTransfers.filter(transfer => {
    const matchesSearch = transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toAbattoir.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || transfer.status === statusFilter;
    const matchesAbattoir = abattoirFilter === 'ALL' || transfer.toAbattoirId.toString() === abattoirFilter;
    return matchesSearch && matchesStatus && matchesAbattoir;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      IN_TRANSIT: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'في الطريق' : 'En transit',
        icon: Truck
      },
      DELIVERED: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'تم التسليم' : 'Livré',
        icon: CheckCircle
      },
      CANCELLED: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAbattoirs = () => {
    const abattoirs = [...new Set(feedTransfers.map(transfer => ({ id: transfer.toAbattoirId, name: transfer.toAbattoir })))];
    return abattoirs.sort((a, b) => a.name.localeCompare(b.name));
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
                  <ArrowRightLeft className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'تحويل الأعلاف' : 'Transfert Aliment'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة تحويلات الأعلاف من المستودعات إلى المجازر' : 'Gestion des transferts d\'aliments des entrepôts vers les abattoirs'}
                </p>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => console.log('Nouveau transfert')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة تحويل' : 'Nouveau transfert'}
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
                  placeholder={isRTL ? 'البحث في التحويلات...' : 'Rechercher un transfert...'}
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
                <option value="PENDING">{isRTL ? 'في الانتظار' : 'En attente'}</option>
                <option value="IN_TRANSIT">{isRTL ? 'في الطريق' : 'En transit'}</option>
                <option value="DELIVERED">{isRTL ? 'تم التسليم' : 'Livré'}</option>
                <option value="CANCELLED">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              <select
                value={abattoirFilter}
                onChange={(e) => setAbattoirFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}</option>
                {getAbattoirs().map(abattoir => (
                  <option key={abattoir.id} value={abattoir.id.toString()}>{abattoir.name}</option>
                ))}
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
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y theme-border-secondary theme-transition">
                  <thead className="theme-bg-secondary theme-transition">
                    <tr>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'التحويل' : 'Transfert'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'من/إلى' : 'De/Vers'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المنتجات' : 'Produits'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الكمية' : 'Quantité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'القيمة' : 'Valeur'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'النقل' : 'Transport'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'التاريخ' : 'Date'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredFeedTransfers.map((transfer) => (
                      <tr key={transfer.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <ArrowRightLeft className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{transfer.transferNumber}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {transfer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {isRTL ? 'من:' : 'De:'} {transfer.fromWarehouse}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {isRTL ? 'إلى:' : 'Vers:'} {transfer.toAbattoir}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {transfer.feedItems.length} {isRTL ? 'منتج' : 'produit(s)'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {transfer.feedItems.map(item => item.name).join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {transfer.totalQuantity.toLocaleString()} kg
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {formatCurrency(transfer.totalValue)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{transfer.driver}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{transfer.vehicle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {isRTL ? 'مجدول:' : 'Prévu:'} {formatDate(transfer.scheduledDate)}
                            </div>
                            {transfer.actualDate && (
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'فعلي:' : 'Réel:'} {formatDate(transfer.actualDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewTransfer(transfer)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditTransfer(transfer)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل التحويل' : 'Modifier le transfert'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTransfer(transfer.id, transfer.transferNumber)}
                              disabled={deletingTransferId === transfer.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف التحويل' : 'Supprimer le transfert'}
                            >
                              {deletingTransferId === transfer.id ? (
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
            
            {filteredFeedTransfers.length === 0 && !loading && (
              <div className="text-center py-12">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على تحويلات' : 'Aucun transfert trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة تحويلات جديدة' : 'Commencez par ajouter de nouveaux transferts'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
