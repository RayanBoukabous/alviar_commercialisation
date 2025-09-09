// Export principal de la couche API
export { apiClient } from './client';
export { apiServices } from './services';
export { livenessService } from './livenessService';
export { clientsService } from './clientsService';
export { configsService } from './configsService';
export { adminsService } from './adminsService';
export { usersService } from './usersService';
export { RolesService as rolesService } from './rolesService';
export { PermissionsService as permissionsService } from './permissionsService';
export { PaymentPlansService as paymentPlansService } from './paymentPlansService';
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
  LegacyLivenessSession,
  LivenessMetrics,
  LivenessFilters,
} from './livenessService';

// Re-exports des nouveaux types de liveness
export type {
  LivenessSession,
  LivenessResult,
  LivenessFrame,
} from '@/types';

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

// Re-exports des types de permissions et rôles
export type {
  Permission,
  Role,
  RolePermission,
  RolesResponse,
} from '@/types';

// Re-exports des types de payment plans
export type {
  PaymentPlan as PaymentPlanType,
  BillingCycle,
  Currency,
  BillingCyclesAndCurrencies,
  CreatePaymentPlanRequest,
} from './paymentPlansService';
