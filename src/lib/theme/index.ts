// Configuration des thèmes
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Couleurs principales
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Couleurs de fond
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };

  // Couleurs de texte
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // Couleurs de bordure
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };

  // Couleurs d'état
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  info: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// Thème clair (Blanc/Vert)
export const lightTheme: ThemeColors = {
  primary: {
    50: '#f0fdf4',   // Vert très clair
    100: '#dcfce7',  // Vert clair
    200: '#bbf7d0',  // Vert clair
    300: '#86efac',  // Vert moyen clair
    400: '#4ade80',  // Vert moyen
    500: '#22c55e',  // Vert principal
    600: '#16a34a',  // Vert foncé
    700: '#15803d',  // Vert très foncé
    800: '#166534',  // Vert sombre
    900: '#14532d',  // Vert très sombre
  },

  background: {
    primary: '#ffffff',     // Blanc pur
    secondary: '#f8fafc',   // Gris très clair
    tertiary: '#f1f5f9',    // Gris clair
    elevated: '#ffffff',    // Blanc pour les cartes
  },

  text: {
    primary: '#0f172a',     // Noir profond
    secondary: '#475569',   // Gris foncé
    tertiary: '#64748b',    // Gris moyen
    inverse: '#ffffff',     // Blanc
  },

  border: {
    primary: '#e2e8f0',     // Gris clair
    secondary: '#cbd5e1',   // Gris moyen
    focus: '#22c55e',       // Vert principal
  },

  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};

// Thème sombre (Gris foncé/Vert)
export const darkTheme: ThemeColors = {
  primary: {
    50: '#1a1a1a',   // Gris très foncé
    100: '#2d2d2d',  // Gris foncé
    200: '#404040',  // Gris moyen foncé
    300: '#525252',  // Gris moyen
    400: '#737373',  // Gris clair
    500: '#22c55e',  // Vert principal
    600: '#16a34a',  // Vert foncé
    700: '#15803d',  // Vert très foncé
    800: '#166534',  // Vert sombre
    900: '#14532d',  // Vert très sombre
  },

  background: {
    primary: '#1a1a1a',     // Gris très foncé
    secondary: '#2d2d2d',   // Gris foncé
    tertiary: '#404040',    // Gris moyen foncé
    elevated: '#2d2d2d',    // Gris foncé pour les cartes
  },

  text: {
    primary: '#f5f5f5',     // Blanc cassé
    secondary: '#d4d4d4',   // Gris clair
    tertiary: '#a3a3a3',    // Gris moyen
    inverse: '#1a1a1a',     // Gris très foncé
  },

  border: {
    primary: '#404040',     // Gris moyen foncé
    secondary: '#525252',   // Gris moyen
    focus: '#22c55e',       // Vert principal
  },

  success: {
    50: '#1a1a1a',
    100: '#2d2d2d',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#1a1a1a',
    100: '#2d2d2d',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#1a1a1a',
    100: '#2d2d2d',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#1a1a1a',
    100: '#2d2d2d',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};

// Configuration des thèmes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// Fonction pour obtenir les couleurs du thème actuel
export function getThemeColors(theme: Theme): ThemeColors {
  return themes[theme];
}

// Fonction pour obtenir la couleur CSS d'une propriété de thème
export function getThemeColor(theme: Theme, path: string): string {
  const colors = getThemeColors(theme);
  const keys = path.split('.');
  let value: any = colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Theme color not found: ${path}`);
      return '#000000';
    }
  }

  return value;
}

// Classes CSS pour les thèmes
export const themeClasses = {
  light: {
    background: 'bg-white',
    text: 'text-slate-900',
    border: 'border-slate-200',
    card: 'bg-white border-slate-200',
    input: 'bg-white border-slate-300 text-slate-900',
    button: {
      primary: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
      outline: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    },
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
    card: 'bg-gray-800 border-gray-700',
    input: 'bg-gray-800 border-gray-600 text-gray-100',
    button: {
      primary: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
      outline: 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700',
    },
  },
} as const;

// Configuration des transitions
export const themeTransitions = {
  duration: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
