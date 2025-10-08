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
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';

// Interface pour les réceptions avec données détaillées
interface ReceptionDetail {
  id: string;
  date: string;
  time: string;
  supplier: {
    name: string;
    contact: string;
    phone: string;
    address: string;
    license: string;
  };
  abattoir: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  transport: {
    vehicle: string;
    driver: string;
    license: string;
    phone: string;
  };
  livestock: {
    count: number;
    type: string;
    averageWeight: number;
    totalWeight: number;
    breed: string;
    age: string;
    healthStatus: string;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  documents: {
    id: number;
    name: string;
    type: string;
    status: string;
  }[];
  timeline: {
    id: number;
    action: string;
    timestamp: string;
    status: string;
    user: string;
  }[];
  statistics: {
    totalWeight: number;
    averageWeight: number;
    processingTime: number;
    qualityScore: number;
  };
  recentActivity: {
    date: string;
    action: string;
    details: string;
    user: string;
  }[];
}

// Données mock détaillées pour les réceptions
const mockReceptionDetails: { [key: string]: ReceptionDetail } = {
  'REC001': {
    id: 'REC001',
    date: '2024-01-15',
    time: '08:30',
    supplier: {
      name: 'Ferme Benali',
      contact: 'Ahmed Benali',
      phone: '+213 555 123 456',
      address: 'Route de Blida, Alger',
      license: 'LIC-2024-001'
    },
    abattoir: {
      name: 'Abattoir Central Alger',
      address: 'Zone Industrielle, Alger',
      contact: 'Directeur: Mohamed Khelil',
      phone: '+213 555 789 012'
    },
    transport: {
      vehicle: 'Camion-001',
      driver: 'Ahmed Benali',
      license: 'DL-123456',
      phone: '+213 555 123 456'
    },
    livestock: {
      count: 25,
      type: 'Bovins',
      averageWeight: 50,
      totalWeight: 1250,
      breed: 'Holstein',
      age: '18-24 mois',
      healthStatus: 'Bon état'
    },
    status: 'COMPLETED',
    notes: 'Livraison en bon état, tous les documents conformes. Animaux en bonne santé.',
    documents: [
      { id: 1, name: 'Certificat sanitaire', type: 'pdf', status: 'valid' },
      { id: 2, name: 'Document de transport', type: 'pdf', status: 'valid' },
      { id: 3, name: 'Facture fournisseur', type: 'pdf', status: 'valid' },
      { id: 4, name: 'Photos de réception', type: 'image', status: 'valid' }
    ],
    timeline: [
      {
        id: 1,
        action: 'Réception programmée',
        timestamp: '2024-01-14 16:00',
        status: 'completed',
        user: 'Système'
      },
      {
        id: 2,
        action: 'Arrivée du transport',
        timestamp: '2024-01-15 08:30',
        status: 'completed',
        user: 'Ahmed Benali'
      },
      {
        id: 3,
        action: 'Vérification des documents',
        timestamp: '2024-01-15 08:45',
        status: 'completed',
        user: 'Mohamed Khelil'
      },
      {
        id: 4,
        action: 'Contrôle sanitaire',
        timestamp: '2024-01-15 09:00',
        status: 'completed',
        user: 'Vétérinaire'
      },
      {
        id: 5,
        action: 'Déchargement',
        timestamp: '2024-01-15 09:15',
        status: 'completed',
        user: 'Équipe de réception'
      },
      {
        id: 6,
        action: 'Pesée et enregistrement',
        timestamp: '2024-01-15 10:00',
        status: 'completed',
        user: 'Système'
      }
    ],
    statistics: {
      totalWeight: 1250,
      averageWeight: 50,
      processingTime: 90,
      qualityScore: 95
    },
    recentActivity: [
      {
        date: '2024-01-15T10:00:00Z',
        action: 'Réception terminée',
        details: 'Tous les animaux ont été pesés et enregistrés',
        user: 'Système'
      },
      {
        date: '2024-01-15T09:15:00Z',
        action: 'Déchargement terminé',
        details: '25 têtes de bétail déchargées avec succès',
        user: 'Équipe de réception'
      },
      {
        date: '2024-01-15T09:00:00Z',
        action: 'Contrôle sanitaire',
        details: 'Examen vétérinaire effectué - tous les animaux en bonne santé',
        user: 'Vétérinaire'
      }
    ]
  },
  'REC002': {
    id: 'REC002',
    date: '2024-01-15',
    time: '10:15',
    supplier: {
      name: 'Élevage Oran',
      contact: 'Mohamed Khelil',
      phone: '+213 555 789 012',
      address: 'Zone Industrielle, Oran',
      license: 'LIC-2024-002'
    },
    abattoir: {
      name: 'Abattoir Oran',
      address: 'Route de l\'Abattoir, Oran',
      contact: 'Directeur: Aicha Boudjedra',
      phone: '+213 555 789 012'
    },
    transport: {
      vehicle: 'Camion-002',
      driver: 'Mohamed Khelil',
      license: 'DL-789012',
      phone: '+213 555 789 012'
    },
    livestock: {
      count: 18,
      type: 'Ovins',
      averageWeight: 25,
      totalWeight: 450,
      breed: 'Ouled Djellal',
      age: '12-18 mois',
      healthStatus: 'Bon état'
    },
    status: 'IN_PROGRESS',
    notes: 'En cours de déchargement et de vérification sanitaire.',
    documents: [
      { id: 1, name: 'Certificat sanitaire', type: 'pdf', status: 'valid' },
      { id: 2, name: 'Document de transport', type: 'pdf', status: 'valid' }
    ],
    timeline: [
      {
        id: 1,
        action: 'Réception programmée',
        timestamp: '2024-01-14 18:00',
        status: 'completed',
        user: 'Système'
      },
      {
        id: 2,
        action: 'Arrivée du transport',
        timestamp: '2024-01-15 10:15',
        status: 'completed',
        user: 'Mohamed Khelil'
      },
      {
        id: 3,
        action: 'Début du déchargement',
        timestamp: '2024-01-15 10:30',
        status: 'completed',
        user: 'Équipe de réception'
      }
    ],
    statistics: {
      totalWeight: 450,
      averageWeight: 25,
      processingTime: 45,
      qualityScore: 90
    },
    recentActivity: [
      {
        date: '2024-01-15T10:30:00Z',
        action: 'Déchargement en cours',
        details: '18 têtes d\'ovins en cours de déchargement',
        user: 'Équipe de réception'
      }
    ]
  },
  'REC003': {
    id: 'REC003',
    date: '2024-01-15',
    time: '14:20',
    supplier: {
      name: 'Ferme Constantine',
      contact: 'Ali Mansouri',
      phone: '+213 555 345 678',
      address: 'Avenue de l\'Abattoir, Constantine',
      license: 'LIC-2024-003'
    },
    abattoir: {
      name: 'Abattoir Constantine',
      address: 'Avenue de l\'Abattoir, Constantine',
      contact: 'Directeur: Mohamed Khelil',
      phone: '+213 555 345 678'
    },
    transport: {
      vehicle: 'Camion-003',
      driver: 'Ali Mansouri',
      license: 'DL-345678',
      phone: '+213 555 345 678'
    },
    livestock: {
      count: 32,
      type: 'Bovins',
      averageWeight: 45,
      totalWeight: 1440,
      breed: 'Charolais',
      age: '24-30 mois',
      healthStatus: 'Excellent état'
    },
    status: 'PENDING',
    notes: 'En attente d\'arrivée du transport. Animaux de qualité supérieure.',
    documents: [
      { id: 1, name: 'Certificat sanitaire', type: 'pdf', status: 'valid' },
      { id: 2, name: 'Document de transport', type: 'pdf', status: 'valid' },
      { id: 3, name: 'Facture fournisseur', type: 'pdf', status: 'valid' }
    ],
    timeline: [
      {
        id: 1,
        action: 'Réception programmée',
        timestamp: '2024-01-15 12:00',
        status: 'completed',
        user: 'Système'
      }
    ],
    statistics: {
      totalWeight: 1440,
      averageWeight: 45,
      processingTime: 0,
      qualityScore: 98
    },
    recentActivity: [
      {
        date: '2024-01-15T14:20:00Z',
        action: 'Réception créée',
        details: 'Nouvelle réception programmée pour 32 têtes de bovins',
        user: 'Système'
      }
    ]
  }
};

export default function ReceptionDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [reception, setReception] = useState<ReceptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');
  const [confirmationText, setConfirmationText] = useState('');
  const [randomText, setRandomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchReceptionDetail = async () => {
      try {
        setLoading(true);
        const receptionId = params.id as string;
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const receptionData = mockReceptionDetails[receptionId];
        if (!receptionData) {
          setError('Réception non trouvée');
          return;
        }
        
        setReception(receptionData);
        console.log('Détails de la réception récupérés:', receptionData);
      } catch (err) {
        setError('Erreur lors du chargement des détails de la réception');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchReceptionDetail();
    }
  }, [isAuthenticated, params.id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const receptionId = params.id as string;
      const receptionData = mockReceptionDetails[receptionId];
      if (receptionData) {
        setReception(receptionData);
      }
      
      console.log('Détails de la réception rafraîchis:', receptionData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Générer un texte aléatoire pour la confirmation
  const generateRandomText = () => {
    const words = ['CONFIRMER', 'VALIDER', 'ACCEPTER', 'APPROUVER', 'AUTORISER'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNumber = Math.floor(Math.random() * 9999) + 1000;
    return `${randomWord}-${randomNumber}`;
  };

  // Ouvrir le modal de confirmation
  const openConfirmModal = (action: string) => {
    setPendingAction(action);
    setRandomText(generateRandomText());
    setConfirmationText('');
    setShowConfirmModal(true);
  };

  // Fermer le modal de confirmation
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setPendingAction('');
    setConfirmationText('');
    setRandomText('');
  };

  // Exécuter l'action après confirmation
  const executeAction = async () => {
    if (confirmationText !== randomText) {
      alert(isRTL ? 'النص المدخل غير صحيح' : 'Le texte saisi est incorrect');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (reception) {
        let newStatus = reception.status;
        
        switch (pendingAction) {
          case 'start':
            newStatus = 'IN_PROGRESS';
            break;
          case 'complete':
            newStatus = 'COMPLETED';
            break;
          case 'cancel':
            newStatus = 'CANCELLED';
            break;
          case 'restart':
            newStatus = 'PENDING';
            break;
        }
        
        setReception({
          ...reception,
          status: newStatus,
          lastActivity: new Date().toISOString()
        });
        
        console.log(`Action ${pendingAction} exécutée avec succès`);
      }
      
      closeConfirmModal();
    } catch (err) {
      console.error('Erreur lors de l\'exécution de l\'action:', err);
      alert(isRTL ? 'خطأ في تنفيذ العملية' : 'Erreur lors de l\'exécution de l\'action');
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtenir les actions disponibles selon le statut
  const getAvailableActions = () => {
    if (!reception) return [];
    
    const actions = [];
    
    switch (reception.status) {
      case 'PENDING':
        actions.push({
          id: 'start',
          label: isRTL ? 'بدء المعالجة' : 'Démarrer le traitement',
          icon: Play,
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          description: isRTL ? 'بدء عملية استقبال الماشية' : 'Commencer la réception du bétail'
        });
        actions.push({
          id: 'cancel',
          label: isRTL ? 'إلغاء الاستقبال' : 'Annuler la réception',
          icon: XCircle,
          color: 'bg-red-600 hover:bg-red-700 text-white',
          description: isRTL ? 'إلغاء عملية الاستقبال نهائياً' : 'Annuler définitivement la réception'
        });
        break;
        
      case 'IN_PROGRESS':
        actions.push({
          id: 'complete',
          label: isRTL ? 'إكمال الاستقبال' : 'Terminer la réception',
          icon: CheckCircle,
          color: 'bg-green-600 hover:bg-green-700 text-white',
          description: isRTL ? 'إنهاء عملية الاستقبال بنجاح' : 'Finaliser la réception avec succès'
        });
        actions.push({
          id: 'cancel',
          label: isRTL ? 'إلغاء الاستقبال' : 'Annuler la réception',
          icon: XCircle,
          color: 'bg-red-600 hover:bg-red-700 text-white',
          description: isRTL ? 'إلغاء عملية الاستقبال نهائياً' : 'Annuler définitivement la réception'
        });
        break;
        
      case 'COMPLETED':
        actions.push({
          id: 'restart',
          label: isRTL ? 'إعادة فتح' : 'Rouvrir',
          icon: RotateCcw,
          color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          description: isRTL ? 'إعادة فتح الاستقبال للمعالجة' : 'Rouvrir la réception pour traitement'
        });
        break;
        
      case 'CANCELLED':
        actions.push({
          id: 'restart',
          label: isRTL ? 'إعادة فتح' : 'Rouvrir',
          icon: RotateCcw,
          color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          description: isRTL ? 'إعادة فتح الاستقبال للمعالجة' : 'Rouvrir la réception pour traitement'
        });
        break;
    }
    
    return actions;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      IN_PROGRESS: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'قيد المعالجة' : 'En cours',
        icon: Activity
      },
      COMPLETED: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'مكتمل' : 'Terminé',
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

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !reception) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {error || 'Réception non trouvée'}
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
                {isRTL ? 'معلومات الاستقبال' : 'Informations de Réception'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'معرف الاستقبال:' : 'ID Réception:'}</span>
                  <span className="font-medium theme-text-primary">{reception.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'التاريخ:' : 'Date:'}</span>
                  <span className="font-medium theme-text-primary">{reception.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الوقت:' : 'Heure:'}</span>
                  <span className="font-medium theme-text-primary">{reception.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(reception.status)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تفاصيل الماشية' : 'Détails du Bétail'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'العدد:' : 'Nombre:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.count} {isRTL ? 'رأس' : 'têtes'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'النوع:' : 'Type:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'العرق:' : 'Race:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'العمر:' : 'Âge:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الوزن الإجمالي:' : 'Poids total:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.totalWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الوزن المتوسط:' : 'Poids moyen:'}</span>
                  <span className="font-medium theme-text-primary">{reception.livestock.averageWeight} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fournisseur et Abattoir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المورد' : 'Fournisseur'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{reception.supplier.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{reception.supplier.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{reception.supplier.phone}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                  <p className="font-medium theme-text-primary">{reception.supplier.address}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الترخيص:' : 'Licence:'}</span>
                  <p className="font-medium theme-text-primary">{reception.supplier.license}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المجزر' : 'Abattoir'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{reception.abattoir.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                  <p className="font-medium theme-text-primary">{reception.abattoir.address}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{reception.abattoir.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{reception.abattoir.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Truck className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'معلومات النقل' : 'Informations de Transport'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="theme-text-secondary">{isRTL ? 'المركبة:' : 'Véhicule:'}</span>
                <p className="font-medium theme-text-primary">{reception.transport.vehicle}</p>
              </div>
              <div>
                <span className="theme-text-secondary">{isRTL ? 'السائق:' : 'Chauffeur:'}</span>
                <p className="font-medium theme-text-primary">{reception.transport.driver}</p>
              </div>
              <div>
                <span className="theme-text-secondary">{isRTL ? 'الرخصة:' : 'Permis:'}</span>
                <p className="font-medium theme-text-primary">{reception.transport.license}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'timeline',
      label: isRTL ? 'الجدول الزمني' : 'Chronologie',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Clock className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تاريخ الإجراءات' : 'Historique des Actions'}
            </h3>
            <div className="space-y-4">
              {reception.timeline.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    event.status === 'completed' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium theme-text-primary">{event.action}</p>
                      <p className="text-sm theme-text-secondary">{event.timestamp}</p>
                    </div>
                    <p className="text-sm theme-text-secondary">{isRTL ? 'بواسطة:' : 'Par:'} {event.user}</p>
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
              {isRTL ? 'مستندات الاستقبال' : 'Documents de Réception'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reception.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium theme-text-primary">{doc.name}</p>
                      <p className="text-sm theme-text-secondary uppercase">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'valid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {doc.status === 'valid' ? (isRTL ? 'صالح' : 'Valide') : (isRTL ? 'غير صالح' : 'Invalide')}
                    </span>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 theme-text-primary">
                      {isRTL ? 'عرض' : 'Voir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      label: isRTL ? 'الملاحظات' : 'Notes',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <FileText className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'ملاحظات الاستقبال' : 'Notes de Réception'}
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="theme-text-primary whitespace-pre-wrap">{reception.notes}</p>
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
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'رجوع' : 'Retour'}
                </button>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Truck className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? 'استقبال' : 'Réception'} {reception.id}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {reception.date} {isRTL ? 'في' : 'à'} {reception.time} - {reception.supplier.name}
                  </p>
                </div>
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
                  onClick={() => console.log('Modifier réception')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </button>
                
                {/* Boutons d'action selon le statut */}
                {getAvailableActions().map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => openConfirmModal(action.id)}
                      className={`px-4 py-2 rounded-lg flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.color}`}
                      title={action.description}
                    >
                      <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {action.label}
                    </button>
                  );
                })}
                
                {getStatusBadge(reception.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <Tabs tabs={tabs} isRTL={isRTL} />
        </div>

        {/* Modal de Confirmation */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold theme-text-primary">
                  {isRTL ? 'تأكيد العملية' : 'Confirmation requise'}
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm theme-text-secondary mb-3">
                  {isRTL 
                    ? 'للمتابعة، يرجى كتابة النص التالي بالضبط:' 
                    : 'Pour continuer, veuillez taper exactement le texte suivant:'
                  }
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
                  <code className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">
                    {randomText}
                  </code>
                </div>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={isRTL ? 'اكتب النص هنا...' : 'Tapez le texte ici...'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-primary theme-text-primary"
                  autoComplete="off"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={executeAction}
                  disabled={isProcessing || confirmationText !== randomText}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري المعالجة...' : 'Traitement...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isRTL ? 'تأكيد' : 'Confirmer'}
                    </>
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
