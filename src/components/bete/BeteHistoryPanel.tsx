'use client';

import React, { useState } from 'react';
import { Clock, User, ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { useBeteHistory } from '@/lib/hooks/useBeteHistory';
import { getHistoryTypeLabel, getHistoryTypeColor, BeteHistoryRecord } from '@/lib/api/beteHistoryService';

interface BeteHistoryPanelProps {
  beteId: number;
  isRTL?: boolean;
}

export const BeteHistoryPanel: React.FC<BeteHistoryPanelProps> = ({ beteId, isRTL = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useBeteHistory(beteId, currentPage, pageSize);

  if (isLoading) {
    return (
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6">
        <div className="animate-pulse">
          <div className="h-6 theme-bg-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 theme-bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6">
        <div className="flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6">
        <h2 className="text-xl font-semibold mb-4 theme-text-primary flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          {isRTL ? 'سجل التعديلات' : 'Historique des modifications'}
        </h2>
        <p className="theme-text-secondary text-center py-8">
          {isRTL ? 'لا توجد تعديلات' : 'Aucune modification enregistrée'}
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-DZ' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderHistoryRecord = (record: BeteHistoryRecord) => {
    const typeColors = getHistoryTypeColor(record.history_type);
    const typeLabel = getHistoryTypeLabel(record.history_type, isRTL);

    return (
      <div
        key={record.history_id}
        className="theme-bg-secondary border theme-border-primary rounded-lg p-5 hover:shadow-md transition-all"
      >
        {/* Header with Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b theme-border-primary">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
            {typeLabel}
          </span>
          <div className="flex items-center theme-text-secondary text-sm">
            <Clock className="h-4 w-4 mr-2" />
            {formatDate(record.history_date)}
          </div>
        </div>

        {/* User Info */}
        {record.history_user && (
          <div className="flex items-center mb-4">
            <User className="h-4 w-4 mr-2 theme-text-secondary" />
            <span className="text-sm theme-text-secondary">
              {isRTL ? 'بواسطة' : 'Par'} :{' '}
            </span>
            <span className="text-sm font-semibold theme-text-primary ml-2">
              {record.history_user.full_name}
            </span>
          </div>
        )}

        {/* Changes */}
        {record.changes && record.changes.length > 0 && (
          <div className="space-y-3">
            {record.changes.map((change, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800/50 border theme-border-primary rounded-lg p-3"
              >
                <p className="text-sm theme-text-primary mb-2">
                  {isRTL ? 'تعديل' : 'Modification'} <span className="font-semibold">{change.label}</span> :
                </p>
                <div className="flex items-center text-sm">
                  <span className="theme-text-secondary">{isRTL ? 'من' : 'De'} :</span>
                  <span className="mx-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-mono">
                    {change.old_value || (isRTL ? 'فارغ' : 'Vide')}
                  </span>
                  <span className="theme-text-secondary mx-2">→</span>
                  <span className="theme-text-secondary">{isRTL ? 'إلى' : 'À'} :</span>
                  <span className="mx-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-mono">
                    {change.new_value || (isRTL ? 'فارغ' : 'Vide')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* État de la bête à ce moment (pour création) */}
        {record.history_type === 'C' && !record.changes && (
          <div className="mt-3 text-sm theme-text-secondary italic">
            <p>
              {isRTL
                ? `تم إنشاء الحيوان: ${record.num_boucle} - ${record.espece_nom}`
                : `Animal créé : ${record.num_boucle} - ${record.espece_nom}`}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold theme-text-primary flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          {isRTL ? 'سجل التعديلات' : 'Historique des modifications'}
        </h2>
        <div className="flex items-center space-x-2 text-sm theme-text-secondary">
          <FileText className="h-4 w-4" />
          <span>
            {data.pagination.total} {isRTL ? 'سجل' : 'enregistrement(s)'}
          </span>
        </div>
      </div>

      {/* History Records */}
      <div className="space-y-4 mb-6">
        {data.history.map((record) => renderHistoryRecord(record))}
      </div>

      {/* Pagination */}
      {data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t theme-border-primary">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={!data.pagination.has_previous}
            className="flex items-center px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary transition-colors border theme-border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {isRTL ? 'السابق' : 'Précédent'}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm theme-text-secondary">
              {isRTL ? 'صفحة' : 'Page'} {data.pagination.page} {isRTL ? 'من' : 'sur'}{' '}
              {data.pagination.total_pages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(data.pagination.total_pages, prev + 1))}
            disabled={!data.pagination.has_next}
            className="flex items-center px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary transition-colors border theme-border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? 'التالي' : 'Suivant'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

