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
import { useLivestock, useCarcassStatistics } from '@/lib/hooks/useLivestock';
import { useAbattoirs } from '@/lib/hooks/useAbattoirs';
import { useAuth } from '@/lib/hooks/useDjangoAuth';
import { Bete } from '@/lib/api/livestockService';
import { useRouter } from 'next/navigation';

interface CarcassLivestockProps {
  isRTL: boolean;
}

// Utiliser l'interface Bete existante pour les carcasses

// Fonction pour mapper les données Bete vers le format carcasse
const mapBeteToCarcass = (bete: Bete) => {
  // Déterminer le statut selon la date d'abattage
  const slaughterDate = new Date(bete.updated_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - slaughterDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let status = 'FRESH';
  if (daysDiff > 7) {
    status = 'CHILLED';
  } else if (daysDiff > 30) {
    status = 'FROZEN';
  }

  return {
    id: bete.id,
    loopNumber: bete.numero_identification,
    type: bete.espece_nom || bete.espece?.nom || 'INCONNU',
    breed: bete.race?.nom || 'Non spécifié',
    liveWeight: bete.poids_vif || 0,
    carcassWeight: bete.poids_a_chaud || 0,
    gender: bete.sexe === 'M' ? 'MALE' : 'FEMALE',
    slaughterDate: bete.updated_at,
    abattoirName: bete.abattoir?.nom || bete.abattoir_nom || 'Inconnu',
    quality: bete.etat_sante === 'BON' ? 'BON' : 'MAUVAIS',
    status: status,
    etatSante: bete.etat_sante, // Ajouter l'état de santé original
    notes: bete.nom || undefined
  };
};

export default function CarcassLivestockTab({ isRTL }: CarcassLivestockProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [qualityFilter, setQualityFilter] = useState<string>('ALL');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('ALL');
  const [deletingCarcassId, setDeletingCarcassId] = useState<number | null>(null);

  // Récupérer les données utilisateur et abattoirs
  const { user } = useAuth();
  const { data: abattoirsList } = useAbattoirs();
  const isSuperuser = user?.is_superuser || false;

  // Récupérer les bêtes avec le statut ABATTU
  const { data: livestockData, isLoading: loading, error } = useLivestock({
    statut: 'ABATTU',
    page_size: 100 // Récupérer plus de données pour les carcasses
  });

  // Récupérer les statistiques des carcasses depuis le backend
  const { data: carcassStats, isLoading: statsLoading } = useCarcassStatistics({
    espece_nom: typeFilter !== 'ALL' ? typeFilter : undefined,
    etat_sante: qualityFilter !== 'ALL' ? (qualityFilter as 'BON' | 'MALADE') : undefined,
    abattoir_id: abattoirFilter !== 'ALL' ? parseInt(abattoirFilter) : undefined,
    search: searchTerm || undefined
  });

  // Mapper les données vers le format carcasse
  const carcassLivestock = livestockData?.betes?.map(mapBeteToCarcass) || [];

  const filteredCarcassLivestock = carcassLivestock.filter(item => {
    const matchesSearch = item.loopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleDeleteCarcass = async (carcassId: number, loopNumber: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la carcasse "${loopNumber}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCarcassId(carcassId);
      // TODO: Implémenter l'appel API pour supprimer la carcasse
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Carcasse ${loopNumber} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la carcasse:', err);
    } finally {
      setDeletingCarcassId(null);
    }
  };

  // Statistiques depuis le backend
  const totalCount = carcassStats?.statistics?.total_count || 0;
  const totalCarcassWeight = carcassStats?.statistics?.total_carcass_weight || 0;
  const totalLiveWeight = carcassStats?.statistics?.total_live_weight || 0;
  const averageWeight = carcassStats?.statistics?.average_carcass_weight || 0;

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
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalCarcassWeight.toFixed(2)} kg</p>
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
                {isRTL ? 'الوزن الحي الإجمالي' : 'Poids vif total'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{totalLiveWeight.toFixed(2)} kg</p>
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
              <p className="text-2xl font-bold theme-text-primary theme-transition">{averageWeight.toFixed(2)} kg</p>
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
          {isSuperuser && (
            <select
              value={abattoirFilter}
              onChange={(e) => setAbattoirFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="ALL">{isRTL ? 'جميع المسالخ' : 'Tous les abattoirs'}</option>
              {abattoirsList?.abattoirs?.map((abattoir: any) => (
                <option key={abattoir.id} value={abattoir.id.toString()}>
                  {abattoir.nom}
                </option>
              ))}
            </select>
          )}
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
                    {isRTL ? 'المسلخ' : 'Abattoir'}
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
                        <div className="text-sm font-medium theme-text-primary theme-transition">{item.abattoirName}</div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {isRTL ? 'مكان الذبح' : 'Lieu d\'abattage'}
                        </div>
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
                          {isRTL ? 'تاريخ الذبح' : 'Date abattage'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getQualityBadge(item.quality)}
                        <div className="text-xs theme-text-tertiary">
                          {isRTL ? 'الحالة الصحية:' : 'État santé:'} 
                          <span className={`ml-1 font-medium ${
                            item.etatSante === 'BON' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.etatSante === 'BON' ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                        <button 
                          onClick={() => router.push(`/dashboard/livestock/carcass/${item.id}`)}
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
