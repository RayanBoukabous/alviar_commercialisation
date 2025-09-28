'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  TrendingDown,
  Scale,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  Package,
  FileText,
  Tag,
  Activity
} from 'lucide-react';

interface SlaughteredStockProps {
  isRTL: boolean;
}

interface Carcass {
  id: string;
  livestockId: string;
  loopNumber: string;
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  slaughterDate: string;
  slaughterWeight: number; // Poids avant abattage
  carcassWeight: number; // Poids de la carcasse
  yield: number; // Rendement en %
  grade: 'A' | 'B' | 'C' | 'D';
  abattoirId: number;
  abattoirName: string;
  butcher: string;
  inspector: string;
  status: 'FRESH' | 'CHILLED' | 'FROZEN' | 'PROCESSED';
  storageLocation: string;
  expiryDate?: string;
  processingDate?: string;
  cuts: {
    name: string;
    weight: number;
    price: number;
  }[];
}

// Données mock pour les carcasses
const mockCarcasses: Carcass[] = [
  {
    id: 'CAR001',
    livestockId: 'LIV003',
    loopNumber: 'DZ-BLI-2024-001236',
    type: 'OVIN',
    breed: 'Ouled Djellal',
    slaughterDate: '2024-01-12T16:45:00Z',
    slaughterWeight: 65,
    carcassWeight: 35,
    yield: 53.8,
    grade: 'A',
    abattoirId: 2,
    abattoirName: 'Abattoir de Blida',
    butcher: 'Ahmed Benali',
    inspector: 'Dr. Mohamed Khelil',
    status: 'CHILLED',
    storageLocation: 'Chambre froide A-12',
    expiryDate: '2024-01-19T00:00:00Z',
    cuts: [
      { name: 'Épaule', weight: 8, price: 1200 },
      { name: 'Gigot', weight: 6, price: 1500 },
      { name: 'Côtelettes', weight: 4, price: 1800 },
      { name: 'Collier', weight: 3, price: 800 }
    ]
  },
  {
    id: 'CAR002',
    livestockId: 'LIV004',
    loopNumber: 'DZ-ORAN-2024-001237',
    type: 'BOVIN',
    breed: 'Limousine',
    slaughterDate: '2024-01-13T10:30:00Z',
    slaughterWeight: 580,
    carcassWeight: 320,
    yield: 55.2,
    grade: 'A',
    abattoirId: 4,
    abattoirName: 'Abattoir d\'Oran',
    butcher: 'Fatima Zohra',
    inspector: 'Dr. Aicha Boudjedra',
    status: 'FROZEN',
    storageLocation: 'Congélateur B-05',
    processingDate: '2024-01-14T08:00:00Z',
    cuts: [
      { name: 'Filet', weight: 12, price: 3500 },
      { name: 'Entrecôte', weight: 15, price: 2800 },
      { name: 'Rumsteck', weight: 18, price: 2500 },
      { name: 'Bavette', weight: 8, price: 1800 }
    ]
  },
  {
    id: 'CAR003',
    livestockId: 'LIV006',
    loopNumber: 'DZ-SETIF-2024-001239',
    type: 'BOVIN',
    breed: 'Montbéliarde',
    slaughterDate: '2024-01-07T09:30:00Z',
    slaughterWeight: 480,
    carcassWeight: 260,
    yield: 54.2,
    grade: 'B',
    abattoirId: 7,
    abattoirName: 'Abattoir de Sétif',
    butcher: 'Omar Boukhelifa',
    inspector: 'Dr. Yasmine Kaci',
    status: 'PROCESSED',
    storageLocation: 'Entrepôt C-08',
    processingDate: '2024-01-08T14:00:00Z',
    cuts: [
      { name: 'Bœuf haché', weight: 25, price: 1200 },
      { name: 'Saucisses', weight: 15, price: 1500 },
      { name: 'Steaks', weight: 20, price: 2200 }
    ]
  }
];

export default function SlaughteredStockTab({ isRTL }: SlaughteredStockProps) {
  const [carcasses, setCarcasses] = useState<Carcass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchCarcasses = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCarcasses(mockCarcasses);
      } catch (err) {
        console.error('Erreur lors du chargement des carcasses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarcasses();
  }, []);

  const filteredCarcasses = carcasses.filter(carcass => {
    const matchesSearch = carcass.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carcass.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carcass.abattoirName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carcass.butcher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || carcass.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || carcass.type === typeFilter;
    const matchesGrade = gradeFilter === 'ALL' || carcass.grade === gradeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesGrade;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      FRESH: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'طازج' : 'Frais'
      },
      CHILLED: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'مبرد' : 'Réfrigéré'
      },
      FROZEN: { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        label: isRTL ? 'مجمد' : 'Congelé'
      },
      PROCESSED: { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-300', 
        label: isRTL ? 'معالج' : 'Transformé'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.FRESH;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      A: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: 'Grade A'
      },
      B: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: 'Grade B'
      },
      C: { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-300', 
        label: 'Grade C'
      },
      D: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: 'Grade D'
      }
    };
    
    const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.B;
    
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
  const totalCarcassWeight = filteredCarcasses.reduce((sum, carcass) => sum + carcass.carcassWeight, 0);
  const totalSlaughterWeight = filteredCarcasses.reduce((sum, carcass) => sum + carcass.slaughterWeight, 0);
  const averageYield = filteredCarcasses.length > 0 ? 
    Math.round(filteredCarcasses.reduce((sum, carcass) => sum + carcass.yield, 0) / filteredCarcasses.length * 10) / 10 : 0;
  const totalValue = filteredCarcasses.reduce((sum, carcass) => 
    sum + carcass.cuts.reduce((cutSum, cut) => cutSum + (cut.weight * cut.price), 0), 0);

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
              <p className="text-2xl font-bold theme-text-primary theme-transition">{filteredCarcasses.length}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'وزن الذبائح' : 'Poids carcasses'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalCarcassWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'متوسط المردود' : 'Rendement moyen'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{averageYield}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'القيمة الإجمالية' : 'Valeur totale'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalValue.toLocaleString()} DA</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
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
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الدرجات' : 'Toutes les notes'}</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
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
                    {isRTL ? 'الدرجة' : 'Grade'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة' : 'Statut'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'تاريخ الذبح' : 'Date abattage'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الموقع' : 'Emplacement'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredCarcasses.map((carcass) => (
                  <tr key={carcass.id} className="transition-colors hover:theme-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-red-600" />
                        </div>
                        <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                          <div className="text-sm font-medium theme-text-primary theme-transition">{carcass.loopNumber}</div>
                          <div className="text-sm theme-text-secondary theme-transition">ID: {carcass.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{carcass.type}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{carcass.breed}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {carcass.carcassWeight} kg
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {carcass.yield}% {isRTL ? 'مردود' : 'rendement'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getGradeBadge(carcass.grade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(carcass.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                      {formatDate(carcass.slaughterDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">{carcass.storageLocation}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{carcass.abattoirName}</div>
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
                          title={isRTL ? 'عرض القطع' : 'Voir les découpes'}
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCarcasses.length === 0 && !loading && (
          <div className="text-center py-12">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
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
