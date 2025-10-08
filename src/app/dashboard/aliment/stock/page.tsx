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
  Package,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wheat,
  Weight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les stocks d'aliments
interface FeedStock {
  id: string;
  name: string;
  type: 'FOIN' | 'CONCENTRE' | 'CEREALE' | 'COMPLEMENT' | 'AUTRE';
  category: string;
  supplier: string;
  quantity: number; // en kg
  unit: string;
  unitPrice: number; // prix par unité
  totalValue: number; // valeur totale du stock
  location: string;
  warehouse: string;
  expiryDate: string;
  batchNumber: string;
  quality: 'EXCELLENT' | 'BON' | 'MOYEN' | 'MAUVAIS';
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  lastRestock: string;
  lastUsed: string;
  consumptionRate: number; // kg/jour
  minThreshold: number; // seuil minimum
  maxThreshold: number; // seuil maximum
  createdAt: string;
  lastActivity: string;
}

// Données mock pour les stocks d'aliments
const mockFeedStocks: FeedStock[] = [
  {
    id: 'FEED001',
    name: 'Foin de Luzerne Premium',
    type: 'FOIN',
    category: 'Fourrage',
    supplier: 'Ferme Benali',
    quantity: 2500,
    unit: 'kg',
    unitPrice: 45,
    totalValue: 112500,
    location: 'Entrepôt A - Zone 1',
    warehouse: 'Entrepôt Central Alger',
    expiryDate: '2024-06-15',
    batchNumber: 'LZ-2024-001',
    quality: 'EXCELLENT',
    status: 'AVAILABLE',
    lastRestock: '2024-01-10T08:00:00Z',
    lastUsed: '2024-01-15T06:00:00Z',
    consumptionRate: 150,
    minThreshold: 500,
    maxThreshold: 3000,
    createdAt: '2023-12-01T10:00:00Z',
    lastActivity: '2024-01-15T06:00:00Z'
  },
  {
    id: 'FEED002',
    name: 'Concentré Bovins 18%',
    type: 'CONCENTRE',
    category: 'Aliment concentré',
    supplier: 'Aliments du Nord',
    quantity: 800,
    unit: 'kg',
    unitPrice: 120,
    totalValue: 96000,
    location: 'Entrepôt A - Zone 2',
    warehouse: 'Entrepôt Central Alger',
    expiryDate: '2024-08-20',
    batchNumber: 'CB-2024-002',
    quality: 'BON',
    status: 'LOW_STOCK',
    lastRestock: '2024-01-05T14:30:00Z',
    lastUsed: '2024-01-15T12:00:00Z',
    consumptionRate: 80,
    minThreshold: 200,
    maxThreshold: 1000,
    createdAt: '2023-11-15T09:00:00Z',
    lastActivity: '2024-01-15T12:00:00Z'
  },
  {
    id: 'FEED003',
    name: 'Orge Entière',
    type: 'CEREALE',
    category: 'Céréale',
    supplier: 'Coopérative Agricole',
    quantity: 0,
    unit: 'kg',
    unitPrice: 35,
    totalValue: 0,
    location: 'Entrepôt B - Zone 1',
    warehouse: 'Entrepôt Oran',
    expiryDate: '2024-12-01',
    batchNumber: 'OR-2024-003',
    quality: 'BON',
    status: 'OUT_OF_STOCK',
    lastRestock: '2024-01-01T10:00:00Z',
    lastUsed: '2024-01-14T18:00:00Z',
    consumptionRate: 50,
    minThreshold: 100,
    maxThreshold: 800,
    createdAt: '2023-10-20T11:00:00Z',
    lastActivity: '2024-01-14T18:00:00Z'
  },
  {
    id: 'FEED004',
    name: 'Foin de Trèfle',
    type: 'FOIN',
    category: 'Fourrage',
    supplier: 'Ferme Constantine',
    quantity: 1800,
    unit: 'kg',
    unitPrice: 42,
    totalValue: 75600,
    location: 'Entrepôt B - Zone 2',
    warehouse: 'Entrepôt Oran',
    expiryDate: '2024-05-30',
    batchNumber: 'TR-2024-004',
    quality: 'EXCELLENT',
    status: 'AVAILABLE',
    lastRestock: '2024-01-12T16:00:00Z',
    lastUsed: '2024-01-15T18:00:00Z',
    consumptionRate: 90,
    minThreshold: 300,
    maxThreshold: 2000,
    createdAt: '2023-12-10T13:00:00Z',
    lastActivity: '2024-01-15T18:00:00Z'
  },
  {
    id: 'FEED005',
    name: 'Complément Minéral',
    type: 'COMPLEMENT',
    category: 'Complément alimentaire',
    supplier: 'NutriFeed International',
    quantity: 120,
    unit: 'kg',
    unitPrice: 85,
    totalValue: 10200,
    location: 'Entrepôt C - Zone 1',
    warehouse: 'Entrepôt Blida',
    expiryDate: '2024-03-15',
    batchNumber: 'CM-2024-005',
    quality: 'BON',
    status: 'LOW_STOCK',
    lastRestock: '2024-01-08T11:00:00Z',
    lastUsed: '2024-01-15T07:00:00Z',
    consumptionRate: 15,
    minThreshold: 50,
    maxThreshold: 200,
    createdAt: '2023-11-25T15:00:00Z',
    lastActivity: '2024-01-15T07:00:00Z'
  },
  {
    id: 'FEED006',
    name: 'Maïs Concassé',
    type: 'CEREALE',
    category: 'Céréale',
    supplier: 'Céréales du Sud',
    quantity: 3200,
    unit: 'kg',
    unitPrice: 38,
    totalValue: 121600,
    location: 'Entrepôt C - Zone 2',
    warehouse: 'Entrepôt Blida',
    expiryDate: '2024-10-01',
    batchNumber: 'MC-2024-006',
    quality: 'EXCELLENT',
    status: 'AVAILABLE',
    lastRestock: '2024-01-14T09:00:00Z',
    lastUsed: '2024-01-15T13:00:00Z',
    consumptionRate: 120,
    minThreshold: 500,
    maxThreshold: 3500,
    createdAt: '2023-12-05T08:00:00Z',
    lastActivity: '2024-01-15T13:00:00Z'
  }
];

export default function FeedStockPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [feedStocks, setFeedStocks] = useState<FeedStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingStockId, setDeletingStockId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchFeedStocks = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeedStocks(mockFeedStocks);
        console.log('Stocks d\'aliments récupérés:', mockFeedStocks);
      } catch (err) {
        setError('Erreur lors du chargement des stocks d\'aliments');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFeedStocks();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setFeedStocks(mockFeedStocks);
      console.log('Stocks d\'aliments rafraîchis:', mockFeedStocks);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewStock = (stock: FeedStock) => {
    router.push(`/dashboard/aliment/stock/${stock.id}`);
  };

  const handleEditStock = (stock: FeedStock) => {
    // TODO: Implémenter la modification
    console.log('Modifier stock:', stock);
  };

  const handleDeleteStock = async (stockId: string, stockName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le stock "${stockName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingStockId(stockId);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeedStocks(prevStocks => prevStocks.filter(stock => stock.id !== stockId));
      setSuccessMessage(`Stock "${stockName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Stock ${stockName} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression du stock:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingStockId(null);
    }
  };

  const filteredFeedStocks = feedStocks.filter(stock => {
    const matchesSearch = stock.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || stock.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || stock.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'ALL' || stock.warehouse === warehouseFilter;
    return matchesSearch && matchesType && matchesStatus && matchesWarehouse;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'متوفر' : 'Disponible',
        icon: CheckCircle
      },
      LOW_STOCK: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'مخزون منخفض' : 'Stock faible',
        icon: AlertCircle
      },
      OUT_OF_STOCK: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'نفد المخزون' : 'Rupture de stock',
        icon: XCircle
      },
      EXPIRED: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'منتهي الصلاحية' : 'Expiré',
        icon: Clock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      EXCELLENT: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'ممتاز' : 'Excellent'
      },
      BON: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'جيد' : 'Bon'
      },
      MOYEN: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'متوسط' : 'Moyen'
      },
      MAUVAIS: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'سيء' : 'Mauvais'
      }
    };
    
    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig.BON;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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

  const getWarehouses = () => {
    const warehouses = [...new Set(feedStocks.map(stock => stock.warehouse))];
    return warehouses.sort();
  };

  const getStockTrend = (stock: FeedStock) => {
    const daysRemaining = Math.ceil(stock.quantity / stock.consumptionRate);
    if (daysRemaining < 7) {
      return { icon: TrendingDown, color: 'text-red-500', label: isRTL ? 'ناقص' : 'Déclin' };
    } else if (daysRemaining < 15) {
      return { icon: TrendingUp, color: 'text-yellow-500', label: isRTL ? 'مستقر' : 'Stable' };
    } else {
      return { icon: TrendingUp, color: 'text-green-500', label: isRTL ? 'ممتاز' : 'Excellent' };
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

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Package className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'مخزون الأعلاف' : 'Stock Aliment'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة مخزون الأعلاف والمكملات الغذائية' : 'Gestion du stock d\'aliments et compléments nutritionnels'}
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
                  onClick={() => console.log('Nouveau stock')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة مخزون' : 'Nouveau stock'}
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
                  placeholder={isRTL ? 'البحث في المخزون...' : 'Rechercher un stock...'}
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
                <option value="FOIN">{isRTL ? 'فون' : 'Foin'}</option>
                <option value="CONCENTRE">{isRTL ? 'مركز' : 'Concentré'}</option>
                <option value="CEREALE">{isRTL ? 'حبوب' : 'Céréale'}</option>
                <option value="COMPLEMENT">{isRTL ? 'مكمل' : 'Complément'}</option>
                <option value="AUTRE">{isRTL ? 'أخرى' : 'Autre'}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="AVAILABLE">{isRTL ? 'متوفر' : 'Disponible'}</option>
                <option value="LOW_STOCK">{isRTL ? 'مخزون منخفض' : 'Stock faible'}</option>
                <option value="OUT_OF_STOCK">{isRTL ? 'نفد المخزون' : 'Rupture de stock'}</option>
                <option value="EXPIRED">{isRTL ? 'منتهي الصلاحية' : 'Expiré'}</option>
              </select>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع المستودعات' : 'Tous les entrepôts'}</option>
                {getWarehouses().map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
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
                        {isRTL ? 'المنتج' : 'Produit'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الكمية' : 'Quantité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'القيمة' : 'Valeur'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الموقع' : 'Localisation'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الجودة' : 'Qualité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الاتجاه' : 'Tendance'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredFeedStocks.map((stock) => {
                      const trend = getStockTrend(stock);
                      const TrendIcon = trend.icon;
                      return (
                        <tr key={stock.id} className="transition-colors hover:theme-bg-secondary">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Wheat className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                                <div className="text-sm font-medium theme-text-primary theme-transition">{stock.name}</div>
                                <div className="text-sm theme-text-secondary theme-transition">
                                  {stock.id} • {stock.batchNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">
                                {stock.quantity.toLocaleString()} {stock.unit}
                              </div>
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'استهلاك:' : 'Consommation:'} {stock.consumptionRate} {stock.unit}/jour
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">
                                {formatCurrency(stock.totalValue)}
                              </div>
                              <div className="text-sm theme-text-secondary theme-transition">
                                {formatCurrency(stock.unitPrice)}/{stock.unit}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{stock.warehouse}</div>
                              <div className="text-sm theme-text-secondary theme-transition">{stock.location}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getQualityBadge(stock.quality)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(stock.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <TrendIcon className={`h-4 w-4 ${trend.color} ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              <span className={`text-xs font-medium ${trend.color}`}>{trend.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                              <button 
                                onClick={() => handleViewStock(stock)}
                                className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                                title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditStock(stock)}
                                className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                                title={isRTL ? 'تعديل المخزون' : 'Modifier le stock'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteStock(stock.id, stock.name)}
                                disabled={deletingStockId === stock.id}
                                className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                                title={isRTL ? 'حذف المخزون' : 'Supprimer le stock'}
                              >
                                {deletingStockId === stock.id ? (
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredFeedStocks.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على مخزون' : 'Aucun stock trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة مخزون جديد' : 'Commencez par ajouter de nouveaux stocks'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
