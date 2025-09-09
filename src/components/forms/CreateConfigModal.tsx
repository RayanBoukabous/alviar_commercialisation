'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Save, AlertCircle, Eye, Smile, RotateCcw, Move, Search, Zap } from 'lucide-react';
import { 
  configsService, 
  CreateLivenessConfigRequest, 
  CreateMatchingConfigRequest, 
  CreateSilentLivenessConfigRequest,
  Client,
  ConfigType 
} from '@/lib/api';

interface CreateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
}

interface FormData {
  configType: ConfigType;
  clientId: number;
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
  configType?: string;
  clientId?: string;
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
  { value: 'blink', label: 'Clignement des yeux', icon: Eye },
  { value: 'smile', label: 'Sourire', icon: Smile },
  { value: 'looking_left', label: 'Regarder à gauche', icon: RotateCcw },
  { value: 'facing_up', label: 'Regarder vers le haut', icon: Move },
  { value: 'facing_down', label: 'Regarder vers le bas', icon: Move },
];

const DISTANCE_METHODS = [
  { value: 'cosine', label: 'Cosine' },
  { value: 'euclidean', label: 'Euclidean' },
  { value: 'manhattan', label: 'Manhattan' },
];

const CONFIG_TYPES = [
  { value: 'liveness', label: 'Liveness', icon: Eye, description: 'Détection de mouvements faciaux' },
  { value: 'matching', label: 'Matching', icon: Search, description: 'Comparaison de visages' },
  { value: 'silent-liveness', label: 'Silent Liveness', icon: Zap, description: 'Détection passive de vivacité' },
];

export const CreateConfigModal: React.FC<CreateConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
}) => {
  const [formData, setFormData] = useState<FormData>({
    configType: 'liveness',
    clientId: 0,
    // Liveness defaults
    requiredMovements: ['blink'],
    movementCount: 2,
    movementDurationSec: 2,
    fps: 15,
    timeoutSec: 30,
    // Matching defaults
    distanceMethod: 'cosine',
    threshold: 0.5,
    minimumConfidence: 0.7,
    maxAngle: 30,
    enablePreprocessing: true,
    enableFraudCheck: true,
    // Silent Liveness defaults
    minFrames: 10,
    minDurationSec: 3,
    decisionThreshold: 0.8,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Définir le premier client par défaut
  useEffect(() => {
    if (clients.length > 0 && formData.clientId === 0) {
      setFormData(prev => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients, formData.clientId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.configType) {
      newErrors.configType = 'Veuillez sélectionner un type de configuration';
    }

    if (!formData.clientId || formData.clientId < 1) {
      newErrors.clientId = 'Veuillez sélectionner un client';
    }

    // Validation spécifique selon le type
    if (formData.configType === 'liveness') {
      if (!formData.requiredMovements || formData.requiredMovements.length === 0) {
        newErrors.requiredMovements = 'Au moins un mouvement est requis';
      }
      if (!formData.movementCount || formData.movementCount < 1) {
        newErrors.movementCount = 'Le nombre de mouvements doit être au moins 1';
      }
      if (!formData.movementDurationSec || formData.movementDurationSec < 1) {
        newErrors.movementDurationSec = 'La durée doit être d\'au moins 1 seconde';
      }
      if (!formData.fps || formData.fps < 1 || formData.fps > 60) {
        newErrors.fps = 'Le FPS doit être entre 1 et 60';
      }
    } else if (formData.configType === 'matching') {
      if (!formData.distanceMethod) {
        newErrors.distanceMethod = 'Veuillez sélectionner une méthode de distance';
      }
      if (formData.threshold < 0 || formData.threshold > 1) {
        newErrors.threshold = 'Le seuil doit être entre 0 et 1';
      }
      if (formData.minimumConfidence < 0 || formData.minimumConfidence > 1) {
        newErrors.minimumConfidence = 'La confiance minimale doit être entre 0 et 1';
      }
      if (formData.maxAngle < 0 || formData.maxAngle > 180) {
        newErrors.maxAngle = 'L\'angle maximum doit être entre 0 et 180 degrés';
      }
    } else if (formData.configType === 'silent-liveness') {
      if (!formData.fps || formData.fps < 1 || formData.fps > 60) {
        newErrors.fps = 'Le FPS doit être entre 1 et 60';
      }
      if (formData.minFrames < 1) {
        newErrors.minFrames = 'Le nombre minimum de frames doit être au moins 1';
      }
      if (formData.minDurationSec < 1) {
        newErrors.minDurationSec = 'La durée minimale doit être d\'au moins 1 seconde';
      }
      if (formData.decisionThreshold < 0 || formData.decisionThreshold > 1) {
        newErrors.decisionThreshold = 'Le seuil de décision doit être entre 0 et 1';
      }
    }

    // Timeout commun à tous les types
    if (!formData.timeoutSec || formData.timeoutSec < 5) {
      newErrors.timeoutSec = 'Le timeout doit être d\'au moins 5 secondes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | string[]) => {
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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      let newConfig;
      
      if (formData.configType === 'liveness') {
        const configData: CreateLivenessConfigRequest = {
          requiredMovements: formData.requiredMovements,
          movementCount: formData.movementCount,
          movementDurationSec: formData.movementDurationSec,
          fps: formData.fps,
          timeoutSec: formData.timeoutSec,
        };
        console.log('Creating liveness config with data:', configData);
        newConfig = await configsService.createLivenessConfig(formData.clientId, configData);
      } else if (formData.configType === 'matching') {
        const configData: CreateMatchingConfigRequest = {
          distanceMethod: formData.distanceMethod,
          threshold: formData.threshold,
          minimumConfidence: formData.minimumConfidence,
          maxAngle: formData.maxAngle,
          enablePreprocessing: formData.enablePreprocessing,
          enableFraudCheck: formData.enableFraudCheck,
        };
        console.log('Creating matching config with data:', configData);
        newConfig = await configsService.createMatchingConfig(formData.clientId, configData);
      } else if (formData.configType === 'silent-liveness') {
        const configData: CreateSilentLivenessConfigRequest = {
          fps: formData.fps,
          timeoutSec: formData.timeoutSec,
          minFrames: formData.minFrames,
          minDurationSec: formData.minDurationSec,
          decisionThreshold: formData.decisionThreshold,
        };
        console.log('Creating silent-liveness config with data:', configData);
        newConfig = await configsService.createSilentLivenessConfig(formData.clientId, configData);
      }

      console.log('Config created successfully:', newConfig);

      // Reset form
      setFormData({
        configType: 'liveness',
        clientId: clients.length > 0 ? clients[0].id : 0,
        // Liveness defaults
        requiredMovements: ['blink'],
        movementCount: 2,
        movementDurationSec: 2,
        fps: 15,
        timeoutSec: 30,
        // Matching defaults
        distanceMethod: 'cosine',
        threshold: 0.5,
        minimumConfidence: 0.7,
        maxAngle: 30,
        enablePreprocessing: true,
        enableFraudCheck: true,
        // Silent Liveness defaults
        minFrames: 10,
        minDurationSec: 3,
        decisionThreshold: 0.8,
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating config:', error);
      setSubmitError((error as Error).message || 'Erreur lors de la création de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        configType: 'liveness',
        clientId: clients.length > 0 ? clients[0].id : 0,
        // Liveness defaults
        requiredMovements: ['blink'],
        movementCount: 2,
        movementDurationSec: 2,
        fps: 15,
        timeoutSec: 30,
        // Matching defaults
        distanceMethod: 'cosine',
        threshold: 0.5,
        minimumConfidence: 0.7,
        maxAngle: 30,
        enablePreprocessing: true,
        enableFraudCheck: true,
        // Silent Liveness defaults
        minFrames: 10,
        minDurationSec: 3,
        decisionThreshold: 0.8,
      });
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  if (!isOpen) return null;

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
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white">Nouvelle Configuration</h3>
                  <p className="text-primary-100 text-sm">
                    Créer une configuration {CONFIG_TYPES.find(t => t.value === formData.configType)?.label.toLowerCase()}
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
                    <h4 className="text-sm font-medium text-red-800">Erreur</h4>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Config Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-primary theme-transition">
                Type de Configuration *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {CONFIG_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.configType === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('configType', type.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 theme-bg-elevated theme-border-primary theme-text-primary hover:theme-bg-secondary'
                      }`}
                      disabled={loading}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm opacity-75">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.configType && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.configType}
                </p>
              )}
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <label htmlFor="clientId" className="block text-sm font-medium theme-text-primary theme-transition">
                Client *
              </label>
              <select
                id="clientId"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-transition ${
                  errors.clientId 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'theme-bg-elevated theme-border-primary theme-text-primary'
                }`}
                disabled={loading}
              >
                <option value={0}>Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (ID: {client.id})
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.clientId}
                </p>
              )}
            </div>

            {/* Liveness Fields */}
            {formData.configType === 'liveness' && (
              <>
                {/* Required Movements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text-primary theme-transition">
                    Mouvements Requis *
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
                            <span className="text-sm font-medium">{movement.label}</span>
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

                {/* Movement Count */}
                <div className="space-y-2">
                  <label htmlFor="movementCount" className="block text-sm font-medium theme-text-primary theme-transition">
                    Nombre de Mouvements *
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

                {/* Movement Duration */}
                <div className="space-y-2">
                  <label htmlFor="movementDurationSec" className="block text-sm font-medium theme-text-primary theme-transition">
                    Durée des Mouvements (secondes) *
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
              </>
            )}

            {/* FPS - Common for Liveness and Silent Liveness */}
            {(formData.configType === 'liveness' || formData.configType === 'silent-liveness') && (
              <div className="space-y-2">
                <label htmlFor="fps" className="block text-sm font-medium theme-text-primary theme-transition">
                  FPS (Images par seconde) *
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

            {/* Matching Fields */}
            {formData.configType === 'matching' && (
              <>
                {/* Distance Method */}
                <div className="space-y-2">
                  <label htmlFor="distanceMethod" className="block text-sm font-medium theme-text-primary theme-transition">
                    Méthode de Distance *
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
                        {method.label}
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
                    Seuil (0-1) *
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
                    Confiance Minimale (0-1) *
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
                    Angle Maximum (degrés) *
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
                      Activer le prétraitement
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
                      Activer la vérification anti-fraude
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Silent Liveness Fields */}
            {formData.configType === 'silent-liveness' && (
              <>
                {/* Min Frames */}
                <div className="space-y-2">
                  <label htmlFor="minFrames" className="block text-sm font-medium theme-text-primary theme-transition">
                    Frames Minimum *
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
                    Durée Minimale (secondes) *
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
                    Seuil de Décision (0-1) *
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

            {/* Timeout */}
            <div className="space-y-2">
              <label htmlFor="timeoutSec" className="block text-sm font-medium theme-text-primary theme-transition">
                Timeout (secondes) *
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
                className="px-4 py-2 text-sm font-medium rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer la Configuration
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

export default CreateConfigModal;
