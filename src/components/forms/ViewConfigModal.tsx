'use client';

import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Config, LivenessConfig, MatchingConfig, SilentLivenessConfig } from '@/lib/api';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ViewConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config | null;
}

const CONFIG_TYPES = [
  { value: 'liveness', labelKey: 'liveness', color: 'blue' },
  { value: 'matching', labelKey: 'matching', color: 'green' },
  { value: 'silent-liveness', labelKey: 'silent_liveness', color: 'purple' },
];

export const ViewConfigModal: React.FC<ViewConfigModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const { t, loading: translationLoading } = useLanguage();
  
  if (!isOpen || !config || translationLoading) return null;

  const configType = CONFIG_TYPES.find(type => type.value === config.type);
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
          {t('configs', 'required_movements')}
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {livenessConfig.requiredMovements.map((movement, index) => (
            <span
              key={`${config.id}-${movement}-${index}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            >
              {t('clients', movement)}
            </span>
          ))}
        </div>
        <div className="text-sm theme-text-secondary">
          <span className="font-medium">{livenessConfig.movementCount}</span> {t('configs', 'movements')} • 
          <span className="font-medium"> {livenessConfig.movementDurationSec}s</span> {t('configs', 'movements_per_movement')}
        </div>
      </div>

      {/* Paramètres techniques */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('clients', 'fps_label')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {livenessConfig.fps}
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'images_per_second')}</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('clients', 'timeout_seconds')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {livenessConfig.timeoutSec}s
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'max_delay')}</p>
        </div>
      </div>
    </div>
  );

  const renderMatchingDetails = (matchingConfig: MatchingConfig) => (
    <div className="space-y-6">
      {/* Méthode de distance */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-lg font-semibold theme-text-primary mb-4">
          {t('configs', 'distance_method')}
        </h4>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {t('clients', matchingConfig.distanceMethod)}
          </span>
        </div>
      </div>

      {/* Seuils et confiance */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('configs', 'threshold')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {matchingConfig.threshold}
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'similarity_threshold')}</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('clients', 'minimum_confidence')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {matchingConfig.minimumConfidence}
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'confidence_level')}</p>
        </div>
      </div>

      {/* Angle maximum */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-sm font-medium theme-text-secondary mb-2">
          {t('clients', 'max_angle')}
        </h4>
        <p className="text-3xl font-bold theme-text-primary">
          {matchingConfig.maxAngle}°
        </p>
        <p className="text-sm theme-text-tertiary">{t('configs', 'max_deviation')}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-3">
            {t('configs', 'preprocessing_label')}
          </h4>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              matchingConfig.enablePreprocessing 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {matchingConfig.enablePreprocessing ? t('configs', 'enabled') : t('configs', 'disabled')}
            </span>
          </div>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-3">
            {t('configs', 'anti_fraud_label')}
          </h4>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              matchingConfig.enableFraudCheck 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {matchingConfig.enableFraudCheck ? t('configs', 'enabled') : t('configs', 'disabled')}
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
            {t('clients', 'fps_label')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.fps}
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'images_per_second')}</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('clients', 'timeout_seconds')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.timeoutSec}s
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'max_delay')}</p>
        </div>
      </div>

      {/* Frames et durée */}
      <div className="grid grid-cols-2 gap-6">
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('configs', 'min_frames_label')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.minFrames}
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'required_images')}</p>
        </div>
        <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
          <h4 className="text-sm font-medium theme-text-secondary mb-2">
            {t('configs', 'min_duration_label')}
          </h4>
          <p className="text-3xl font-bold theme-text-primary">
            {silentConfig.minDurationSec}s
          </p>
          <p className="text-sm theme-text-tertiary">{t('configs', 'min_duration_desc')}</p>
        </div>
      </div>

      {/* Seuil de décision */}
      <div className="theme-bg-secondary rounded-lg p-6 border theme-border-primary">
        <h4 className="text-sm font-medium theme-text-secondary mb-2">
          {t('configs', 'decision_threshold_label')}
        </h4>
        <p className="text-3xl font-bold theme-text-primary">
          {silentConfig.decisionThreshold}
        </p>
        <p className="text-sm theme-text-tertiary">{t('configs', 'confidence_threshold')}</p>
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
                    {configType?.labelKey ? t('clients', configType.labelKey).charAt(0) : 'C'}
                  </span>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold theme-text-primary">{t('configs', 'view_config_title')}</h3>
                  <p className="theme-text-secondary text-base mt-1">
                    {t('configs', 'view_config_subtitle')
                      .replace('{type}', configType?.labelKey ? t('clients', configType.labelKey) : '')
                      .replace('{id}', config.id.toString())
                      .replace('{clientId}', config.clientId.toString())}
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
                {t('configs', 'general_information')}
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">{t('configs', 'config_id')}</p>
                  <p className="text-2xl font-bold theme-text-primary">#{config.id}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">{t('configs', 'client_id')}</p>
                  <p className="text-2xl font-bold theme-text-primary">#{config.clientId}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">{t('configs', 'created_by_label')}</p>
                  <p className="text-lg font-semibold theme-text-primary">{config.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-tertiary mb-1">{t('configs', 'modified_by_label')}</p>
                  <p className="text-lg font-semibold theme-text-primary">
                    {config.updatedBy || t('configs', 'not_modified')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div className="theme-bg-secondary rounded-xl p-6 border theme-border-primary">
                <h4 className="text-lg font-semibold theme-text-primary mb-3">
                  {t('configs', 'creation_date_label')}
                </h4>
                <p className="text-sm theme-text-secondary">
                  {formatDate(config.createdAt)}
                </p>
              </div>
              <div className="theme-bg-secondary rounded-xl p-6 border theme-border-primary">
                <h4 className="text-lg font-semibold theme-text-primary mb-3">
                  {t('configs', 'last_modification')}
                </h4>
                <p className="text-sm theme-text-secondary">
                  {formatDate(config.updatedAt)}
                </p>
              </div>
            </div>

            {/* Détails spécifiques au type */}
            <div>
              <h4 className="text-2xl font-bold theme-text-primary mb-6">
                {t('configs', 'config_details').replace('{type}', configType?.labelKey ? t('clients', configType.labelKey) : '')}
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
