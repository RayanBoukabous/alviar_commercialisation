'use client';

import React, { useState } from 'react';
import { X, History, User, Calendar, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useHistoriqueAbattoirs, HistoriqueAbattoirFilters } from '@/lib/hooks/useHistoriqueAbattoir';
import { HistoriqueAbattoir } from '@/lib/api/historiqueAbattoirService';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface HistoriqueAbattoirModalProps {
  isOpen: boolean;
  onClose: () => void;
  abattoirId: number;
  abattoirNom: string;
  isRTL: boolean;
}

const HistoriqueAbattoirModal: React.FC<HistoriqueAbattoirModalProps> = ({
  isOpen,
  onClose,
  abattoirId,
  abattoirNom,
  isRTL
}) => {
  const { currentLocale } = useLanguage();
  const [filters, setFilters] = useState<HistoriqueAbattoirFilters>({
    abattoir_id: abattoirId,
    page_size: 50
  });

  const { data: historiqueData, isLoading, error, refetch } = useHistoriqueAbattoirs(filters);

  // Refetch les données à chaque ouverture du modal
  React.useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

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

  const getActionColor = (typeAction: string) => {
    switch (typeAction) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACTIVATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DEACTIVATE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <History className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
              <h2 className="text-lg font-semibold theme-text-primary">
                {isRTL ? 'تاريخ التعديلات' : 'Historique des modifications'}
              </h2>
              <p className="text-sm theme-text-secondary">
                {isRTL ? `للمجزر: ${abattoirNom}` : `Abattoir: ${abattoirNom}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-error-500" />
              <p className="text-error-600 dark:text-error-400">
                {isRTL ? 'خطأ في تحميل التاريخ' : 'Erreur lors du chargement de l\'historique'}
              </p>
            </div>
          ) : historiqueData && historiqueData.results.length > 0 ? (
            <div className="space-y-4">
                {historiqueData.results.map((historique: HistoriqueAbattoir, index: number) => (
                  <div
                    key={historique.id}
                    className={`p-4 rounded-lg border theme-border-primary transition-all duration-200 hover:shadow-md theme-bg-elevated ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
                      {/* Icône d'action */}
                      <div className="flex-shrink-0">
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
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 theme-text-tertiary" />
              <h3 className="text-lg font-medium theme-text-primary mb-2">
                {isRTL ? 'لا يوجد تاريخ' : 'Aucun historique'}
              </h3>
              <p className="theme-text-secondary">
                {isRTL ? 'لم يتم العثور على أي تعديلات لهذا المجزر' : 'Aucune modification trouvée pour cet abattoir'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t theme-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium theme-text-primary theme-bg-elevated border theme-border-primary rounded-lg hover:theme-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 theme-transition"
          >
            {isRTL ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoriqueAbattoirModal;
