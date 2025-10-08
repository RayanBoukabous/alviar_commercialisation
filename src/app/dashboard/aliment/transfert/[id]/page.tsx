'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Truck,
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
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';

// Interface pour les transferts d'aliment avec données détaillées
interface FeedTransferDetail {
  id: string;
  transferNumber: string;
  type: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  fromLocation: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  toLocation: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    type: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    batchNumber: string;
    expiryDate: string;
  }[];
  totalQuantity: number;
  totalValue: number;
  scheduledDate: string;
  actualDate: string;
  estimatedArrival: string;
  actualArrival: string;
  driver: {
    name: string;
    license: string;
    phone: string;
    vehicle: string;
  };
  transporter: {
    name: string;
    contact: string;
    phone: string;
    license: string;
  };
  createdAt: string;
  lastActivity: string;
  notes: string;
  documents: {
    id: string;
    type: 'DELIVERY_NOTE' | 'INVOICE' | 'RECEIPT';
    name: string;
    url: string;
    createdAt: string;
  }[];
  tracking: {
    date: string;
    location: string;
    status: string;
    notes: string;
  }[];
  recentActivity: {
    date: string;
    action: string;
    details: string;
    user: string;
  }[];
}

// Données mock détaillées pour les transferts d'aliment
const mockFeedTransferDetails: { [key: string]: FeedTransferDetail } = {
  'TRANS001': {
    id: 'TRANS001',
    transferNumber: 'TR-2024-001',
    type: 'OUTGOING',
    status: 'IN_TRANSIT',
    fromLocation: {
      name: 'Entrepôt Central Alger',
      address: 'Zone Industrielle, Alger Centre',
      contact: 'Responsable: Ahmed Benali',
      phone: '+213 21 45 67 89'
    },
    toLocation: {
      name: 'Abattoir de Blida',
      address: 'Zone Industrielle, Blida',
      contact: 'Responsable: Fatima Zohra',
      phone: '+213 25 45 67 90'
    },
    items: [
      {
        id: 'FEED001',
        name: 'Concentré Bovins Premium',
        type: 'Concentré',
        quantity: 500,
        unit: 'kg',
        unitPrice: 45,
        totalPrice: 22500,
        batchNumber: 'BATCH-2024-001',
        expiryDate: '2024-06-15T00:00:00Z'
      },
      {
        id: 'FEED002',
        name: 'Foin de Luzerne Premium',
        type: 'Foin',
        quantity: 100,
        unit: 'balles',
        unitPrice: 120,
        totalPrice: 12000,
        batchNumber: 'BATCH-2024-002',
        expiryDate: '2024-12-31T00:00:00Z'
      }
    ],
    totalQuantity: 600,
    totalValue: 34500,
    scheduledDate: '2024-01-15T08:00:00Z',
    actualDate: '2024-01-15T08:30:00Z',
    estimatedArrival: '2024-01-15T10:00:00Z',
    actualArrival: '',
    driver: {
      name: 'Mohamed Khelil',
      license: 'LIC-2024-001',
      phone: '+213 21 45 67 91',
      vehicle: 'Camion-001 (Renault Kerax)'
    },
    transporter: {
      name: 'Transport Express',
      contact: 'Directeur: Ali Benali',
      phone: '+213 21 45 67 92',
      license: 'TRANS-2024-001'
    },
    createdAt: '2024-01-14T16:00:00Z',
    lastActivity: '2024-01-15T09:30:00Z',
    notes: 'Transfert urgent pour approvisionnement de l\'abattoir de Blida',
    documents: [
      {
        id: 'DOC001',
        type: 'DELIVERY_NOTE',
        name: 'Bon de livraison TR-2024-001',
        url: '/documents/delivery-note-TR-2024-001.pdf',
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: 'DOC002',
        type: 'INVOICE',
        name: 'Facture TR-2024-001',
        url: '/documents/invoice-TR-2024-001.pdf',
        createdAt: '2024-01-15T08:00:00Z'
      }
    ],
    tracking: [
      {
        date: '2024-01-15T08:30:00Z',
        location: 'Entrepôt Central Alger',
        status: 'Départ',
        notes: 'Chargement terminé, départ confirmé'
      },
      {
        date: '2024-01-15T09:00:00Z',
        location: 'Autoroute A1',
        status: 'En transit',
        notes: 'Véhicule en route vers Blida'
      },
      {
        date: '2024-01-15T09:30:00Z',
        location: 'Sortie Blida',
        status: 'En transit',
        notes: 'Arrivée prévue dans 30 minutes'
      }
    ],
    recentActivity: [
      {
        date: '2024-01-15T09:30:00Z',
        action: 'Mise à jour position',
        details: 'Véhicule signalé à la sortie de Blida',
        user: 'Mohamed Khelil (Chauffeur)'
      },
      {
        date: '2024-01-15T09:00:00Z',
        action: 'Départ confirmé',
        details: 'Véhicule en route vers Blida',
        user: 'Système de suivi'
      },
      {
        date: '2024-01-15T08:30:00Z',
        action: 'Chargement terminé',
        details: 'Chargement de 500 kg de concentré et 100 balles de foin terminé',
        user: 'Équipe de chargement'
      }
    ]
  },
  'TRANS002': {
    id: 'TRANS002',
    transferNumber: 'TR-2024-002',
    type: 'INCOMING',
    status: 'DELIVERED',
    fromLocation: {
      name: 'Aliments du Maghreb',
      address: 'Zone Industrielle, Alger',
      contact: 'Directeur: Mohamed Benali',
      phone: '+213 21 45 67 89'
    },
    toLocation: {
      name: 'Entrepôt Central Alger',
      address: 'Zone Industrielle, Alger Centre',
      contact: 'Responsable: Ahmed Benali',
      phone: '+213 21 45 67 89'
    },
    items: [
      {
        id: 'FEED003',
        name: 'Concentré Ovins Premium',
        type: 'Concentré',
        quantity: 1000,
        unit: 'kg',
        unitPrice: 40,
        totalPrice: 40000,
        batchNumber: 'BATCH-2024-003',
        expiryDate: '2024-07-15T00:00:00Z'
      }
    ],
    totalQuantity: 1000,
    totalValue: 40000,
    scheduledDate: '2024-01-14T14:00:00Z',
    actualDate: '2024-01-14T14:15:00Z',
    estimatedArrival: '2024-01-14T15:00:00Z',
    actualArrival: '2024-01-14T15:10:00Z',
    driver: {
      name: 'Ali Benali',
      license: 'LIC-2024-002',
      phone: '+213 21 45 67 93',
      vehicle: 'Camion-002 (Mercedes Actros)'
    },
    transporter: {
      name: 'Transport Express',
      contact: 'Directeur: Ali Benali',
      phone: '+213 21 45 67 92',
      license: 'TRANS-2024-001'
    },
    createdAt: '2024-01-14T10:00:00Z',
    lastActivity: '2024-01-14T15:10:00Z',
    notes: 'Livraison de concentré ovins pour approvisionnement',
    documents: [
      {
        id: 'DOC003',
        type: 'DELIVERY_NOTE',
        name: 'Bon de livraison TR-2024-002',
        url: '/documents/delivery-note-TR-2024-002.pdf',
        createdAt: '2024-01-14T15:10:00Z'
      },
      {
        id: 'DOC004',
        type: 'INVOICE',
        name: 'Facture TR-2024-002',
        url: '/documents/invoice-TR-2024-002.pdf',
        createdAt: '2024-01-14T15:10:00Z'
      },
      {
        id: 'DOC005',
        type: 'RECEIPT',
        name: 'Récepissé TR-2024-002',
        url: '/documents/receipt-TR-2024-002.pdf',
        createdAt: '2024-01-14T15:10:00Z'
      }
    ],
    tracking: [
      {
        date: '2024-01-14T14:15:00Z',
        location: 'Aliments du Maghreb',
        status: 'Départ',
        notes: 'Chargement terminé, départ confirmé'
      },
      {
        date: '2024-01-14T14:45:00Z',
        location: 'Autoroute A1',
        status: 'En transit',
        notes: 'Véhicule en route vers Alger'
      },
      {
        date: '2024-01-14T15:10:00Z',
        location: 'Entrepôt Central Alger',
        status: 'Livré',
        notes: 'Livraison terminée avec succès'
      }
    ],
    recentActivity: [
      {
        date: '2024-01-14T15:10:00Z',
        action: 'Livraison terminée',
        details: '1000 kg de concentré ovins livrés avec succès',
        user: 'Équipe de réception'
      },
      {
        date: '2024-01-14T14:45:00Z',
        action: 'En transit',
        details: 'Véhicule en route vers Alger',
        user: 'Système de suivi'
      },
      {
        date: '2024-01-14T14:15:00Z',
        action: 'Départ confirmé',
        details: 'Chargement terminé, départ confirmé',
        user: 'Ali Benali (Chauffeur)'
      }
    ]
  }
};

export default function FeedTransferDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [feedTransfer, setFeedTransfer] = useState<FeedTransferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchFeedTransferDetail = async () => {
      try {
        setLoading(true);
        const feedTransferId = params.id as string;
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const feedTransferData = mockFeedTransferDetails[feedTransferId];
        if (!feedTransferData) {
          setError('Transfert d\'aliment non trouvé');
          return;
        }
        
        setFeedTransfer(feedTransferData);
        console.log('Détails du transfert d\'aliment récupérés:', feedTransferData);
      } catch (err) {
        setError('Erreur lors du chargement des détails du transfert d\'aliment');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchFeedTransferDetail();
    }
  }, [isAuthenticated, params.id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const feedTransferId = params.id as string;
      const feedTransferData = mockFeedTransferDetails[feedTransferId];
      if (feedTransferData) {
        setFeedTransfer(feedTransferData);
      }
      
      console.log('Détails du transfert d\'aliment rafraîchis:', feedTransferData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في الانتظار' : 'En Attente',
        icon: Clock
      },
      IN_TRANSIT: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'في الطريق' : 'En Transit',
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INCOMING: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'وارد' : 'Entrant',
        icon: TrendingUp
      },
      OUTGOING: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'صادر' : 'Sortant',
        icon: TrendingDown
      },
      INTERNAL: { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        label: isRTL ? 'داخلي' : 'Interne',
        icon: Minus
      }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INTERNAL;
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

  const handlePrintDocument = (documentType: string) => {
    console.log(`Impression du document: ${documentType}`);
    // Logique d'impression
  };

  const handleDownloadDocument = (documentType: string) => {
    console.log(`Téléchargement du document: ${documentType}`);
    // Logique de téléchargement
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

  if (error || !feedTransfer) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {error || 'Transfert d\'aliment non trouvé'}
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
                <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات النقل' : 'Informations du Transfert'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'رقم النقل:' : 'N° Transfert:'}</span>
                  <span className="font-medium theme-text-primary">{feedTransfer.transferNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'النوع:' : 'Type:'}</span>
                  {getTypeBadge(feedTransfer.type)}
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(feedTransfer.status)}
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedTransfer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'تاريخ مجدول:' : 'Date programmée:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedTransfer.scheduledDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'تاريخ فعلي:' : 'Date réelle:'}</span>
                  <span className="font-medium theme-text-primary">{formatDate(feedTransfer.actualDate)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'الكميات والقيم' : 'Quantités et Valeurs'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'إجمالي الكمية:' : 'Quantité totale:'}</span>
                  <span className="font-medium theme-text-primary">{feedTransfer.totalQuantity} {isRTL ? 'وحدة' : 'unités'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'القيمة الإجمالية:' : 'Valeur totale:'}</span>
                  <span className="font-medium theme-text-primary">{feedTransfer.totalValue.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'عدد العناصر:' : 'Nombre d\'articles:'}</span>
                  <span className="font-medium theme-text-primary">{feedTransfer.items.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lieux de départ et d'arrivée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'مكان الانطلاق' : 'Lieu de Départ'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.fromLocation.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.fromLocation.address}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.fromLocation.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.fromLocation.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'مكان الوصول' : 'Lieu d\'Arrivée'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.toLocation.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.toLocation.address}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.toLocation.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.toLocation.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chauffeur et Transporteur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'السائق' : 'Chauffeur'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.driver.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'رخصة القيادة:' : 'Permis:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.driver.license}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.driver.phone}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'المركبة:' : 'Véhicule:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.driver.vehicle}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'الناقل' : 'Transporteur'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.transporter.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.transporter.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.transporter.phone}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الترخيص:' : 'Licence:'}</span>
                  <p className="font-medium theme-text-primary">{feedTransfer.transporter.license}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {feedTransfer.notes && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'ملاحظات' : 'Notes'}
              </h3>
              <p className="theme-text-primary">{feedTransfer.notes}</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'items',
      label: isRTL ? 'العناصر' : 'Articles',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'العناصر المنقولة' : 'Articles Transférés'}
            </h3>
            <div className="space-y-4">
              {feedTransfer.items.map((item, index) => (
                <div key={index} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Package className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <div>
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          {item.name}
                        </h3>
                        <p className="text-sm theme-text-secondary theme-transition">{item.type} • {item.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold theme-text-primary">{item.totalPrice.toLocaleString()} DA</p>
                      <p className="text-sm theme-text-secondary">{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'السعر/وحدة' : 'Prix/unité'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{item.unitPrice} DA/{item.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'رقم الدفعة' : 'N° Lot'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{item.batchNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'تاريخ الانتهاء' : 'Date d\'expiration'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{formatDate(item.expiryDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tracking',
      label: isRTL ? 'التتبع' : 'Suivi',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'مسار التتبع' : 'Trajet de Suivi'}
            </h3>
            <div className="space-y-4">
              {feedTransfer.tracking.map((track, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium theme-text-primary">{track.location}</p>
                      <p className="text-sm theme-text-secondary">{formatDate(track.date)}</p>
                    </div>
                    <p className="text-sm theme-text-secondary">{track.status}</p>
                    <p className="text-xs theme-text-tertiary mt-1">{track.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'documents',
      label: isRTL ? 'المستندات' : 'Documents',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المستندات المرتبطة' : 'Documents Associés'}
            </h3>
            <div className="space-y-4">
              {feedTransfer.documents.map((document, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium theme-text-primary">{document.name}</h4>
                      <p className="text-sm theme-text-secondary">{formatDate(document.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadDocument(document.type)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePrintDocument(document.type)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Templates de documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'قالب الفاتورة' : 'Template Facture'}
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const invoiceData = {
                      invoiceNumber: feedTransfer.transferNumber,
                      date: formatDate(feedTransfer.actualDate),
                      dueDate: formatDate(feedTransfer.estimatedArrival),
                      from: {
                        name: feedTransfer.fromLocation.name,
                        address: feedTransfer.fromLocation.address,
                        city: 'Alger',
                        phone: feedTransfer.fromLocation.phone,
                        email: 'contact@alviar.dz',
                        taxId: '123456789'
                      },
                      to: {
                        name: feedTransfer.toLocation.name,
                        address: feedTransfer.toLocation.address,
                        city: 'Alger',
                        phone: feedTransfer.toLocation.phone,
                        email: 'contact@client.dz'
                      },
                      items: feedTransfer.items.map(item => ({
                        description: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        total: item.totalPrice
                      })),
                      subtotal: feedTransfer.totalValue,
                      tax: feedTransfer.totalValue * 0.19,
                      total: feedTransfer.totalValue * 1.19,
                      notes: feedTransfer.notes
                    };
                    // Créer un composant temporaire pour afficher la facture
                    const tempDiv = document.createElement('div');
                    document.body.appendChild(tempDiv);
                    // Ici on pourrait utiliser ReactDOM.render ou une autre méthode
                    console.log('Invoice data:', invoiceData);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isRTL ? 'عرض الفاتورة' : 'Afficher la Facture'}
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'قالب بون التسليم' : 'Template Bon de Livraison'}
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const deliveryData = {
                      deliveryNumber: feedTransfer.transferNumber,
                      date: formatDate(feedTransfer.actualDate),
                      from: {
                        name: feedTransfer.fromLocation.name,
                        address: feedTransfer.fromLocation.address,
                        city: 'Alger',
                        phone: feedTransfer.fromLocation.phone,
                        email: 'contact@alviar.dz'
                      },
                      to: {
                        name: feedTransfer.toLocation.name,
                        address: feedTransfer.toLocation.address,
                        city: 'Alger',
                        phone: feedTransfer.toLocation.phone,
                        email: 'contact@client.dz'
                      },
                      driver: {
                        name: feedTransfer.driver.name,
                        license: feedTransfer.driver.license,
                        phone: feedTransfer.driver.phone
                      },
                      vehicle: {
                        plate: feedTransfer.driver.vehicle,
                        type: 'Camion',
                        capacity: 1000
                      },
                      items: feedTransfer.items.map(item => ({
                        description: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        batchNumber: item.batchNumber,
                        condition: 'Bon état'
                      })),
                      totalQuantity: feedTransfer.totalQuantity,
                      notes: feedTransfer.notes,
                      receivedBy: {
                        name: 'Responsable Réception',
                        signature: '',
                        date: formatDate(feedTransfer.actualDate)
                      }
                    };
                    console.log('Delivery data:', deliveryData);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isRTL ? 'عرض بون التسليم' : 'Afficher le Bon de Livraison'}
                </button>
              </div>
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
              {feedTransfer.recentActivity.map((activity, index) => (
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
                    <Truck className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? 'نقل الأعلاف' : 'Transfert d\'Aliment'} {feedTransfer.id}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {feedTransfer.transferNumber} • {feedTransfer.fromLocation.name} → {feedTransfer.toLocation.name} • {getStatusBadge(feedTransfer.status)}
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
                  onClick={() => console.log('Modifier transfert')}
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
