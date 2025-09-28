'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  Activity,
  Heart,
  Tag,
  Scale,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface LiveStockProps {
  isRTL: boolean;
}

interface LiveStockItem {
  id: string;
  loopNumber: string;
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  age: number;
  weight: number;
  gender: 'MALE' | 'FEMALE';
  status: 'EN_ATTENTE' | 'EN_TRAITEMENT';
  arrivalDate: string;
  origin: string;
  healthStatus: 'BON' | 'MOYEN' | 'MAUVAIS';
  abattoirId: number;
  abattoirName: string;
  estimatedSlaughterDate?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Données mock pour le stock vif
const mockLiveStock: LiveStockItem[] = [
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
    origin: 'Ferme de Blida',
    healthStatus: 'BON',
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    estimatedSlaughterDate: '2024-01-20T00:00:00Z',
    priority: 'HIGH'
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
    origin: 'Ferme de Tipaza',
    healthStatus: 'BON',
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    estimatedSlaughterDate: '2024-01-18T00:00:00Z',
    priority: 'HIGH'
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
    origin: 'Ferme de Tizi Ouzou',
    healthStatus: 'BON',
    abattoirId: 5,
    abattoirName: 'Abattoir de Tizi Ouzou',
    estimatedSlaughterDate: '2024-01-22T00:00:00Z',
    priority: 'MEDIUM'
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
    origin: 'Ferme de Khenchela',
    healthStatus: 'BON',
    abattoirId: 8,
    abattoirName: 'Abattoir de Batna',
    estimatedSlaughterDate: '2024-01-19T00:00:00Z',
    priority: 'MEDIUM'
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
    origin: 'Ferme de Boumerdès',
    healthStatus: 'BON',
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    estimatedSlaughterDate: '2024-01-25T00:00:00Z',
    priority: 'LOW'
  }
];

export default function LiveStockTab({ isRTL }: LiveStockProps) {
  const [liveStock, setLiveStock] = useState<LiveStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchLiveStock = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLiveStock(mockLiveStock);
      } catch (err) {
        console.error('Erreur lors du chargement du stock vif:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStock();
  }, []);

  const filteredLiveStock = liveStock.filter(item => {
    const matchesSearch = item.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.abattoirName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      HIGH: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'عالي' : 'Élevée'
      },
      MEDIUM: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'متوسط' : 'Moyenne'
      },
      LOW: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'منخفض' : 'Faible'
      }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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
      day: 'numeric'
    });
  };

  // Statistiques
  const totalWeight = filteredLiveStock.reduce((sum, item) => sum + item.weight, 0);
  const totalCount = filteredLiveStock.length;
  const averageWeight = totalCount > 0 ? Math.round(totalWeight / totalCount) : 0;

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي الرؤوس' : 'Total têtes'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalCount}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'متوسط الوزن' : 'Poids moyen'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{averageWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'في المعالجة' : 'En traitement'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {filteredLiveStock.filter(item => item.status === 'EN_TRAITEMENT').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-4">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في المخزون الحي...' : 'Rechercher dans le stock vif...'}
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الأولويات' : 'Toutes les priorités'}</option>
            <option value="HIGH">{isRTL ? 'عالي' : 'Élevée'}</option>
            <option value="MEDIUM">{isRTL ? 'متوسط' : 'Moyenne'}</option>
            <option value="LOW">{isRTL ? 'منخفض' : 'Faible'}</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                    {isRTL ? 'الأولوية' : 'Priorité'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة' : 'Statut'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'تاريخ الذبح المتوقع' : 'Date abattage prévue'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredLiveStock.map((item) => (
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
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                      {item.estimatedSlaughterDate ? formatDate(item.estimatedSlaughterDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        <button 
                          className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredLiveStock.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا يوجد مخزون حي' : 'Aucun stock vif'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لا توجد حيوانات في المخزون الحي' : 'Aucun animal dans le stock vif'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
