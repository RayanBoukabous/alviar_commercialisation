'use client';

import React from 'react';
import { X, User, Mail, Shield, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Admin } from '@/lib/api';

interface ViewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

export const ViewAdminModal: React.FC<ViewAdminModalProps> = ({
  isOpen,
  onClose,
  admin,
}) => {
  if (!isOpen || !admin) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'suspended':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'suspended':
        return 'Suspendu';
      default:
        return 'Inconnu';
    }
  };

  const getRoleText = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'Super Admin';
      case 2:
        return 'Admin';
      case 3:
        return 'Moderator';
      default:
        return 'Utilisateur';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-elevated rounded-lg shadow-xl w-full max-w-2xl mx-4 theme-transition border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary">{admin.fullName}</h2>
              <p className="text-sm theme-text-secondary">@{admin.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium theme-text-primary mb-4">Informations personnelles</h3>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Email</p>
                  <p className="text-sm theme-text-secondary">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Nom d'utilisateur</p>
                  <p className="text-sm theme-text-secondary">@{admin.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Rôle</p>
                  <p className="text-sm theme-text-secondary">{getRoleText(admin.roleId)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusIcon(admin.status)}
                <div>
                  <p className="text-sm font-medium theme-text-primary">Statut</p>
                  <p className="text-sm theme-text-secondary">{getStatusText(admin.status)}</p>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium theme-text-primary mb-4">Informations système</h3>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Date de création</p>
                  <p className="text-sm theme-text-secondary">{formatDate(admin.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Dernière modification</p>
                  <p className="text-sm theme-text-secondary">{formatDate(admin.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 theme-text-tertiary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">Dernière connexion</p>
                  <p className="text-sm theme-text-secondary">
                    {admin.lastLogin ? formatDate(admin.lastLogin) : 'Jamais connecté'}
                  </p>
                </div>
              </div>

              {admin.lastLogout && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 theme-text-tertiary" />
                  <div>
                    <p className="text-sm font-medium theme-text-primary">Dernière déconnexion</p>
                    <p className="text-sm theme-text-secondary">{formatDate(admin.lastLogout)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="mt-8 pt-6 border-t theme-border-primary">
            <h3 className="text-lg font-medium theme-text-primary mb-4">Statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="theme-bg-secondary rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium theme-text-primary">ID Utilisateur</p>
                    <p className="text-lg font-semibold theme-text-primary">#{admin.id}</p>
                  </div>
                </div>
              </div>

              <div className="theme-bg-secondary rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium theme-text-primary">Niveau de rôle</p>
                    <p className="text-lg font-semibold theme-text-primary">{admin.roleId}</p>
                  </div>
                </div>
              </div>

              <div className="theme-bg-secondary rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium theme-text-primary">Membre depuis</p>
                    <p className="text-lg font-semibold theme-text-primary">
                      {Math.floor((Date.now() - new Date(admin.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t theme-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text-primary theme-transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};