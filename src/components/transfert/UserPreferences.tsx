'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface UserPreferencesProps {
  isRTL: boolean;
  onPreferencesChange: (preferences: any) => void;
}

export const UserPreferences: React.FC<UserPreferencesProps> = React.memo(({
  isRTL,
  onPreferencesChange
}) => {
  const [preferences, setPreferences] = useState({
    itemsPerPage: 10,
    autoRefresh: true,
    refreshInterval: 30,
    showStats: true,
    showPerformance: true,
    compactMode: false,
    animations: true,
    soundEffects: false,
    notifications: true
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('transfert-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transfert-preferences', JSON.stringify(preferences));
    onPreferencesChange(preferences);
  }, [preferences, onPreferencesChange]);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const defaultPreferences = {
      itemsPerPage: 10,
      autoRefresh: true,
      refreshInterval: 30,
      showStats: true,
      showPerformance: true,
      compactMode: false,
      animations: true,
      soundEffects: false,
      notifications: true
    };
    setPreferences(defaultPreferences);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        title={isRTL ? 'الإعدادات' : 'Paramètres'}
      >
        <Settings className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated theme-transition rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                {isRTL ? 'إعدادات المستخدم' : 'Préférences utilisateur'}
              </h2>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'تخصيص تجربة الاستخدام' : 'Personnaliser l\'expérience utilisateur'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <RotateCcw className="h-5 w-5 theme-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Affichage */}
          <div>
            <h3 className="text-lg font-medium theme-text-primary theme-transition mb-4">
              {isRTL ? 'العرض' : 'Affichage'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'عدد العناصر في الصفحة' : 'Éléments par page'}
                </label>
                <select
                  value={preferences.itemsPerPage}
                  onChange={(e) => handlePreferenceChange('itemsPerPage', parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'الوضع المدمج' : 'Mode compact'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'إظهار الإحصائيات' : 'Afficher les statistiques'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.showStats}
                  onChange={(e) => handlePreferenceChange('showStats', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'إظهار الأداء' : 'Afficher les performances'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.showPerformance}
                  onChange={(e) => handlePreferenceChange('showPerformance', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Actualisation */}
          <div>
            <h3 className="text-lg font-medium theme-text-primary theme-transition mb-4">
              {isRTL ? 'التحديث التلقائي' : 'Actualisation automatique'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'تفعيل التحديث التلقائي' : 'Activer l\'actualisation automatique'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(e) => handlePreferenceChange('autoRefresh', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'فترة التحديث (ثواني)' : 'Intervalle de mise à jour (secondes)'}
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={preferences.refreshInterval}
                  onChange={(e) => handlePreferenceChange('refreshInterval', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                />
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div>
            <h3 className="text-lg font-medium theme-text-primary theme-transition mb-4">
              {isRTL ? 'التفاعل' : 'Interaction'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'الرسوم المتحركة' : 'Animations'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.animations}
                  onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'الأصوات' : 'Effets sonores'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => handlePreferenceChange('soundEffects', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium theme-text-primary theme-transition">
                  {isRTL ? 'الإشعارات' : 'Notifications'}
                </label>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t theme-border-primary">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium theme-text-tertiary hover:theme-text-primary theme-transition"
          >
            {isRTL ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium theme-text-tertiary hover:theme-text-primary theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isRTL ? 'حفظ' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

UserPreferences.displayName = 'UserPreferences';
