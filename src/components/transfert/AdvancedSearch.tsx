'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Calendar, Building2, Hash } from 'lucide-react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
  isRTL: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = React.memo(({
  isOpen,
  onClose,
  onSearch,
  isRTL
}) => {
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    abattoir_expediteur: '',
    abattoir_destinataire: '',
    date_creation_after: '',
    date_creation_before: '',
    nombre_betes_min: '',
    nombre_betes_max: ''
  });

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    onSearch(cleanFilters);
    onClose();
  }, [filters, onSearch, onClose]);

  const handleReset = useCallback(() => {
    setFilters({
      search: '',
      statut: '',
      abattoir_expediteur: '',
      abattoir_destinataire: '',
      date_creation_after: '',
      date_creation_before: '',
      nombre_betes_min: '',
      nombre_betes_max: ''
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated theme-transition rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                {isRTL ? 'البحث المتقدم' : 'Recherche avancée'}
              </h2>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'فلترة النقل حسب معايير متعددة' : 'Filtrer les transferts selon plusieurs critères'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Recherche textuelle */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'البحث في النص' : 'Recherche textuelle'}
            </label>
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
              <input
                type="text"
                placeholder={isRTL ? 'رقم النقل، الموقع، الملاحظات...' : 'Numéro, lieu, notes...'}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'الحالة' : 'Statut'}
            </label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            >
              <option value="">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
              <option value="EN_COURS">{isRTL ? 'قيد التنفيذ' : 'En cours'}</option>
              <option value="EN_LIVRAISON">{isRTL ? 'في الطريق' : 'En livraison'}</option>
              <option value="LIVRE">{isRTL ? 'تم التسليم' : 'Livré'}</option>
              <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                {isRTL ? 'من تاريخ' : 'Date de début'}
              </label>
              <div className="relative">
                <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                <input
                  type="date"
                  value={filters.date_creation_after}
                  onChange={(e) => handleFilterChange('date_creation_after', e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                {isRTL ? 'إلى تاريخ' : 'Date de fin'}
              </label>
              <div className="relative">
                <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                <input
                  type="date"
                  value={filters.date_creation_before}
                  onChange={(e) => handleFilterChange('date_creation_before', e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
                />
              </div>
            </div>
          </div>

          {/* Nombre de bêtes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                {isRTL ? 'الحد الأدنى للعدد' : 'Nombre minimum'}
              </label>
              <div className="relative">
                <Hash className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                <input
                  type="number"
                  placeholder="0"
                  value={filters.nombre_betes_min}
                  onChange={(e) => handleFilterChange('nombre_betes_min', e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                {isRTL ? 'الحد الأقصى للعدد' : 'Nombre maximum'}
              </label>
              <div className="relative">
                <Hash className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                <input
                  type="number"
                  placeholder="100"
                  value={filters.nombre_betes_max}
                  onChange={(e) => handleFilterChange('nombre_betes_max', e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t theme-border-primary">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium theme-text-tertiary hover:theme-text-primary theme-transition"
          >
            {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-tertiary hover:theme-text-primary theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isRTL ? 'بحث' : 'Rechercher'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AdvancedSearch.displayName = 'AdvancedSearch';
