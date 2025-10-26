'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TransfertPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isRTL: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const TransfertPagination: React.FC<TransfertPaginationProps> = React.memo(({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isRTL,
  onPageChange,
  isLoading = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t theme-border-primary theme-bg-elevated ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
        <p className="text-sm theme-text-secondary theme-transition">
          {isRTL 
            ? `عرض ${startItem}-${endItem} من ${totalItems} عنصر`
            : `Affichage de ${startItem}-${endItem} sur ${totalItems} éléments`
          }
        </p>
      </div>

      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
        {/* Première page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-lg border theme-border-primary theme-text-tertiary hover:theme-bg-secondary theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isRTL ? 'الصفحة الأولى' : 'Première page'}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Page précédente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-lg border theme-border-primary theme-text-tertiary hover:theme-bg-secondary theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isRTL ? 'الصفحة السابقة' : 'Page précédente'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Pages numérotées */}
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 theme-text-tertiary">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'theme-text-tertiary hover:theme-bg-secondary theme-transition'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-lg border theme-border-primary theme-text-tertiary hover:theme-bg-secondary theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isRTL ? 'الصفحة التالية' : 'Page suivante'}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dernière page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-lg border theme-border-primary theme-text-tertiary hover:theme-bg-secondary theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isRTL ? 'الصفحة الأخيرة' : 'Dernière page'}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

TransfertPagination.displayName = 'TransfertPagination';
