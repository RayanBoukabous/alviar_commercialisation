'use client';

import React, { useCallback } from 'react';
import { ArrowRightLeft, Eye, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { Transfert } from '@/lib/api/transfertService';
import { StatusBadge } from './StatusBadge';

interface TransfertRowProps {
  transfert: Transfert;
  isRTL: boolean;
  onView: (transfert: Transfert) => void;
  onEdit: (transfert: Transfert) => void;
  onDelete: (id: number, name: string) => void;
  isDeleting: boolean;
}

export const TransfertRow: React.FC<TransfertRowProps> = React.memo(({
  transfert,
  isRTL,
  onView,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const formatDate = useCallback((dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <tr className="transition-colors hover:theme-bg-secondary">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary-600" />
          </div>
          <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
            <div className="text-sm font-medium theme-text-primary theme-transition">
              {transfert.numero_transfert}
            </div>
            <div className="text-sm theme-text-secondary theme-transition">
              {transfert.motif || '-'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">
            {transfert.abattoir_expediteur.nom}
          </div>
          <div className="text-sm theme-text-secondary theme-transition">
            {transfert.abattoir_expediteur.adresse_complete}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">
            {transfert.abattoir_destinataire.nom}
          </div>
          <div className="text-sm theme-text-secondary theme-transition">
            {transfert.abattoir_destinataire.adresse_complete}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">
            {transfert.nombre_betes_actuelles} / {transfert.nombre_betes} {isRTL ? 'رأس' : 'têtes'}
          </div>
          <div className="text-sm theme-text-secondary theme-transition">
            {transfert.est_complet ? (isRTL ? 'مكتمل' : 'Complet') : (isRTL ? 'غير مكتمل' : 'Incomplet')}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge statut={transfert.statut} isRTL={isRTL} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
        {formatDate(transfert.date_creation)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
          <button 
            onClick={() => onView(transfert)}
            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
            title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onEdit(transfert)}
            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
            title={isRTL ? 'تعديل النقل' : 'Modifier le transfert'}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(transfert.id, transfert.numero_transfert)}
            disabled={isDeleting}
            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
            title={isRTL ? 'حذف النقل' : 'Supprimer le transfert'}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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
  );
});

TransfertRow.displayName = 'TransfertRow';
