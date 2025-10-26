'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Users, Settings, Save, Loader2 } from 'lucide-react';
import { useUpdateAbattoir } from '@/lib/hooks/useAbattoirs';
import { Abattoir } from '@/lib/api/abattoirService';

interface EditAbattoirModalProps {
  isOpen: boolean;
  onClose: () => void;
  abattoir: Abattoir | null;
  isRTL: boolean;
}

const EditAbattoirModal: React.FC<EditAbattoirModalProps> = ({
  isOpen,
  onClose,
  abattoir,
  isRTL
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    wilaya: '',
    commune: '',
    adresse_complete: '',
    capacite_reception_ovin: 0,
    capacite_reception_bovin: 0,
    capacite_stabulation_ovin: 0,
    capacite_stabulation_bovin: 0,
    actif: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateAbattoirMutation = useUpdateAbattoir();

  // Initialiser le formulaire quand l'abattoir change
  useEffect(() => {
    if (abattoir) {
      setFormData({
        nom: abattoir.nom || '',
        wilaya: abattoir.wilaya || '',
        commune: abattoir.commune || '',
        adresse_complete: abattoir.adresse_complete || '',
        capacite_reception_ovin: abattoir.capacite_reception_ovin || 0,
        capacite_reception_bovin: abattoir.capacite_reception_bovin || 0,
        capacite_stabulation_ovin: abattoir.capacite_stabulation_ovin || 0,
        capacite_stabulation_bovin: abattoir.capacite_stabulation_bovin || 0,
        actif: abattoir.actif ?? true
      });
    }
  }, [abattoir]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = isRTL ? 'اسم المجزر مطلوب' : 'Le nom de l\'abattoir est requis';
    }

    if (!formData.wilaya.trim()) {
      newErrors.wilaya = isRTL ? 'الولاية مطلوبة' : 'La wilaya est requise';
    }

    if (!formData.commune.trim()) {
      newErrors.commune = isRTL ? 'البلدية مطلوبة' : 'La commune est requise';
    }

    if (!formData.adresse_complete.trim()) {
      newErrors.adresse_complete = isRTL ? 'العنوان مطلوب' : 'L\'adresse est requise';
    }

    if (formData.capacite_reception_ovin < 0) {
      newErrors.capacite_reception_ovin = isRTL ? 'السعة يجب أن تكون إيجابية' : 'La capacité doit être positive';
    }

    if (formData.capacite_reception_bovin < 0) {
      newErrors.capacite_reception_bovin = isRTL ? 'السعة يجب أن تكون إيجابية' : 'La capacité doit être positive';
    }

    if (formData.capacite_stabulation_ovin < 0) {
      newErrors.capacite_stabulation_ovin = isRTL ? 'السعة يجب أن تكون إيجابية' : 'La capacité doit être positive';
    }

    if (formData.capacite_stabulation_bovin < 0) {
      newErrors.capacite_stabulation_bovin = isRTL ? 'السعة يجب أن تكون إيجابية' : 'La capacité doit être positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!abattoir || !validateForm()) {
      return;
    }

    try {
      await updateAbattoirMutation.mutateAsync({
        id: abattoir.id,
        data: formData
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  if (!isOpen || !abattoir) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRTL ? 'تعديل المجزر' : 'Modifier l\'abattoir'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'تحديث معلومات المجزر' : 'Mettre à jour les informations de l\'abattoir'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium text-gray-900 dark:text-white flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
              {isRTL ? 'المعلومات الأساسية' : 'Informations de base'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'اسم المجزر *' : 'Nom de l\'abattoir *'}
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.nom ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'أدخل اسم المجزر' : 'Entrez le nom de l\'abattoir'}
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الحالة' : 'Statut'}
                </label>
                <select
                  name="actif"
                  value={formData.actif.toString()}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="true">{isRTL ? 'نشط' : 'Actif'}</option>
                  <option value="false">{isRTL ? 'غير نشط' : 'Inactif'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium text-gray-900 dark:text-white flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
              {isRTL ? 'الموقع' : 'Localisation'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wilaya */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الولاية *' : 'Wilaya *'}
                </label>
                <input
                  type="text"
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.wilaya ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'أدخل الولاية' : 'Entrez la wilaya'}
                />
                {errors.wilaya && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.wilaya}</p>
                )}
              </div>

              {/* Commune */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'البلدية *' : 'Commune *'}
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.commune ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'أدخل البلدية' : 'Entrez la commune'}
                />
                {errors.commune && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.commune}</p>
                )}
              </div>
            </div>

            {/* Adresse complète */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'العنوان الكامل *' : 'Adresse complète *'}
              </label>
              <textarea
                name="adresse_complete"
                value={formData.adresse_complete}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.adresse_complete ? 'border-red-500' : ''}`}
                placeholder={isRTL ? 'أدخل العنوان الكامل' : 'Entrez l\'adresse complète'}
              />
              {errors.adresse_complete && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adresse_complete}</p>
              )}
            </div>
          </div>

          {/* Capacités */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium text-gray-900 dark:text-white flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
              {isRTL ? 'السعات' : 'Capacités'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capacité réception ovins */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'سعة استقبال الأغنام' : 'Capacité réception ovins'}
                </label>
                <input
                  type="number"
                  name="capacite_reception_ovin"
                  value={formData.capacite_reception_ovin}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.capacite_reception_ovin ? 'border-red-500' : ''}`}
                />
                {errors.capacite_reception_ovin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacite_reception_ovin}</p>
                )}
              </div>

              {/* Capacité réception bovins */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'سعة استقبال الأبقار' : 'Capacité réception bovins'}
                </label>
                <input
                  type="number"
                  name="capacite_reception_bovin"
                  value={formData.capacite_reception_bovin}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.capacite_reception_bovin ? 'border-red-500' : ''}`}
                />
                {errors.capacite_reception_bovin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacite_reception_bovin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Capacités de stabulation */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium text-gray-900 dark:text-white flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
              {isRTL ? 'سعات الحظيرة' : 'Capacités de stabulation'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capacité stabulation ovins */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'سعة الحظيرة للأغنام' : 'Capacité stabulation ovins'}
                </label>
                <input
                  type="number"
                  name="capacite_stabulation_ovin"
                  value={formData.capacite_stabulation_ovin}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.capacite_stabulation_ovin ? 'border-red-500' : ''}`}
                />
                {errors.capacite_stabulation_ovin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacite_stabulation_ovin}</p>
                )}
              </div>

              {/* Capacité stabulation bovins */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'سعة الحظيرة للأبقار' : 'Capacité stabulation bovins'}
                </label>
                <input
                  type="number"
                  name="capacite_stabulation_bovin"
                  value={formData.capacite_stabulation_bovin}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'} ${errors.capacite_stabulation_bovin ? 'border-red-500' : ''}`}
                />
                {errors.capacite_stabulation_bovin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacite_stabulation_bovin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} pt-4 border-t border-gray-200 dark:border-gray-700`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={updateAbattoirMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              {updateAbattoirMutation.isPending ? (
                <>
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  {isRTL ? 'جاري الحفظ...' : 'Sauvegarde...'}
                </>
              ) : (
                <>
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حفظ التغييرات' : 'Sauvegarder'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAbattoirModal;
