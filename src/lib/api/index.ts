// Export principal de la couche API
export { apiClient } from './client';
export { apiServices } from './services';
export { livenessService } from './livenessService';
export { clientsService } from './clientsService';
export { configsService } from './configsService';
export { adminsService } from './adminsService';
export { usersService } from './usersService';
export type { ApiResponse, ApiError } from './client';

// Re-exports des services individuels pour faciliter l'import
export {
  authService,
  userService,
  dashboardService,
  analyticsService,
  settingsService,
  notificationService,
  logService,
} from './services';

// Re-exports des types de liveness
export type {
  LivenessSession,
  LivenessMetrics,
  LivenessFilters,
} from './livenessService';

// Re-exports des types de clients
export type {
  Client,
  CreateClientRequest,
  ClientsResponse,
  PaymentPlan,
} from './clientsService';

// Re-exports des types de configs
export type {
  Config,
  ConfigType,
  LivenessConfig,
  MatchingConfig,
  SilentLivenessConfig,
  CreateLivenessConfigRequest,
  CreateMatchingConfigRequest,
  CreateSilentLivenessConfigRequest,
  UpdateLivenessConfigRequest,
  UpdateMatchingConfigRequest,
  UpdateSilentLivenessConfigRequest,
  ConfigsResponse,
} from '@/types';

// Re-exports des types d'admins
export type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
} from '@/types';

// Re-exports des types d'utilisateurs
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types';
