'use client';

import React from 'react';
import { 
  History, 
  User, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Globe
} from 'lucide-react';
import { useHistoriqueAbattoirs, HistoriqueAbattoirFilters } from '@/lib/hooks/useHistoriqueAbattoir';
import { HistoriqueAbattoir } from '@/lib/api/historiqueAbattoirService';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface HistoriqueAbattoirContentProps {
  abattoirId: number;
  abattoirNom: string;
  isRTL: boolean;
}

const HistoriqueAbattoirContent: React.FC<HistoriqueAbattoirContentProps> = ({
  abattoirId,
  abattoirNom,
  isRTL
}) => {
  const { currentLocale } = useLanguage();
  
  const [filters, setFilters] = React.useState<HistoriqueAbattoirFilters>({
    abattoir_id: abattoirId,
    page_size: 50
  });

  const { data: historiqueData, isLoading, error, refetch } = useHistoriqueAbattoirs(filters);

  const getActionIcon = (typeAction: string) => {
    switch (typeAction) {
      case 'CREATE':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-primary-600" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-error-600" />;
      case 'ACTIVATE':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'DEACTIVATE':
        return <XCircle className="h-4 w-4 text-error-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-warning-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-error-500" />
          <p className="text-error-600 dark:text-error-400">
            {isRTL ? 'خطأ في تحميل التاريخ' : 'Erreur lors du chargement de l\'historique'}
          </p>
        </div>
      </div>
    );
  }

  if (!historiqueData || historiqueData.results.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <History className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
          <h3 className="text-lg font-medium theme-text-primary mb-2">
            {isRTL ? 'لا يوجد تاريخ' : 'Aucun historique'}
          </h3>
          <p className="theme-text-secondary">
            {isRTL ? 'لم يتم العثور على أي تعديلات لهذا المجزر' : 'Aucune modification trouvée pour cet abattoir'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-4`}>
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <History className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
            <h3 className="text-lg font-semibold theme-text-primary">
              {isRTL ? 'تاريخ التعديلات' : 'Historique des modifications'}
            </h3>
            <p className="text-sm theme-text-secondary">
              {isRTL ? `للمجزر: ${abattoirNom}` : `Abattoir: ${abattoirNom}`}
            </p>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {historiqueData.count}
              </div>
              <div className="text-sm theme-text-secondary">
                {isRTL ? 'تعديل' : 'modification(s)'}
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 dark:bg-primary-900/30 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              {isRTL ? 'تحديث' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des modifications */}
      <div className="space-y-3">
        {historiqueData.results.map((historique: HistoriqueAbattoir) => (
          <div
            key={historique.id}
            className="theme-bg-elevated rounded-lg border theme-border-primary p-4 hover:shadow-md transition-all duration-200"
          >
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
              {/* Icône d'action */}
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(historique.type_action)}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                {/* En-tête avec action et utilisateur */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'} mb-2`}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                    {historique.type_action_display}
                  </span>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-1' : 'space-x-1'} text-sm theme-text-tertiary`}>
                    <User className="h-4 w-4" />
                    <span>{historique.nom_utilisateur}</span>
                  </div>
                </div>

                {/* Description de la modification */}
                <p className="text-sm theme-text-primary mb-2">
                  {historique.description_modification}
                </p>
                
                {/* Détails de la modification (pour un seul champ modifié) */}
                {historique.champ_modifie && historique.ancienne_valeur && historique.nouvelle_valeur && (
                  <div className="text-xs theme-text-secondary mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {isRTL ? 'من:' : 'De:'} 
                      </span>
                      <span className="bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300 px-2 py-1 rounded text-xs">
                        {historique.ancienne_valeur}
                      </span>
                      <span className="theme-text-tertiary">
                        {isRTL ? 'إلى:' : '→'}
                      </span>
                      <span className="bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 px-2 py-1 rounded text-xs">
                        {historique.nouvelle_valeur}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Détails complets de la modification (JSON pour plusieurs champs) */}
                {historique.details_modification && Object.keys(historique.details_modification).length > 0 && (
                  <div className="text-xs theme-text-secondary mb-2">
                    <div className="font-medium mb-1">
                      {isRTL ? 'التفاصيل الكاملة:' : 'Détails complets:'}
                    </div>
                    <div className="theme-bg-secondary p-2 rounded text-xs">
                      {Object.entries(historique.details_modification).map(([champ, data]: [string, any]) => (
                        <div key={champ} className="mb-1">
                          <span className="font-medium text-primary-600 dark:text-primary-400">
                            {champ}:
                          </span>
                          <span className="ml-1 text-error-600 dark:text-error-400">
                            {data.ancienne_valeur}
                          </span>
                          <span className="mx-1 theme-text-tertiary">→</span>
                          <span className="text-success-600 dark:text-success-400">
                            {data.nouvelle_valeur}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métadonnées */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'} text-xs theme-text-tertiary`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-1' : 'space-x-1'}`}>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(historique.date_modification), 'dd/MM/yyyy HH:mm', {
                        locale: currentLocale === 'ar' ? ar : fr,
                      })}
                    </span>
                  </div>
                  {historique.adresse_ip && (
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-1' : 'space-x-1'}`}>
                      <Globe className="h-3 w-3" />
                      <span>{historique.adresse_ip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoriqueAbattoirContent;
