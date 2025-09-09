// Constantes de l'application
export const APP_CONFIG = {
  name: 'Liveness Dashboard',
  version: '1.0.0',
  description: 'Dashboard professionnel pour la gestion des données de liveness',
  author: 'Rayan',
} as const;

// Configuration API
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://aiuniversfs.ddns.net:7000/api/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Configuration des couleurs du thème
export const THEME_COLORS = {
  primary: {
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
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
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
} as const;

// Configuration des breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Configuration des animations
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
  FORBIDDEN: 'Accès interdit.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides.',
  TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  SAVED: 'Données sauvegardées avec succès.',
  UPDATED: 'Données mises à jour avec succès.',
  DELETED: 'Élément supprimé avec succès.',
  CREATED: 'Élément créé avec succès.',
  EXPORTED: 'Données exportées avec succès.',
  IMPORTED: 'Données importées avec succès.',
} as const;

// Configuration des formats de date
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DD',
} as const;

// Configuration des formats de nombre
export const NUMBER_FORMATS = {
  CURRENCY: {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  },
  PERCENTAGE: {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  },
  DECIMAL: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
} as const;

// Configuration des limites
export const LIMITS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  SEARCH: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    DEBOUNCE_DELAY: 300,
  },
} as const;

// Configuration des rôles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

// Configuration des permissions
export const PERMISSIONS = {
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  DASHBOARD: {
    READ: 'dashboard:read',
    EXPORT: 'dashboard:export',
  },
  SETTINGS: {
    READ: 'settings:read',
    UPDATE: 'settings:update',
  },
} as const;

// Configuration des localStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  DASHBOARD_FILTERS: 'dashboard_filters',
} as const;
