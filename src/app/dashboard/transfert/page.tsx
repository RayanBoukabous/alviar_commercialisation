'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ArrowRightLeft,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  TrendingUp,
  User,
  Building2,
  X,
  Printer,
  Download
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import CreateTransfertModal from '@/components/transfert/CreateTransfertModal';
import { 
  useTransferts, 
  useTransfertStats, 
  useAnnulerTransfert 
} from '@/lib/hooks/useTransferts';
import { Transfert } from '@/lib/api/transfertService';

// Types importés depuis le service API

const TransfertPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Récupérer l'utilisateur depuis localStorage
  const [localUser, setLocalUser] = useState<any>(null);
  const [abattoirId, setAbattoirId] = useState<number | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('django_user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setLocalUser(parsedUser);
          
          if (parsedUser?.abattoir?.id) {
            setAbattoirId(parsedUser.abattoir.id);
          }
        } catch (error) {
          console.error('Erreur parsing user from localStorage:', error);
        }
      }
    }
  }, []);
  
  const effectiveUser = user || localUser;
  
  const getAbattoirId = (userData: any) => {
    if (!userData?.abattoir) return null;
    if (typeof userData.abattoir === 'number') {
      return userData.abattoir;
    }
    if (typeof userData.abattoir === 'object' && userData.abattoir.id) {
      return userData.abattoir.id;
    }
    return null;
  };
  
  const effectiveAbattoirId = getAbattoirId(effectiveUser) || abattoirId;
  
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransfert, setSelectedTransfert] = useState<Transfert | null>(null);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Déterminer si l'utilisateur est superuser
  const isSuperuser = effectiveUser?.is_superuser || false;

  // Hooks API
  const { 
    data: transfertsData, 
    isLoading: loading, 
    error, 
    refetch 
  } = useTransferts({
    statut: filterStatus === 'ALL' ? undefined : filterStatus,
    abattoir_id: isSuperuser ? undefined : effectiveAbattoirId,
    search: searchTerm || undefined,
  });

  const { data: statsData } = useTransfertStats();
  const annulerTransfertMutation = useAnnulerTransfert();

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'EN_COURS': { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/40', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        border: 'border-yellow-200 dark:border-yellow-700',
        label: isRTL ? 'قيد التنفيذ' : 'En cours',
        icon: Clock
      },
      'LIVRE': { 
        bg: 'bg-green-100 dark:bg-green-900/40', 
        text: 'text-green-800 dark:text-green-200', 
        border: 'border-green-200 dark:border-green-700',
        label: isRTL ? 'تم التسليم' : 'Livré',
        icon: CheckCircle
      },
      'ANNULE': { 
        bg: 'bg-red-100 dark:bg-red-900/40', 
        text: 'text-red-800 dark:text-red-200', 
        border: 'border-red-200 dark:border-red-700',
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['EN_COURS'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  // Données des transferts
  const transferts = transfertsData?.results || [];

  const handleViewTransfert = (id: number) => {
    router.push(`/dashboard/transfert/${id}`);
  };

  const handleCreateTransfert = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    // Recharger les données après création
    refetch();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleEditTransfert = (transfert: Transfert) => {
    // TODO: Implémenter la modification
    console.log('Modifier transfert:', transfert);
  };

  const handleDeleteTransfert = async (transfertId: number, transfertNumero: string) => {
    const confirmed = window.confirm(
      isRTL 
        ? `هل أنت متأكد من حذف النقل "${transfertNumero}"؟`
        : `Êtes-vous sûr de vouloir supprimer le transfert "${transfertNumero}" ?`
    );

    if (!confirmed) return;

    try {
      // TODO: Implémenter la suppression
      toast.success(
        isRTL 
          ? `تم حذف النقل "${transfertNumero}" بنجاح`
          : `Transfert "${transfertNumero}" supprimé avec succès`
      );
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleAnnulerTransfert = (transfert: Transfert) => {
    setSelectedTransfert(transfert);
    setShowCancelModal(true);
  };

  const handleConfirmAnnulation = async () => {
    if (!selectedTransfert) return;

    try {
      await annulerTransfertMutation.mutateAsync(selectedTransfert.id);
      setShowCancelModal(false);
      setSelectedTransfert(null);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      // L'erreur est déjà gérée dans le hook
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ArrowRightLeft className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'النقل' : 'Transferts'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة نقل الماشية بين المجازر' : 'Gestion des transferts de bêtes entre abattoirs'}
                </p>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'نقل جديد' : 'Nouveau transfert'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm theme-text-secondary">{isRTL ? 'قيد التنفيذ' : 'En cours'}</p>
                  <p className="text-2xl font-bold theme-text-primary">
                    {statsData?.transferts_en_cours || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm theme-text-secondary">{isRTL ? 'تم التسليم' : 'Livrés'}</p>
                  <p className="text-2xl font-bold theme-text-primary">
                    {statsData?.transferts_livres || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm theme-text-secondary">{isRTL ? 'ملغاة' : 'Annulés'}</p>
                  <p className="text-2xl font-bold theme-text-primary">
                    {statsData?.transferts_annules || 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
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
                  placeholder={isRTL ? 'البحث في النقل...' : 'Rechercher un transfert...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="EN_COURS">{isRTL ? 'قيد التنفيذ' : 'En cours'}</option>
                <option value="LIVRE">{isRTL ? 'تم التسليم' : 'Livré'}</option>
                <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              <button className="px-4 py-2 border rounded-lg flex items-center theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصفية' : 'Filtres'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-6">
          <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error.message || 'Erreur lors du chargement'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y theme-border-secondary theme-transition">
                  <thead className="theme-bg-secondary theme-transition">
                    <tr>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'رقم النقل' : 'N° Transfert'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'من' : 'De'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'إلى' : 'Vers'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'عدد البهائم' : 'Nb Bêtes'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'تاريخ الإنشاء' : 'Date création'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الحالة' : 'Statut'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {transferts.map((transfert: Transfert) => (
                      <tr key={transfert.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <ArrowRightLeft className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{transfert.numero_transfert}</div>
                              <div className="text-sm theme-text-secondary theme-transition">{formatDate(transfert.date_creation)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition flex items-center">
                              <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} theme-text-secondary`} />
                              {transfert.abattoir_expediteur.nom}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition flex items-center">
                              <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} theme-text-secondary`} />
                              {transfert.abattoir_destinataire.nom}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {transfert.nombre_betes} {isRTL ? 'رأس' : 'têtes'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {formatDate(transfert.date_creation)}
                            </div>
                            {transfert.date_livraison && (
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'تم:' : 'Livré:'} {formatDate(transfert.date_livraison)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transfert.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewTransfert(transfert.id)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {transfert.statut === 'EN_COURS' && (
                              <button 
                                onClick={() => handleEditTransfert(transfert)}
                                className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                                title={isRTL ? 'تعديل' : 'Modifier'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {transfert.statut === 'EN_COURS' && (
                              <button 
                                onClick={() => handleAnnulerTransfert(transfert)}
                                disabled={annulerTransfertMutation.isPending}
                                className="p-1 theme-text-tertiary hover:text-orange-500 theme-transition disabled:opacity-50"
                                title={isRTL ? 'إلغاء' : 'Annuler'}
                              >
                                {annulerTransfertMutation.isPending ? (
                                  <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button 
                              onClick={() => window.print()}
                              className="p-1 theme-text-tertiary hover:text-purple-500 theme-transition"
                              title={isRTL ? 'طباعة' : 'Imprimer'}
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {transferts.length === 0 && !loading && (
              <div className="text-center py-12">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على عمليات نقل' : 'Aucun transfert trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة عمليات نقل جديدة' : 'Commencez par créer un nouveau transfert'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation d'annulation */}
        {showCancelModal && selectedTransfert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-md mx-4">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                </h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedTransfert(null);
                  }}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="theme-text-secondary theme-transition">
                  {isRTL 
                    ? `هل أنت متأكد من إلغاء النقل "${selectedTransfert.numero_transfert}"؟`
                    : `Êtes-vous sûr de vouloir annuler le transfert "${selectedTransfert.numero_transfert}" ?`
                  }
                </p>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedTransfert(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleConfirmAnnulation}
                  disabled={annulerTransfertMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {annulerTransfertMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإلغاء...' : 'Annulation...'}
                    </div>
                  ) : (
                    isRTL ? 'تأكيد الإلغاء' : 'Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création */}
        <CreateTransfertModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </Layout>
  );
};

export default TransfertPage;
