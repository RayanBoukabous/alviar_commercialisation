'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Eye, Smile, RotateCcw, Move } from 'lucide-react';
import { configsService, UpdateLivenessConfigRequest, UpdateMatchingConfigRequest, UpdateSilentLivenessConfigRequest, Config, ConfigType, LivenessConfig, MatchingConfig, SilentLivenessConfig } from '@/lib/api';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface EditConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: Config | null;
}

interface FormData {
  // Config type
  configType: ConfigType;
  
  // Liveness fields
  requiredMovements: string[];
  movementCount: number;
  movementDurationSec: number;
  fps: number;
  timeoutSec: number;
  
  // Matching fields
  distanceMethod: string;
  threshold: number;
  minimumConfidence: number;
  maxAngle: number;
  enablePreprocessing: boolean;
  enableFraudCheck: boolean;
  
  // Silent Liveness fields
  minFrames: number;
  minDurationSec: number;
  decisionThreshold: number;
}

interface FormErrors {
  requiredMovements?: string;
  movementCount?: string;
  movementDurationSec?: string;
  fps?: string;
  timeoutSec?: string;
  distanceMethod?: string;
  threshold?: string;
  minimumConfidence?: string;
  maxAngle?: string;
  minFrames?: string;
  minDurationSec?: string;
  decisionThreshold?: string;
}

const AVAILABLE_MOVEMENTS = [
  { value: 'blink', labelKey: 'blink', icon: Eye },
  { value: 'smile', labelKey: 'smile', icon: Smile },
  { value: 'looking_left', labelKey: 'looking_left', icon: RotateCcw },
  { value: 'facing_up', labelKey: 'facing_up', icon: Move },
  { value: 'facing_down', labelKey: 'facing_down', icon: Move },
];

const DISTANCE_METHODS = [
  { value: 'cosine', labelKey: 'cosine' },
  { value: 'euclidean', labelKey: 'euclidean' },
  { value: 'manhattan', labelKey: 'manhattan' },
  { value: 'hamming', labelKey: 'hamming' },
];

const CONFIG_TYPES = [
  { value: 'liveness', labelKey: 'liveness', icon: '👁️' },
  { value: 'matching', labelKey: 'matching', icon: '🔍' },
  { value: 'silent-liveness', labelKey: 'silent_liveness', icon: '👁️' },
];

export const EditConfigModal: React.FC<EditConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  config,
}) => {
  const { t, loading: translationLoading } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    // Config type
    configType: 'liveness',
    
    // Liveness fields
    requiredMovements: ['blink'],
    movementCount: 2,
    movementDurationSec: 2,
    fps: 15,
    timeoutSec: 30,
    
    // Matching fields
    distanceMethod: 'cosine',
    threshold: 0.5,
    minimumConfidence: 0.7,
    maxAngle: 30,
    enablePreprocessing: true,
    enableFraudCheck: true,
    
    // Silent Liveness fields
    minFrames: 10,
    minDurationSec: 3,
    decisionThreshold: 0.8,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Pré-remplir le formulaire avec les données de la config
  useEffect(() => {
    if (config && isOpen) {
      const baseData = {
        configType: config.type,
        timeoutSec: (config as any).timeoutSec || 30,
      };

      if (config.type === 'liveness') {
        const livenessConfig = config as LivenessConfig;
        setFormData({
          ...baseData,
          // Liveness fields
          requiredMovements: livenessConfig.requiredMovements || ['blink'],
          movementCount: livenessConfig.movementCount || 2,
          movementDurationSec: livenessConfig.movementDurationSec || 2,
          fps: livenessConfig.fps || 15,
          // Default values for other types
          distanceMethod: 'cosine',
          threshold: 0.5,
          minimumConfidence: 0.7,
          maxAngle: 30,
          enablePreprocessing: true,
          enableFraudCheck: true,
          minFrames: 10,
          minDurationSec: 3,
          decisionThreshold: 0.8,
        });
      } else if (config.type === 'matching') {
        const matchingConfig = config as MatchingConfig;
        setFormData({
          ...baseData,
          // Matching fields
          distanceMethod: matchingConfig.distanceMethod || 'cosine',
          threshold: matchingConfig.threshold || 0.5,
          minimumConfidence: matchingConfig.minimumConfidence || 0.7,
          maxAngle: matchingConfig.maxAngle || 30,
          enablePreprocessing: matchingConfig.enablePreprocessing ?? true,
          enableFraudCheck: matchingConfig.enableFraudCheck ?? true,
          // Default values for other types
          requiredMovements: ['blink'],
          movementCount: 2,
          movementDurationSec: 2,
          fps: 15,
          minFrames: 10,
          minDurationSec: 3,
          decisionThreshold: 0.8,
        });
      } else if (config.type === 'silent-liveness') {
        const silentConfig = config as SilentLivenessConfig;
        setFormData({
          ...baseData,
          // Silent Liveness fields
          fps: silentConfig.fps || 15,
          minFrames: silentConfig.minFrames || 10,
          minDurationSec: silentConfig.minDurationSec || 3,
          decisionThreshold: silentConfig.decisionThreshold || 0.8,
          // Default values for other types
          requiredMovements: ['blink'],
          movementCount: 2,
          movementDurationSec: 2,
          distanceMethod: 'cosine',
          threshold: 0.5,
          minimumConfidence: 0.7,
          maxAngle: 30,
          enablePreprocessing: true,
          enableFraudCheck: true,
        });
      }
      
      setErrors({});
      setSubmitError('');
    }
  }, [config, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!config) return false;

    // Validation selon le type
    if (formData.configType === 'liveness') {
      // Validation commune pour liveness
      if (!formData.timeoutSec || formData.timeoutSec < 5) {
        newErrors.timeoutSec = t('clients', 'timeout_required');
      }
      if (!formData.requiredMovements || formData.requiredMovements.length === 0) {
        newErrors.requiredMovements = t('clients', 'movements_required');
      }

      if (!formData.movementCount || formData.movementCount < 1) {
        newErrors.movementCount = t('clients', 'movement_count_required');
      }

      if (!formData.movementDurationSec || formData.movementDurationSec < 1) {
        newErrors.movementDurationSec = t('clients', 'movement_duration_required');
      }

      if (!formData.fps || formData.fps < 1 || formData.fps > 60) {
        newErrors.fps = t('clients', 'fps_required');
      }
    } else if (formData.configType === 'matching') {
      if (!formData.distanceMethod) {
        newErrors.distanceMethod = t('clients', 'distance_method_required');
      }

      if (formData.threshold < 0 || formData.threshold > 1) {
        newErrors.threshold = t('clients', 'threshold_required');
      }

      if (formData.minimumConfidence < 0 || formData.minimumConfidence > 1) {
        newErrors.minimumConfidence = t('clients', 'minimum_confidence_required');
      }

      if (formData.maxAngle < 0 || formData.maxAngle > 180) {
        newErrors.maxAngle = t('clients', 'max_angle_required');
      }
    } else if (formData.configType === 'silent-liveness') {
      // Validation commune pour silent-liveness
      if (!formData.timeoutSec || formData.timeoutSec < 5) {
        newErrors.timeoutSec = t('clients', 'timeout_required');
      }
      
      if (!formData.fps || formData.fps < 1 || formData.fps > 60) {
        newErrors.fps = t('clients', 'fps_required');
      }

      if (!formData.minFrames || formData.minFrames < 1) {
        newErrors.minFrames = t('clients', 'min_frames_required');
      }

      if (!formData.minDurationSec || formData.minDurationSec < 1) {
        newErrors.minDurationSec = t('clients', 'min_duration_required');
      }

      if (formData.decisionThreshold < 0 || formData.decisionThreshold > 1) {
        newErrors.decisionThreshold = t('clients', 'decision_threshold_required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleMovementToggle = (movement: string) => {
    const newMovements = formData.requiredMovements.includes(movement)
      ? formData.requiredMovements.filter(m => m !== movement)
      : [...formData.requiredMovements, movement];
    
    handleInputChange('requiredMovements', newMovements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !config) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      let updatedConfig;

      if (formData.configType === 'liveness') {
        const configData: UpdateLivenessConfigRequest = {
          requiredMovements: formData.requiredMovements,
          movementCount: formData.movementCount,
          movementDurationSec: formData.movementDurationSec,
          fps: formData.fps,
          timeoutSec: formData.timeoutSec,
        };
        console.log('Updating liveness config with data:', configData);
        updatedConfig = await configsService.updateLivenessConfig(config.clientId, configData);
      } else if (formData.configType === 'matching') {
        const configData: UpdateMatchingConfigRequest = {
          distanceMethod: formData.distanceMethod,
          threshold: formData.threshold,
          minimumConfidence: formData.minimumConfidence,
          maxAngle: formData.maxAngle,
          enablePreprocessing: formData.enablePreprocessing,
          enableFraudCheck: formData.enableFraudCheck,
        };
        console.log('Updating matching config with data:', configData);
        updatedConfig = await configsService.updateMatchingConfig(config.clientId, configData);
      } else if (formData.configType === 'silent-liveness') {
        const configData: UpdateSilentLivenessConfigRequest = {
          fps: formData.fps,
          timeoutSec: formData.timeoutSec,
          minFrames: formData.minFrames,
          minDurationSec: formData.minDurationSec,
          decisionThreshold: formData.decisionThreshold,
        };
        console.log('Updating silent-liveness config with data:', configData);
        updatedConfig = await configsService.updateSilentLivenessConfig(config.clientId, configData);
      }

      console.log('Config updated successfully:', updatedConfig);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating config:', error);
      setSubmitError(error.message || t('clients', 'update_config_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  if (!isOpen || !config || translationLoading) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl shadow-xl theme-bg-elevated theme-transition">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg text-white">
                    {CONFIG_TYPES.find(t => t.value === config.type)?.icon}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white">{t('clients', 'edit_config_title')}</h3>
                  <p className="text-primary-100 text-sm">
                    {t('clients', 'edit_config_subtitle')
                      .replace('{type}', CONFIG_TYPES.find(t => t.value === config.type)?.labelKey ? t('clients', CONFIG_TYPES.find(t => t.value === config.type)!.labelKey) : '')
                      .replace('{id}', config.id.toString())
                      .replace('{clientId}', config.clientId.toString())}
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
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">{t('clients', 'error_title')}</h4>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Config Type Display (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-primary theme-transition">
                {t('clients', 'config_type')}
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-lg">{CONFIG_TYPES.find(t => t.value === formData.configType)?.icon}</span>
                <span className="text-sm font-medium theme-text-primary theme-transition">
                  {CONFIG_TYPES.find(t => t.value === formData.configType)?.labelKey ? t('clients', CONFIG_TYPES.find(t => t.value === formData.configType)!.labelKey) : ''}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {t('clients', 'not_modifiable')}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t theme-border-primary theme-transition"></div>

            {/* Required Movements - Only for Liveness */}
            {formData.configType === 'liveness' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium theme-text-primary theme-transition">
                  {t('clients', 'required_movements')} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_MOVEMENTS.map((movement) => {
                    const Icon = movement.icon;
                    const isSelected = formData.requiredMovements.includes(movement.value);
                    
                    return (
                      <button
                        key={movement.value}
                        type="button"
                        onClick={() => handleMovementToggle(movement.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary'
                        }`}
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('clients', movement.labelKey)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.requiredMovements && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.requiredMovements}
                  </p>
                )}
              </div>
            )}

            {/* Movement Count - Only for Liveness */}
            {formData.configType === 'liveness' && (
              <div className="space-y-2">
                <label htmlFor="movementCount" className="block text-sm font-medium theme-text-primary theme-transition">
                  {t('clients', 'movement_count')} *
                </label>
                <input
                  type="number"
                  id="movementCount"
                  value={formData.movementCount}
                  onChange={(e) => handleInputChange('movementCount', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.movementCount 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder="2"
                  min="1"
                  max="10"
                  disabled={loading}
                />
                {errors.movementCount && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.movementCount}
                  </p>
                )}
              </div>
            )}

            {/* Movement Duration - Only for Liveness */}
            {formData.configType === 'liveness' && (
              <div className="space-y-2">
                <label htmlFor="movementDurationSec" className="block text-sm font-medium theme-text-primary theme-transition">
                  {t('clients', 'movement_duration')} *
                </label>
                <input
                  type="number"
                  id="movementDurationSec"
                  value={formData.movementDurationSec}
                  onChange={(e) => handleInputChange('movementDurationSec', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.movementDurationSec 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder="2"
                  min="1"
                  max="10"
                  disabled={loading}
                />
                {errors.movementDurationSec && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.movementDurationSec}
                  </p>
                )}
              </div>
            )}

            {/* FPS - For Liveness and Silent Liveness */}
            {(formData.configType === 'liveness' || formData.configType === 'silent-liveness') && (
              <div className="space-y-2">
                <label htmlFor="fps" className="block text-sm font-medium theme-text-primary theme-transition">
                  {t('clients', 'fps_label')} *
                </label>
                <input
                  type="number"
                  id="fps"
                  value={formData.fps}
                  onChange={(e) => handleInputChange('fps', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.fps 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder="15"
                  min="1"
                  max="60"
                  disabled={loading}
                />
                {errors.fps && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fps}
                  </p>
                )}
              </div>
            )}

            {/* Matching specific fields */}
            {formData.configType === 'matching' && (
              <>
                {/* Distance Method */}
                <div className="space-y-2">
                  <label htmlFor="distanceMethod" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'distance_method')} *
                  </label>
                  <select
                    id="distanceMethod"
                    value={formData.distanceMethod}
                    onChange={(e) => handleInputChange('distanceMethod', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.distanceMethod 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary'
                    }`}
                    disabled={loading}
                  >
                    {DISTANCE_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {t('clients', method.labelKey)}
                      </option>
                    ))}
                  </select>
                  {errors.distanceMethod && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.distanceMethod}
                    </p>
                  )}
                </div>

                {/* Threshold */}
                <div className="space-y-2">
                  <label htmlFor="threshold" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'threshold')} *
                  </label>
                  <input
                    type="number"
                    id="threshold"
                    value={formData.threshold}
                    onChange={(e) => handleInputChange('threshold', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.threshold 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="0.5"
                    min="0"
                    max="1"
                    step="0.1"
                    disabled={loading}
                  />
                  {errors.threshold && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.threshold}
                    </p>
                  )}
                </div>

                {/* Minimum Confidence */}
                <div className="space-y-2">
                  <label htmlFor="minimumConfidence" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'minimum_confidence')} *
                  </label>
                  <input
                    type="number"
                    id="minimumConfidence"
                    value={formData.minimumConfidence}
                    onChange={(e) => handleInputChange('minimumConfidence', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.minimumConfidence 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="0.7"
                    min="0"
                    max="1"
                    step="0.1"
                    disabled={loading}
                  />
                  {errors.minimumConfidence && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.minimumConfidence}
                    </p>
                  )}
                </div>

                {/* Max Angle */}
                <div className="space-y-2">
                  <label htmlFor="maxAngle" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'max_angle')} *
                  </label>
                  <input
                    type="number"
                    id="maxAngle"
                    value={formData.maxAngle}
                    onChange={(e) => handleInputChange('maxAngle', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.maxAngle 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="30"
                    min="0"
                    max="180"
                    disabled={loading}
                  />
                  {errors.maxAngle && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.maxAngle}
                    </p>
                  )}
                </div>

                {/* Enable Preprocessing */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enablePreprocessing}
                      onChange={(e) => handleInputChange('enablePreprocessing', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {t('clients', 'enable_preprocessing')}
                    </span>
                  </label>
                </div>

                {/* Enable Fraud Check */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableFraudCheck}
                      onChange={(e) => handleInputChange('enableFraudCheck', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {t('clients', 'enable_fraud_check')}
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Silent Liveness specific fields */}
            {formData.configType === 'silent-liveness' && (
              <>
                {/* Min Frames */}
                <div className="space-y-2">
                  <label htmlFor="minFrames" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'min_frames')} *
                  </label>
                  <input
                    type="number"
                    id="minFrames"
                    value={formData.minFrames}
                    onChange={(e) => handleInputChange('minFrames', parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.minFrames 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="10"
                    min="1"
                    disabled={loading}
                  />
                  {errors.minFrames && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.minFrames}
                    </p>
                  )}
                </div>

                {/* Min Duration */}
                <div className="space-y-2">
                  <label htmlFor="minDurationSec" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'min_duration')} *
                  </label>
                  <input
                    type="number"
                    id="minDurationSec"
                    value={formData.minDurationSec}
                    onChange={(e) => handleInputChange('minDurationSec', parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.minDurationSec 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="3"
                    min="1"
                    disabled={loading}
                  />
                  {errors.minDurationSec && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.minDurationSec}
                    </p>
                  )}
                </div>

                {/* Decision Threshold */}
                <div className="space-y-2">
                  <label htmlFor="decisionThreshold" className="block text-sm font-medium theme-text-primary theme-transition">
                    {t('clients', 'decision_threshold')} *
                  </label>
                  <input
                    type="number"
                    id="decisionThreshold"
                    value={formData.decisionThreshold}
                    onChange={(e) => handleInputChange('decisionThreshold', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                      errors.decisionThreshold 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                    }`}
                    placeholder="0.8"
                    min="0"
                    max="1"
                    step="0.1"
                    disabled={loading}
                  />
                  {errors.decisionThreshold && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.decisionThreshold}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Timeout - Only for Liveness and Silent Liveness */}
            {(formData.configType === 'liveness' || formData.configType === 'silent-liveness') && (
              <div className="space-y-2">
                <label htmlFor="timeoutSec" className="block text-sm font-medium theme-text-primary theme-transition">
                  {t('clients', 'timeout_seconds')} *
                </label>
                <input
                  type="number"
                  id="timeoutSec"
                  value={formData.timeoutSec}
                  onChange={(e) => handleInputChange('timeoutSec', parseInt(e.target.value) || 5)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                    errors.timeoutSec 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'theme-bg-elevated theme-border-primary theme-text-primary placeholder-gray-500 dark:placeholder-slate-400'
                  }`}
                  placeholder="30"
                  min="5"
                  max="120"
                  disabled={loading}
                />
                {errors.timeoutSec && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.timeoutSec}
                  </p>
                )}
              </div>
            )}

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
                {t('clients', 'cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mr-2" />
                    {t('clients', 'updating')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('clients', 'update_config')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditConfigModal;
