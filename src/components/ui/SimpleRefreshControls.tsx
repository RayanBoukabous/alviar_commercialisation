import React from 'react';
import { RefreshCw, Wifi, WifiOff, ChevronDown } from 'lucide-react';

interface SimpleRefreshControlsProps {
  isRefreshing: boolean;
  isOnline: boolean;
  currentInterval: number;
  onIntervalChange: (interval: number) => void;
  onRefresh: () => void;
  isRTL: boolean;
  className?: string;
}

const INTERVAL_OPTIONS = [
  { value: 5 * 60 * 1000, label: '5 min' },
  { value: 10 * 60 * 1000, label: '10 min' },
  { value: 15 * 60 * 1000, label: '15 min' },
];

export const SimpleRefreshControls: React.FC<SimpleRefreshControlsProps> = ({
  isRefreshing,
  isOnline,
  currentInterval,
  onIntervalChange,
  onRefresh,
  isRTL,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const selectedOption = INTERVAL_OPTIONS.find(opt => opt.value === currentInterval);

  // Fermer le dropdown quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} ${className}`}>
      {/* Tag de connexion simple */}
      <div className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}>
        {isOnline ? (
          <Wifi className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        ) : (
          <WifiOff className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        )}
        <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
      </div>

      {/* Dropdown simple pour l'intervalle */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>{selectedOption?.label || '5 min'}</span>
          <ChevronDown className={`h-3 w-3 ${isRTL ? 'mr-1' : 'ml-1'} transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div 
            className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {INTERVAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onIntervalChange(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md ${
                  option.value === currentInterval 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bouton actualiser simple */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing || !isOnline}
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          isRefreshing || !isOnline
            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
        }`}
      >
        <RefreshCw className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'} ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Actualiser</span>
      </button>
    </div>
  );
};
