import React from 'react';
import { Clock, Settings, Zap, Timer, Hourglass } from 'lucide-react';

interface RefreshIntervalSelectorProps {
  currentInterval: number;
  onIntervalChange: (interval: number) => void;
  isRTL: boolean;
  className?: string;
}

const INTERVAL_OPTIONS = [
  { value: 5 * 60 * 1000, label: '5 min', icon: Zap, description: 'Temps réel' },
  { value: 10 * 60 * 1000, label: '10 min', icon: Timer, description: 'Équilibré' },
  { value: 15 * 60 * 1000, label: '15 min', icon: Hourglass, description: 'Économique' },
];

export const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({
  currentInterval,
  onIntervalChange,
  isRTL,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} ${className}`}>
      {/* Icône de configuration */}
      <div className="flex items-center px-2 py-1 rounded-md bg-theme-secondary text-theme-secondary border border-theme-border transition-all duration-300">
        <Settings className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        <span className="text-xs font-medium">
          {isRTL ? 'تحديث' : 'Actualisation'}
        </span>
      </div>

      {/* Sélecteur d'intervalle */}
      <div className="flex items-center space-x-1">
        {INTERVAL_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = currentInterval === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onIntervalChange(option.value)}
              className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-theme-elevated border border-theme-border hover:border-primary-300'
              }`}
              title={option.description}
            >
              <Icon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
