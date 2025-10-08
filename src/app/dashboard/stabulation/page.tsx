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
  XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les stabulations
interface Stabulation {
  id: string;
  name: string;
  abattoir: string;
  abattoirId: number;
  capacity: number; // Nombre total de places
  currentOccupancy: number; // Nombre d'animaux actuellement
  availableSpaces: number; // Places disponibles
  status: 'ACTIVE' | 'FULL' | 'MAINTENANCE' | 'INACTIVE';
  manager: string;
  phone: string;
  email: string;
  location: string;
  lastFeeding: string;
  nextSlaughter: string;
  createdAt: string;
  lastActivity: string;
  animals: {
    id: string;
    type: string;
    count: number;
    averageWeight: number;
    arrivalDate: string;
    expectedSlaughter: string;
  }[];
}

// Données mock pour les stabulations
const mockStabulations: Stabulation[] = [
  {
    id: 'STAB001',
    name: 'Stabulation A - Bovins',
    abattoir: 'Abattoir Central Alger',
    abattoirId: 1,
    capacity: 100,
    currentOccupancy: 30,
    availableSpaces: 70,
    status: 'ACTIVE',
    manager: 'Ahmed Benali',
    phone: '+213 21 45 67 89',
    email: 'ahmed.benali@abattoir-alger.dz',
    location: 'Zone de stabulation A, Alger Centre',
    lastFeeding: '2024-01-15T06:00:00Z',
    nextSlaughter: '2024-01-16T08:00:00Z',
    createdAt: '2023-01-15T08:30:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
    animals: [
      {
        id: 'GRP001',
        type: 'Bovins',
        count: 30,
        averageWeight: 450,
        arrivalDate: '2024-01-14T10:00:00Z',
        expectedSlaughter: '2024-01-16T08:00:00Z'
      }
    ]
  },
  {
    id: 'STAB002',
    name: 'Stabulation B - Ovins',
    abattoir: 'Abattoir Central Alger',
    abattoirId: 1,
    capacity: 200,
    currentOccupancy: 180,
    availableSpaces: 20,
    status: 'FULL',
    manager: 'Fatima Zohra',
    phone: '+213 21 45 67 90',
    email: 'fatima.zohra@abattoir-alger.dz',
    location: 'Zone de stabulation B, Alger Centre',
    lastFeeding: '2024-01-15T06:30:00Z',
    nextSlaughter: '2024-01-15T16:00:00Z',
    createdAt: '2023-02-20T10:15:00Z',
    lastActivity: '2024-01-15T15:45:00Z',
    animals: [
      {
        id: 'GRP002',
        type: 'Ovins',
        count: 120,
        averageWeight: 35,
        arrivalDate: '2024-01-13T14:00:00Z',
        expectedSlaughter: '2024-01-15T16:00:00Z'
      },
      {
        id: 'GRP003',
        type: 'Ovins',
        count: 60,
        averageWeight: 40,
        arrivalDate: '2024-01-14T09:00:00Z',
        expectedSlaughter: '2024-01-16T10:00:00Z'
      }
    ]
  },
  {
    id: 'STAB003',
    name: 'Stabulation C - Caprins',
    abattoir: 'Abattoir de Blida',
    abattoirId: 2,
    capacity: 80,
    currentOccupancy: 0,
    availableSpaces: 80,
    status: 'MAINTENANCE',
    manager: 'Mohamed Khelil',
    phone: '+213 25 12 34 56',
    email: 'mohamed.khelil@abattoir-blida.dz',
    location: 'Zone de stabulation C, Blida',
    lastFeeding: '2024-01-14T18:00:00Z',
    nextSlaughter: '2024-01-17T09:00:00Z',
    createdAt: '2023-03-10T09:00:00Z',
    lastActivity: '2024-01-15T12:00:00Z',
    animals: []
  },
  {
    id: 'STAB004',
    name: 'Stabulation D - Bovins',
    abattoir: 'Abattoir d\'Oran',
    abattoirId: 4,
    capacity: 150,
    currentOccupancy: 45,
    availableSpaces: 105,
    status: 'ACTIVE',
    manager: 'Aicha Boudjedra',
    phone: '+213 41 23 45 67',
    email: 'aicha.boudjedra@abattoir-oran.dz',
    location: 'Zone de stabulation D, Oran',
    lastFeeding: '2024-01-15T07:00:00Z',
    nextSlaughter: '2024-01-16T14:00:00Z',
    createdAt: '2023-04-05T11:30:00Z',
    lastActivity: '2024-01-15T13:20:00Z',
    animals: [
      {
        id: 'GRP004',
        type: 'Bovins',
        count: 45,
        averageWeight: 420,
        arrivalDate: '2024-01-14T16:00:00Z',
        expectedSlaughter: '2024-01-16T14:00:00Z'
      }
    ]
  },
  {
    id: 'STAB005',
    name: 'Stabulation E - Mixte',
    abattoir: 'Abattoir de Tizi Ouzou',
    abattoirId: 5,
    capacity: 120,
    currentOccupancy: 85,
    availableSpaces: 35,
    status: 'ACTIVE',
    manager: 'Karim Amrani',
    phone: '+213 26 56 78 90',
    email: 'karim.amrani@abattoir-tizi.dz',
    location: 'Zone de stabulation E, Tizi Ouzou',
    lastFeeding: '2024-01-15T06:45:00Z',
    nextSlaughter: '2024-01-16T11:00:00Z',
    createdAt: '2023-05-12T14:45:00Z',
    lastActivity: '2024-01-15T10:15:00Z',
    animals: [
      {
        id: 'GRP005',
        type: 'Bovins',
        count: 25,
        averageWeight: 380,
        arrivalDate: '2024-01-13T11:00:00Z',
        expectedSlaughter: '2024-01-16T11:00:00Z'
      },
      {
        id: 'GRP006',
        type: 'Ovins',
        count: 60,
        averageWeight: 32,
        arrivalDate: '2024-01-14T13:00:00Z',
        expectedSlaughter: '2024-01-17T08:00:00Z'
      }
    ]
  },
  {
    id: 'STAB006',
    name: 'Stabulation F - Bovins',
    abattoir: 'Abattoir de Sétif',
    abattoirId: 7,
    capacity: 200,
    currentOccupancy: 200,
    availableSpaces: 0,
    status: 'FULL',
    manager: 'Omar Boukhelifa',
    phone: '+213 36 45 67 89',
    email: 'omar.boukhelifa@abattoir-setif.dz',
    location: 'Zone de stabulation F, Sétif',
    lastFeeding: '2024-01-15T05:30:00Z',
    nextSlaughter: '2024-01-15T20:00:00Z',
    createdAt: '2023-07-22T12:10:00Z',
    lastActivity: '2024-01-15T15:45:00Z',
    animals: [
      {
        id: 'GRP007',
        type: 'Bovins',
        count: 200,
        averageWeight: 480,
        arrivalDate: '2024-01-12T08:00:00Z',
        expectedSlaughter: '2024-01-15T20:00:00Z'
      }
    ]
  }
];

export default function StabulationPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [stabulations, setStabulations] = useState<Stabulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingStabulationId, setDeletingStabulationId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchStabulations = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStabulations(mockStabulations);
        console.log('Stabulations récupérées:', mockStabulations);
      } catch (err) {
        setError('Erreur lors du chargement des stabulations');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStabulations();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setStabulations(mockStabulations);
      console.log('Stabulations rafraîchies:', mockStabulations);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewStabulation = (stabulation: Stabulation) => {
    router.push(`/dashboard/stabulation/${stabulation.id}`);
  };

  const handleEditStabulation = (stabulation: Stabulation) => {
    // TODO: Implémenter la modification
    console.log('Modifier stabulation:', stabulation);
  };

  const handleDeleteStabulation = async (stabulationId: string, stabulationName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la stabulation "${stabulationName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingStabulationId(stabulationId);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStabulations(prevStabulations => prevStabulations.filter(stabulation => stabulation.id !== stabulationId));
      setSuccessMessage(`Stabulation "${stabulationName}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Stabulation ${stabulationName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la stabulation:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingStabulationId(null);
    }
  };

  const filteredStabulations = stabulations.filter(stabulation => {
    const matchesSearch = stabulation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stabulation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stabulation.abattoir.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stabulation.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || stabulation.status === statusFilter;
    const matchesAbattoir = abattoirFilter === 'ALL' || stabulation.abattoirId.toString() === abattoirFilter;
    return matchesSearch && matchesStatus && matchesAbattoir;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif',
        icon: CheckCircle
      },
      FULL: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'ممتلئ' : 'Plein',
        icon: XCircle
      },
      MAINTENANCE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'صيانة' : 'Maintenance',
        icon: AlertCircle
      },
      INACTIVE: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif',
        icon: Clock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
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
    const abattoirs = [...new Set(stabulations.map(stabulation => ({ id: stabulation.abattoirId, name: stabulation.abattoir })))];
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
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => console.log('Nouvelle stabulation')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة إسطبل' : 'Nouvelle stabulation'}
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
                <option value="ACTIVE">{isRTL ? 'نشط' : 'Actif'}</option>
                <option value="FULL">{isRTL ? 'ممتلئ' : 'Plein'}</option>
                <option value="MAINTENANCE">{isRTL ? 'صيانة' : 'Maintenance'}</option>
                <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactif'}</option>
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
                        {isRTL ? 'الإسطبل' : 'Stabulation'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المجزر' : 'Abattoir'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'السعة' : 'Capacité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحيوانات' : 'Animaux'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المدير' : 'Responsable'}
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
                    {filteredStabulations.map((stabulation) => (
                      <tr key={stabulation.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Warehouse className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{stabulation.name}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {stabulation.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{stabulation.abattoir}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{stabulation.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {stabulation.currentOccupancy} / {stabulation.capacity}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {isRTL ? 'مكان' : 'places'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {stabulation.animals.reduce((total, animal) => total + animal.count, 0)} {isRTL ? 'رأس' : 'têtes'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {stabulation.animals.map(animal => animal.type).join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{stabulation.manager}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{stabulation.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(stabulation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(stabulation.lastActivity)}
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
                            <button 
                              onClick={() => handleEditStabulation(stabulation)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل الإسطبل' : 'Modifier la stabulation'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStabulation(stabulation.id, stabulation.name)}
                              disabled={deletingStabulationId === stabulation.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف الإسطبل' : 'Supprimer la stabulation'}
                            >
                              {deletingStabulationId === stabulation.id ? (
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
      </div>
    </Layout>
  );
}
