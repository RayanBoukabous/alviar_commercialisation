'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Save, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { rolesService, permissionsService, Permission } from '@/lib/api';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  permissionsIds: number[];
}

interface FormErrors {
  name?: string;
  permissionsIds?: string;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    permissionsIds: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string>('');

  // Récupérer les permissions quand le modal s'ouvre
  useEffect(() => {
    const fetchPermissions = async () => {
      if (isOpen && permissions.length === 0) {
        try {
          setPermissionsLoading(true);
          setPermissionsError('');
          console.log('🔍 Récupération des permissions pour le formulaire de création de rôle...');
          
          const permissionsData = await permissionsService.getAllPermissions();
          console.log('✅ Permissions récupérées pour le formulaire:', permissionsData);
          
          setPermissions(permissionsData);
        } catch (err: any) {
          console.error('❌ Erreur lors de la récupération des permissions:', err);
          setPermissionsError(`Erreur lors du chargement des permissions: ${err.message || 'Erreur inconnue'}`);
        } finally {
          setPermissionsLoading(false);
        }
      }
    };

    fetchPermissions();
  }, [isOpen, permissions.length]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation name
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du rôle est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom du rôle doit contenir au moins 2 caractères';
    }

    // Validation permissions
    if (formData.permissionsIds.length === 0) {
      newErrors.permissionsIds = 'Au moins une permission est requise';
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
        permissionsIds: formData.permissionsIds,
      };

      console.log('🔍 Création du rôle avec les données:', createData);
      await rolesService.createRole(createData);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        permissionsIds: [],
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création du rôle:', error);
      
      // Gérer les erreurs de validation de l'API
      let errorMessage = 'Erreur lors de la création du rôle';
      
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

  const handleInputChange = (field: keyof FormData, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissionsIds: prev.permissionsIds.includes(permissionId)
        ? prev.permissionsIds.filter(id => id !== permissionId)
        : [...prev.permissionsIds, permissionId]
    }));
    // Effacer l'erreur des permissions
    if (errors.permissionsIds) {
      setErrors(prev => ({ ...prev, permissionsIds: undefined }));
    }
  };

  const handleSelectAll = () => {
    if (formData.permissionsIds.length === permissions.length) {
      // Désélectionner tout
      setFormData(prev => ({ ...prev, permissionsIds: [] }));
    } else {
      // Sélectionner tout
      setFormData(prev => ({ ...prev, permissionsIds: permissions.map(p => p.id) }));
    }
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const groups: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      const category = permission.name.split(':')[0] || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    
    return groups;
  };

  if (!isOpen) return null;

  const permissionGroups = groupPermissionsByCategory(permissions);
  const allSelected = formData.permissionsIds.length === permissions.length && permissions.length > 0;
  const someSelected = formData.permissionsIds.length > 0 && formData.permissionsIds.length < permissions.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-elevated rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto theme-transition border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary sticky top-0 theme-bg-elevated">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold theme-text-primary">Nouveau Rôle</h2>
              <p className="text-sm theme-text-secondary">Créer un nouveau rôle avec ses permissions</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Shield className="h-4 w-4 inline mr-2" />
              Nom du rôle *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="ex: admin, moderator, user"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium theme-text-primary">
                <Shield className="h-4 w-4 inline mr-2" />
                Permissions * ({formData.permissionsIds.length} sélectionnée{formData.permissionsIds.length > 1 ? 's' : ''})
              </label>
              {permissions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              )}
            </div>

            {permissionsLoading ? (
              <div className="border rounded-lg p-4 theme-bg-elevated theme-border-primary">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm theme-text-secondary">Chargement des permissions...</span>
                </div>
              </div>
            ) : permissionsError ? (
              <div className="border border-red-500 rounded-lg p-4 theme-bg-elevated">
                <span className="text-sm text-red-600 dark:text-red-400">{permissionsError}</span>
              </div>
            ) : (
              <div className="border rounded-lg theme-bg-elevated theme-border-primary max-h-96 overflow-y-auto">
                {Object.entries(permissionGroups).map(([category, categoryPermissions]) => (
                  <div key={category} className="border-b theme-border-secondary last:border-b-0">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-medium theme-text-primary capitalize">
                        {category} ({categoryPermissions.length})
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-3 cursor-pointer hover:theme-bg-secondary p-2 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {formData.permissionsIds.includes(permission.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 theme-text-tertiary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium theme-text-primary">
                              {permission.name}
                            </div>
                            <div className="text-xs theme-text-tertiary">
                              ID: {permission.id}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.permissionsIds.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.permissionsIds && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.permissionsIds}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || permissionsLoading}
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
                  Créer le rôle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
