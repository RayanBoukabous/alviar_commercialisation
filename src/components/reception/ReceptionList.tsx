'use client';

import React from 'react';
import { 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Package,
  Truck,
  Building2,
  Calendar,
  Users,
  Hash
} from 'lucide-react';
import { Reception } from '@/lib/api/receptionService';

interface ReceptionListProps {
  receptions: Reception[];
  onView: (reception: Reception) => void;
  onConfirm: (reception: Reception) => void;
  onCancel: (reception: Reception) => void;
  loading: boolean;
  isRTL?: boolean;
}

export const ReceptionList: React.FC<ReceptionListProps> = ({
  receptions,
  onView,
  onConfirm,
  onCancel,
  loading,
  isRTL = false
}) => {
  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const configs = {
      'EN_ATTENTE': { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        label: isRTL ? 'في الانتظار' : 'En attente'
      },
      'EN_COURS': { 
        icon: AlertCircle, 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        label: isRTL ? 'جاري' : 'En cours'
      },
      'RECU': { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        label: isRTL ? 'مستلم' : 'Reçu'
      },
      'PARTIEL': { 
        icon: AlertCircle, 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        label: isRTL ? 'جزئي' : 'Partiel'
      },
      'ANNULE': { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        label: isRTL ? 'ملغي' : 'Annulé'
      }
    };

    const config = configs[status as keyof typeof configs] || configs['EN_ATTENTE'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-DZ' : 'fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (receptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
          {isRTL ? 'لم يتم العثور على استقبالات' : 'Aucune réception trouvée'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL ? 'ابدأ بإضافة استقبالات جديدة' : 'Commencez par ajouter de nouvelles réceptions'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receptions.map((reception) => (
        <div key={reception.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-start space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {reception.numero_reception}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? 'من النقل' : 'Du transfert'}: {reception.transfert.numero_transfert}
                </p>
              </div>
            </div>
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {getStatusBadge(reception.statut)}
            </div>
          </div>

          {/* Informations du transfert */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Building2 className="w-4 h-4 text-gray-500" />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'من' : 'De'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reception.transfert.abattoir_expediteur.nom}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Truck className="w-4 h-4 text-gray-500" />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'إلى' : 'Vers'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reception.transfert.abattoir_destinataire.nom}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Users className="w-4 h-4 text-gray-500" />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'البهائم' : 'Bêtes'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reception.nombre_betes_recues || 0} / {reception.nombre_betes_attendues}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'التاريخ' : 'Date'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(reception.date_creation)}
                </p>
              </div>
            </div>
          </div>

          {/* Bêtes manquantes */}
          {reception.betes_manquantes && reception.betes_manquantes.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className={`flex items-center space-x-2 mb-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  {isRTL ? 'بهائم مفقودة' : 'Bêtes manquantes'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {reception.betes_manquantes.map((bete, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {bete}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                onClick={() => onView(reception)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                {isRTL ? 'عرض' : 'Voir'}
              </button>

              {reception.est_confirmable && (
                <button
                  onClick={() => onConfirm(reception)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {isRTL ? 'تأكيد الاستلام' : 'Confirmer'}
                </button>
              )}

              {reception.est_annulable && (
                <button
                  onClick={() => onCancel(reception)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
              )}
            </div>

            <div className={`text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'تم الإنشاء' : 'Créé par'}: {reception.cree_par.nom}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

