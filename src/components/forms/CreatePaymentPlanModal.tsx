'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { paymentPlansService, BillingCycle, Currency, CreatePaymentPlanRequest } from '@/lib/api';

interface CreatePaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  requestLimit: string;
  isDefault: boolean;
  trialDays: string;
  features: string[];
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  currency?: string;
  billingCycle?: string;
  requestLimit?: string;
  trialDays?: string;
  features?: string;
}

export const CreatePaymentPlanModal: React.FC<CreatePaymentPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    currency: '',
    billingCycle: '',
    requestLimit: '',
    isDefault: false,
    trialDays: '0',
    features: [''],
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Charger les options au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadBillingCyclesAndCurrencies();
    }
  }, [isOpen]);

  const loadBillingCyclesAndCurrencies = async () => {
    try {
      setLoadingOptions(true);
      const data = await paymentPlansService.getBillingCyclesAndCurrencies();
      setBillingCycles(data.billingCycles);
      setCurrencies(data.currencies);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      setSubmitError('Erreur lors du chargement des options');
    } finally {
      setLoadingOptions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du plan est requis';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom du plan doit contenir au moins 3 caractères';
    }

    // Validation du prix
    if (!formData.price.trim()) {
      newErrors.price = 'Le prix est requis';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Le prix doit être un nombre positif';
      }
    }

    // Validation de la devise
    if (!formData.currency) {
      newErrors.currency = 'La devise est requise';
    }

    // Validation du cycle de facturation
    if (!formData.billingCycle) {
      newErrors.billingCycle = 'Le cycle de facturation est requis';
    }

    // Validation de la limite de requêtes
    if (!formData.requestLimit.trim()) {
      newErrors.requestLimit = 'La limite de requêtes est requise';
    } else {
      const limit = parseInt(formData.requestLimit);
      if (isNaN(limit) || limit < 1) {
        newErrors.requestLimit = 'La limite doit être un nombre positif';
      }
    }

    // Validation des jours d'essai
    const trialDays = parseInt(formData.trialDays);
    if (isNaN(trialDays) || trialDays < 0) {
      newErrors.trialDays = 'Les jours d\'essai doivent être un nombre positif ou zéro';
    }

    // Validation des fonctionnalités
    const validFeatures = formData.features.filter(f => f.trim() !== '');
    if (validFeatures.length === 0) {
      newErrors.features = 'Au moins une fonctionnalité est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const validFeatures = formData.features.filter(f => f.trim() !== '');
      
      const createData: CreatePaymentPlanRequest = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        billingCycle: formData.billingCycle,
        requestLimit: parseInt(formData.requestLimit),
        isDefault: formData.isDefault,
        trialDays: parseInt(formData.trialDays),
        features: validFeatures,
        isActive: formData.isActive,
      };

      await paymentPlansService.createPaymentPlan(createData);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        price: '',
        currency: '',
        billingCycle: '',
        requestLimit: '',
        isDefault: false,
        trialDays: '0',
        features: [''],
        isActive: true,
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création du plan:', error);
      
      let errorMessage = 'Erreur lors de la création du plan';
      
      if (error.response?.data?.message) {
        const apiMessage = error.response.data.message;
        
        if (Array.isArray(apiMessage)) {
          errorMessage = apiMessage.join(', ');
        } else {
          errorMessage = apiMessage;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
    
    if (errors.features) {
      setErrors(prev => ({ ...prev, features: undefined }));
    }
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-elevated rounded-lg shadow-xl w-full max-w-2xl mx-4 theme-transition border theme-border-primary max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <CreditCard className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold theme-text-primary theme-transition">Nouveau Plan de Paiement</h2>
              <p className="text-sm theme-text-secondary theme-transition">Créer un nouveau plan de paiement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  {submitError.includes(', ') ? (
                    <ul className="list-disc list-inside space-y-1">
                      {submitError.split(', ').map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{submitError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading Options */}
          {loadingOptions && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm theme-text-secondary mt-2">Chargement des options...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom du plan */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Nom du Plan *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Premium Plan, Basic Plan..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Prix */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Prix *
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Ex: 29.99"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                  errors.price ? 'border-red-500' : ''
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
              )}
            </div>

            {/* Devise */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Devise *
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.currency ? 'border-red-500' : ''
                }`}
              >
                <option value="">Sélectionner une devise</option>
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.value}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currency}</p>
              )}
            </div>

            {/* Cycle de facturation */}
            <div>
              <label htmlFor="billingCycle" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Cycle de Facturation *
              </label>
              <select
                id="billingCycle"
                value={formData.billingCycle}
                onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.billingCycle ? 'border-red-500' : ''
                }`}
              >
                <option value="">Sélectionner un cycle</option>
                {billingCycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
              {errors.billingCycle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.billingCycle}</p>
              )}
            </div>

            {/* Limite de requêtes */}
            <div>
              <label htmlFor="requestLimit" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Limite de Requêtes *
              </label>
              <input
                type="number"
                id="requestLimit"
                min="1"
                value={formData.requestLimit}
                onChange={(e) => handleInputChange('requestLimit', e.target.value)}
                placeholder="Ex: 1000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                  errors.requestLimit ? 'border-red-500' : ''
                }`}
              />
              {errors.requestLimit && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.requestLimit}</p>
              )}
            </div>

            {/* Jours d'essai */}
            <div>
              <label htmlFor="trialDays" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
                Jours d'Essai
              </label>
              <input
                type="number"
                id="trialDays"
                min="0"
                value={formData.trialDays}
                onChange={(e) => handleInputChange('trialDays', e.target.value)}
                placeholder="Ex: 30"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                  errors.trialDays ? 'border-red-500' : ''
                }`}
              />
              {errors.trialDays && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.trialDays}</p>
              )}
            </div>
          </div>

          {/* Fonctionnalités */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              Fonctionnalités *
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Ex: api_access, premium_support..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 theme-transition"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une fonctionnalité
            </button>
            {errors.features && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.features}</p>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm theme-text-primary">Plan par défaut</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm theme-text-primary">Plan actif</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
