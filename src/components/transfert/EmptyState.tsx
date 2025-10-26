'use client';

import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface EmptyStateProps {
  isRTL: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({ isRTL }) => (
  <div className="text-center py-12">
    <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
    <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
      {isRTL ? 'لم يتم العثور على نقل' : 'Aucun transfert trouvé'}
    </h3>
    <p className="theme-text-secondary theme-transition">
      {isRTL ? 'ابدأ بإضافة نقل جديد' : 'Commencez par ajouter un nouveau transfert'}
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';
