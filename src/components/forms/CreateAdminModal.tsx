'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { adminsService, CreateAdminRequest, rolesService, Role } from '@/lib/api';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  roleId: number;
}

interface FormErrors {
  email?: string;
  username?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  roleId?: string;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    roleId: 2, // Admin par défaut
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string>('');

  // Récupérer les rôles quand le modal s'ouvre
  useEffect(() => {
    const fetchRoles = async () => {
      if (isOpen && roles.length === 0) {
        try {
          setRolesLoading(true);
          setRolesError('');
          console.log('🔍 Récupération des rôles pour le formulaire de création...');
          
          const rolesData = await rolesService.getRoles();
          console.log('✅ Rôles récupérés pour le formulaire:', rolesData);
          
          setRoles(rolesData);
          
          // Définir le premier rôle comme valeur par défaut si aucun n'est sélectionné
          if (rolesData.length > 0 && formData.roleId === 2) {
            setFormData(prev => ({ ...prev, roleId: rolesData[0].id }));
          }
        } catch (err: any) {
          console.error('❌ Erreur lors de la récupération des rôles:', err);
          setRolesError(t('admins', 'roles_error').replace('{error}', err.message || 'Erreur inconnue'));
        } finally {
          setRolesLoading(false);
        }
      }
    };

    fetchRoles();
  }, [isOpen, roles.length, formData.roleId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = t('admins', 'email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('admins', 'email_invalid');
    }

    // Validation username
    if (!formData.username.trim()) {
      newErrors.username = t('admins', 'username_required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('admins', 'username_min_length');
    }

    // Validation fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('admins', 'full_name_required');
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t('admins', 'full_name_min_length');
    }

    // Validation password
    if (!formData.password) {
      newErrors.password = t('admins', 'password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('admins', 'password_min_length');
    }

    // Validation confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('admins', 'confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('admins', 'passwords_not_match');
    }

    // Validation roleId
    if (!formData.roleId) {
      newErrors.roleId = t('admins', 'role_required');
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
      const createData: CreateAdminRequest = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password,
        roleId: formData.roleId,
      };

      await adminsService.createAdmin(createData);
      
      // Réinitialiser le formulaire
      setFormData({
        email: '',
        username: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        roleId: roles.length > 0 ? roles[0].id : 2,
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
      
      // Gérer les erreurs de validation de l'API
      let errorMessage = t('admins', 'create_error');
      
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
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
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold theme-text-primary">{t('admins', 'create_admin_title')}</h2>
              <p className="text-sm theme-text-secondary">{t('admins', 'create_admin_subtitle')}</p>
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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              {t('admins', 'email_label')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.email ? 'border-red-500' : ''
              }`}
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <User className="h-4 w-4 inline mr-2" />
              {t('admins', 'username_label')} *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.username ? 'border-red-500' : ''
              }`}
              placeholder="admin"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <User className="h-4 w-4 inline mr-2" />
              {t('admins', 'full_name_label')} *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              placeholder="John Doe (min. 3 caractères)"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              {t('admins', 'role_label')} *
            </label>
            {rolesLoading ? (
              <div className="w-full px-3 py-2 border rounded-lg theme-bg-elevated theme-border-primary flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                <span className="text-sm theme-text-secondary">{t('admins', 'loading_roles')}</span>
              </div>
            ) : rolesError ? (
              <div className="w-full px-3 py-2 border border-red-500 rounded-lg theme-bg-elevated">
                <span className="text-sm text-red-600 dark:text-red-400">{rolesError}</span>
              </div>
            ) : (
              <select
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.roleId ? 'border-red-500' : ''
                }`}
                disabled={roles.length === 0}
              >
                {roles.length === 0 ? (
                  <option value="">{t('admins', 'no_roles_available')}</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
            )}
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleId}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              {t('admins', 'password_label')} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.password ? 'border-red-500' : ''
                }`}
                placeholder="•••••••• (min. 8 caractères)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-tertiary hover:theme-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              {t('admins', 'confirm_password_label')} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="•••••••• (confirmer le mot de passe)"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-tertiary hover:theme-text-primary"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
            >
              {t('admins', 'cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('admins', 'creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('admins', 'create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};