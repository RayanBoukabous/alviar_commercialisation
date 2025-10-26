import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Abattoir {
  id: number;
  nom: string;
  wilaya: string;
  commune: string;
}

interface AbattoirSelectorProps {
  abattoirs: Abattoir[];
  selectedAbattoirId?: number;
  onAbattoirChange: (abattoirId?: number) => void;
  isRTL: boolean;
  isLoading?: boolean;
}

export default function AbattoirSelector({
  abattoirs,
  selectedAbattoirId,
  onAbattoirChange,
  isRTL,
  isLoading = false
}: AbattoirSelectorProps) {
  const selectedAbattoir = abattoirs.find(abattoir => abattoir.id === selectedAbattoirId);

  return (
    <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
      <label className="block text-sm font-medium theme-text-secondary mb-2">
        {isRTL ? 'اختر المجزر' : 'Sélectionner un abattoir'}
      </label>
      <div className="relative">
        <select
          value={selectedAbattoirId || ''}
          onChange={(e) => {
            const value = e.target.value;
            onAbattoirChange(value ? parseInt(value) : undefined);
          }}
          disabled={isLoading}
          className={`
            w-full px-4 py-2 pr-10 rounded-lg border transition-all duration-200
            bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100
            hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isRTL ? 'text-right' : 'text-left'}
          `}
        >
          <option value="">
            {isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}
          </option>
          {abattoirs.map((abattoir) => (
            <option key={abattoir.id} value={abattoir.id}>
              {abattoir.nom} - {abattoir.commune}, {abattoir.wilaya}
            </option>
          ))}
        </select>
        <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
          <ChevronDown className="h-4 w-4 theme-text-tertiary" />
        </div>
      </div>
      {selectedAbattoir && (
        <p className="mt-1 text-xs theme-text-tertiary">
          {isRTL ? 'المجزر المحدد:' : 'Abattoir sélectionné:'} {selectedAbattoir.nom}
        </p>
      )}
    </div>
  );
}
