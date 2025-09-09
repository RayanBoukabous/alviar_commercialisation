'use client';

import React, { useState } from 'react';
import { X, Shield, Save, AlertCircle } from 'lucide-react';
import { permissionsService } from '@/lib/api';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
}

interface FormErrors {
  name?: string;
}

export const CreatePermissionModal: React.FC<CreatePermissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('permissions');
  const [formData, setFormData] = useState<FormData>({
    name: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom de la permission
    if (!formData.name.trim()) {
      newErrors.name = t('createPermission.permissionNameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('createPermission.permissionNameMinLength');
    } else if (!/^[a-zA-Z0-9:_-]+$/.test(formData.name.trim())) {
      newErrors.name = t('createPermission.permissionNameInvalidChars');
    } else {
      // Validation du format spécifique de l'API
      const name = formData.name.trim();
      const parts = name.split(':');
      
      // Vérifier les formats acceptés: action:module ou module:resource:action
      if (parts.length === 2) {
        // Format: action:module
        const [action, module] = parts;
        if (!action.trim() || !module.trim()) {
          newErrors.name = t('createPermission.permissionNameInvalidFormat2');
        }
      } else if (parts.length === 3) {
        // Format: module:resource:action
        const [module, resource, action] = parts;
        if (!module.trim() || !resource.trim() || !action.trim()) {
          newErrors.name = t('createPermission.permissionNameInvalidFormat3');
        }
      } else {
        newErrors.name = t('createPermission.permissionNameInvalidFormat');
      }
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
      const createData = {
        name: formData.name.trim(),
      };

      await permissionsService.createPermission(createData);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création de la permission:', error);
      
      // Gérer les erreurs de validation de l'API
      let errorMessage = t('createPermission.errorCreating');
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-elevated rounded-lg shadow-xl w-full max-w-md mx-4 theme-transition border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold theme-text-primary theme-transition">{t('createPermission.title')}</h2>
              <p className="text-sm theme-text-secondary theme-transition">{t('createPermission.description')}</p>
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

          {/* Permission Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium theme-text-primary theme-transition mb-1">
              {t('createPermission.permissionName')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('createPermission.permissionNamePlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400 ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs theme-text-tertiary" dangerouslySetInnerHTML={{ __html: t('createPermission.acceptedFormats') }} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
            >
              {t('createPermission.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('createPermission.creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('createPermission.create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
