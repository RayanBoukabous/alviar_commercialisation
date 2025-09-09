'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Globe, 
  Settings, 
  Check, 
  X,
  User,
  Clock,
  RefreshCw,
  Power,
  PowerOff
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { paymentPlansService, PaymentPlanType } from '@/lib/api';
import { EditPaymentPlanModal } from '@/components/forms/EditPaymentPlanModal';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function PaymentPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = parseInt(params.id as string);
  const { t } = useTranslation('paymentPlans');

  const [plan, setPlan] = useState<PaymentPlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPaymentPlan();
    }
  }, [planId]);

  const fetchPaymentPlan = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔍`, t('planDetail.loadingPlan', { planId }));
      const planData = await paymentPlansService.getPaymentPlanById(planId);
      setPlan(planData);
      console.log('✅', t('planDetail.planLoaded'), planData);
      
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setError(`${t('planDetail.errorLoading')} ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!plan) return;

    // Confirmation avant suppression avec plus de détails
    const confirmed = window.confirm(
      `${t('planDetail.deleteConfirmation')} "${plan.name}"\n\n` +
      `${t('planDetail.deleteConfirmationMessage')}\n` +
      t('planDetail.deleteConfirmationDetails', { planName: plan.name, planId: plan.id }) + `\n\n` +
      t('planDetail.deleteConfirmationQuestion')
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      
      console.log(`🔍`, t('planDetail.deletingPlan', { planName: plan.name, planId: plan.id }));
      await paymentPlansService.deletePaymentPlan(plan.id);
      
      // Rediriger vers la liste des plans
      router.push('/dashboard/payment-plans');
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la suppression du plan:', err);
      setError(`❌ ${t('planDetail.errorDeleting', { planName: plan.name })} ${err.message || 'Erreur inconnue'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = async () => {
    // Rafraîchir les données du plan après modification
    await fetchPaymentPlan();
    setSuccessMessage(`✅ ${t('planDetail.planUpdated')}`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleTogglePlanStatus = async () => {
    if (!plan) return;

    try {
      setToggling(true);
      setError('');

      if (plan.isActive) {
        // Désactiver le plan
        await paymentPlansService.deactivatePaymentPlan(plan.id);
        setSuccessMessage(`✅ ${t('planDeactivated', { planName: plan.name })}`);
      } else {
        // Activer le plan
        await paymentPlansService.activatePaymentPlan(plan.id);
        setSuccessMessage(`✅ ${t('planActivated', { planName: plan.name })}`);
      }

      // Rafraîchir les données du plan
      await fetchPaymentPlan();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      setError(`${t('errorTogglingStatus')} ${err.message || 'Erreur inconnue'}`);
    } finally {
      setToggling(false);
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    const cycleLabels: { [key: string]: string } = {
      MONTHLY: t('billingCycleLabels.MONTHLY'),
      YEARLY: t('billingCycleLabels.YEARLY'),
      WEEKLY: t('billingCycleLabels.WEEKLY'),
      DAILY: t('billingCycleLabels.DAILY'),
      QUARTERLY: t('billingCycleLabels.QUARTERLY'),
      LIFETIME: t('billingCycleLabels.LIFETIME'),
    };
    return cycleLabels[cycle] || cycle;
  };

  const getBillingCycleBadge = (cycle: string) => {
    const badgeConfig = {
      MONTHLY: { 
        bg: 'bg-blue-600 dark:bg-blue-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.MONTHLY')
      },
      YEARLY: { 
        bg: 'bg-emerald-600 dark:bg-emerald-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.YEARLY')
      },
      WEEKLY: { 
        bg: 'bg-amber-600 dark:bg-amber-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.WEEKLY')
      },
      DAILY: { 
        bg: 'bg-slate-600 dark:bg-slate-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.DAILY')
      },
      QUARTERLY: { 
        bg: 'bg-purple-600 dark:bg-purple-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.QUARTERLY')
      },
      LIFETIME: { 
        bg: 'bg-indigo-600 dark:bg-indigo-500', 
        text: 'text-white', 
        label: t('billingCycleLabels.LIFETIME')
      },
    };

    const config = badgeConfig[cycle as keyof typeof badgeConfig] || badgeConfig.MONTHLY;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} shadow-sm`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: string, currency: string) => {
    return `${price} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !plan) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition">
          <div className="px-6 py-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push('/dashboard/payment-plans')}
                className="flex items-center text-sm theme-text-secondary hover:theme-text-primary theme-transition mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('planDetail.backToList')}
              </button>
            </div>
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">{t('planDetail.planNotFound')}</h3>
              <p className="theme-text-secondary theme-transition">{error || t('planDetail.planNotFoundDescription')}</p>
            </div>
          </div>
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
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard/payment-plans')}
                  className="flex items-center text-sm theme-text-secondary hover:theme-text-primary theme-transition mr-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('planDetail.backToList')}
                </button>
                <div className="flex items-center">
                  <div className="h-12 w-12 theme-bg-tertiary rounded-lg flex items-center justify-center mr-4 theme-transition">
                    <CreditCard className="h-6 w-6 theme-text-primary theme-transition" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold theme-text-primary theme-transition">{plan.name}</h1>
                    <p className="theme-text-secondary theme-transition">{t('planDetail.description')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={fetchPaymentPlan}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {t('planDetail.refresh')}
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-lg flex items-center bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Edit className='h-4 w-4 mr-2' />
                  {t('planDetail.edit')}
                </button>
                <button 
                  onClick={handleTogglePlanStatus}
                  disabled={toggling}
                  className={`px-4 py-2 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
                    plan?.isActive 
                      ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {toggling ? (
                    <>
                      <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2`}></div>
                      {plan?.isActive ? t('planDetail.deactivating') : t('planDetail.activating')}
                    </>
                  ) : plan?.isActive ? (
                    <>
                      <PowerOff className='h-4 w-4 mr-2' />
                      {t('planDetail.deactivate')}
                    </>
                  ) : (
                    <>
                      <Power className='h-4 w-4 mr-2' />
                      {t('planDetail.activate')}
                    </>
                  )}
                </button>
                <button 
                  onClick={handleDeletePlan}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg flex items-center bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('planDetail.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('planDetail.delete')}
                    </>
                  )}
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

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de base */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">{t('planDetail.basicInfo')}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.planName')}</p>
                        <p className="font-medium theme-text-primary theme-transition">{plan.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.planPrice')}</p>
                        <p className="font-medium theme-text-primary theme-transition">{formatPrice(plan.price, plan.currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.planBillingCycle')}</p>
                        <div className="mt-1">{getBillingCycleBadge(plan.billingCycle)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <Settings className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.planRequestLimit')}</p>
                        <p className="font-medium theme-text-primary theme-transition">{plan.requestLimit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">{t('planDetail.planFeatures')}</h2>
                </div>
                <div className="p-6">
                  {plan.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Check className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                          <span className="text-sm theme-text-primary theme-transition">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.noFeatures')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations secondaires */}
            <div className="space-y-6">
              {/* Statut */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">{t('planDetail.planStatus')}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary theme-transition">{t('planDetail.planStatus')}</span>
                    {plan.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        {t('active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <X className="h-3 w-3 mr-1" />
                        {t('inactive')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary theme-transition">{t('planDetail.planType')}</span>
                    {plan.isDefault ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Check className="h-3 w-3 mr-1" />
                        {t('yes')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        <X className="h-3 w-3 mr-1" />
                        {t('no')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-secondary theme-transition">{t('planDetail.planTrialDays')}</span>
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {plan.trialDays} {plan.trialDays > 1 ? t('days') : t('day')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition">
                <div className="px-6 py-4 border-b theme-border-primary">
                  <h2 className="text-lg font-semibold theme-text-primary theme-transition">{t('planDetail.metadata')}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.createdBy')}</p>
                      <p className="font-medium theme-text-primary theme-transition">{plan.createdBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.createdAt')}</p>
                      <p className="font-medium theme-text-primary theme-transition">{formatDate(plan.createdAt)}</p>
                    </div>
                  </div>
                  {plan.updatedBy && (
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.updatedBy')}</p>
                        <p className="font-medium theme-text-primary theme-transition">{plan.updatedBy}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-secondary theme-transition">{t('planDetail.updatedAt')}</p>
                      <p className="font-medium theme-text-primary theme-transition">{formatDate(plan.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <EditPaymentPlanModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          plan={plan}
        />
      </div>
    </Layout>
  );
}
