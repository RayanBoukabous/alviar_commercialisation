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
  Heart,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity,
  Tag,
  Scale,
  Clock,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les bêtes
interface Livestock {
  id: string;
  loopNumber: string;
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  age: number; // en mois
  weight: number; // en kg
  gender: 'MALE' | 'FEMALE';
  status: 'EN_ATTENTE' | 'EN_TRAITEMENT' | 'ABATTU' | 'TRANSFERE' | 'REJETE';
  arrivalDate: string;
  lastActivity: string;
  origin: string;
  healthStatus: 'BON' | 'MOYEN' | 'MAUVAIS';
  abattoirId: number;
  abattoirName: string;
  notes?: string;
}

// Données mock pour les bêtes
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
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
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
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    notes: 'En cours de traitement'
  },
  {
    id: 'LIV003',
    loopNumber: 'DZ-BLI-2024-001236',
    type: 'OVIN',
    breed: 'Ouled Djellal',
    age: 18,
    weight: 65,
    gender: 'FEMALE',
    status: 'ABATTU',
    arrivalDate: '2024-01-10T09:00:00Z',
    lastActivity: '2024-01-12T16:45:00Z',
    origin: 'Ferme de Médéa',
    healthStatus: 'BON',
    abattoirId: 2,
    abattoirName: 'Abattoir de Blida',
    notes: 'Abattage terminé avec succès'
  },
  {
    id: 'LIV004',
    loopNumber: 'DZ-ORAN-2024-001237',
    type: 'BOVIN',
    breed: 'Limousine',
    age: 36,
    weight: 580,
    gender: 'MALE',
    status: 'TRANSFERE',
    arrivalDate: '2024-01-08T11:20:00Z',
    lastActivity: '2024-01-13T10:30:00Z',
    origin: 'Ferme de Mostaganem',
    healthStatus: 'MOYEN',
    abattoirId: 4,
    abattoirName: 'Abattoir d\'Oran',
    notes: 'Transféré vers un autre abattoir'
  },
  {
    id: 'LIV005',
    loopNumber: 'DZ-TIZI-2024-001238',
    type: 'CAPRIN',
    breed: 'Kabyle',
    age: 12,
    weight: 35,
    gender: 'FEMALE',
    status: 'EN_ATTENTE',
    arrivalDate: '2024-01-16T07:45:00Z',
    lastActivity: '2024-01-16T07:45:00Z',
    origin: 'Ferme de Tizi Ouzou',
    healthStatus: 'BON',
    abattoirId: 5,
    abattoirName: 'Abattoir de Tizi Ouzou',
    notes: 'Arrivée récente, en attente d\'examen'
  },
  {
    id: 'LIV006',
    loopNumber: 'DZ-SETIF-2024-001239',
    type: 'BOVIN',
    breed: 'Montbéliarde',
    age: 28,
    weight: 480,
    gender: 'FEMALE',
    status: 'REJETE',
    arrivalDate: '2024-01-05T14:15:00Z',
    lastActivity: '2024-01-07T09:30:00Z',
    origin: 'Ferme de Bordj Bou Arreridj',
    healthStatus: 'MAUVAIS',
    abattoirId: 7,
    abattoirName: 'Abattoir de Sétif',
    notes: 'Rejeté pour problèmes de santé'
  },
  {
    id: 'LIV007',
    loopNumber: 'DZ-BATNA-2024-001240',
    type: 'OVIN',
    breed: 'Rambouillet',
    age: 15,
    weight: 55,
    gender: 'MALE',
    status: 'EN_TRAITEMENT',
    arrivalDate: '2024-01-13T12:30:00Z',
    lastActivity: '2024-01-15T11:15:00Z',
    origin: 'Ferme de Khenchela',
    healthStatus: 'BON',
    abattoirId: 8,
    abattoirName: 'Abattoir de Batna',
    notes: 'En cours de préparation'
  },
  {
    id: 'LIV008',
    loopNumber: 'DZ-ALG-2024-001241',
    type: 'BOVIN',
    breed: 'Simmental',
    age: 32,
    weight: 550,
    gender: 'MALE',
    status: 'EN_ATTENTE',
    arrivalDate: '2024-01-17T08:00:00Z',
    lastActivity: '2024-01-17T08:00:00Z',
    origin: 'Ferme de Boumerdès',
    healthStatus: 'BON',
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    notes: 'Nouvelle arrivée, en attente d\'examen'
  }
];

export default function LivestockPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingLivestockId, setDeletingLivestockId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLivestock(mockLivestock);
        console.log('Bêtes récupérées:', mockLivestock);
      } catch (err) {
        setError('Erreur lors du chargement des bêtes');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLivestock();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setLivestock(mockLivestock);
      console.log('Bêtes rafraîchies:', mockLivestock);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewLivestock = (livestockItem: Livestock) => {
    router.push(`/dashboard/abattoirs/${livestockItem.abattoirId}/livestock/${livestockItem.id}`);
  };

  const handleEditLivestock = (livestockItem: Livestock) => {
    // TODO: Implémenter la modification
    console.log('Modifier bête:', livestockItem);
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
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLivestock(prevLivestock => prevLivestock.filter(item => item.id !== livestockId));
      setSuccessMessage(`Bête "${loopNumber}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Bête ${loopNumber} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la bête:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingLivestockId(null);
    }
  };

  const filteredLivestock = livestock.filter(item => {
    const matchesSearch = item.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.abattoirName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesAbattoir = abattoirFilter === 'ALL' || item.abattoirId.toString() === abattoirFilter;
    return matchesSearch && matchesStatus && matchesType && matchesAbattoir;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      EN_ATTENTE: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      EN_TRAITEMENT: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'قيد المعالجة' : 'En traitement',
        icon: Activity
      },
      ABATTU: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'مذبوح' : 'Abattu',
        icon: CheckCircle
      },
      TRANSFERE: { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        label: isRTL ? 'منقول' : 'Transféré',
        icon: ArrowRight
      },
      REJETE: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'مرفوض' : 'Rejeté',
        icon: X
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_ATTENTE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      BON: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
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
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    
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

  const getAbattoirs = () => {
    const abattoirs = [...new Set(livestock.map(item => ({ id: item.abattoirId, name: item.abattoirName })))];
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
                  <Heart className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الماشية' : 'Bêtes'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة جميع الماشية في النظام' : 'Gestion de toutes les bêtes du système'}
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
                  onClick={() => console.log('Nouvelle bête')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة بête' : 'Nouvelle bête'}
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
                  placeholder={isRTL ? 'البحث في الماشية...' : 'Rechercher une bête...'}
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
                <option value="BOVIN">{isRTL ? 'بقر' : 'Bovin'}</option>
                <option value="OVIN">{isRTL ? 'غنم' : 'Ovin'}</option>
                <option value="CAPRIN">{isRTL ? 'ماعز' : 'Caprin'}</option>
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
                        {isRTL ? 'الحالة الصحية' : 'Santé'}
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
                    {filteredLivestock.map((item) => (
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
                          {getHealthBadge(item.healthStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(item.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewLivestock(item)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditLivestock(item)}
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
            
            {filteredLivestock.length === 0 && !loading && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على ماشية' : 'Aucune bête trouvée'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة ماشية جديدة' : 'Commencez par ajouter de nouvelles bêtes'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
