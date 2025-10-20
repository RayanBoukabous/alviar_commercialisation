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
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { 
  useBonsDeCommande,
  useBonDeCommandeStats,
  useDeleteBonDeCommande,
  useUpdateBonStatus,
  useAnnulerBon
} from '@/lib/hooks/useBonsCommande';
import { BonDeCommande } from '@/lib/api/bonCommandeService';
import { CreateBonCommandeModal } from '@/components/bon-commande';
import toast from 'react-hot-toast';

export default function BonCommandePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBon, setSelectedBon] = useState<BonDeCommande | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  // Déterminer si l'utilisateur est superuser
  const isSuperuser = effectiveUser?.is_superuser || false;
  
  // Hooks API
  const { 
    data: bonsData, 
    isLoading: loading, 
    error, 
    refetch 
  } = useBonsDeCommande({
    statut: statusFilter === 'ALL' ? undefined : statusFilter,
    abattoir_id: isSuperuser ? undefined : effectiveAbattoirId,
  });

  const { data: statsData } = useBonDeCommandeStats();

  const deleteBonMutation = useDeleteBonDeCommande();
  const updateStatusMutation = useUpdateBonStatus();
  const annulerBonMutation = useAnnulerBon();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleViewBon = (bon: BonDeCommande) => {
    router.push(`/dashboard/bon-commande/${bon.id}`);
  };

  const handleEditBon = (bon: BonDeCommande) => {
    // TODO: Implémenter la modification
    console.log('Modifier bon:', bon);
  };

  const handleDeleteBon = async (bonId: number, bonNumero: string) => {
    const confirmed = window.confirm(
      isRTL 
        ? `هل أنت متأكد من حذف طلب الشراء "${bonNumero}"؟`
        : `Êtes-vous sûr de vouloir supprimer le bon de commande "${bonNumero}" ?`
    );

    if (!confirmed) return;

    try {
      await deleteBonMutation.mutateAsync(bonId);
      toast.success(
        isRTL 
          ? `تم حذف طلب الشراء "${bonNumero}" بنجاح`
          : `Bon de commande "${bonNumero}" supprimé avec succès`
      );
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleAnnulerBon = (bon: BonDeCommande) => {
    setSelectedBon(bon);
    setShowCancelModal(true);
  };

  const handleConfirmAnnulation = async () => {
    if (!selectedBon) return;

    setIsCancelling(true);
    try {
      await annulerBonMutation.mutateAsync(selectedBon.id);
      
      setShowCancelModal(false);
      setSelectedBon(null);
      
      toast.success(
        isRTL 
          ? `تم إلغاء طلب الشراء بنجاح`
          : `Bon de commande annulé avec succès`
      );
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.message || 'Erreur lors de l\'annulation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateStatus = async (bonId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: bonId,
        statut: newStatus,
      });
      
      toast.success(
        isRTL 
          ? 'تم تحديث حالة طلب الشراء بنجاح'
          : 'Statut mis à jour avec succès'
      );
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  // Filtrage des bons
  const bons = Array.isArray(bonsData) ? bonsData : [];
  const filteredBons = bons.filter(bon => {
    const matchesSearch = bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bon.client_nom && bon.client_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (bon.abattoir_nom && bon.abattoir_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (bon.notes && bon.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'ALL' || bon.type_bete === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      BROUILLON: { 
        bg: 'bg-gray-200 dark:bg-gray-900/50', 
        text: 'text-gray-900 dark:text-gray-100', 
        label: isRTL ? 'مسودة' : 'Brouillon',
        icon: Edit
      },
      CONFIRME: { 
        bg: 'bg-blue-200 dark:bg-blue-900/50', 
        text: 'text-blue-900 dark:text-blue-100', 
        label: isRTL ? 'مؤكد' : 'Confirmé',
        icon: CheckCircle
      },
      EN_COURS: { 
        bg: 'bg-orange-200 dark:bg-orange-900/50', 
        text: 'text-orange-900 dark:text-orange-100', 
        label: isRTL ? 'قيد التنفيذ' : 'En cours',
        icon: Activity
      },
      LIVRE: { 
        bg: 'bg-green-200 dark:bg-green-900/50', 
        text: 'text-green-900 dark:text-green-100', 
        label: isRTL ? 'تم التسليم' : 'Livré',
        icon: Package
      },
      ANNULE: { 
        bg: 'bg-red-200 dark:bg-red-900/50', 
        text: 'text-red-900 dark:text-red-100', 
        label: isRTL ? 'ملغي' : 'Annulé',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.BROUILLON;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
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
                  <FileText className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {isRTL ? 'طلبات الشراء' : 'Bons de commande'}
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">
                  {isRTL ? 'إدارة طلبات الشراء والتوريد' : 'Gestion des commandes et des livraisons'}
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
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'طلب شراء جديد' : 'Nouveau bon de commande'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {statsData && (
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-secondary">{isRTL ? 'إجمالي الطلبات' : 'Total'}</p>
                    <p className="text-2xl font-bold theme-text-primary">{statsData.total_bons}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-secondary">{isRTL ? 'قيد التنفيذ' : 'En cours'}</p>
                    <p className="text-2xl font-bold theme-text-primary">{statsData.bons_en_cours}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-secondary">{isRTL ? 'تم التسليم' : 'Livrés'}</p>
                    <p className="text-2xl font-bold theme-text-primary">{statsData.bons_livres}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary p-4 theme-transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-secondary">{isRTL ? 'معدل الإنجاز' : 'Taux de livraison'}</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {statsData.total_bons > 0 
                        ? Math.round((statsData.bons_livres / statsData.total_bons) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في طلبات الشراء...' : 'Rechercher un bon de commande...'}
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
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
                <option value="BROUILLON">{isRTL ? 'مسودة' : 'Brouillon'}</option>
                <option value="CONFIRME">{isRTL ? 'مؤكد' : 'Confirmé'}</option>
                <option value="EN_COURS">{isRTL ? 'قيد التنفيذ' : 'En cours'}</option>
                <option value="LIVRE">{isRTL ? 'تم التسليم' : 'Livré'}</option>
                <option value="ANNULE">{isRTL ? 'ملغي' : 'Annulé'}</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="ALL">{isRTL ? 'جميع الأنواع' : 'Tous les types'}</option>
                <option value="BOVIN">{isRTL ? 'بقر' : 'Bovin'}</option>
                <option value="OVIN">{isRTL ? 'غنم' : 'Ovin'}</option>
                <option value="CAPRIN">{isRTL ? 'ماعز' : 'Caprin'}</option>
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
                        {isRTL ? 'رقم الطلب' : 'N° Bon'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'العميل' : 'Client'}
                      </th>
                      {isSuperuser && (
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                          {isRTL ? 'المسلخ' : 'Abattoir'}
                        </th>
                      )}
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'النوع' : 'Type'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'المصدر' : 'Source'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الكمية' : 'Quantité'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'الدفعة' : 'Versement'}
                      </th>
                      <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                        {isRTL ? 'تاريخ التسليم' : 'Livraison'}
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
                    {filteredBons.map((bon) => (
                      <tr key={bon.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition">{bon.numero_bon}</div>
                              <div className="text-sm theme-text-secondary theme-transition">{formatDate(bon.created_at)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition flex items-center">
                              <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} theme-text-secondary`} />
                              {bon.client_nom || 'N/A'}
                            </div>
                          </div>
                        </td>
                        {isSuperuser && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className="text-sm font-medium theme-text-primary theme-transition flex items-center">
                                <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} theme-text-secondary`} />
                                {bon.abattoir_nom || 'N/A'}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {bon.type_bete_display}
                            </div>
                            <div className="text-sm theme-text-secondary theme-transition">
                              {bon.type_produit_display}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bon.source === 'PRODUCTION' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {bon.source_display}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {bon.quantite} {bon.type_quantite === 'NOMBRE' ? (isRTL ? 'رأس' : 'têtes') : 'kg'}
                            </div>
                            {bon.avec_cinquieme_quartier && (
                              <div className="text-xs theme-text-secondary theme-transition">
                                {isRTL ? 'مع الأحشاء' : '+ 5ème quartier'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            {bon.versement ? (
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {bon.versement.toLocaleString()} DA
                              </div>
                            ) : (
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'لا يوجد' : 'Aucun'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm font-medium theme-text-primary theme-transition">
                              {formatDate(bon.date_livraison_prevue)}
                            </div>
                            {bon.date_livraison_reelle && (
                              <div className="text-sm theme-text-secondary theme-transition">
                                {isRTL ? 'تم:' : 'Réel:'} {formatDate(bon.date_livraison_reelle)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(bon.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                            <button 
                              onClick={() => handleViewBon(bon)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {bon.est_modifiable && (
                              <button 
                                onClick={() => handleEditBon(bon)}
                                className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                                title={isRTL ? 'تعديل' : 'Modifier'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {bon.est_annulable && (
                              <button 
                                onClick={() => handleAnnulerBon(bon)}
                                disabled={isCancelling}
                                className="p-1 theme-text-tertiary hover:text-orange-500 theme-transition disabled:opacity-50"
                                title={isRTL ? 'إلغاء' : 'Annuler'}
                              >
                                {isCancelling ? (
                                  <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {bon.statut === 'BROUILLON' && (
                              <button 
                                onClick={() => handleDeleteBon(bon.id, bon.numero_bon)}
                                disabled={deleteBonMutation.isPending}
                                className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
                                title={isRTL ? 'حذف' : 'Supprimer'}
                              >
                                {deleteBonMutation.isPending ? (
                                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
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
            
            {filteredBons.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {isRTL ? 'لم يتم العثور على طلبات شراء' : 'Aucun bon de commande trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'ابدأ بإضافة طلبات شراء جديدة' : 'Commencez par créer un nouveau bon de commande'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation d'annulation */}
        {showCancelModal && selectedBon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-md mx-4">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                </h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBon(null);
                  }}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="theme-text-secondary theme-transition">
                  {isRTL 
                    ? `هل أنت متأكد من إلغاء طلب الشراء "${selectedBon.numero_bon}"؟`
                    : `Êtes-vous sûr de vouloir annuler le bon de commande "${selectedBon.numero_bon}" ?`
                  }
                </p>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBon(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleConfirmAnnulation}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? (
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
        <CreateBonCommandeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </Layout>
  );
}

