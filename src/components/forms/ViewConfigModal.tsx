'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Config, LivenessConfig, MatchingConfig, SilentLivenessConfig } from '@/lib/api';

interface ViewConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config | null;
}

const CONFIG_TYPES = [
  { value: 'liveness', label: 'Liveness', color: 'blue' },
  { value: 'matching', label: 'Matching', color: 'green' },
  { value: 'silent-liveness', label: 'Silent Liveness', color: 'purple' },
];

const MOVEMENT_LABELS: Record<string, string> = {
  blink: 'Clignement des yeux',
  smile: 'Sourire',
  looking_left: 'Regarder à gauche',
  facing_up: 'Regarder vers le haut',
  facing_down: 'Regarder vers le bas',
};

const DISTANCE_METHOD_LABELS: Record<string, string> = {
  cosine: 'Cosine',
  euclidean: 'Euclidienne',
  manhattan: 'Manhattan',
  hamming: 'Hamming',
};

export const ViewConfigModal: React.FC<ViewConfigModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen || !config) return null;

  const configType = CONFIG_TYPES.find(t => t.value === config.type);
  const typeColor = configType?.color || 'gray';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {isActive ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {status}
      </span>
    );
  };

  const renderLivenessDetails = (livenessConfig: LivenessConfig) => (
    <div className="space-y-6">
      {/* Mouvements requis */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-lg font-semibold theme-text-primary mb-4">
          Mouvements Requis
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {livenessConfig.requiredMovements.map((movement, index) => (
            <span
              key={`${config.id}-${movement}-${index}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            >
              {MOVEMENT_LABELS[movement] || movement}
            </span>
          ))}
        </div>
        <div className="text-sm theme-text-secondary">
          <span className="font-medium">{livenessConfig.movementCount}</span> mouvements • 
          <span className="font-medium"> {livenessConfig.movementDurationSec}s</span> par mouvement
        </div>
      </div>

      {/* Paramètres techniques */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            FPS
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {livenessConfig.fps}
          </p>
          <p className="text-sm theme-text-tertiary">Images par seconde</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Timeout
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {livenessConfig.timeoutSec}s
          </p>
          <p className="text-sm theme-text-tertiary">Délai maximum</p>
        </div>
      </div>
    </div>
  );

  const renderMatchingDetails = (matchingConfig: MatchingConfig) => (
    <div className="space-y-6">
      {/* Méthode de distance */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-lg font-semibold theme-text-primary mb-4">
          Méthode de Distance
        </h4>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {DISTANCE_METHOD_LABELS[matchingConfig.distanceMethod] || matchingConfig.distanceMethod}
          </span>
        </div>
      </div>

      {/* Seuils et confiance */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Seuil
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {matchingConfig.threshold}
          </p>
          <p className="text-sm theme-text-tertiary">Seuil de similarité</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Confiance Min.
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {matchingConfig.minimumConfidence}
          </p>
          <p className="text-sm theme-text-tertiary">Niveau de confiance</p>
        </div>
      </div>

      {/* Angle maximum */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-sm font-medium theme-text-secondary mb-2">
          Angle Maximum
        </h4>
        <p className="text-3xl font-bold theme-text-primary">
          {matchingConfig.maxAngle}°
        </p>
        <p className="text-sm theme-text-tertiary">Déviation autorisée</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-3">
            Prétraitement
          </h4>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              matchingConfig.enablePreprocessing 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {matchingConfig.enablePreprocessing ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-3">
            Anti-fraude
          </h4>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              matchingConfig.enableFraudCheck 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {matchingConfig.enableFraudCheck ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSilentLivenessDetails = (silentConfig: SilentLivenessConfig) => (
    <div className="space-y-6">
      {/* FPS et Timeout */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            FPS
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.fps}
          </p>
          <p className="text-sm theme-text-tertiary">Images par seconde</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Timeout
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.timeoutSec}s
          </p>
          <p className="text-sm theme-text-tertiary">Délai maximum</p>
        </div>
      </div>

      {/* Frames et durée */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Frames Minimum
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.minFrames}
          </p>
          <p className="text-sm theme-text-tertiary">Images requises</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            Durée Min.
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.minDurationSec}s
          </p>
          <p className="text-sm theme-text-tertiary">Durée minimale</p>
        </div>
      </div>

      {/* Seuil de décision */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-sm font-medium theme-text-secondary mb-2">
          Seuil de Décision
        </h4>
        <p className="text-3xl font-bold theme-text-primary">
          {silentConfig.decisionThreshold}
        </p>
        <p className="text-sm theme-text-tertiary">Seuil de confiance</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl transform overflow-hidden rounded-2xl shadow-xl theme-bg-elevated theme-transition">
          {/* Header */}
          <div className="theme-bg-elevated border-b theme-border-primary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {configType?.label.charAt(0)}
                  </span>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold theme-text-primary">Détails de la Configuration</h3>
                  <p className="theme-text-secondary text-base mt-1">
                    {configType?.label} • Config #{config.id} • Client #{config.clientId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="theme-text-tertiary hover:theme-text-primary transition-colors p-3 hover:theme-bg-secondary rounded-xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Informations générales */}
            <div className="theme-bg-secondary rounded-xl p-6 border theme-border-primary">
              <h4 className="text-xl font-semibold theme-text-primary mb-6">
                Informations Générales
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">ID de Configuration</p>
                  <p className="text-2xl font-bold theme-text-primary">#{config.id}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">ID du Client</p>
                  <p className="text-2xl font-bold theme-text-primary">#{config.clientId}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">Créé par</p>
                  <p className="text-lg font-semibold theme-text-primary">{config.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">Modifié par</p>
                  <p className="text-lg font-semibold theme-text-primary">
                    {config.updatedBy || 'Non modifié'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div className="theme-bg-secondary rounded-xl p-6 border theme-border-primary">
                <h4 className="text-lg font-semibold theme-text-primary mb-3">
                  Date de Création
                </h4>
                <p className="text-sm theme-text-secondary">
                  {formatDate(config.createdAt)}
                </p>
              </div>
              <div className="theme-bg-secondary rounded-xl p-6 border theme-border-primary">
                <h4 className="text-lg font-semibold theme-text-primary mb-3">
                  Dernière Modification
                </h4>
                <p className="text-sm theme-text-secondary">
                  {formatDate(config.updatedAt)}
                </p>
              </div>
            </div>

            {/* Détails spécifiques au type */}
            <div>
              <h4 className="text-2xl font-bold theme-text-primary mb-6">
                Configuration {configType?.label}
              </h4>
              {config.type === 'liveness' && renderLivenessDetails(config as LivenessConfig)}
              {config.type === 'matching' && renderMatchingDetails(config as MatchingConfig)}
              {config.type === 'silent-liveness' && renderSilentLivenessDetails(config as SilentLivenessConfig)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewConfigModal;
