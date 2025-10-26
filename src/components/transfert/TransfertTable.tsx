'use client';

import React, { useMemo, useCallback } from 'react';
import { Transfert } from '@/lib/api/transfertService';
import { TransfertRow } from './TransfertRow';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

interface TransfertTableProps {
  transferts: Transfert[];
  loading: boolean;
  error: Error | null;
  isRTL: boolean;
  onView: (transfert: Transfert) => void;
  onEdit: (transfert: Transfert) => void;
  onDelete: (id: number, name: string) => void;
  onRetry: () => void;
  deletingTransfertId: number | null;
}

export const TransfertTable: React.FC<TransfertTableProps> = ({
  transferts,
  loading,
  error,
  isRTL,
  onView,
  onEdit,
  onDelete,
  onRetry,
  deletingTransfertId
}) => {
  const tableHeaders = useMemo(() => [
    { key: 'transfert', label: isRTL ? 'النقل' : 'Transfert' },
    { key: 'from', label: isRTL ? 'من' : 'De' },
    { key: 'to', label: isRTL ? 'إلى' : 'Vers' },
    { key: 'livestock', label: isRTL ? 'الماشية' : 'Bétail' },
    { key: 'status', label: isRTL ? 'الحالة' : 'Statut' },
    { key: 'date', label: isRTL ? 'التاريخ' : 'Date' },
    { key: 'actions', label: isRTL ? 'الإجراءات' : 'Actions' }
  ], [isRTL]);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y theme-border-secondary theme-transition">
          <thead className="theme-bg-secondary theme-transition">
            <tr>
              {tableHeaders.map((header) => (
                <th 
                  key={header.key}
                  className={`px-6 py-3 ${
                    header.key === 'actions' 
                      ? (isRTL ? 'text-left' : 'text-right')
                      : (isRTL ? 'text-right' : 'text-left')
                  } text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
            <LoadingSkeleton isRTL={isRTL} />
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} isRTL={isRTL} />;
  }

  if (transferts.length === 0) {
    return <EmptyState isRTL={isRTL} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y theme-border-secondary theme-transition">
        <thead className="theme-bg-secondary theme-transition">
          <tr>
            {tableHeaders.map((header) => (
              <th 
                key={header.key}
                className={`px-6 py-3 ${
                  header.key === 'actions' 
                    ? (isRTL ? 'text-left' : 'text-right')
                    : (isRTL ? 'text-right' : 'text-left')
                } text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
          {transferts.map((transfert) => (
            <TransfertRow
              key={transfert.id}
              transfert={transfert}
              isRTL={isRTL}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingTransfertId === transfert.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
