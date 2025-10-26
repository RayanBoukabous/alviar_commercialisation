'use client';

import React, { useMemo } from 'react';
import { Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  statut: string;
  isRTL: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ 
  statut, 
  isRTL 
}) => {
  const statusConfig = useMemo(() => ({
    'EN_COURS': { 
      bg: 'bg-orange-200 dark:bg-orange-900/50', 
      text: 'text-orange-900 dark:text-orange-100', 
      border: 'border-orange-300 dark:border-orange-700',
      label: isRTL ? 'قيد التنفيذ' : 'En cours',
      icon: Clock
    },
    'EN_LIVRAISON': { 
      bg: 'bg-blue-200 dark:bg-blue-900/50', 
      text: 'text-blue-900 dark:text-blue-100', 
      border: 'border-blue-300 dark:border-blue-700',
      label: isRTL ? 'في الطريق' : 'En livraison',
      icon: Truck
    },
    'LIVRE': { 
      bg: 'bg-green-200 dark:bg-green-900/50', 
      text: 'text-green-900 dark:text-green-100', 
      border: 'border-green-300 dark:border-green-700',
      label: isRTL ? 'تم التسليم' : 'Livré',
      icon: CheckCircle
    },
    'ANNULE': { 
      bg: 'bg-red-200 dark:bg-red-900/50', 
      text: 'text-red-900 dark:text-red-100', 
      border: 'border-red-300 dark:border-red-700',
      label: isRTL ? 'ملغي' : 'Annulé',
      icon: XCircle
    }
  }), [isRTL]);
  
  const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['EN_COURS'];
  const IconComponent = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
