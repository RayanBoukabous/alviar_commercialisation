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
  Truck,
  Calendar,
  MapPin,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les réceptions
interface Reception {
  id: string;
  date: string;
  time: string;
  supplier: string;
  abattoir: string;
  abattoirId: number;
  livestockCount: number;
  livestockType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  weight: number;
  transport: string;
  driver: string;
  phone: string;
  notes: string;
  createdAt: string;
  lastActivity: string;
}

// Données mock pour les réceptions
const mockReceptions: Reception[] = [
  {
    id: 'REC001',
    date: '2024-01-15',
    time: '08:30',
    supplier: 'Ferme Benali',
    abattoir: 'Abattoir Central Alger',
    abattoirId: 1,
    livestockCount: 25,
    livestockType: 'Bovins',
    status: 'COMPLETED',
    weight: 1250,
    transport: 'Camion-001',
    driver: 'Ahmed Benali',
    phone: '+213 555 123 456',
    notes: 'Livraison en bon état, tous les documents conformes',
    createdAt: '2024-01-15T08:30:00Z',
    lastActivity: '2024-01-15T10:00:00Z'
  },
  {
    id: 'REC002',
    date: '2024-01-15',
    time: '10:15',
    supplier: 'Élevage Oran',
    abattoir: 'Abattoir Oran',
    abattoirId: 4,
    livestockCount: 18,
    livestockType: 'Ovins',
    status: 'IN_PROGRESS',
    weight: 450,
    transport: 'Camion-002',
    driver: 'Mohamed Khelil',
    phone: '+213 555 789 012',
    notes: 'En cours de déchargement',
    createdAt: '2024-01-15T10:15:00Z',
    lastActivity: '2024-01-15T11:30:00Z'
  },
  {
    id: 'REC003',
    date: '2024-01-15',
    time: '14:20',
    supplier: 'Ferme Constantine',
    abattoir: 'Abattoir Constantine',
    abattoirId: 3,
    livestockCount: 32,
    livestockType: 'Bovins',
    status: 'PENDING',
    weight: 0,
    transport: 'Camion-003',
    driver: 'Ali Mansouri',
    phone: '+213 555 345 678',
    notes: 'En attente d\'arrivée',
    createdAt: '2024-01-15T14:20:00Z',
    lastActivity: '2024-01-15T14:20:00Z'
  },
  {
    id: 'REC004',
    date: '2024-01-14',
    time: '16:45',
    supplier: 'Coopérative Tlemcen',
    abattoir: 'Abattoir Tlemcen',
    abattoirId: 6,
    livestockCount: 12,
    livestockType: 'Caprins',
    status: 'COMPLETED',
    weight: 180,
    transport: 'Camion-004',
    driver: 'Omar Boudjema',
    phone: '+213 555 901 234',
    notes: 'Livraison terminée avec succès',
    createdAt: '2024-01-14T16:45:00Z',
    lastActivity: '2024-01-14T18:00:00Z'
  },
  {
    id: 'REC005',
    date: '2024-01-14',
    time: '11:30',
    supplier: 'Ferme Blida',
    abattoir: 'Abattoir Blida',
    abattoirId: 2,
    livestockCount: 28,
    livestockType: 'Bovins',
    status: 'CANCELLED',
    weight: 0,
    transport: 'Camion-005',
    driver: 'Karim Belkacem',
    phone: '+213 555 567 890',
    notes: 'Annulé - Problème de transport',
    createdAt: '2024-01-14T11:30:00Z',
    lastActivity: '2024-01-14T12:00:00Z'
  },
  {
    id: 'REC006',
    date: '2024-01-16',
    time: '09:00',
    supplier: 'Ferme Sétif',
    abattoir: 'Abattoir Sétif',
    abattoirId: 7,
    livestockCount: 15,
    livestockType: 'Ovins',
    status: 'IN_PROGRESS',
    weight: 375,
    transport: 'Camion-006',
    driver: 'Fatima Zohra',
    phone: '+213 555 234 567',
    notes: 'Contrôle sanitaire en cours',
    createdAt: '2024-01-16T09:00:00Z',
    lastActivity: '2024-01-16T10:15:00Z'
  },
  {
    id: 'REC007',
    date: '2024-01-16',
    time: '13:45',
    supplier: 'Élevage Batna',
    abattoir: 'Abattoir Batna',
    abattoirId: 8,
    livestockCount: 22,
    livestockType: 'Bovins',
    status: 'PENDING',
    weight: 0,
    transport: 'Camion-007',
    driver: 'Youssef Amrani',
    phone: '+213 555 678 901',
    notes: 'Programmé pour cet après-midi',
    createdAt: '2024-01-16T13:45:00Z',
    lastActivity: '2024-01-16T13:45:00Z'
  },
  {
    id: 'REC008',
    date: '2024-01-13',
    time: '07:30',
    supplier: 'Ferme Tizi Ouzou',
    abattoir: 'Abattoir Tizi Ouzou',
    abattoirId: 5,
    livestockCount: 8,
    livestockType: 'Caprins',
    status: 'COMPLETED',
    weight: 120,
    transport: 'Camion-008',
    driver: 'Nadia Kaci',
    phone: '+213 555 123 789',
    notes: 'Livraison matinale terminée',
    createdAt: '2024-01-13T07:30:00Z',
    lastActivity: '2024-01-13T09:00:00Z'
  }
];

export default function ReceptionPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingReceptionId, setDeletingReceptionId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchReceptions = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReceptions(mockReceptions);
        console.log('Réceptions récupérées:', mockReceptions);
      } catch (err) {
        setError('Erreur lors du chargement des réceptions');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReceptions();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setReceptions(mockReceptions);
      console.log('Réceptions rafraîchies:', mockReceptions);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewReception = (reception: Reception) => {
    router.push(`/dashboard/reception/${reception.id}`);
  };

  const handleEditReception = (reception: Reception) => {
    // TODO: Implémenter la modification
    console.log('Modifier réception:', reception);
  };

  const handleDeleteReception = async (receptionId: string, receptionName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la réception "${receptionName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReceptionId(receptionId);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReceptions(prevReceptions => prevReceptions.filter(reception => reception.id !== receptionId));
      setSuccessMessage(`Réception "${receptionName}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Réception ${receptionName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la réception:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingReceptionId(null);
    }
  };

  const filteredReceptions = receptions.filter(reception => {
    const matchesSearch = reception.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reception.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reception.abattoir.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reception.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || reception.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || reception.livestockType === typeFilter;
    const matchesAbattoir = abattoirFilter === 'ALL' || reception.abattoirId.toString() === abattoirFilter;
    return matchesSearch && matchesStatus && matchesType && matchesAbattoir;
  });

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

  const getAbattoirs = () => {
    const abattoirs = [...new Set(receptions.map(reception => ({ id: reception.abattoirId, name: reception.abattoir })))];
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
                  <Truck className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الاستقبال' : 'Réception'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة استقبال الماشية في المجازر' : 'Gestion des réceptions de bétail dans les abattoirs'}
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
                  onClick={() => console.log('Nouvelle réception')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة استقبال' : 'Nouvelle réception'}
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
                  placeholder={isRTL ? 'البحث في الاستقبالات...' : 'Rechercher une réception...'}
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
                <option value="IN_PROGRESS">{isRTL ? 'قيد المعالجة' : 'En cours'}</option>
                <option value="COMPLETED">{isRTL ? 'مكتمل' : 'Terminé'}</option>
                <option value="CANCELLED">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
                <option value="Bovins">{isRTL ? 'بقر' : 'Bovins'}</option>
                <option value="Ovins">{isRTL ? 'غنم' : 'Ovins'}</option>
                <option value="Caprins">{isRTL ? 'ماعز' : 'Caprins'}</option>
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
                        {isRTL ? 'الاستقبال' : 'Réception'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'التاريخ والوقت' : 'Date & Heure'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المورد' : 'Fournisseur'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المجزر' : 'Abattoir'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الماشية' : 'Bétail'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الوزن' : 'Poids'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'آخر نشاط' : 'Dernière activité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredReceptions.map((reception) => (
                      <tr key={reception.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Truck className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{reception.id}</div>
                              <div className="text-sm theme-text-secondary theme-transition">{reception.transport}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{reception.date}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{reception.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{reception.supplier}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{reception.driver}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{reception.abattoir}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{reception.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {reception.livestockCount} {isRTL ? 'رأس' : 'têtes'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">{reception.livestockType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {reception.weight > 0 ? `${reception.weight} kg` : '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reception.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(reception.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewReception(reception)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditReception(reception)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل الاستقبال' : 'Modifier la réception'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteReception(reception.id, reception.id)}
                              disabled={deletingReceptionId === reception.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف الاستقبال' : 'Supprimer la réception'}
                            >
                              {deletingReceptionId === reception.id ? (
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
            
            {filteredReceptions.length === 0 && !loading && (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على استقبالات' : 'Aucune réception trouvée'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة استقبالات جديدة' : 'Commencez par ajouter de nouvelles réceptions'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
