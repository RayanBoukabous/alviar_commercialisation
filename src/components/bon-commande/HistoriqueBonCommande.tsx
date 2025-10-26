'use client';

import React, { useState } from 'react';
import { 
  History, 
  User, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Edit, 
  AlertCircle,
  FileText,
  Calendar,
  Activity,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useHistoriqueBonCommande, useHistoriqueBonCommandeStats } from '@/lib/hooks/useHistoriqueBonCommande';
import { HistoriqueBonDeCommande } from '@/lib/api/historiqueBonCommandeService';
import { cn } from '@/lib/utils';

interface HistoriqueBonCommandeProps {
  bonId: number;
  className?: string;
}

const HistoriqueBonCommande: React.FC<HistoriqueBonCommandeProps> = ({ bonId, className }) => {
  const { t, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  
  // Hooks API
  const { 
    data: historique, 
    isLoading, 
    error, 
    refetch 
  } = useHistoriqueBonCommande(bonId);
  
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useHistoriqueBonCommandeStats(bonId);
  
  // Fonctions utilitaires
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'UPDATED':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'STATUS_CHANGED':
        return <ArrowRight className="h-4 w-4 text-orange-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'STARTED':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'BROUILLON':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'CONFIRME':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'EN_COURS':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'LIVRE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ANNULE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  // Filtrer l'historique - s'assurer que c'est un tableau
  const historiqueArray = Array.isArray(historique) ? historique : [];
  const filteredHistorique = historiqueArray.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type_action === filterType;
    return matchesSearch && matchesFilter;
  });
  
  if (isLoading) {
    return (
      <div className={cn('theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition', className)}>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={cn('theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition', className)}>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement de l'historique
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('theme-bg-elevated rounded-lg shadow-sm theme-border-primary border theme-transition', className)}>
      {/* Header */}
      <div className="px-6 py-4 theme-border-secondary border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <History className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <h2 className="text-lg font-semibold theme-text-primary">
              {isRTL ? 'تاريخ التغييرات' : 'Historique des modifications'}
            </h2>
            {historiqueArray.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-full dark:bg-primary-900 dark:text-primary-200">
                {historiqueArray.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 theme-text-secondary hover:theme-bg-secondary rounded-md transition-colors"
              title={isRTL ? 'إحصائيات' : 'Statistiques'}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 theme-text-secondary hover:theme-bg-secondary rounded-md transition-colors"
              title={isRTL ? 'تحديث' : 'Actualiser'}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistiques */}
      {showStats && stats && (
        <div className="px-6 py-4 theme-border-secondary border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.total_actions}</div>
              <div className="text-sm theme-text-secondary">Total actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.changements_statut}</div>
              <div className="text-sm theme-text-secondary">Changements statut</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.modifications}</div>
              <div className="text-sm theme-text-secondary">Modifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(stats.actions_par_utilisateur).length}
              </div>
              <div className="text-sm theme-text-secondary">Utilisateurs</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtres */}
      <div className="px-6 py-4 theme-border-secondary border-b">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary" />
              <input
                type="text"
                placeholder={isRTL ? 'البحث في التاريخ...' : 'Rechercher dans l\'historique...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 theme-bg-secondary theme-text-primary border theme-border-primary rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 theme-text-tertiary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 theme-bg-secondary theme-text-primary border theme-border-primary rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="CREATED">Création</option>
              <option value="UPDATED">Modification</option>
              <option value="STATUS_CHANGED">Changement statut</option>
              <option value="CANCELLED">Annulation</option>
              <option value="DELIVERED">Livraison</option>
              <option value="CONFIRMED">Confirmation</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste de l'historique */}
      <div className="max-h-96 overflow-y-auto">
        {filteredHistorique.length === 0 ? (
          <div className="p-6 text-center">
            <History className="h-12 w-12 theme-text-tertiary mx-auto mb-4" />
            <p className="theme-text-secondary">
              {isRTL ? 'لا يوجد تاريخ' : 'Aucun historique trouvé'}
            </p>
          </div>
        ) : (
          <div className="divide-y theme-border-secondary">
            {filteredHistorique.map((entry, index) => (
              <div key={entry.id} className="p-6 hover:theme-bg-secondary transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Icône de l'action */}
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.type_action)}
                  </div>
                  
                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium theme-text-primary">
                        {entry.type_action_display}
                      </h3>
                      <div className="flex items-center text-xs theme-text-tertiary">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                    
                    <p className="text-sm theme-text-secondary mb-2">
                      {entry.description}
                    </p>
                    
                    {/* Informations sur l'utilisateur */}
                    <div className="flex items-center text-xs theme-text-tertiary mb-2">
                      <User className="h-3 w-3 mr-1" />
                      {entry.user_nom}
                    </div>
                    
                    {/* Changement de statut */}
                    {entry.ancien_statut && entry.nouveau_statut && (
                      <div className="flex items-center space-x-2">
                        <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(entry.ancien_statut))}>
                          {entry.ancien_statut_display}
                        </span>
                        <ArrowRight className="h-3 w-3 theme-text-tertiary" />
                        <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(entry.nouveau_statut))}>
                          {entry.nouveau_statut_display}
                        </span>
                      </div>
                    )}
                    
                    {/* Données supplémentaires */}
                    {entry.data && Object.keys(entry.data).length > 0 && (
                      <div className="mt-2 p-2 theme-bg-secondary rounded-md">
                        <details className="text-xs">
                          <summary className="cursor-pointer theme-text-tertiary hover:theme-text-secondary">
                            Détails techniques
                          </summary>
                          <pre className="mt-2 text-xs theme-text-tertiary overflow-x-auto">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueBonCommande;
