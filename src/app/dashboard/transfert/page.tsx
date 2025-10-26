'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ArrowRightLeft,
  Calendar,
  MapPin,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Activity,
  Truck,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTransfertPage } from '@/lib/hooks/useTransfertPage';
import { 
  CreateTransfertModal, 
  TransfertTable, 
  TransfertFilters 
} from '@/components/transfert';


export default function TransfertPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  
  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Hook personnalisé pour la gestion de la page
  const {
    searchTerm,
    statusFilter,
    abattoirFilter,
    refreshing,
    deletingTransfertId,
    isCreateModalOpen,
    loading,
    error,
    transferts,
    abattoirs,
    setSearchTerm,
    setStatusFilter,
    setAbattoirFilter,
    setIsCreateModalOpen,
    handleRefresh,
    handleDeleteTransfert,
    handleRetry,
  } = useTransfertPage({ isRTL });

  // Handlers spécifiques à la page
  const handleViewTransfert = useCallback((transfert: any) => {
    router.push(`/dashboard/transfert/${transfert.id}`);
  }, [router]);

  const handleEditTransfert = useCallback((transfert: any) => {
    // TODO: Implémenter la modification
    console.log('Modifier transfert:', transfert);
  }, []);

  // États de chargement
  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ArrowRightLeft className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'النقل' : 'Transfert'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة نقل الماشية بين المجازر' : 'Gestion des transferts de bétail entre abattoirs'}
                </p>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة نقل' : 'Nouveau transfert'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <TransfertFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          abattoirFilter={abattoirFilter}
          isRTL={isRTL}
          abattoirs={abattoirs}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onAbattoirChange={setAbattoirFilter}
        />

        {/* Table */}
        <div className="px-6 py-6">
          <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
            <TransfertTable
              transferts={transferts}
              loading={loading}
              error={error}
              isRTL={isRTL}
              onView={handleViewTransfert}
              onEdit={handleEditTransfert}
              onDelete={handleDeleteTransfert}
              onRetry={handleRetry}
              deletingTransfertId={deletingTransfertId}
            />
          </div>
        </div>

        {/* Modal de création */}
        <CreateTransfertModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </Layout>
  );
}