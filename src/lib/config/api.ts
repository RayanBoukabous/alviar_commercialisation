// Configuration centralisée de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh',
  },
  
  // Utilisateurs
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    BY_ID: (id: string) => `/users/${id}`,
  },
  
  // Dashboard
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    CHARTS: (type: string) => `/dashboard/charts/${type}`,
    LIVENESS_DATA: '/dashboard/liveness',
    EXPORT: '/dashboard/export',
  },
  
  // Analytics
  ANALYTICS: {
    STATS: '/analytics/stats',
    PERFORMANCE: '/analytics/performance',
    CONVERSION: '/analytics/conversion',
    GEO: '/analytics/geo',
  },
  
  // Paramètres
  SETTINGS: {
    BASE: '/settings',
    PREFERENCES: '/settings/preferences',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    BY_ID: (id: string) => `/notifications/${id}`,
  },
  
  // Logs
  LOGS: {
    BASE: '/logs',
    ERRORS: '/logs/errors',
    EXPORT: '/logs/export',
  },
  
  // Liveness
  LIVENESS: {
    BASE: '/liveness',
    SESSIONS: '/liveness/sessions',
    VERIFY: '/liveness/verify',
    HISTORY: '/liveness/history',
    BY_ID: (id: string) => `/liveness/${id}`,
  },
  
  // Rapports
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
  },
} as const;

// Configuration des headers par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Headers pour les requêtes authentifiées
export const getAuthHeaders = (token: string) => ({
  ...DEFAULT_HEADERS,
  'Authorization': `Bearer ${token}`,
});

// Configuration des codes de statut HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Types d'erreurs API
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Configuration des retry
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000,
  BACKOFF_FACTOR: 2,
  MAX_DELAY: 10000,
} as const;

// Configuration des timeouts
export const TIMEOUT_CONFIG = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
  LONG_RUNNING: 120000,
} as const;
