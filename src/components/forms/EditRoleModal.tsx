'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Role } from '@/types';
import { RolesService } from '@/lib/api/rolesService';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: (updatedRole: Role) => void;
}

export function EditRoleModal({ isOpen, onClose, role, onSuccess }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Initialiser le formulaire quand le rôle change
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔍 Mise à jour du rôle...', formData);
      
      const updatedRole = await RolesService.updateRole(role.id, {
        name: formData.name
      });

      console.log('✅ Rôle mis à jour avec succès:', updatedRole);
      
      setSuccess('Rôle mis à jour avec succès');
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

            {/* Note sur les permissions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Seul le nom du rôle peut être modifié. Les permissions sont gérées séparément par l'administrateur système.
                  </p>
                </div>
              </div>
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