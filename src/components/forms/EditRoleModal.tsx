'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Shield, Users, Key, CheckSquare, Square } from 'lucide-react';
import { Role, Permission } from '@/types';
import { rolesService, permissionsService } from '@/lib/api';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: (updatedRole: Role) => void;
}

export function EditRoleModal({ isOpen, onClose, role, onSuccess }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as number[]
  });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Charger toutes les permissions disponibles
  useEffect(() => {
    const loadPermissions = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingPermissions(true);
        setError('');
        console.log('🔍 Chargement des permissions pour l\'édition du rôle...');
        const permissions = await permissionsService.getAllPermissions();
        setAllPermissions(permissions);
        console.log('✅ Permissions chargées pour l\'édition:', permissions);
      } catch (err: any) {
        console.error('❌ Erreur lors du chargement des permissions:', err);
        setError(`Erreur lors du chargement des permissions: ${err.message}`);
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [isOpen]);

  // Initialiser le formulaire quand le rôle change
  useEffect(() => {
    if (role) {
      const currentPermissionIds = role.permissions?.map(p => p.permissionId) || [];
      setFormData({
        name: role.name,
        permissions: currentPermissionIds
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) return;
    if (!formData.name.trim()) {
      setError('Le nom du rôle est requis.');
      return;
    }
    if (formData.permissions.length === 0) {
      setError('Au moins une permission doit être sélectionnée.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔍 Mise à jour du rôle...', formData);
      
      // Mettre à jour le rôle avec le nom et les permissions en une seule requête
      const updatedRole = await rolesService.updateRole(role.id, {
        name: formData.name,
        permissionsIds: formData.permissions
      });

      console.log('✅ Rôle et permissions mis à jour avec succès:', updatedRole);
      
      setSuccess('Rôle et permissions mis à jour avec succès');
      
      // Appeler onSuccess pour rafraîchir la liste des rôles
      onSuccess(updatedRole);
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour du rôle:', err);
      setError(`Erreur lors de la mise à jour du rôle: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    if (!loading) {
      setError('');
      setSuccess('');
      onClose();
    }
  };

  // Gérer la sélection/désélection des permissions
  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Grouper les permissions par catégorie
  const groupPermissionsByCategory = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      const category = permission.name.split(':')[0] || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  // Gérer la sélection/désélection de toutes les permissions
  const handleSelectAll = () => {
    if (formData.permissions.length === allPermissions.length) {
      // Désélectionner tout
      setFormData(prev => ({ ...prev, permissions: [] }));
    } else {
      // Sélectionner tout
      setFormData(prev => ({ ...prev, permissions: allPermissions.map(p => p.id) }));
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg shadow-xl theme-bg-elevated theme-transition border theme-border-primary">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b theme-border-primary">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold theme-text-primary">Modifier le Rôle</h2>
                <p className="text-sm theme-text-secondary">Modifier les informations de "{role.name}" (ID: {role.id})</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:theme-bg-secondary rounded-lg theme-transition disabled:opacity-50"
            >
              <X className="h-5 w-5 theme-text-tertiary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Submit Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nom du rôle */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Shield className="h-4 w-4 inline mr-2" />
                Nom du rôle *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                placeholder="ex: admin, moderator, user"
                required
                disabled={loading}
              />
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium theme-text-primary">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Permissions * ({formData.permissions.length} sélectionnée{formData.permissions.length > 1 ? 's' : ''})
                </label>
                {allPermissions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {formData.permissions.length === allPermissions.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                )}
              </div>

              {loadingPermissions ? (
                <div className="border rounded-lg p-4 theme-bg-elevated theme-border-primary">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm theme-text-secondary">Chargement des permissions...</span>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg theme-bg-elevated theme-border-primary max-h-96 overflow-y-auto">
                  {Object.entries(groupPermissionsByCategory(allPermissions)).map(([category, categoryPermissions]) => (
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
                              {formData.permissions.includes(permission.id) ? (
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
                              checked={formData.permissions.includes(permission.id)}
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
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border-primary">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || loadingPermissions}
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
                    Mettre à jour le rôle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}