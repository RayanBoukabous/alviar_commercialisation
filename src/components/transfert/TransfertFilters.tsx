'use client';

import React, { useCallback } from 'react';
import { Search, Filter } from 'lucide-react';

interface TransfertFiltersProps {
  searchTerm: string;
  statusFilter: string;
  abattoirFilter: string;
  isRTL: boolean;
  abattoirs: Array<{ id: number; name: string }>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAbattoirChange: (value: string) => void;
}

export const TransfertFilters: React.FC<TransfertFiltersProps> = React.memo(({
  searchTerm,
  statusFilter,
  abattoirFilter,
  isRTL,
  abattoirs,
  onSearchChange,
  onStatusChange,
  onAbattoirChange
}) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value);
  }, [onStatusChange]);

  const handleAbattoirChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onAbattoirChange(e.target.value);
  }, [onAbattoirChange]);

  return (
    <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
      <div className="px-6 py-4">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في النقل...' : 'Rechercher un transfert...'}
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
            <option value="EN_COURS">{isRTL ? 'قيد التنفيذ' : 'En cours'}</option>
            <option value="EN_LIVRAISON">{isRTL ? 'في الطريق' : 'En livraison'}</option>
            <option value="LIVRE">{isRTL ? 'تم التسليم' : 'Livré'}</option>
            <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
          </select>
          <select
            value={abattoirFilter}
            onChange={handleAbattoirChange}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="">{isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}</option>
            {abattoirs.map(abattoir => (
              <option key={abattoir.id} value={abattoir.id.toString()}>
                {abattoir.name}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
            <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تصفية' : 'Filtres'}
          </button>
        </div>
      </div>
    </div>
  );
});

TransfertFilters.displayName = 'TransfertFilters';
