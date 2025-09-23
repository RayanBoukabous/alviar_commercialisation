'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Hash,
  MessageSquare,
  Server
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { logsService, RequestLog } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function LogsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading } = useTranslation('logs');
  const router = useRouter();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 20,
    totalPages: 0,
  });
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    level: '',
    service: '',
    userId: '',
    from: '',
    to: '',
    message: '',
    page: 1,
    size: 20,
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔄 Début du chargement des logs...');
        
        // Préparer les paramètres de filtrage
        const params: any = {};
        if (filters.level) params.level = filters.level;
        if (filters.service) params.service = filters.service;
        if (filters.userId) params.userId = filters.userId;
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        if (filters.message) params.message = filters.message;
        if (filters.page) params.page = filters.page;
        if (filters.size) params.size = filters.size;
        
        console.log('🔍 Paramètres de filtrage:', params);
        
        const response = await logsService.getRequestLogs(params);
        console.log('📊 Réponse complète de l\'API:', response);
        console.log('📋 Logs dans la réponse:', response.logs);
        console.log('📊 Pagination:', {
          total: response.total,
          page: response.page,
          size: response.size,
          totalPages: response.totalPages
        });
        
        setLogs(response.logs || []);
        setPagination({
          total: response.total,
          page: response.page,
          size: response.size,
          totalPages: response.totalPages || Math.ceil(response.total / response.size),
        });
        
        console.log('✅ Logs chargés avec succès:', response.logs?.length || 0, 'éléments');
      } catch (err) {
        console.error('❌ Erreur lors du chargement des logs:', err);
        setError(t('loading_error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, filters]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Utiliser les filtres actuels pour le rafraîchissement
      const params: any = {};
      if (filters.level) params.level = filters.level;
      if (filters.service) params.service = filters.service;
      if (filters.userId) params.userId = filters.userId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.message) params.message = filters.message;
      if (filters.page) params.page = filters.page;
      if (filters.size) params.size = filters.size;
      
      const response = await logsService.getRequestLogs(params);
      setLogs(response.logs || []);
      setPagination({
        total: response.total,
        page: response.page,
        size: response.size,
        totalPages: response.totalPages || Math.ceil(response.total / response.size),
      });
      console.log('Logs rafraîchis:', response);
    } catch (err) {
      setError(t('refresh_error'));
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewLog = (log: RequestLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000); // Hide after 3 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Gestion des filtres
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      level: '',
      service: '',
      userId: '',
      from: '',
      to: '',
      message: '',
      page: 1,
      size: 20,
    });
  };

  // Debug: Log des états
  console.log('🔍 État des logs:', {
    totalLogs: logs.length,
    filters,
    loading,
    error
  });

  const getLogLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    const levelConfig = {
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'ERROR' },
      warn: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'WARN' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'WARN' },
      info: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'INFO' },
      success: { bg: 'bg-green-100', text: 'text-green-800', label: 'SUCCESS' }
    };
    
    const config = levelConfig[level.toLowerCase() as keyof typeof levelConfig] || { bg: 'bg-gray-100', text: 'text-gray-800', label: level.toUpperCase() };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition">
      {/* Header */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                <FileText className="h-7 w-7 mr-3 text-primary-600" />
                {t('title')}
              </h1>
              <p className="mt-1 theme-text-secondary theme-transition">{t('request_logs')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 theme-text-primary" />
              <h3 className="text-lg font-semibold theme-text-primary">{t('filters.title')}</h3>
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('filters.clear_all')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Message Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('filters.message')}
              </label>
              <input
                type="text"
                placeholder={t('filters.message_placeholder')}
                value={filters.message}
                onChange={(e) => handleFilterChange('message', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Level Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('filters.level')}
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="">{t('filters.all_levels')}</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            {/* Service Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <Server className="h-4 w-4 mr-2" />
                {t('filters.service')}
              </label>
              <input
                type="text"
                placeholder={t('filters.service_placeholder')}
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>

            {/* User ID Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <Hash className="h-4 w-4 mr-2" />
                {t('filters.user_id')}
              </label>
              <input
                type="text"
                placeholder={t('filters.user_id_placeholder')}
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <CalendarDays className="h-4 w-4 mr-2" />
                {t('filters.date_from')}
              </label>
              <input
                type="datetime-local"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <CalendarDays className="h-4 w-4 mr-2" />
                {t('filters.date_to')}
              </label>
              <input
                type="datetime-local"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>

            {/* Page Size Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <Hash className="h-4 w-4 mr-2" />
                {t('filters.page_size')}
              </label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium theme-text-secondary">
                <Search className="h-4 w-4 mr-2" />
                {t('filters.actions')}
              </label>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t('filters.searching') : t('filters.search')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-5 w-5 text-green-500 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-6">
        <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y theme-border-secondary theme-transition">
                <thead className="theme-bg-secondary theme-transition">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('level')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('service')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('message')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('timestamp')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                  {logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:theme-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            {getLogLevelIcon(log.level)}
                          </div>
                          <div className="ml-4">
                            {getLogLevelBadge(log.level)}
                            <div className="text-sm theme-text-secondary theme-transition">ID: {log.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-900 px-3 py-1.5 rounded-full font-semibold shadow-sm">
                          {log.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm theme-text-primary theme-transition max-w-md truncate">
                          {log.message}
                        </div>
                        {log.metadata && (
                          <div className="text-xs theme-text-secondary theme-transition mt-1">
                            {Object.keys(log.metadata).length} {t('table.metadata_count')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewLog(log)}
                            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                            title={t('table.view_details')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {logs.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('no_logs')}</h3>
              <p className="theme-text-secondary theme-transition">{t('no_logs_message')}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="px-6 py-4 border-t theme-border-primary theme-bg-elevated">
            <div className="flex items-center justify-between">
              <div className="text-sm theme-text-secondary">
                {t('pagination.showing')} {((pagination.page - 1) * pagination.size) + 1} {t('pagination.to')} {Math.min(pagination.page * pagination.size, pagination.total)} {t('pagination.of')} {pagination.total} {t('pagination.results')}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', (pagination.page - 1).toString())}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border rounded-lg theme-border-primary theme-text-primary hover:theme-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('pagination.previous')}
                </button>
                <span className="px-3 py-1 text-sm theme-text-primary">
                  {t('pagination.page')} {pagination.page} {t('pagination.on')} {pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => handleFilterChange('page', (pagination.page + 1).toString())}
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="px-3 py-1 text-sm border rounded-lg theme-border-primary theme-text-primary hover:theme-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('pagination.next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal de détails du log */}
      {isModalOpen && selectedLog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="theme-bg-elevated rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto theme-transition"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-6 border-b theme-border-primary">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  {getLogLevelIcon(selectedLog.level)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                    {t('modal.title')}
                  </h2>
                  <p className="text-sm theme-text-secondary theme-transition">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="theme-text-tertiary hover:theme-text-primary theme-transition"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Contenu de la modal */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Niveau */}
                <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 theme-text-tertiary theme-transition" />
                    <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.level')}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getLogLevelIcon(selectedLog.level)}
                    {getLogLevelBadge(selectedLog.level)}
                  </div>
                </div>

                {/* Card Service */}
                <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                  <div className="flex items-center space-x-2 mb-2">
                    <Server className="h-5 w-5 theme-text-tertiary theme-transition" />
                    <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.service')}</h3>
                  </div>
                  <span className="font-mono text-sm bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-900 px-3 py-1.5 rounded-full font-semibold shadow-sm">
                    {selectedLog.service}
                  </span>
                </div>

                {/* Card Timestamp */}
                <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarDays className="h-5 w-5 theme-text-tertiary theme-transition" />
                    <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.timestamp')}</h3>
                  </div>
                  <p className="text-sm theme-text-primary theme-transition">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                  <p className="text-xs theme-text-tertiary theme-transition mt-1">
                    {selectedLog.timestamp}
                  </p>
                </div>

                {/* Card ID */}
                <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="h-5 w-5 theme-text-tertiary theme-transition" />
                    <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.log_id')}</h3>
                  </div>
                  <p className="text-sm font-mono theme-text-primary theme-transition break-all">
                    {selectedLog.id}
                  </p>
                </div>
              </div>

              {/* Card Message */}
              <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="h-5 w-5 theme-text-tertiary theme-transition" />
                  <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.message')}</h3>
                </div>
                <div className="theme-bg-elevated rounded-lg p-4 border theme-border-primary theme-transition">
                  <p className="theme-text-primary theme-transition whitespace-pre-wrap">
                    {selectedLog.message}
                  </p>
                </div>
              </div>

              {/* Card Métadonnées */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="theme-bg-secondary rounded-lg p-4 theme-transition">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="h-5 w-5 theme-text-tertiary theme-transition" />
                    <h3 className="font-semibold theme-text-primary theme-transition">{t('modal.metadata')}</h3>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                      {Object.keys(selectedLog.metadata).length} {t('modal.elements')}
                    </span>
                  </div>
                  <div className="theme-bg-elevated rounded-lg p-4 border theme-border-primary theme-transition">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedLog.metadata).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium theme-text-tertiary theme-transition uppercase tracking-wide">
                              {key}
                            </span>
                          </div>
                          <div className="theme-bg-secondary rounded-lg p-3 theme-transition">
                            <p className="text-sm theme-text-primary theme-transition break-all">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t theme-border-primary">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 theme-text-primary theme-bg-secondary rounded-lg hover:theme-bg-elevated theme-transition"
                >
                  {t('modal.close')}
                </button>
                <button
                  onClick={handleCopyJSON}
                  className="px-4 py-2 theme-text-primary theme-bg-secondary rounded-lg hover:theme-bg-elevated theme-transition"
                >
                  {t('modal.copy_json')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de confirmation de copie */}
      {showCopyToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{t('toast.copied')}</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
