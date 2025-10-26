'use client';

import React from 'react';
import { TransfertToast } from './TransfertToast';

interface NotificationManagerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
  isRTL: boolean;
}

export const NotificationManager: React.FC<NotificationManagerProps> = React.memo(({
  toasts,
  onRemoveToast,
  isRTL
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <TransfertToast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemoveToast}
          isRTL={isRTL}
        />
      ))}
    </div>
  );
});

NotificationManager.displayName = 'NotificationManager';
