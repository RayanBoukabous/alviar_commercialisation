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
  Building2,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Interface pour les abattoirs
interface Abattoir {
  id: number;
  name: string;
  wilaya: string;
  commune: string;
  address: string;
  capacity: number; // Nombre de têtes
  currentStock: number; // Stock actuel
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  manager: string;
  phone: string;
  email: string;
  createdAt: string;
  lastActivity: string;
}

// Données mock pour les abattoirs
const mockAbattoirs: Abattoir[] = [
  {
    id: 1,
    name: "Abattoir Central d'Alger",
    wilaya: "Alger",
    commune: "Alger Centre",
    address: "Route de l'Abattoir, Alger Centre",
    capacity: 500,
    currentStock: 320,
    status: 'ACTIVE',
    manager: "Ahmed Benali",
    phone: "+213 21 45 67 89",
    email: "ahmed.benali@abattoir-alger.dz",
    createdAt: "2023-01-15T08:30:00Z",
    lastActivity: "2024-01-15T14:30:00Z"
  },
  {
    id: 2,
    name: "Abattoir de Blida",
    wilaya: "Blida",
    commune: "Blida",
    address: "Zone Industrielle, Blida",
    capacity: 300,
    currentStock: 180,
    status: 'ACTIVE',
    manager: "Fatima Zohra",
    phone: "+213 25 12 34 56",
    email: "fatima.zohra@abattoir-blida.dz",
    createdAt: "2023-02-20T10:15:00Z",
    lastActivity: "2024-01-14T16:45:00Z"
  },
  {
    id: 3,
    name: "Abattoir de Constantine",
    wilaya: "Constantine",
    commune: "Constantine",
    address: "Avenue de l'Abattoir, Constantine",
    capacity: 400,
    currentStock: 0,
    status: 'MAINTENANCE',
    manager: "Mohamed Khelil",
    phone: "+213 31 78 90 12",
    email: "mohamed.khelil@abattoir-constantine.dz",
    createdAt: "2023-03-10T09:00:00Z",
    lastActivity: "2024-01-10T12:00:00Z"
  },
  {
    id: 4,
    name: "Abattoir d'Oran",
    wilaya: "Oran",
    commune: "Oran",
    address: "Route de l'Abattoir, Oran",
    capacity: 350,
    currentStock: 250,
    status: 'ACTIVE',
    manager: "Aicha Boudjedra",
    phone: "+213 41 23 45 67",
    email: "aicha.boudjedra@abattoir-oran.dz",
    createdAt: "2023-04-05T11:30:00Z",
    lastActivity: "2024-01-15T13:20:00Z"
  },
  {
    id: 5,
    name: "Abattoir de Tizi Ouzou",
    wilaya: "Tizi Ouzou",
    commune: "Tizi Ouzou",
    address: "Zone d'Activité, Tizi Ouzou",
    capacity: 200,
    currentStock: 120,
    status: 'ACTIVE',
    manager: "Karim Amrani",
    phone: "+213 26 56 78 90",
    email: "karim.amrani@abattoir-tizi.dz",
    createdAt: "2023-05-12T14:45:00Z",
    lastActivity: "2024-01-14T10:15:00Z"
  },
  {
    id: 6,
    name: "Abattoir de Annaba",
    wilaya: "Annaba",
    commune: "Annaba",
    address: "Port de Annaba, Annaba",
    capacity: 280,
    currentStock: 0,
    status: 'INACTIVE',
    manager: "Nadia Cherif",
    phone: "+213 38 90 12 34",
    email: "nadia.cherif@abattoir-annaba.dz",
    createdAt: "2023-06-18T16:20:00Z",
    lastActivity: "2024-01-05T08:30:00Z"
  },
  {
    id: 7,
    name: "Abattoir de Sétif",
    wilaya: "Sétif",
    commune: "Sétif",
    address: "Zone Industrielle, Sétif",
    capacity: 320,
    currentStock: 200,
    status: 'ACTIVE',
    manager: "Omar Boukhelifa",
    phone: "+213 36 45 67 89",
    email: "omar.boukhelifa@abattoir-setif.dz",
    createdAt: "2023-07-22T12:10:00Z",
    lastActivity: "2024-01-15T15:45:00Z"
  },
  {
    id: 8,
    name: "Abattoir de Batna",
    wilaya: "Batna",
    commune: "Batna",
    address: "Route Nationale, Batna",
    capacity: 250,
    currentStock: 150,
    status: 'ACTIVE',
    manager: "Yasmine Kaci",
    phone: "+213 33 12 34 56",
    email: "yasmine.kaci@abattoir-batna.dz",
    createdAt: "2023-08-30T13:25:00Z",
    lastActivity: "2024-01-14T11:30:00Z"
  }
];

export default function AbattoirsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [abattoirs, setAbattoirs] = useState<Abattoir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [wilayaFilter, setWilayaFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAbattoirId, setDeletingAbattoirId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchAbattoirs = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAbattoirs(mockAbattoirs);
        console.log('Abattoirs récupérés:', mockAbattoirs);
      } catch (err) {
        setError('Erreur lors du chargement des abattoirs');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAbattoirs();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setAbattoirs(mockAbattoirs);
      console.log('Abattoirs rafraîchis:', mockAbattoirs);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAbattoir = (abattoir: Abattoir) => {
    router.push(`/dashboard/abattoirs/${abattoir.id}`);
  };

  const handleEditAbattoir = (abattoir: Abattoir) => {
    // TODO: Implémenter la modification
    console.log('Modifier abattoir:', abattoir);
  };

  const handleDeleteAbattoir = async (abattoirId: number, abattoirName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'abattoir "${abattoirName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAbattoirId(abattoirId);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAbattoirs(prevAbattoirs => prevAbattoirs.filter(abattoir => abattoir.id !== abattoirId));
      setSuccessMessage(`Abattoir "${abattoirName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Abattoir ${abattoirName} supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'abattoir:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingAbattoirId(null);
    }
  };

  const filteredAbattoirs = abattoirs.filter(abattoir => {
    const matchesSearch = abattoir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abattoir.wilaya.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abattoir.commune.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || abattoir.status === statusFilter;
    const matchesWilaya = wilayaFilter === 'ALL' || abattoir.wilaya === wilayaFilter;
    return matchesSearch && matchesStatus && matchesWilaya;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
      MAINTENANCE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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

  const getWilayas = () => {
    const wilayas = [...new Set(abattoirs.map(abattoir => abattoir.wilaya))];
    return wilayas.sort();
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
                  <Building2 className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'المجازر' : 'Abattoirs'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة المجازر والمواشي' : 'Gestion des abattoirs et du bétail'}
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
                  onClick={() => console.log('Nouvel abattoir')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة مجزر' : 'Nouvel abattoir'}
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
                  placeholder={isRTL ? 'البحث في المجازر...' : 'Rechercher un abattoir...'}
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
                <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactif'}</option>
                <option value="MAINTENANCE">{isRTL ? 'صيانة' : 'Maintenance'}</option>
              </select>
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الولايات' : 'Toutes les wilayas'}</option>
                {getWilayas().map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
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
                        {isRTL ? 'المجزر' : 'Abattoir'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الموقع' : 'Localisation'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'السعة' : 'Capacité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الرئيس' : 'Responsable'}
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
                    {filteredAbattoirs.map((abattoir) => (
                      <tr key={abattoir.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.name}</div>
                              <div className="text-sm theme-text-secondary theme-transition">ID: {abattoir.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.wilaya}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{abattoir.commune}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {abattoir.currentStock} / {abattoir.capacity}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {isRTL ? 'رؤوس' : 'têtes'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{abattoir.manager}</div>
                            <div className="text-sm theme-text-secondary theme-transition">{abattoir.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(abattoir.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(abattoir.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewAbattoir(abattoir)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAbattoir(abattoir)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل المجزر' : 'Modifier l\'abattoir'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAbattoir(abattoir.id, abattoir.name)}
                              disabled={deletingAbattoirId === abattoir.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف المجزر' : 'Supprimer l\'abattoir'}
                            >
                              {deletingAbattoirId === abattoir.id ? (
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
            
            {filteredAbattoirs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على مجازر' : 'Aucun abattoir trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة مجازر جديدة' : 'Commencez par ajouter de nouveaux abattoirs'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

