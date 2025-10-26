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
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Package,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Activity,
  Truck
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useReceptions } from '@/lib/hooks/useReceptions';
import { Reception } from '@/lib/api/receptionService';

export default function ReceptionPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingReceptionId, setDeletingReceptionId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Hooks pour les réceptions
  const { data: receptionsData, isLoading: loading, error, refetch } = useReceptions({
    search: searchTerm || undefined,
    statut: statusFilter || undefined,
  });

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refetch]);

  // Rafraîchissement forcé au focus de la page
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Indicateur de rafraîchissement automatique
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const receptions = receptionsData?.results || [];

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewReception = (reception: Reception) => {
    router.push(`/dashboard/reception/${reception.id}`);
  };

  const handleEditReception = (reception: Reception) => {
    // TODO: Implémenter la modification
    console.log('Modifier réception:', reception);
  };

  const handleDeleteReception = async (receptionId: number, receptionName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la réception "${receptionName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReceptionId(receptionId);
      // TODO: Implémenter la suppression via l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`Réception "${receptionName}" supprimée avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`Réception ${receptionName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la réception:', err);
    } finally {
      setDeletingReceptionId(null);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'EN_ATTENTE': { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        border: 'border-orange-300 dark:border-orange-700',
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      'EN_ROUTE': { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'في الطريق' : 'En route',
        icon: Truck
      },
      'EN_COURS': { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        border: 'border-blue-300 dark:border-blue-700',
        label: isRTL ? 'قيد المعالجة' : 'En cours',
        icon: Activity
      },
      'RECU': { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        border: 'border-green-300 dark:border-green-700',
        label: isRTL ? 'مكتمل' : 'Reçu',
        icon: CheckCircle
      },
      'PARTIEL': { 
        bg: 'bg-yellow-200 dark:bg-yellow-900/50', 
        text: 'text-yellow-900 dark:text-yellow-100', 
        border: 'border-yellow-300 dark:border-yellow-700',
        label: isRTL ? 'جزئي' : 'Partiel',
        icon: AlertCircle
      },
      'ANNULE': { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        border: 'border-red-300 dark:border-red-700',
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAbattoirs = () => {
    const abattoirs = new Set();
    receptions.forEach(reception => {
      // Vérification de sécurité pour abattoir_expediteur (priorité aux données directes, puis transfert)
      const expediteur = reception.abattoir_expediteur || reception.transfert?.abattoir_expediteur;
      if (expediteur && expediteur.id && expediteur.nom) {
        abattoirs.add(JSON.stringify({ id: expediteur.id, name: expediteur.nom }));
      }
      
      // Vérification de sécurité pour abattoir_destinataire (priorité aux données directes, puis transfert)
      const destinataire = reception.abattoir_destinataire || reception.transfert?.abattoir_destinataire;
      if (destinataire && destinataire.id && destinataire.nom) {
        abattoirs.add(JSON.stringify({ id: destinataire.id, name: destinataire.nom }));
      }
    });
    return Array.from(abattoirs).map(item => JSON.parse(item as string)).sort((a, b) => a.name.localeCompare(b.name));
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
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'الاستقبال' : 'Réception'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة استقبال الماشية في المجازر' : 'Gestion des réceptions de bétail dans les abattoirs'}
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
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="px-3 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {isRTL ? 'إعادة تحميل' : 'Recharger'}
                </button>
                <div className="text-xs theme-text-secondary flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  {isRTL ? 'تحديث تلقائي' : 'Auto-refresh'} ({30 - (autoRefreshCount % 30)}s)
                </div>
                <button 
                  onClick={() => router.push('/dashboard/reception/new')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة استقبال' : 'Nouvelle réception'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في الاستقبالات...' : 'Rechercher une réception...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="EN_ATTENTE">{isRTL ? 'في الانتظار' : 'En attente'}</option>
                <option value="EN_COURS">{isRTL ? 'قيد المعالجة' : 'En cours'}</option>
                <option value="RECU">{isRTL ? 'مكتمل' : 'Reçu'}</option>
                <option value="PARTIEL">{isRTL ? 'جزئي' : 'Partiel'}</option>
                <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              <select
                value={abattoirFilter}
                onChange={(e) => setAbattoirFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="">{isRTL ? 'جميع المجازر' : 'Tous les abattoirs'}</option>
                {getAbattoirs().map(abattoir => (
                  <option key={abattoir.id} value={abattoir.id.toString()}>{abattoir.name}</option>
                ))}
              </select>
              <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصفية' : 'Filtres'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`h-5 w-5 text-green-500 ${isRTL ? 'ml-3' : 'mr-3'}`}>
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
                <p className="text-red-600">{error.message || 'Erreur lors du chargement des réceptions'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y theme-border-secondary theme-transition">
                  <thead className="theme-bg-secondary theme-transition">
                    <tr>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الاستقبال' : 'Réception'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'النقل' : 'Transfert'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'من' : 'De'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'إلى' : 'Vers'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الماشية' : 'Bétail'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'التاريخ' : 'Date'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {receptions.map((reception) => (
                      <tr key={reception.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{reception.numero_reception}</div>
                              <div className="text-sm theme-text-secondary theme-transition">
                                {reception.taux_reception}% {isRTL ? 'مكتمل' : 'complété'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">{reception.transfert.numero_transfert}</div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {formatDate(reception.transfert.date_creation)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {reception.abattoir_expediteur?.nom || reception.transfert?.abattoir_expediteur?.nom || 'N/A'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {reception.abattoir_expediteur?.wilaya || reception.transfert?.abattoir_expediteur?.wilaya || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {reception.abattoir_destinataire?.nom || reception.transfert?.abattoir_destinataire?.nom || 'N/A'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {reception.abattoir_destinataire?.wilaya || reception.transfert?.abattoir_destinataire?.wilaya || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {reception.nombre_betes_recues} / {reception.nombre_betes_attendues} {isRTL ? 'رأس' : 'têtes'}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {reception.nombre_betes_manquantes > 0 && (
                                <span className="text-red-600">
                                  {reception.nombre_betes_manquantes} {isRTL ? 'مفقود' : 'manquant'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reception.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                          {formatDate(reception.date_creation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => router.push(`/dashboard/reception/${reception.id}`)}
                              className="p-1 theme-text-tertiary hover:text-green-500 theme-transition"
                              title={isRTL ? 'عرض الاستقبال' : 'Voir la réception'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditReception(reception)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={isRTL ? 'تعديل الاستقبال' : 'Modifier la réception'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteReception(reception.id, reception.numero_reception)}
                              disabled={deletingReceptionId === reception.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                              title={isRTL ? 'حذف الاستقبال' : 'Supprimer la réception'}
                            >
                              {deletingReceptionId === reception.id ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
            
            {receptions.length === 0 && !loading && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على استقبالات' : 'Aucune réception trouvée'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة استقبالات جديدة' : 'Commencez par ajouter de nouvelles réceptions'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}