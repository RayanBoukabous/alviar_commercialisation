'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  Activity,
  Package,
  Tag,
  Scale,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical,
  Skull
} from 'lucide-react';

interface CarcassLivestockProps {
  isRTL: boolean;
}

interface CarcassLivestockItem {
  id: string;
  loopNumber: string;
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  age: number;
  liveWeight: number; // Poids avant abattage
  carcassWeight: number; // Poids de la carcasse
  gender: 'MALE' | 'FEMALE';
  slaughterDate: string;
  slaughterTime: string;
  origin: string;
  abattoirId: number;
  abattoirName: string;
  slaughterMethod: 'HALAL' | 'TRADITIONAL';
  quality: 'EXCELLENT' | 'BON' | 'MOYEN' | 'MAUVAIS';
  status: 'FRESH' | 'CHILLED' | 'FROZEN' | 'PROCESSED' | 'SOLD';
  storageLocation: string;
  expiryDate: string;
  pricePerKg: number;
  totalValue: number;
  notes?: string;
}

// Données mock pour les carcasses
const mockCarcassLivestock: CarcassLivestockItem[] = [
  {
    id: 'CAR001',
    loopNumber: 'DZ-BLI-2024-001236',
    type: 'OVIN',
    breed: 'Ouled Djellal',
    age: 18,
    liveWeight: 65,
    carcassWeight: 35,
    gender: 'FEMALE',
    slaughterDate: '2024-01-12T00:00:00Z',
    slaughterTime: '16:45',
    origin: 'Ferme de Médéa',
    abattoirId: 2,
    abattoirName: 'Abattoir de Blida',
    slaughterMethod: 'HALAL',
    quality: 'EXCELLENT',
    status: 'CHILLED',
    storageLocation: 'Chambre froide A-1',
    expiryDate: '2024-01-19T00:00:00Z',
    pricePerKg: 1200,
    totalValue: 42000,
    notes: 'Carcasse de qualité excellente, bien conditionnée'
  },
  {
    id: 'CAR002',
    loopNumber: 'DZ-ALG-2024-001242',
    type: 'BOVIN',
    breed: 'Holstein',
    age: 26,
    liveWeight: 480,
    carcassWeight: 280,
    gender: 'MALE',
    slaughterDate: '2024-01-13T00:00:00Z',
    slaughterTime: '14:30',
    origin: 'Ferme de Blida',
    abattoirId: 1,
    abattoirName: "Abattoir Central d'Alger",
    slaughterMethod: 'HALAL',
    quality: 'BON',
    status: 'FRESH',
    storageLocation: 'Hangar principal',
    expiryDate: '2024-01-16T00:00:00Z',
    pricePerKg: 1800,
    totalValue: 504000,
    notes: 'Carcasse fraîche, prête pour la vente'
  },
  {
    id: 'CAR003',
    loopNumber: 'DZ-ORAN-2024-001243',
    type: 'BOVIN',
    breed: 'Charolais',
    age: 28,
    liveWeight: 520,
    carcassWeight: 310,
    gender: 'MALE',
    slaughterDate: '2024-01-11T00:00:00Z',
    slaughterTime: '11:15',
    origin: 'Ferme de Mostaganem',
    abattoirId: 4,
    abattoirName: 'Abattoir d\'Oran',
    slaughterMethod: 'HALAL',
    quality: 'EXCELLENT',
    status: 'FROZEN',
    storageLocation: 'Congélateur B-2',
    expiryDate: '2024-02-11T00:00:00Z',
    pricePerKg: 1900,
    totalValue: 589000,
    notes: 'Carcasse congelée, qualité excellente'
  },
  {
    id: 'CAR004',
    loopNumber: 'DZ-SETIF-2024-001244',
    type: 'CAPRIN',
    breed: 'Kabyle',
    age: 14,
    liveWeight: 40,
    carcassWeight: 22,
    gender: 'MALE',
    slaughterDate: '2024-01-14T00:00:00Z',
    slaughterTime: '09:30',
    origin: 'Ferme de Bordj Bou Arreridj',
    abattoirId: 7,
    abattoirName: 'Abattoir de Sétif',
    slaughterMethod: 'HALAL',
    quality: 'BON',
    status: 'PROCESSED',
    storageLocation: 'Zone de transformation',
    expiryDate: '2024-01-21T00:00:00Z',
    pricePerKg: 1500,
    totalValue: 33000,
    notes: 'Carcasse transformée en morceaux'
  },
  {
    id: 'CAR005',
    loopNumber: 'DZ-BATNA-2024-001245',
    type: 'OVIN',
    breed: 'Rambouillet',
    age: 16,
    liveWeight: 55,
    carcassWeight: 30,
    gender: 'FEMALE',
    slaughterDate: '2024-01-10T00:00:00Z',
    slaughterTime: '13:20',
    origin: 'Ferme de Khenchela',
    abattoirId: 8,
    abattoirName: 'Abattoir de Batna',
    slaughterMethod: 'HALAL',
    quality: 'MOYEN',
    status: 'SOLD',
    storageLocation: 'Vendu',
    expiryDate: '2024-01-17T00:00:00Z',
    pricePerKg: 1100,
    totalValue: 33000,
    notes: 'Carcasse vendue à un client local'
  }
];

export default function CarcassLivestockTab({ isRTL }: CarcassLivestockProps) {
  const [carcassLivestock, setCarcassLivestock] = useState<CarcassLivestockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [qualityFilter, setQualityFilter] = useState<string>('ALL');
  const [deletingCarcassId, setDeletingCarcassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarcassLivestock = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCarcassLivestock(mockCarcassLivestock);
      } catch (err) {
        console.error('Erreur lors du chargement des carcasses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarcassLivestock();
  }, []);

  const filteredCarcassLivestock = carcassLivestock.filter(item => {
    const matchesSearch = item.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.abattoirName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesQuality = qualityFilter === 'ALL' || item.quality === qualityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesQuality;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      FRESH: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'طازج' : 'Frais',
        icon: CheckCircle
      },
      CHILLED: { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'مبرد' : 'Réfrigéré',
        icon: Clock
      },
      FROZEN: { 
        bg: 'bg-purple-200 dark:bg-purple-900/50', 
        text: 'text-purple-900 dark:text-purple-100', 
        border: 'border-purple-300 dark:border-purple-700',
        label: isRTL ? 'مجمد' : 'Congelé',
        icon: Package
      },
      PROCESSED: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'معالج' : 'Transformé',
        icon: Activity
      },
      SOLD: { 
        bg: 'bg-gray-200 dark:bg-gray-900/50', 
        text: 'text-gray-900 dark:text-gray-100', 
        border: 'border-gray-300 dark:border-gray-700',
        label: isRTL ? 'مباع' : 'Vendu',
        icon: ArrowRight
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.FRESH;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      EXCELLENT: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'ممتاز' : 'Excellent'
      },
      BON: { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'جيد' : 'Bon'
      },
      MOYEN: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'متوسط' : 'Moyen'
      },
      MAUVAIS: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'سيء' : 'Mauvais'
      }
    };
    
    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig.BON;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDeleteCarcass = async (carcassId: string, loopNumber: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la carcasse "${loopNumber}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCarcassId(carcassId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCarcassLivestock(prevCarcass => prevCarcass.filter(item => item.id !== carcassId));
      console.log(`Carcasse ${loopNumber} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la carcasse:', err);
    } finally {
      setDeletingCarcassId(null);
    }
  };

  // Statistiques
  const totalCarcassWeight = filteredCarcassLivestock.reduce((sum, item) => sum + item.carcassWeight, 0);
  const totalCount = filteredCarcassLivestock.length;
  const totalValue = filteredCarcassLivestock.reduce((sum, item) => sum + item.totalValue, 0);
  const averageWeight = totalCount > 0 ? Math.round(totalCarcassWeight / totalCount) : 0;

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي الذبائح' : 'Total carcasses'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalCount}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Skull className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalCarcassWeight} kg</p>
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
                {isRTL ? 'القيمة الإجمالية' : 'Valeur totale'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{formatCurrency(totalValue)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
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
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-yellow-600" />
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
              placeholder={isRTL ? 'البحث في الذبائح...' : 'Rechercher dans les carcasses...'}
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
            <option value="FRESH">{isRTL ? 'طازج' : 'Frais'}</option>
            <option value="CHILLED">{isRTL ? 'مبرد' : 'Réfrigéré'}</option>
            <option value="FROZEN">{isRTL ? 'مجمد' : 'Congelé'}</option>
            <option value="PROCESSED">{isRTL ? 'معالج' : 'Transformé'}</option>
            <option value="SOLD">{isRTL ? 'مباع' : 'Vendu'}</option>
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
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الجودات' : 'Toutes les qualités'}</option>
            <option value="EXCELLENT">{isRTL ? 'ممتاز' : 'Excellent'}</option>
            <option value="BON">{isRTL ? 'جيد' : 'Bon'}</option>
            <option value="MOYEN">{isRTL ? 'متوسط' : 'Moyen'}</option>
            <option value="MAUVAIS">{isRTL ? 'سيء' : 'Mauvais'}</option>
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
                    {isRTL ? 'الأوزان' : 'Poids'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'تاريخ الذبح' : 'Date abattage'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الجودة' : 'Qualité'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة' : 'Statut'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'القيمة' : 'Valeur'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredCarcassLivestock.map((item) => (
                  <tr key={item.id} className="transition-colors hover:theme-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Skull className="h-5 w-5 text-red-600" />
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
                          {item.carcassWeight} kg
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {isRTL ? 'حي:' : 'Vif:'} {item.liveWeight} kg
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {formatDate(item.slaughterDate)}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {item.slaughterTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getQualityBadge(item.quality)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {formatCurrency(item.totalValue)}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {formatCurrency(item.pricePerKg)}/kg
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        <button 
                          className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                          title={isRTL ? 'تعديل الذبيحة' : 'Modifier la carcasse'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCarcass(item.id, item.loopNumber)}
                          disabled={deletingCarcassId === item.id}
                          className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                          title={isRTL ? 'حذف الذبيحة' : 'Supprimer la carcasse'}
                        >
                          {deletingCarcassId === item.id ? (
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
        
        {filteredCarcassLivestock.length === 0 && !loading && (
          <div className="text-center py-12">
            <Skull className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا توجد ذبائح' : 'Aucune carcasse'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لا توجد ذبائح في المخزون' : 'Aucune carcasse dans le stock'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
