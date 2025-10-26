'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsProps {
  onRefresh: () => void;
  onCreate: () => void;
  onSearch: () => void;
  isRTL: boolean;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = React.memo(({
  onRefresh,
  onCreate,
  onSearch,
  isRTL
}) => {
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Ctrl/Cmd + R: Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      onRefresh();
      return;
    }

    // Ctrl/Cmd + N: New transfert
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      onCreate();
      return;
    }

    // Ctrl/Cmd + F: Search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      onSearch();
      return;
    }

    // Escape: Close modals
    if (event.key === 'Escape') {
      // This will be handled by individual components
      return;
    }

    // Ctrl/Cmd + K: Quick actions
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      // Show quick actions modal
      return;
    }
  }, [onRefresh, onCreate, onSearch]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Show keyboard shortcuts help
  const showHelp = useCallback(() => {
    const shortcuts = [
      { key: 'Ctrl/Cmd + R', action: isRTL ? 'تحديث' : 'Actualiser' },
      { key: 'Ctrl/Cmd + N', action: isRTL ? 'نقل جديد' : 'Nouveau transfert' },
      { key: 'Ctrl/Cmd + F', action: isRTL ? 'بحث' : 'Rechercher' },
      { key: 'Escape', action: isRTL ? 'إغلاق' : 'Fermer' },
      { key: 'Ctrl/Cmd + K', action: isRTL ? 'إجراءات سريعة' : 'Actions rapides' }
    ];

    // Create a simple alert for now, could be replaced with a modal
    const message = shortcuts.map(s => `${s.key}: ${s.action}`).join('\n');
    alert(isRTL ? 'اختصارات لوحة المفاتيح:\n' + message : 'Raccourcis clavier:\n' + message);
  }, [isRTL]);

  // Add help button to the page
  useEffect(() => {
    const helpButton = document.createElement('button');
    helpButton.innerHTML = '?';
    helpButton.className = 'fixed bottom-4 right-4 z-50 w-10 h-10 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors';
    helpButton.title = isRTL ? 'اختصارات لوحة المفاتيح' : 'Raccourcis clavier';
    helpButton.onclick = showHelp;
    
    document.body.appendChild(helpButton);
    
    return () => {
      if (document.body.contains(helpButton)) {
        document.body.removeChild(helpButton);
      }
    };
  }, [showHelp, isRTL]);

  return null;
});

KeyboardShortcuts.displayName = 'KeyboardShortcuts';
