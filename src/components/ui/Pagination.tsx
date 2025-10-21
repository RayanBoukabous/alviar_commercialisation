'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isRTL?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isRTL = false
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="theme-bg-elevated px-4 py-3 flex items-center justify-between border-t theme-border-primary theme-transition">
      <div className="flex items-center space-x-2">
        <span className="text-sm theme-text-secondary theme-transition">
          {isRTL ? 'عرض' : 'Afficher'}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border theme-border-primary rounded theme-bg-elevated theme-text-primary theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm theme-text-secondary theme-transition">
          {isRTL ? 'من' : 'sur'} {totalItems} {isRTL ? 'عنصر' : 'éléments'}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm theme-text-secondary theme-transition">
          {isRTL ? 'الصفحة' : 'Page'} {currentPage} {isRTL ? 'من' : 'sur'} {totalPages}
        </span>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm border theme-border-primary rounded theme-bg-elevated theme-text-primary theme-transition disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-secondary"
          >
            {isRTL ? 'الأولى' : 'Première'}
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm border theme-border-primary rounded theme-bg-elevated theme-text-primary theme-transition disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-secondary"
          >
            {isRTL ? 'السابقة' : 'Précédente'}
          </button>
          
          {/* Afficher les numéros de page */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 py-1 text-sm border rounded theme-transition ${
                  currentPage === pageNum
                    ? 'theme-bg-primary theme-text-white border-primary-500'
                    : 'theme-border-primary theme-bg-elevated theme-text-primary hover:theme-bg-secondary'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm border theme-border-primary rounded theme-bg-elevated theme-text-primary theme-transition disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-secondary"
          >
            {isRTL ? 'التالية' : 'Suivante'}
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm border theme-border-primary rounded theme-bg-elevated theme-text-primary theme-transition disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-secondary"
          >
            {isRTL ? 'الأخيرة' : 'Dernière'}
          </button>
        </div>
      </div>
    </div>
  );
}






