'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Save, AlertCircle } from 'lucide-react';
import { adminsService, UpdateAdminRequest, Admin } from '@/lib/api';

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: Admin | null;
}

interface FormData {
  email: string;
  username: string;
  fullName: string;
  roleId: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface FormErrors {
  email?: string;
  username?: string;
  fullName?: string;
  roleId?: string;
  status?: string;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  admin,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    fullName: '',
    roleId: 2,
    status: 'active',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const roleOptions = [
    { value: 1, label: 'Super Admin' },
    { value: 2, label: 'Admin' },
    { value: 3, label: 'Moderator' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
  ];

  // Initialiser le formulaire avec les données de l'admin
  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        roleId: admin.roleId,
        status: admin.status,
      });
    }
  }, [admin]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation username
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    // Validation fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

    // Validation roleId
    if (!formData.roleId) {
      newErrors.roleId = 'Le rôle est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admin || !validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const updateData: UpdateAdminRequest = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        roleId: formData.roleId,
        status: formData.status,
      };

      await adminsService.updateAdmin(admin.id, updateData);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'administrateur:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Erreur lors de la mise à jour de l\'administrateur'
      );
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

  if (!isOpen || !admin) return null;

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
              <h2 className="text-lg font-semibold theme-text-primary">Modifier l'Administrateur</h2>
              <p className="text-sm theme-text-secondary">Modifier les informations de {admin.fullName}</p>
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
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email *
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
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nom d'utilisateur *
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
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              placeholder="Admin User"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              Rôle *
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.roleId ? 'border-red-500' : ''
              }`}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              Statut *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.status ? 'border-red-500' : ''
              }`}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};