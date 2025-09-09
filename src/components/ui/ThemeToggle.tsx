import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'theme-transition inline-flex items-center justify-center rounded-md border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-opacity-80',
        theme === 'dark' 
          ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        buttonSizeClasses[size],
        className
      )}
      aria-label={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
      title={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className={sizeClasses[size]} />
      ) : (
        <Sun className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Sombre' : 'Clair'}
        </span>
      )}
    </button>
  );
};

// Composant de toggle avec animation
export const AnimatedThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'theme-transition relative inline-flex items-center justify-center rounded-full border border-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        theme === 'dark' 
          ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        buttonSizeClasses[size],
        className
      )}
      aria-label={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
      title={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      <div className="relative">
        <Sun 
          className={cn(
            sizeClasses[size],
            'transition-all duration-300',
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          )}
        />
        <Moon 
          className={cn(
            sizeClasses[size],
            'absolute top-0 left-0 transition-all duration-300',
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Sombre' : 'Clair'}
        </span>
      )}
    </button>
  );
};

// Composant de toggle avec slider
export const SliderThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const thumbPositionClasses = {
    sm: theme === 'dark' ? 'translate-x-3' : 'translate-x-0',
    md: theme === 'dark' ? 'translate-x-4' : 'translate-x-0',
    lg: theme === 'dark' ? 'translate-x-5' : 'translate-x-0',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showLabel && (
        <span className="text-sm font-medium theme-text-secondary">
          {theme === 'light' ? 'Clair' : 'Sombre'}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={cn(
          'theme-transition relative inline-flex rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          theme === 'dark' 
            ? 'bg-primary-600' 
            : 'bg-slate-200',
          sizeClasses[size]
        )}
        aria-label={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
        title={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        <span
          className={cn(
            'theme-transition inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
            thumbSizeClasses[size],
            thumbPositionClasses[size]
          )}
        >
          <span className="sr-only">
            {theme === 'light' ? 'Basculer vers le thème sombre' : 'Basculer vers le thème clair'}
          </span>
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
