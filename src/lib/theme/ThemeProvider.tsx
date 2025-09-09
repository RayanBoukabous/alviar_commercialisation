'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, getThemeColors, themes } from './index';
import { useLocalStorage } from '@/lib/hooks/useApi';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: ReturnType<typeof getThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>(storageKey, defaultTheme);
  const [theme, setThemeState] = useState<Theme>(storedTheme);

  // Appliquer le thème au document
  useEffect(() => {
    const root = document.documentElement;
    const colors = getThemeColors(theme);

    // Supprimer les classes de thème précédentes
    root.classList.remove('light', 'dark');
    
    // Ajouter la classe du thème actuel
    root.classList.add(theme);

    // Définir les variables CSS personnalisées
    root.style.setProperty('--bg-primary', colors.background.primary);
    root.style.setProperty('--bg-secondary', colors.background.secondary);
    root.style.setProperty('--bg-tertiary', colors.background.tertiary);
    root.style.setProperty('--bg-elevated', colors.background.elevated);
    
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);
    root.style.setProperty('--text-inverse', colors.text.inverse);
    
    root.style.setProperty('--border-primary', colors.border.primary);
    root.style.setProperty('--border-secondary', colors.border.secondary);
    root.style.setProperty('--border-focus', colors.border.focus);

    // Appliquer les couleurs primaires
    Object.entries(colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value);
    });

    // Appliquer les couleurs d'état
    Object.entries(colors.success).forEach(([key, value]) => {
      root.style.setProperty(`--success-${key}`, value);
    });

    Object.entries(colors.warning).forEach(([key, value]) => {
      root.style.setProperty(`--warning-${key}`, value);
    });

    Object.entries(colors.error).forEach(([key, value]) => {
      root.style.setProperty(`--error-${key}`, value);
    });

    Object.entries(colors.info).forEach(([key, value]) => {
      root.style.setProperty(`--info-${key}`, value);
    });

    // Ajouter une transition fluide pour le changement de thème
    root.style.transition = 'background-color 0.3s ease-in-out, color 0.3s ease-in-out';

  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = getThemeColors(theme);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook pour utiliser le contexte de thème
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Hook pour obtenir les couleurs du thème actuel
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

// Hook pour vérifier si le thème est sombre
export function useIsDark() {
  const { theme } = useTheme();
  return theme === 'dark';
}

// Composant pour appliquer les styles de thème
interface ThemeStylesProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeStyles({ children, className = '' }: ThemeStylesProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`theme-transition ${theme} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les cartes avec thème
interface ThemeCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function ThemeCard({ children, className = '', elevated = false }: ThemeCardProps) {
  const { theme } = useTheme();
  
  const baseClasses = 'theme-transition rounded-lg border';
  const themeClasses = theme === 'dark' 
    ? 'bg-slate-800 border-slate-700' 
    : 'bg-white border-slate-200';
  const elevationClasses = elevated 
    ? 'shadow-lg' 
    : 'shadow-sm';

  return (
    <div className={`${baseClasses} ${themeClasses} ${elevationClasses} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les boutons avec thème
interface ThemeButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ThemeButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
}: ThemeButtonProps) {
  const { theme } = useTheme();
  
  const baseClasses = 'theme-transition inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: theme === 'dark' 
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500'
      : 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
    outline: theme === 'dark'
      ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-primary-500'
      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-primary-500',
    ghost: theme === 'dark'
      ? 'text-slate-100 hover:bg-slate-700 focus:ring-primary-500'
      : 'text-slate-700 hover:bg-slate-100 focus:ring-primary-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default ThemeProvider;
