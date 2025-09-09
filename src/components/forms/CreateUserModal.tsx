'use client';

import React, { useState } from 'react';
import { X, User, Save, AlertCircle } from 'lucide-react';
import { usersService, CreateUserRequest } from '@/lib/api';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  clientId: string;
  externalUserId: string;
  username: string;
  fullName: string;
}

interface FormErrors {
  clientId?: string;
  externalUserId?: string;
  username?: string;
  fullName?: string;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  
  // Helper function to ensure translations are strings
  const translate = (namespace: 'users', key: string): string => {
    return t(namespace, key) as string;
  };
  
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    clientId: '',
    externalUserId: '',
    username: '',
    fullName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Force re-render when language changes
  React.useEffect(() => {
    setLanguageKey(prev => prev + 1);
  }, [currentLocale]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du Client ID
    if (!formData.clientId.trim()) {
      newErrors.clientId = translate('users', 'client_id_required');
    } else if (!/^\d+$/.test(formData.clientId.trim())) {
      newErrors.clientId = translate('users', 'client_id_must_be_number');
    }

    // Validation de l'ID externe
    if (!formData.externalUserId.trim()) {
      newErrors.externalUserId = translate('users', 'external_id_required');
    } else if (formData.externalUserId.trim().length < 3) {
      newErrors.externalUserId = translate('users', 'external_id_min_length');
    }

    // Validation du nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = translate('users', 'username_required');
    } else if (formData.username.trim().length < 3) {
      newErrors.username = translate('users', 'username_min_length');
    }

    // Validation du nom complet
    if (!formData.fullName.trim()) {
      newErrors.fullName = translate('users', 'full_name_required');
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = translate('users', 'full_name_min_length');
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
      const createData: CreateUserRequest = {
        clientId: parseInt(formData.clientId.trim()),
        externalUserId: formData.externalUserId.trim(),
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
      };

      await usersService.createUser(createData);
      
      // Réinitialiser le formulaire
      setFormData({
        clientId: '',
        externalUserId: '',
        username: '',
        fullName: '',
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      
      // Gérer les erreurs de validation de l'API
      let errorMessage = 'Erreur lors de la création de l\'utilisateur';
      
      if (error.response?.data?.message) {
        const apiMessage = error.response.data.message;
        
        if (Array.isArray(apiMessage)) {
          // Si c'est un tableau de messages d'erreur
          errorMessage = apiMessage.join(', ');
        } else {
          // Si c'est un message simple
          errorMessage = apiMessage;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div key={languageKey} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-elevated rounded-lg shadow-xl w-full max-w-md mx-4 theme-transition border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold theme-text-primary theme-transition">{translate('users', 'new_user')}</h2>
              <p className="text-sm theme-text-secondary theme-transition">{translate('users', 'create_new_user')}</p>
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

          {/* Client ID */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {translate('users', 'client_id')} *
            </label>
            <input
              type="text"
              id="clientId"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              placeholder={translate('users', 'client_id_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                errors.clientId ? 'border-red-500' : ''
              }`}
            />
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.clientId}</p>
            )}
          </div>

          {/* External User ID */}
          <div>
            <label htmlFor="externalUserId" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {translate('users', 'external_id')} *
            </label>
            <input
              type="text"
              id="externalUserId"
              value={formData.externalUserId}
              onChange={(e) => handleInputChange('externalUserId', e.target.value)}
              placeholder={translate('users', 'external_id_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                errors.externalUserId ? 'border-red-500' : ''
              }`}
            />
            {errors.externalUserId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.externalUserId}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {translate('users', 'username')} *
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder={translate('users', 'username_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                errors.username ? 'border-red-500' : ''
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {translate('users', 'full_name')} *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder={translate('users', 'full_name_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                errors.fullName ? 'border-red-500' : ''
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
            >
              {translate('users', 'cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {translate('users', 'creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {translate('users', 'create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
