'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Shield, Users, Key } from 'lucide-react';
import { Role, Permission } from '@/types';
import { RolesService } from '@/lib/api/rolesService';
import { PermissionsService } from '@/lib/api/permissionsService';

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
        const permissions = await PermissionsService.getAllPermissions();
        setAllPermissions(permissions);
      } catch (err: any) {
        console.error('Erreur lors du chargement des permissions:', err);
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
      
      // Mettre à jour le nom du rôle
      const updatedRole = await RolesService.updateRole(role.id, {
        name: formData.name
      });

      // Mettre à jour les permissions séparément
      await RolesService.updateRolePermissions(role.id, formData.permissions);

      console.log('✅ Rôle mis à jour avec succès:', updatedRole);
      
      setSuccess('Rôle et permissions mis à jour avec succès');
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
      const category = permission.name.split(':')[1] || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl shadow-xl theme-bg-elevated theme-transition">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white">Modifier le Rôle</h3>
                  <p className="text-primary-100 text-sm">
                    {role.name} - Rôle #{role.id}
                  </p>
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Erreur</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Succès</h4>
                    <p className="text-sm text-green-700 mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nom du rôle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-primary theme-transition">
                Nom du rôle *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400"
                placeholder="Nom du rôle"
                required
                disabled={loading}
              />
            </div>

                        {/* Gestion des permissions */}
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <Key className="h-5 w-5 text-primary-600 mr-2" />
                            <h3 className="text-lg font-medium theme-text-primary">Permissions du rôle</h3>
                          </div>
                          
                          {loadingPermissions ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mr-2" />
                              <span className="theme-text-secondary">Chargement des permissions...</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(groupPermissionsByCategory(allPermissions)).map(([category, permissions]) => (
                                <div key={category} className="border rounded-lg p-4 theme-bg-elevated theme-border-primary">
                                  <h4 className="font-medium theme-text-primary mb-3 capitalize">
                                    {category.replace('-', ' ')} ({permissions.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {permissions.map(permission => (
                                      <label
                                        key={permission.id}
                                        className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-secondary theme-transition cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={formData.permissions.includes(permission.id)}
                                          onChange={() => handlePermissionToggle(permission.id)}
                                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                        />
                                        <span className="text-sm theme-text-primary">
                                          {permission.name.split(':')[0]}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="text-sm theme-text-secondary">
                                <strong>{formData.permissions.length}</strong> permission(s) sélectionnée(s) sur {allPermissions.length} disponibles
                              </div>
                            </div>
                          )}
                        </div>

            {/* Separator */}
            <div className="border-t theme-border-primary theme-transition"></div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border-primary theme-transition">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition disabled:opacity-50 theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg flex items-center bg-primary-600 hover:bg-primary-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-white rounded-full animate-spin mr-2" />
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