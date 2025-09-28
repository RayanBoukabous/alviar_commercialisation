'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Activity,
  Calendar,
  User,
  RefreshCw,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Download,
  Printer
} from 'lucide-react';

// Interface pour le bétail
interface Livestock {
  id: string;
  loopNumber: string; // Numéro de boucle
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
  notes?: string;
  transferHistory?: TransferRecord[];
}

// Interface pour les transferts
interface TransferRecord {
  id: string;
  livestockId: string;
  fromAbattoir: string;
  toAbattoir: string;
  transferDate: string;
  reason: string;
  authorizedBy: string;
  transferDocument: string;
  status: 'EN_COURS' | 'COMPLETE' | 'ANNULE';
}

// Interface pour les bons de transfert
interface TransferDocument {
  id: string;
  documentNumber: string;
  transferDate: string;
  fromAbattoir: {
    name: string;
    address: string;
    manager: string;
    phone: string;
  };
  toAbattoir: {
    name: string;
    address: string;
    manager: string;
    phone: string;
  };
  livestock: {
    loopNumber: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    gender: string;
  };
  reason: string;
  authorizedBy: string;
  status: 'DRAFT' | 'SIGNED' | 'COMPLETED';
  createdAt: string;
}

// Données mock pour le bétail
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
    notes: 'En cours de traitement'
  },
  {
    id: 'LIV003',
    loopNumber: 'DZ-ALG-2024-001236',
    type: 'OVIN',
    breed: 'Ouled Djellal',
    age: 12,
    weight: 35,
    gender: 'FEMALE',
    status: 'ABATTU',
    arrivalDate: '2024-01-13T09:00:00Z',
    lastActivity: '2024-01-14T16:45:00Z',
    origin: 'Ferme de Médéa',
    healthStatus: 'BON',
    notes: 'Abattage terminé avec succès'
  },
  {
    id: 'LIV004',
    loopNumber: 'DZ-ALG-2024-001237',
    type: 'BOVIN',
    breed: 'Limousine',
    age: 28,
    weight: 480,
    gender: 'MALE',
    status: 'TRANSFERE',
    arrivalDate: '2024-01-12T11:30:00Z',
    lastActivity: '2024-01-13T10:20:00Z',
    origin: 'Ferme de Boumerdès',
    healthStatus: 'MOYEN',
    notes: 'Transféré vers Abattoir de Blida',
    transferHistory: [
      {
        id: 'TRF001',
        livestockId: 'LIV004',
        fromAbattoir: 'Abattoir Central d\'Alger',
        toAbattoir: 'Abattoir de Blida',
        transferDate: '2024-01-13T10:20:00Z',
        reason: 'Capacité insuffisante',
        authorizedBy: 'Ahmed Benali',
        transferDocument: 'TRF-2024-001',
        status: 'COMPLETE'
      }
    ]
  },
  {
    id: 'LIV005',
    loopNumber: 'DZ-ALG-2024-001238',
    type: 'CAPRIN',
    breed: 'Chèvre locale',
    age: 18,
    weight: 25,
    gender: 'FEMALE',
    status: 'REJETE',
    arrivalDate: '2024-01-11T14:45:00Z',
    lastActivity: '2024-01-12T09:15:00Z',
    origin: 'Ferme de Chéraga',
    healthStatus: 'MAUVAIS',
    notes: 'Rejeté pour problèmes de santé'
  }
];

interface LivestockManagementProps {
  abattoirId: number;
  isRTL: boolean;
}

export default function LivestockManagement({ abattoirId, isRTL }: LivestockManagementProps) {
  const router = useRouter();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedLivestock, setSelectedLivestock] = useState<Livestock | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSlaughterModal, setShowSlaughterModal] = useState(false);
  const [transferDocuments, setTransferDocuments] = useState<TransferDocument[]>([]);

  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLivestock(mockLivestock);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLivestock();
  }, [abattoirId]);

  const filteredLivestock = livestock.filter(animal => {
    const matchesSearch = animal.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.origin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || animal.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || animal.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
      BON: { bg: 'bg-green-100', text: 'text-green-800', label: isRTL ? 'جيد' : 'Bon' },
      MOYEN: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: isRTL ? 'متوسط' : 'Moyen' },
      MAUVAIS: { bg: 'bg-red-100', text: 'text-red-800', label: isRTL ? 'سيء' : 'Mauvais' }
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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

  const handleSlaughter = (animal: Livestock) => {
    setSelectedLivestock(animal);
    setShowSlaughterModal(true);
  };

  const handleTransfer = (animal: Livestock) => {
    setSelectedLivestock(animal);
    setShowTransferModal(true);
  };

  const confirmSlaughter = async () => {
    if (!selectedLivestock) return;

    try {
      // Simulation de l'abattage
      setLivestock(prev => prev.map(animal => 
        animal.id === selectedLivestock.id 
          ? { ...animal, status: 'ABATTU' as const, lastActivity: new Date().toISOString() }
          : animal
      ));
      
      setShowSlaughterModal(false);
      setSelectedLivestock(null);
      
      // Afficher un message de succès
      console.log(`Animal ${selectedLivestock.loopNumber} abattu avec succès`);
    } catch (err) {
      console.error('Erreur lors de l\'abattage:', err);
    }
  };

  const confirmTransfer = async (transferData: any) => {
    if (!selectedLivestock) return;

    try {
      // Générer un bon de transfert
      const transferDoc: TransferDocument = {
        id: `TRF-${Date.now()}`,
        documentNumber: `TRF-2024-${String(transferDocuments.length + 1).padStart(3, '0')}`,
        transferDate: new Date().toISOString(),
        fromAbattoir: {
          name: 'Abattoir Central d\'Alger',
          address: 'Route de l\'Abattoir, Alger Centre',
          manager: 'Ahmed Benali',
          phone: '+213 21 45 67 89'
        },
        toAbattoir: {
          name: transferData.toAbattoir,
          address: transferData.toAddress,
          manager: transferData.toManager,
          phone: transferData.toPhone
        },
        livestock: {
          loopNumber: selectedLivestock.loopNumber,
          type: selectedLivestock.type,
          breed: selectedLivestock.breed,
          age: selectedLivestock.age,
          weight: selectedLivestock.weight,
          gender: selectedLivestock.gender
        },
        reason: transferData.reason,
        authorizedBy: 'Ahmed Benali',
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };

      setTransferDocuments(prev => [...prev, transferDoc]);

      // Mettre à jour le statut de l'animal
      setLivestock(prev => prev.map(animal => 
        animal.id === selectedLivestock.id 
          ? { 
              ...animal, 
              status: 'TRANSFERE' as const, 
              lastActivity: new Date().toISOString(),
              transferHistory: [...(animal.transferHistory || []), {
                id: transferDoc.id,
                livestockId: animal.id,
                fromAbattoir: transferDoc.fromAbattoir.name,
                toAbattoir: transferDoc.toAbattoir.name,
                transferDate: transferDoc.transferDate,
                reason: transferDoc.reason,
                authorizedBy: transferDoc.authorizedBy,
                transferDocument: transferDoc.documentNumber,
                status: 'COMPLETE'
              }]
            }
          : animal
      ));
      
      setShowTransferModal(false);
      setSelectedLivestock(null);
      
      console.log(`Animal ${selectedLivestock.loopNumber} transféré avec succès`);
    } catch (err) {
      console.error('Erreur lors du transfert:', err);
    }
  };

  const printTransferDocument = (doc: TransferDocument) => {
    // Simulation d'impression
    console.log('Impression du bon de transfert:', doc.documentNumber);
    // Ici vous pourriez ouvrir une nouvelle fenêtre avec le document formaté
  };

  const downloadTransferDocument = (doc: TransferDocument) => {
    // Simulation de téléchargement
    console.log('Téléchargement du bon de transfert:', doc.documentNumber);
    // Ici vous pourriez générer un PDF et le télécharger
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إدارة الماشية' : 'Gestion du bétail'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تحديث' : 'Actualiser'}
            </button>
            <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إضافة ماشية' : 'Ajouter du bétail'}
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث برقم البوق...' : 'Rechercher par numéro de boucle...'}
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
        </div>
      </div>

      {/* Tableau du bétail */}
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
                    {isRTL ? 'النوع' : 'Type/Race'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'العمر/الوزن' : 'Âge/Poids'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة الصحية' : 'Santé'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الحالة' : 'Statut'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'تاريخ الوصول' : 'Date d\'arrivée'}
                  </th>
                  <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                {filteredLivestock.map((animal) => (
                  <tr key={animal.id} className="transition-colors hover:theme-bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {animal.loopNumber}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {isRTL ? 'من' : 'De'} {animal.origin}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {animal.type} - {animal.breed}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {animal.gender === 'MALE' ? (isRTL ? 'ذكر' : 'Mâle') : (isRTL ? 'أنثى' : 'Femelle')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {animal.age} {isRTL ? 'شهر' : 'mois'}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {animal.weight} kg
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getHealthBadge(animal.healthStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(animal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                      {formatDate(animal.arrivalDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        {animal.status === 'EN_ATTENTE' && (
                          <>
                            <button 
                              onClick={() => handleSlaughter(animal)}
                              className="p-1 text-green-600 hover:text-green-700 theme-transition"
                              title={isRTL ? 'ذبح' : 'Abattre'}
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleTransfer(animal)}
                              className="p-1 text-blue-600 hover:text-blue-700 theme-transition"
                              title={isRTL ? 'نقل' : 'Transférer'}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => router.push(`/dashboard/abattoirs/${abattoirId}/livestock/${animal.id}`)}
                          className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
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
            <Activity className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لم يتم العثور على ماشية' : 'Aucun animal trouvé'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'ابدأ بإضافة ماشية جديدة' : 'Commencez par ajouter de nouveaux animaux'}
            </p>
          </div>
        )}
      </div>

      {/* Bons de transfert */}
      {transferDocuments.length > 0 && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'أذونات النقل' : 'Bons de transfert'}
          </h3>
          
          <div className="space-y-4">
            {transferDocuments.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg theme-border-primary theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h4 className="font-medium theme-text-primary theme-transition">
                      {isRTL ? 'وثيقة النقل' : 'Bon de transfert'} {doc.documentNumber}
                    </h4>
                    <p className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'من' : 'De'} {doc.fromAbattoir.name} {isRTL ? 'إلى' : 'vers'} {doc.toAbattoir.name}
                    </p>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <button 
                      onClick={() => printTransferDocument(doc)}
                      className="p-2 text-primary-600 hover:text-primary-700 theme-transition"
                      title={isRTL ? 'طباعة' : 'Imprimer'}
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => downloadTransferDocument(doc)}
                      className="p-2 text-primary-600 hover:text-primary-700 theme-transition"
                      title={isRTL ? 'تحميل' : 'Télécharger'}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'رقم البوق' : 'Numéro de boucle'}: {doc.livestock.loopNumber}
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'النوع' : 'Type'}: {doc.livestock.type} - {doc.livestock.breed}
                    </p>
                  </div>
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'الوزن' : 'Poids'}: {doc.livestock.weight} kg
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'العمر' : 'Âge'}: {doc.livestock.age} {isRTL ? 'شهر' : 'mois'}
                    </p>
                  </div>
                  <div>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'السبب' : 'Raison'}: {doc.reason}
                    </p>
                    <p className="theme-text-secondary theme-transition">
                      {isRTL ? 'تاريخ النقل' : 'Date de transfert'}: {formatDate(doc.transferDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'abattage */}
      {showSlaughterModal && selectedLivestock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
              <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                {isRTL ? 'تأكيد الذبح' : 'Confirmer l\'abattage'}
              </h3>
              <button 
                onClick={() => setShowSlaughterModal(false)}
                className="text-gray-500 hover:text-gray-700 theme-transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="theme-text-secondary theme-transition mb-2">
                {isRTL ? 'هل أنت متأكد من ذبح هذا الحيوان؟' : 'Êtes-vous sûr de vouloir abattre cet animal ?'}
              </p>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="font-medium theme-text-primary theme-transition">
                  {selectedLivestock.loopNumber}
                </p>
                <p className="text-sm theme-text-secondary theme-transition">
                  {selectedLivestock.type} - {selectedLivestock.breed} ({selectedLivestock.weight} kg)
                </p>
              </div>
            </div>
            
            <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
              <button 
                onClick={() => setShowSlaughterModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 theme-transition"
              >
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={confirmSlaughter}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 theme-transition"
              >
                {isRTL ? 'تأكيد الذبح' : 'Confirmer l\'abattage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de transfert */}
      {showTransferModal && selectedLivestock && (
        <TransferModal 
          animal={selectedLivestock}
          isRTL={isRTL}
          onClose={() => setShowTransferModal(false)}
          onConfirm={confirmTransfer}
        />
      )}
    </div>
  );
}

// Composant Modal de transfert
interface TransferModalProps {
  animal: Livestock;
  isRTL: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

function TransferModal({ animal, isRTL, onClose, onConfirm }: TransferModalProps) {
  const [transferData, setTransferData] = useState({
    toAbattoir: '',
    toAddress: '',
    toManager: '',
    toPhone: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(transferData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h3 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'نقل الحيوان' : 'Transférer l\'animal'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 theme-transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg mb-4">
            <p className="font-medium theme-text-primary theme-transition">
              {animal.loopNumber}
            </p>
            <p className="text-sm theme-text-secondary theme-transition">
              {animal.type} - {animal.breed} ({animal.weight} kg)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'اسم المجزر الوجهة' : 'Nom de l\'abattoir de destination'}
            </label>
            <input
              type="text"
              required
              value={transferData.toAbattoir}
              onChange={(e) => setTransferData(prev => ({ ...prev, toAbattoir: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'عنوان المجزر' : 'Adresse de l\'abattoir'}
            </label>
            <input
              type="text"
              required
              value={transferData.toAddress}
              onChange={(e) => setTransferData(prev => ({ ...prev, toAddress: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                {isRTL ? 'اسم المدير' : 'Nom du directeur'}
              </label>
              <input
                type="text"
                required
                value={transferData.toManager}
                onChange={(e) => setTransferData(prev => ({ ...prev, toManager: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                {isRTL ? 'رقم الهاتف' : 'Numéro de téléphone'}
              </label>
              <input
                type="tel"
                required
                value={transferData.toPhone}
                onChange={(e) => setTransferData(prev => ({ ...prev, toPhone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {isRTL ? 'سبب النقل' : 'Raison du transfert'}
            </label>
            <textarea
              required
              rows={3}
              value={transferData.reason}
              onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 theme-transition"
            >
              {isRTL ? 'تأكيد النقل' : 'Confirmer le transfert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
