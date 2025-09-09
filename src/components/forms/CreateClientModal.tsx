'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, User, DollarSign, MapPin, Save, AlertCircle } from 'lucide-react';
import { clientsService, CreateClientRequest, PaymentPlan } from '@/lib/api';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  paymentPlanId: number;
  distributorId: number;
  createdBy: string;
}

interface FormErrors {
  name?: string;
  paymentPlanId?: string;
  distributorId?: string;
  createdBy?: string;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, loading: translationLoading } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    status: 'ACTIVE',
    paymentPlanId: 1,
    distributorId: 1,
    createdBy: 'admin',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Charger les plans de paiement au montage du composant
  useEffect(() => {
    const fetchPaymentPlans = async () => {
      try {
        setLoadingPlans(true);
        const plans = await clientsService.getPaymentPlans();
        setPaymentPlans(plans);
        
        // Définir le plan par défaut si disponible
        const defaultPlan = plans.find(plan => plan.isDefault);
        if (defaultPlan) {
          setFormData(prev => ({ ...prev, paymentPlanId: defaultPlan.id }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des plans de paiement:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (isOpen) {
      fetchPaymentPlans();
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('clients', 'client_name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('clients', 'client_name_min_length');
    }

    if (!formData.paymentPlanId || formData.paymentPlanId < 1) {
      newErrors.paymentPlanId = t('clients', 'payment_plan_required');
    }

    if (!formData.distributorId || formData.distributorId < 1) {
      newErrors.distributorId = t('clients', 'distributor_id_required');
    }

    if (!formData.createdBy.trim()) {
      newErrors.createdBy = t('clients', 'created_by_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const clientData: CreateClientRequest = {
        name: formData.name.trim(),
        status: formData.status,
        paymentPlanId: formData.paymentPlanId,
        distributorId: formData.distributorId,
        createdBy: formData.createdBy.trim(),
      };

      console.log('Creating client with data:', clientData);
      const newClient = await clientsService.createClient(clientData);
      console.log('Client created successfully:', newClient);

      // Reset form
      setFormData({
        name: '',
        status: 'ACTIVE',
        paymentPlanId: 1,
        distributorId: 1,
        createdBy: 'admin',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating client:', error);
      setSubmitError(error.message || t('clients', 'create_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        status: 'ACTIVE',
        paymentPlanId: 1,
        distributorId: 1,
        createdBy: 'admin',
      });
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  if (!isOpen || translationLoading) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl shadow-xl theme-bg-elevated theme-transition">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white">{t('clients', 'new_client_title')}</h3>
                  <p className="text-primary-100 text-sm">{t('clients', 'new_client_subtitle')}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">{t('clients', 'error_title')}</h4>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'client_name')} *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-tertiary theme-transition" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder={t('clients', 'client_name_placeholder')}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'status_label')}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                disabled={loading}
              >
                <option value="ACTIVE">{t('clients', 'active')}</option>
                <option value="INACTIVE">{t('clients', 'inactive')}</option>
                <option value="SUSPENDED">{t('clients', 'suspended')}</option>
              </select>
            </div>

            {/* Payment Plan */}
            <div className="space-y-2">
              <label htmlFor="paymentPlanId" className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'payment_plan')} *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-tertiary theme-transition" />
                {loadingPlans ? (
                  <div className="w-full pl-10 pr-4 py-3 border rounded-lg theme-bg-elevated theme-border-primary theme-text-primary flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mr-2" />
                    {t('clients', 'payment_plan_loading')}
                  </div>
                ) : (
                  <select
                    id="paymentPlanId"
                    value={formData.paymentPlanId}
                    onChange={(e) => handleInputChange('paymentPlanId', parseInt(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.paymentPlanId 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary'
                    }`}
                    disabled={loading || loadingPlans}
                  >
                    <option value="">{t('clients', 'payment_plan_select')}</option>
                    {paymentPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price} {plan.currency} ({plan.billingCycle})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.paymentPlanId && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.paymentPlanId}
                </p>
              )}
            </div>

            {/* Distributor ID */}
            <div className="space-y-2">
              <label htmlFor="distributorId" className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'distributor_id')} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-tertiary theme-transition" />
                <input
                  type="number"
                  id="distributorId"
                  value={formData.distributorId}
                  onChange={(e) => handleInputChange('distributorId', parseInt(e.target.value) || 1)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.distributorId 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder="1"
                  min="1"
                  disabled={loading}
                />
              </div>
              {errors.distributorId && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.distributorId}
                </p>
              )}
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <label htmlFor="createdBy" className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'created_by')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-tertiary theme-transition" />
                <input
                  type="text"
                  id="createdBy"
                  value={formData.createdBy}
                  onChange={(e) => handleInputChange('createdBy', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.createdBy 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder={t('clients', 'created_by_placeholder')}
                  disabled={loading}
                />
              </div>
              {errors.createdBy && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.createdBy}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border-primary theme-transition">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition disabled:opacity-50 theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary"
              >
                {t('clients', 'cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mr-2" />
                    {t('clients', 'creating')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('clients', 'create_client')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;
