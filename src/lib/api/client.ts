import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { DEFAULT_HEADERS, getAuthHeaders, HTTP_STATUS, API_ERROR_TYPES, RETRY_CONFIG, TIMEOUT_CONFIG } from '@/lib/config/api';
import { tokenManager } from '@/lib/auth/tokenManager';
import { ApiResponse, ApiError } from '@/types';

class ApiClient {
    private client: any;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.baseURL,
            timeout: TIMEOUT_CONFIG.DEFAULT,
            headers: DEFAULT_HEADERS,
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config: any) => {
                // Ajouter le token d'authentification si disponible
                const token = this.getAuthToken();

                console.log('🔍 API Request:', {
                    url: config.url,
                    method: config.method,
                    hasToken: !!token,
                    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
                });

                if (token) {
                    config.headers = {
                        ...config.headers,
                        ...getAuthHeaders(token),
                    };
                } else {
                    console.warn('⚠️ No authentication token found for request:', config.url);
                }

                // Ajouter des métadonnées de requête
                config.metadata = {
                    startTime: Date.now(),
                };

                return config;
            },
            (error: any) => {
                return Promise.reject(this.handleError(error));
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Calculer le temps de réponse
                const endTime = Date.now();
                const startTime = response.config.metadata?.startTime;
                if (startTime) {
                    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${endTime - startTime}ms)`);
                }

                // S'assurer que response.data est préservé
                const originalData = response.data;
                response.data = originalData;

                return response;
            },
            (error: AxiosError) => {
                // Gestion spéciale des erreurs 403 (Forbidden)
                if (error.response?.status === 403) {
                    console.error('🚫 Access Forbidden (403):', {
                        url: error.config?.url,
                        method: error.config?.method,
                        message: error.response?.data?.message || 'Forbidden resource',
                        code: error.response?.data?.code || 'AUTHORIZATION_ERROR'
                    });
                }

                return Promise.reject(this.handleError(error));
            }
        );
    }

    private getAuthToken(): string | null {
        return tokenManager.getToken();
    }

    private handleError(error: any): ApiError {
        const apiError: ApiError = {
            message: ERROR_MESSAGES.UNKNOWN_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            code: API_ERROR_TYPES.UNKNOWN_ERROR,
        };

        if (error.response) {
            // Erreur de réponse du serveur
            apiError.status = error.response.status;
            apiError.message = error.response.data?.message || this.getErrorMessage(error.response.status);
            apiError.details = error.response.data;
            apiError.code = this.getErrorCode(error.response.status);
        } else if (error.request) {
            // Erreur de réseau
            apiError.message = ERROR_MESSAGES.NETWORK_ERROR;
            apiError.status = 0;
            apiError.code = API_ERROR_TYPES.NETWORK_ERROR;
        } else if (error.code === 'ECONNABORTED') {
            // Timeout
            apiError.message = ERROR_MESSAGES.TIMEOUT;
            apiError.status = 0;
            apiError.code = API_ERROR_TYPES.TIMEOUT_ERROR;
        } else {
            // Autre erreur
            apiError.message = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        }

        // Gérer les erreurs d'authentification
        if (apiError.status === HTTP_STATUS.UNAUTHORIZED) {
            this.handleUnauthorized();
        }

        return apiError;
    }

    private getErrorMessage(status: number): string {
        switch (status) {
            case HTTP_STATUS.BAD_REQUEST:
                return ERROR_MESSAGES.VALIDATION_ERROR;
            case HTTP_STATUS.UNAUTHORIZED:
                return ERROR_MESSAGES.UNAUTHORIZED;
            case HTTP_STATUS.FORBIDDEN:
                return ERROR_MESSAGES.FORBIDDEN;
            case HTTP_STATUS.NOT_FOUND:
                return ERROR_MESSAGES.NOT_FOUND;
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return ERROR_MESSAGES.SERVER_ERROR;
            default:
                return ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }

    private getErrorCode(status: number): string {
        switch (status) {
            case HTTP_STATUS.BAD_REQUEST:
                return API_ERROR_TYPES.VALIDATION_ERROR;
            case HTTP_STATUS.UNAUTHORIZED:
                return API_ERROR_TYPES.AUTHENTICATION_ERROR;
            case HTTP_STATUS.FORBIDDEN:
                return API_ERROR_TYPES.AUTHORIZATION_ERROR;
            case HTTP_STATUS.NOT_FOUND:
                return API_ERROR_TYPES.NOT_FOUND_ERROR;
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return API_ERROR_TYPES.SERVER_ERROR;
            default:
                return API_ERROR_TYPES.UNKNOWN_ERROR;
        }
    }

    private handleUnauthorized(): void {
        // Supprimer le token d'authentification
        tokenManager.clearToken();

        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    // Méthodes HTTP
    async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.get<ApiResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.post<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.put<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.patch<ApiResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.delete<ApiResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Méthode pour les uploads de fichiers
    async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await this.client.post<ApiResponse<T>>(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: any) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Méthode pour les requêtes avec retry
    async requestWithRetry<T = any>(
        requestFn: () => Promise<ApiResponse<T>>,
        retries: number = RETRY_CONFIG.MAX_ATTEMPTS
    ): Promise<ApiResponse<T>> {
        try {
            return await requestFn();
        } catch (error) {
            if (retries > 0 && this.shouldRetry(error as ApiError)) {
                const delay = Math.min(
                    RETRY_CONFIG.DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, RETRY_CONFIG.MAX_ATTEMPTS - retries),
                    RETRY_CONFIG.MAX_DELAY
                );
                await this.delay(delay);
                return this.requestWithRetry(requestFn, retries - 1);
            }
            throw error;
        }
    }

    private shouldRetry(error: ApiError): boolean {
        // Retry pour les erreurs de réseau et les erreurs 5xx
        return error.status === 0 ||
            error.code === API_ERROR_TYPES.NETWORK_ERROR ||
            error.code === API_ERROR_TYPES.TIMEOUT_ERROR ||
            (error.status >= 500 && error.status < 600);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Méthode pour annuler les requêtes (utilise AbortController moderne)
    createAbortController() {
        return new AbortController();
    }

    // Méthode pour obtenir l'instance axios (pour des cas spéciaux)
    getAxiosInstance(): any {
        return this.client;
    }
}

// Instance singleton
export const apiClient = new ApiClient();

// Export des types pour l'utilisation
export type { ApiResponse, ApiError };
