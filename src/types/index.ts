// Types de base pour l'application

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
  status?: number;
}

// Types spécifiques pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResponse {
  access_token: string;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les métriques du dashboard
export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  conversionRate: number;
  revenue: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Types pour les composants UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// Types pour les formulaires
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: string | number | boolean | File | null | undefined;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types pour la navigation
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Types pour les tables
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationParams;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  className?: string;
}

// Types pour les modales
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Types pour les filtres
export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: SelectOption[];
  placeholder?: string;
}

export interface FilterState {
  [key: string]: any;
}

// Types pour les exports
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Types pour les configurations
export type ConfigType = 'liveness' | 'matching' | 'silent-liveness';

// Configuration de base commune à tous les types
export interface BaseConfig {
  id: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Configuration Liveness
export interface LivenessConfig extends BaseConfig {
  type: 'liveness';
  requiredMovements: string[];
  movementCount: number;
  movementDurationSec: number;
  fps: number;
  timeoutSec: number;
}

// Configuration Matching
export interface MatchingConfig extends BaseConfig {
  type: 'matching';
  distanceMethod: string;
  threshold: number;
  minimumConfidence: number;
  maxAngle: number;
  enablePreprocessing: boolean;
  enableFraudCheck: boolean;
}

// Configuration Silent Liveness
export interface SilentLivenessConfig extends BaseConfig {
  type: 'silent-liveness';
  fps: number;
  timeoutSec: number;
  minFrames: number;
  minDurationSec: number;
  decisionThreshold: number;
}

// Admin types
export interface Admin {
  id: number;
  email: string;
  username: string;
  fullName: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  lastLogout: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export interface CreateAdminRequest {
  email: string;
  username: string;
  fullName: string;
  password: string;
  roleId: number;
}

export interface UpdateAdminRequest {
  email?: string;
  username?: string;
  fullName?: string;
}

// Union type pour toutes les configurations
export type Config = LivenessConfig | MatchingConfig | SilentLivenessConfig;

// Types pour les requêtes de création
export interface CreateLivenessConfigRequest {
  requiredMovements: string[];
  movementCount: number;
  movementDurationSec: number;
  fps: number;
  timeoutSec: number;
}

export interface CreateMatchingConfigRequest {
  distanceMethod: string;
  threshold: number;
  minimumConfidence: number;
  maxAngle: number;
  enablePreprocessing: boolean;
  enableFraudCheck: boolean;
}

export interface CreateSilentLivenessConfigRequest {
  fps: number;
  timeoutSec: number;
  minFrames: number;
  minDurationSec: number;
  decisionThreshold: number;
}

// Types pour les requêtes de mise à jour
export interface UpdateLivenessConfigRequest extends CreateLivenessConfigRequest {
  id: string;
}
export interface UpdateMatchingConfigRequest extends CreateMatchingConfigRequest {
  id: string;
}
export interface UpdateSilentLivenessConfigRequest extends CreateSilentLivenessConfigRequest {
  id: string;
}

// Union types pour les requêtes
export type CreateConfigRequest = CreateLivenessConfigRequest | CreateMatchingConfigRequest | CreateSilentLivenessConfigRequest;
export type UpdateConfigRequest = UpdateLivenessConfigRequest | UpdateMatchingConfigRequest | UpdateSilentLivenessConfigRequest;

// Réponse de l'API pour les configurations
export interface ConfigsResponse<T extends Config = Config> {
  configs: T[];
  total: number;
  page: number;
  limit: number;
}

// Réponse de l'API pour les administrateurs
export interface AdminsResponse {
  admins: Admin[];
  total: number;
  page: number;
  limit: number;
}

// Types pour les utilisateurs
export interface User {
  id: number;
  clientId: number;
  externalUserId: string;
  username: string;
  fullName: string;
  totalRequests: number;
  lastRequestAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Types pour les clients avec la nouvelle structure
export interface ClientKey {
  id: number;
  key: string;
  isActive: boolean;
}

export interface PaymentPlan {
  id: number;
  name: string;
}

export interface Distributor {
  id: number;
  name: string;
}

export interface ClientCounts {
  keys: number;
  users: number;
  livenessSessions: number;
  livenessResults: number;
}

export interface Client {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  paymentPlanId: number;
  distributorId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  paymentPlan: PaymentPlan;
  distributor: Distributor;
  keys: ClientKey[];
  livenessConfig: LivenessConfig | null;
  matchingConfig: MatchingConfig | null;
  silentLivenessConfig: SilentLivenessConfig | null;
  users: User[];
  _count: ClientCounts;
  apiKeysCount: number;
}

// Types pour les requêtes d'utilisateurs
export interface CreateUserRequest {
  clientId: number;
  externalUserId: string;
  username: string;
  fullName: string;
}

export interface UpdateUserRequest {
  clientId?: number;
  externalUserId?: string;
  username?: string;
  fullName?: string;
}

// Réponse de l'API pour les utilisateurs
export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// Types pour les rôles et permissions
export interface Permission {
  id: number;
  name: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  permission: Permission;
}

export interface Admin {
  id: number;
  email: string;
  username: string;
}

export interface RoleCounts {
  admins: number;
  permissions: number;
}

export interface Role {
  id: number;
  name: string;
  permissions?: RolePermission[];
  _count?: RoleCounts;
  admins?: Admin[];
}

// Réponse de l'API pour les rôles
export interface RolesResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
}
