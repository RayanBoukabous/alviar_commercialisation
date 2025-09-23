import { apiClient } from './client';
import { RequestLog, LogStats, LogsResponse } from '@/types';

export interface GetRequestLogsParams {
    lines?: string;
    level?: string;
    service?: string;
    userId?: string;
    from?: string;
    to?: string;
    message?: string;
    page?: number;
    size?: number;
}

export interface GetLogStatsParams {
    startDate?: string;
    endDate?: string;
    service?: string;
}

class LogsService {
    /**
     * Récupère les logs de requêtes (route /logs/search)
     */
    async getRequestLogs(params: GetRequestLogsParams = {}): Promise<LogsResponse> {
        const queryParams = new URLSearchParams();

        if (params.level) queryParams.append('level', params.level);
        if (params.service) queryParams.append('service', params.service);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        if (params.message) queryParams.append('message', params.message);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());

        const response = await apiClient.get(`/logs/search?${queryParams.toString()}`);
        // L'API retourne directement les données, pas dans un objet ApiResponse
        return response as LogsResponse;
    }

    /**
     * Récupère les logs de requêtes spécifiques (route /logs/request-logs)
     */
    async getRequestLogsSpecific(params: GetRequestLogsParams = {}): Promise<LogsResponse> {
        const queryParams = new URLSearchParams();

        if (params.lines) queryParams.append('lines', params.lines);
        if (params.level) queryParams.append('level', params.level);
        if (params.service) queryParams.append('service', params.service);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        if (params.message) queryParams.append('message', params.message);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());

        const response = await apiClient.get(`/logs/request-logs?${queryParams.toString()}`);
        // L'API retourne directement les données, pas dans un objet ApiResponse
        return response as LogsResponse;
    }

    /**
     * Récupère les statistiques des logs
     */
    async getLogStats(params: GetLogStatsParams = {}): Promise<LogStats> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.service) queryParams.append('service', params.service);

        const response = await apiClient.get(`/logs/stats?${queryParams.toString()}`);
        // L'API retourne directement les données, pas dans un objet ApiResponse
        return response as LogStats;
    }

    /**
     * Récupère un log spécifique par ID
     */
    async getLogById(id: string): Promise<RequestLog> {
        const response = await apiClient.get(`/logs/${id}`);
        // L'API retourne directement les données, pas dans un objet ApiResponse
        return response as RequestLog;
    }

    /**
     * Exporte les logs au format CSV
     */
    async exportLogs(params: GetRequestLogsParams = {}): Promise<Blob> {
        const queryParams = new URLSearchParams();

        if (params.lines) queryParams.append('lines', params.lines.toString());
        if (params.level) queryParams.append('level', params.level);
        if (params.service) queryParams.append('service', params.service);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        const response = await apiClient.get(`/logs/export?${queryParams.toString()}`, {
            responseType: 'blob'
        });
        // Pour les blobs, on retourne directement la réponse
        return response as Blob;
    }
}

export const logsService = new LogsService();
