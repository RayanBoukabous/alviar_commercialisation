'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CreditCard,
  RefreshCw,
  Check,
  X,
  Edit,
  Eye,
  Power,
  PowerOff
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { paymentPlansService, PaymentPlanType } from '@/lib/api';
import { CreatePaymentPlanModal } from '@/components/forms/CreatePaymentPlanModal';
import { EditPaymentPlanModal } from '@/components/forms/EditPaymentPlanModal';

export default function PaymentPlansPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanType | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [allPlansCount, setAllPlansCount] = useState(0);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [togglingPlanId, setTogglingPlanId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPaymentPlans = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement des plans de paiement depuis l\'API...');
        const plansData = showActiveOnly 
          ? await paymentPlansService.getActivePaymentPlans()
          : await paymentPlansService.getAllPaymentPlans();
        setPaymentPlans(plansData);
        console.log('✅ Plans de paiement chargés:', plansData);
        
      } catch (err: any) {
        console.error('Erreur détaillée:', err);
        setError(`Erreur lors du chargement des plans de paiement: ${err.message || 'Erreur inconnue'}`);
        setPaymentPlans([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const [allPlans, activePlans] = await Promise.all([
          paymentPlansService.getAllPaymentPlans(),
          paymentPlansService.getActivePaymentPlans()
        ]);
        setAllPlansCount(allPlans.length);
        setActivePlansCount(activePlans.length);
      } catch (err) {
        console.error('Erreur lors du chargement des compteurs:', err);
      }
    };

    if (isAuthenticated) {
      fetchPaymentPlans();
      fetchCounts();
    }
  }, [isAuthenticated, showActiveOnly]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      console.log('🔄 Rafraîchissement des plans de paiement...');
      const [plansData, allPlans, activePlans] = await Promise.all([
        showActiveOnly 
          ? paymentPlansService.getActivePaymentPlans()
          : paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getActivePaymentPlans()
      ]);
      
      setPaymentPlans(plansData);
      setAllPlansCount(allPlans.length);
      setActivePlansCount(activePlans.length);
      console.log('✅ Plans de paiement rafraîchis:', plansData);
      
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(`Erreur lors du rafraîchissement des plans de paiement: ${err.message || 'Erreur inconnue'}`);
      setPaymentPlans([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePlan = async (planId: number, planName: string) => {
    // Confirmation avant suppression avec plus de détails
    const confirmed = window.confirm(
      `⚠️ ATTENTION - Suppression du plan "${planName}"\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera :\n` +
      `• Le plan de paiement "${planName}" (ID: ${planId})\n` +
      `• Toutes les configurations liées à ce plan\n\n` +
      `Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPlanId(planId);
      setError('');
      
      console.log(`🔍 Suppression du plan ${planName} (ID: ${planId})...`);
      await paymentPlansService.deletePaymentPlan(planId);
      
      // Supprimer le plan de la liste locale
      setPaymentPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      // Afficher un message de succès temporaire
      setSuccessMessage(`✅ Plan "${planName}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      console.log(`✅ Plan ${planName} supprimé avec succès`);
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression du plan:', err);
      setError(`❌ Erreur lors de la suppression du plan "${planName}": ${err.message || 'Erreur inconnue'}`);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleCreatePlanSuccess = async () => {
    // Rafraîchir la liste des plans après création
    try {
      setError('');
      const [plansData, allPlans, activePlans] = await Promise.all([
        showActiveOnly 
          ? paymentPlansService.getActivePaymentPlans()
          : paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getActivePaymentPlans()
      ]);
      
      setPaymentPlans(plansData);
      setAllPlansCount(allPlans.length);
      setActivePlansCount(activePlans.length);
      setSuccessMessage('✅ Plan de paiement créé avec succès');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement après création:', err);
      setError(`Erreur lors du rafraîchissement: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handleEditPlan = (plan: PaymentPlanType) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleEditPlanSuccess = async () => {
    // Rafraîchir la liste des plans après modification
    try {
      setError('');
      const [plansData, allPlans, activePlans] = await Promise.all([
        showActiveOnly 
          ? paymentPlansService.getActivePaymentPlans()
          : paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getActivePaymentPlans()
      ]);
      
      setPaymentPlans(plansData);
      setAllPlansCount(allPlans.length);
      setActivePlansCount(activePlans.length);
      setSuccessMessage('✅ Plan de paiement modifié avec succès');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement après modification:', err);
      setError(`Erreur lors du rafraîchissement: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handleViewPlan = (plan: PaymentPlanType) => {
    router.push(`/dashboard/payment-plans/${plan.id}`);
  };

  const handleTogglePlanStatus = async (plan: PaymentPlanType) => {
    try {
      setTogglingPlanId(plan.id);
      setError('');

      if (plan.isActive) {
        // Désactiver le plan
        await paymentPlansService.deactivatePaymentPlan(plan.id);
        setSuccessMessage(`✅ Plan "${plan.name}" désactivé avec succès`);
      } else {
        // Activer le plan
        await paymentPlansService.activatePaymentPlan(plan.id);
        setSuccessMessage(`✅ Plan "${plan.name}" activé avec succès`);
      }

      // Rafraîchir la liste des plans
      const [plansData, allPlans, activePlans] = await Promise.all([
        showActiveOnly 
          ? paymentPlansService.getActivePaymentPlans()
          : paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getAllPaymentPlans(),
        paymentPlansService.getActivePaymentPlans()
      ]);
      
      setPaymentPlans(plansData);
      setAllPlansCount(allPlans.length);
      setActivePlansCount(activePlans.length);

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      setError(`Erreur lors du changement de statut: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setTogglingPlanId(null);
    }
  };

  const filteredPlans = paymentPlans.filter(plan => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.billingCycle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getBillingCycleBadge = (cycle: string) => {
    const badgeConfig = {
      MONTHLY: { 
        bg: 'bg-slate-100 dark:bg-slate-700', 
        text: 'text-slate-800 dark:text-slate-200', 
        label: 'Mensuel'
      },
      QUARTERLY: { 
        bg: 'bg-zinc-100 dark:bg-zinc-700', 
        text: 'text-zinc-800 dark:text-zinc-200', 
        label: 'Trimestriel'
      },
      YEARLY: { 
        bg: 'bg-stone-100 dark:bg-stone-700', 
        text: 'text-stone-800 dark:text-stone-200', 
        label: 'Annuel'
      },
      LIFETIME: { 
        bg: 'bg-neutral-100 dark:bg-neutral-700', 
        text: 'text-neutral-800 dark:text-neutral-200', 
        label: 'À vie'
      },
      WEEKLY: { 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-800 dark:text-gray-200', 
        label: 'Hebdomadaire'
      },
      DAILY: { 
        bg: 'bg-slate-50 dark:bg-slate-800', 
        text: 'text-slate-700 dark:text-slate-300', 
        label: 'Quotidien'
      },
    };

    const config = badgeConfig[cycle as keyof typeof badgeConfig] || {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      label: cycle
    };

    return (
      <div className="flex items-center">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} theme-transition`}>
          {config.label}
        </span>
      </div>
    );
  };

  const formatPrice = (price: string | number, currency: string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'DZD': 'د.ج',
      'INR': '₹'
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${numPrice.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  <CreditCard className="h-7 w-7 mr-3 text-blue-600" />
                  Payment Plans
                </h1>
                <p className="mt-1 theme-text-secondary theme-transition">Gérez les plans de paiement</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition" />
                <input
                  type="text"
                  placeholder="Rechercher un plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
              
              {/* Professional Filter Tabs */}
              <div className="flex items-center theme-bg-tertiary rounded-lg p-1">
                <button
                  onClick={() => setShowActiveOnly(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                    !showActiveOnly
                      ? 'theme-bg-elevated theme-text-primary shadow-sm'
                      : 'theme-text-tertiary hover:theme-text-primary'
                  }`}
                >
                  <span>Tous les plans</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    !showActiveOnly
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'theme-bg-secondary theme-text-tertiary'
                  }`}>
                    {allPlansCount}
                  </span>
                </button>
                <button
                  onClick={() => setShowActiveOnly(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                    showActiveOnly
                      ? 'theme-bg-elevated theme-text-primary shadow-sm'
                      : 'theme-text-tertiary hover:theme-text-primary'
                  }`}
                >
                  <span>Plans actifs</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    showActiveOnly
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'theme-bg-secondary theme-text-tertiary'
                  }`}>
                    {activePlansCount}
                  </span>
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

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-5 w-5 text-red-500 mr-3">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-6 py-6">
          <div className="shadow-sm rounded-lg overflow-hidden theme-bg-elevated theme-transition">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Cycle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Limite
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="transition-colors hover:theme-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 theme-bg-tertiary rounded-lg flex items-center justify-center theme-transition">
                              <CreditCard className="h-5 w-5 theme-text-primary theme-transition" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium theme-text-primary theme-transition">{plan.name}</div>
                              <div className="text-sm theme-text-secondary theme-transition">
                                {plan.isDefault ? 'Plan par défaut' : 'Plan personnalisé'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium theme-text-primary theme-transition">
                            {formatPrice(plan.price, plan.currency)}
                          </div>
                          <div className="text-sm theme-text-secondary theme-transition">
                            {plan.trialDays > 0 ? `${plan.trialDays} jours d'essai` : 'Aucun essai'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getBillingCycleBadge(plan.billingCycle)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm theme-text-primary theme-transition">
                            {plan.requestLimit.toLocaleString()} requêtes
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {plan.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 theme-transition">
                                <Check className="h-3 w-3 mr-1.5" />
                                Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 theme-transition">
                                <X className="h-3 w-3 mr-1.5" />
                                Inactif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm theme-text-secondary theme-transition">
                            #{plan.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleViewPlan(plan)}
                              className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                              title={`Voir les détails du plan "${plan.name}"`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditPlan(plan)}
                              className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                              title={`Modifier le plan "${plan.name}"`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleTogglePlanStatus(plan)}
                              disabled={togglingPlanId === plan.id}
                              className={`p-1 theme-transition disabled:opacity-50 rounded ${
                                plan.isActive 
                                  ? 'theme-text-tertiary hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                  : 'theme-text-tertiary hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                              title={plan.isActive ? `Désactiver le plan "${plan.name}"` : `Activer le plan "${plan.name}"`}
                            >
                              {togglingPlanId === plan.id ? (
                                <div className={`w-4 h-4 border-2 border-t-2 rounded-full animate-spin ${
                                  plan.isActive ? 'border-orange-300 border-t-orange-600' : 'border-green-300 border-t-green-600'
                                }`} />
                              ) : plan.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(plan.id, plan.name)}
                              disabled={deletingPlanId === plan.id}
                              className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title={`Supprimer le plan "${plan.name}"`}
                            >
                              {deletingPlanId === plan.id ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredPlans.length === 0 && !loading && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
                <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                  {showActiveOnly ? 'Aucun plan actif trouvé' : 'Aucun plan trouvé'}
                </h3>
                <p className="theme-text-secondary theme-transition">
                  {showActiveOnly 
                    ? 'Aucun plan de paiement actif ne correspond à votre recherche.' 
                    : 'Commencez par créer votre premier plan de paiement.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Payment Plan Modal */}
        <CreatePaymentPlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreatePlanSuccess}
        />

        {/* Edit Payment Plan Modal */}
        <EditPaymentPlanModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPlan(null);
          }}
          onSuccess={handleEditPlanSuccess}
          plan={selectedPlan}
        />
      </div>
    </Layout>
  );
}
