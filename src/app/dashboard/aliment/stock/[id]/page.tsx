'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Package,
  Edit,
  RefreshCw,
  AlertCircle,
  Activity,
  Users,
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Heart,
  Weight,
  Truck,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';

// Interface pour les stocks d'aliment avec données détaillées
interface FeedStockDetail {
  id: string;
  name: string;
  type: string;
  category: string;
  supplier: {
    name: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
  };
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  expiryDate: string;
  batchNumber: string;
  location: string;
  lastRestock: string;
  lastUsed: string;
  createdAt: string;
  lastActivity: string;
  specifications: {
    protein: number;
    fat: number;
    fiber: number;
    moisture: number;
    ash: number;
    calcium: number;
    phosphorus: number;
  };
  usageHistory: {
    date: string;
    quantity: number;
    purpose: string;
    user: string;
    notes: string;
  }[];
  restockHistory: {
    date: string;
    quantity: number;
    unitPrice: number;
    supplier: string;
    batchNumber: string;
    expiryDate: string;
    notes: string;
  }[];
  statistics: {
    totalReceived: number;
    totalUsed: number;
    averageDailyUsage: number;
    daysRemaining: number;
    turnoverRate: number;
  };
  recentActivity: {
    date: string;
    action: string;
    details: string;
    user: string;
  }[];
}

// Données mock détaillées pour les stocks d'aliment
const mockFeedStockDetails: { [key: string]: FeedStockDetail } = {
  'FEED001': {
    id: 'FEED001',
    name: 'Concentré Bovins Premium',
    type: 'Concentré',
    category: 'Bovins',
    supplier: {
      name: 'Aliments du Maghreb',
      contact: 'Directeur: Mohamed Benali',
      phone: '+213 21 45 67 89',
      email: 'contact@aliments-maghreb.dz',
      address: 'Zone Industrielle, Alger'
    },
    currentStock: 1500,
    minStock: 500,
    maxStock: 2000,
    unit: 'kg',
    unitPrice: 45,
    totalValue: 67500,
    status: 'IN_STOCK',
    expiryDate: '2024-06-15T00:00:00Z',
    batchNumber: 'BATCH-2024-001',
    location: 'Entrepôt A - Zone 1',
    lastRestock: '2024-01-10T10:00:00Z',
    lastUsed: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
    specifications: {
      protein: 18.5,
      fat: 3.2,
      fiber: 8.0,
      moisture: 12.0,
      ash: 7.5,
      calcium: 1.2,
      phosphorus: 0.8
    },
    usageHistory: [
      {
        date: '2024-01-15T14:30:00Z',
        quantity: 50,
        purpose: 'Alimentation stabulation A',
        user: 'Équipe de stabulation',
        notes: 'Distribution matinale'
      },
      {
        date: '2024-01-14T10:00:00Z',
        quantity: 75,
        purpose: 'Alimentation stabulation B',
        user: 'Équipe de stabulation',
        notes: 'Distribution normale'
      }
    ],
    restockHistory: [
      {
        date: '2024-01-10T10:00:00Z',
        quantity: 500,
        unitPrice: 45,
        supplier: 'Aliments du Maghreb',
        batchNumber: 'BATCH-2024-001',
        expiryDate: '2024-06-15T00:00:00Z',
        notes: 'Réapprovisionnement régulier'
      }
    ],
    statistics: {
      totalReceived: 2000,
      totalUsed: 500,
      averageDailyUsage: 25,
      daysRemaining: 60,
      turnoverRate: 0.25
    },
    recentActivity: [
      {
        date: '2024-01-15T14:30:00Z',
        action: 'Utilisation',
        details: '50 kg utilisés pour l\'alimentation de la stabulation A',
        user: 'Équipe de stabulation'
      },
      {
        date: '2024-01-15T10:00:00Z',
        action: 'Contrôle qualité',
        details: 'Contrôle de qualité effectué - conforme',
        user: 'Responsable qualité'
      },
      {
        date: '2024-01-14T10:00:00Z',
        action: 'Utilisation',
        details: '75 kg utilisés pour l\'alimentation de la stabulation B',
        user: 'Équipe de stabulation'
      }
    ]
  },
  'FEED002': {
    id: 'FEED002',
    name: 'Foin de Luzerne Premium',
    type: 'Foin',
    category: 'Tous',
    supplier: {
      name: 'Foin du Centre',
      contact: 'Directeur: Fatima Zohra',
      phone: '+213 21 45 67 90',
      email: 'contact@foin-centre.dz',
      address: 'Blida, Algérie'
    },
    currentStock: 800,
    minStock: 200,
    maxStock: 1000,
    unit: 'balles',
    unitPrice: 120,
    totalValue: 96000,
    status: 'LOW_STOCK',
    expiryDate: '2024-12-31T00:00:00Z',
    batchNumber: 'BATCH-2024-002',
    location: 'Entrepôt B - Zone 2',
    lastRestock: '2024-01-05T14:00:00Z',
    lastUsed: '2024-01-15T06:00:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    lastActivity: '2024-01-15T06:00:00Z',
    specifications: {
      protein: 16.0,
      fat: 2.5,
      fiber: 25.0,
      moisture: 15.0,
      ash: 8.0,
      calcium: 1.8,
      phosphorus: 0.3
    },
    usageHistory: [
      {
        date: '2024-01-15T06:00:00Z',
        quantity: 20,
        purpose: 'Alimentation matinale',
        user: 'Équipe de stabulation',
        notes: 'Distribution normale'
      }
    ],
    restockHistory: [
      {
        date: '2024-01-05T14:00:00Z',
        quantity: 200,
        unitPrice: 120,
        supplier: 'Foin du Centre',
        batchNumber: 'BATCH-2024-002',
        expiryDate: '2024-12-31T00:00:00Z',
        notes: 'Réapprovisionnement urgent'
      }
    ],
    statistics: {
      totalReceived: 1000,
      totalUsed: 200,
      averageDailyUsage: 10,
      daysRemaining: 80,
      turnoverRate: 0.2
    },
    recentActivity: [
      {
        date: '2024-01-15T06:00:00Z',
        action: 'Utilisation',
        details: '20 balles utilisées pour l\'alimentation matinale',
        user: 'Équipe de stabulation'
      },
      {
        date: '2024-01-14T16:00:00Z',
        action: 'Alerte stock bas',
        details: 'Stock en dessous du seuil minimum',
        user: 'Système'
      }
    ]
  }
};

export default function FeedStockDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [feedStock, setFeedStock] = useState<FeedStockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchFeedStockDetail = async () => {
      try {
        setLoading(true);
        const feedStockId = params.id as string;
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const feedStockData = mockFeedStockDetails[feedStockId];
        if (!feedStockData) {
          setError('Stock d\'aliment non trouvé');
          return;
        }
        
        setFeedStock(feedStockData);
        console.log('Détails du stock d\'aliment récupérés:', feedStockData);
      } catch (err) {
        setError('Erreur lors du chargement des détails du stock d\'aliment');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchFeedStockDetail();
    }
  }, [isAuthenticated, params.id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const feedStockId = params.id as string;
      const feedStockData = mockFeedStockDetails[feedStockId];
      if (feedStockData) {
        setFeedStock(feedStockData);
      }
      
      console.log('Détails du stock d\'aliment rafraîchis:', feedStockData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      IN_STOCK: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'في المخزن' : 'En Stock',
        icon: CheckCircle
      },
      LOW_STOCK: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'مخزون منخفض' : 'Stock Bas',
        icon: AlertCircle
      },
      OUT_OF_STOCK: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'نفد المخزون' : 'Rupture',
        icon: XCircle
      },
      EXPIRED: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'منتهي الصلاحية' : 'Expiré',
        icon: Clock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OUT_OF_STOCK;
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

  const getStockTrend = (current: number, min: number, max: number) => {
    if (current <= min) return { icon: TrendingDown, color: 'text-red-500', label: isRTL ? 'منخفض' : 'Bas' };
    if (current >= max * 0.8) return { icon: TrendingUp, color: 'text-green-500', label: isRTL ? 'مرتفع' : 'Élevé' };
    return { icon: Minus, color: 'text-yellow-500', label: isRTL ? 'متوسط' : 'Moyen' };
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

  if (error || !feedStock) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {error || 'Stock d\'aliment non trouvé'}
              </h3>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stockTrend = getStockTrend(feedStock.currentStock, feedStock.minStock, feedStock.maxStock);
  const TrendIcon = stockTrend.icon;

  const tabs = [
    {
      id: 'overview',
      label: isRTL ? 'نظرة عامة' : 'Vue d\'ensemble',
      content: (
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات المنتج' : 'Informations du Produit'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'معرف المنتج:' : 'ID Produit:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'النوع:' : 'Type:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الفئة:' : 'Catégorie:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الموقع:' : 'Localisation:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(feedStock.status)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Weight className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المخزون' : 'Stock'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الكمية الحالية:' : 'Quantité actuelle:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.currentStock} {feedStock.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحد الأدنى:' : 'Stock minimum:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.minStock} {feedStock.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحد الأقصى:' : 'Stock maximum:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.maxStock} {feedStock.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'السعر/وحدة:' : 'Prix/unité:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.unitPrice} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'القيمة الإجمالية:' : 'Valeur totale:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.totalValue.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'اتجاه المخزون:' : 'Tendance:'}</span>
                  <span className={`font-medium flex items-center ${stockTrend.color}`}>
                    <TrendIcon className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {stockTrend.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fournisseur et Détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المورد' : 'Fournisseur'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{feedStock.supplier.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{feedStock.supplier.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{feedStock.supplier.phone}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <p className="font-medium theme-text-primary">{feedStock.supplier.email}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                  <p className="font-medium theme-text-primary">{feedStock.supplier.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تفاصيل الدفعة' : 'Détails du Lot'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'رقم الدفعة:' : 'Numéro de lot:'}</span>
                  <span className="font-medium theme-text-primary">{feedStock.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'تاريخ الانتهاء:' : 'Date d\'expiration:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedStock.expiryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'آخر إعادة تموين:' : 'Dernier réapprovisionnement:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedStock.lastRestock)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'آخر استخدام:' : 'Dernière utilisation:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedStock.lastUsed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spécifications nutritionnelles */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المواصفات الغذائية' : 'Spécifications Nutritionnelles'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.protein}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'بروتين' : 'Protéines'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.fat}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'دهون' : 'Matières grasses'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.fiber}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'ألياف' : 'Fibres'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.moisture}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'رطوبة' : 'Humidité'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.ash}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'رماد' : 'Cendres'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.calcium}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'كالسيوم' : 'Calcium'}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{feedStock.specifications.phosphorus}%</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'فوسفور' : 'Phosphore'}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      label: isRTL ? 'الاستخدام' : 'Utilisation',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تاريخ الاستخدام' : 'Historique d\'Utilisation'}
            </h3>
            <div className="space-y-4">
              {feedStock.usageHistory.map((usage, index) => (
                <div key={index} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Package className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <div>
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          {usage.quantity} {feedStock.unit}
                        </h3>
                        <p className="text-sm theme-text-secondary theme-transition">{usage.purpose}</p>
                      </div>
                    </div>
                    <span className="text-sm theme-text-secondary theme-transition">{formatDate(usage.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="theme-text-secondary">{isRTL ? 'المستخدم:' : 'Utilisateur:'} {usage.user}</span>
                    <span className="theme-text-secondary">{usage.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <TrendingUp className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إحصائيات الاستخدام' : 'Statistiques d\'Utilisation'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{feedStock.statistics.totalUsed} {feedStock.unit}</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'إجمالي المستخدم' : 'Total Utilisé'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{feedStock.statistics.averageDailyUsage} {feedStock.unit}</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'متوسط الاستخدام اليومي' : 'Moyenne Quotidienne'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{feedStock.statistics.daysRemaining}</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'أيام متبقية' : 'Jours Restants'}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'restock',
      label: isRTL ? 'إعادة التموين' : 'Réapprovisionnement',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تاريخ إعادة التموين' : 'Historique de Réapprovisionnement'}
            </h3>
            <div className="space-y-4">
              {feedStock.restockHistory.map((restock, index) => (
                <div key={index} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Truck className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <div>
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          +{restock.quantity} {feedStock.unit}
                        </h3>
                        <p className="text-sm theme-text-secondary theme-transition">{restock.supplier}</p>
                      </div>
                    </div>
                    <span className="text-sm theme-text-secondary theme-transition">{formatDate(restock.date)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="theme-text-secondary">{isRTL ? 'السعر:' : 'Prix:'}</span>
                      <p className="font-medium theme-text-primary">{restock.unitPrice} DA/{feedStock.unit}</p>
                    </div>
                    <div>
                      <span className="theme-text-secondary">{isRTL ? 'رقم الدفعة:' : 'N° Lot:'}</span>
                      <p className="font-medium theme-text-primary">{restock.batchNumber}</p>
                    </div>
                    <div>
                      <span className="theme-text-secondary">{isRTL ? 'انتهاء الصلاحية:' : 'Expiration:'}</span>
                      <p className="font-medium theme-text-primary">{formatDate(restock.expiryDate)}</p>
                    </div>
                  </div>
                  {restock.notes && (
                    <div className="mt-3 text-sm theme-text-secondary">
                      <span className="font-medium">{isRTL ? 'ملاحظات:' : 'Notes:'}</span> {restock.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'activity',
      label: isRTL ? 'النشاط' : 'Activité',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Clock className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'النشاط الأخير' : 'Activité Récente'}
            </h3>
            <div className="space-y-4">
              {feedStock.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium theme-text-primary">{activity.action}</p>
                      <p className="text-sm theme-text-secondary">{formatDate(activity.date)}</p>
                    </div>
                    <p className="text-sm theme-text-secondary">{activity.details}</p>
                    <p className="text-xs theme-text-tertiary mt-1">{isRTL ? 'بواسطة:' : 'Par:'} {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className={`${isRTL ? 'ml-4' : 'mr-4'} p-2 rounded-lg hover:theme-bg-secondary theme-transition`}
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Package className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? 'مخزون الأعلاف' : 'Stock d\'Aliment'} {feedStock.id}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {feedStock.name} • {feedStock.supplier.name} • {getStatusBadge(feedStock.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => console.log('Modifier stock')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <Tabs tabs={tabs} isRTL={isRTL} />
        </div>
      </div>
    </Layout>
  );
}
