'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateBete } from '@/lib/hooks/useLivestock';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useProfile } from '@/lib/hooks/useDjangoAuth';
import { 
  X, 
  Save, 
  Heart, 
  Activity, 
  Scale, 
  MapPin,
  Edit3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UpdateBeteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bete: any;
  isRTL?: boolean;
  onUpdateSuccess?: () => void;
}

export default function UpdateBeteModal({ isOpen, onClose, bete, isRTL = false, onUpdateSuccess }: UpdateBeteModalProps) {
  const [formData, setFormData] = useState<any>({});
  const { data: userProfile } = useProfile();
  const { data: especesList } = useEspeces();
  const { data: abattoirsList } = useAbattoirsList();
  const updateBeteMutation = useUpdateBete();

  // Déterminer les permissions
  const isSuperuser = userProfile?.is_superuser || false;
  const canEditAll = isSuperuser;
  const canEditHealth = true; // Tous les utilisateurs peuvent modifier l'état de santé

  // Initialiser les données du formulaire
  useEffect(() => {
    if (bete && isOpen) {
      setFormData({
        num_boucle: bete.num_boucle || '',
        num_boucle_post_abattage: bete.num_boucle_post_abattage || '',
        espece: bete.espece || '',
        sexe: bete.sexe || '',
        poids_vif: bete.poids_vif || '',
        poids_a_chaud: bete.poids_a_chaud || '',
        poids_a_froid: bete.poids_a_froid || '',
        statut: bete.statut || 'VIVANT',
        etat_sante: bete.etat_sante || 'BON',
        abattage_urgence: bete.abattage_urgence || false,
        abattoir: bete.abattoir || '',
        client: bete.client || '',
        notes: bete.notes || '',
      });
    }
  }, [bete, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Préparer les données selon les permissions
      const updateData: any = {};
      
      if (canEditAll) {
        // Superuser peut modifier tous les champs
        updateData.etat_sante = formData.etat_sante;
        updateData.statut = formData.statut;
        updateData.poids_vif = formData.poids_vif;
        updateData.poids_a_chaud = formData.poids_a_chaud;
        updateData.poids_a_froid = formData.poids_a_froid;
        updateData.abattage_urgence = formData.abattage_urgence;
        updateData.notes = formData.notes;
        updateData.num_boucle = formData.num_boucle;
        updateData.num_boucle_post_abattage = formData.num_boucle_post_abattage;
        updateData.espece = formData.espece;
        updateData.sexe = formData.sexe;
        updateData.abattoir = formData.abattoir;
      } else {
        // Utilisateur normal peut seulement modifier l'état de santé
        updateData.etat_sante = formData.etat_sante;
      }
      
      await updateBeteMutation.mutateAsync({
        id: bete.id,
        data: updateData
      });
      
      toast.success('Bête mise à jour avec succès');
      onClose();
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      VIVANT: { 
        bg: 'bg-green-600 dark:bg-green-900/30', 
        text: 'text-white dark:text-green-200',
        icon: CheckCircle,
        label: isRTL ? 'حي' : 'Vivant'
      },
      ABATTU: { 
        bg: 'bg-red-600 dark:bg-red-900/30', 
        text: 'text-white dark:text-red-200',
        icon: Activity,
        label: isRTL ? 'مذبوح' : 'Abattu'
      },
      MORT: { 
        bg: 'bg-gray-600 dark:bg-gray-900/30', 
        text: 'text-white dark:text-gray-200',
        icon: AlertTriangle,
        label: isRTL ? 'ميت' : 'Mort'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.VIVANT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      BON: { 
        bg: 'bg-green-600 dark:bg-green-900/30', 
        text: 'text-white dark:text-green-200',
        icon: CheckCircle,
        label: isRTL ? 'جيد' : 'Bon'
      },
      MALADE: { 
        bg: 'bg-red-600 dark:bg-red-900/30', 
        text: 'text-white dark:text-red-200',
        icon: AlertTriangle,
        label: isRTL ? 'مريض' : 'Malade'
      },
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block align-bottom theme-bg-elevated rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="theme-bg-elevated px-6 py-4 border-b theme-border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Edit3 className="h-6 w-6 theme-text-primary mr-3" />
                <h3 className="text-lg font-medium theme-text-primary">
                  {isRTL ? 'تعديل البقرة' : 'Modifier la bête'}
                </h3>
                <span className="ml-3 text-sm theme-text-secondary">
                  {isRTL ? 'رقم الحلقة' : 'Numéro'}: {bete?.num_boucle}
                </span>
              </div>
              
              {/* Indicateur de permissions */}
              <div className="text-sm">
                {isSuperuser ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white dark:bg-purple-900/30 dark:text-purple-200">
                    {isRTL ? 'مدير عام' : 'Superuser'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white dark:bg-blue-900/30 dark:text-blue-200">
                    {isRTL ? 'مستخدم عادي' : 'Utilisateur'}
                  </span>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="theme-text-tertiary hover:theme-text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {!canEditAll && (
              <div className="mb-4 p-3 bg-blue-600 dark:bg-blue-900/20 border border-blue-600 dark:border-blue-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-white dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-white dark:text-blue-300">
                      {isRTL 
                        ? 'يمكنك تعديل الحالة الصحية فقط. الحقول الأخرى معطلة.'
                        : 'Vous pouvez uniquement modifier l\'état de santé. Les autres champs sont désactivés.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations de base */}
              <div className="space-y-4">
                <h4 className="font-medium theme-text-primary flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  {isRTL ? 'المعلومات الأساسية' : 'Informations de base'}
                </h4>
                
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'رقم الحلقة' : 'Numéro de boucle'}
                  </label>
                  {canEditAll ? (
                    <input
                      type="text"
                      value={formData.num_boucle}
                      onChange={(e) => handleInputChange('num_boucle', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    />
                  ) : (
                    <p className="theme-text-tertiary font-medium">{bete?.num_boucle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'النوع' : 'Espèce'}
                  </label>
                  {canEditAll ? (
                    <select
                      value={formData.espece}
                      onChange={(e) => handleInputChange('espece', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    >
                      <option value="">{isRTL ? 'اختر النوع' : 'Sélectionner une espèce'}</option>
                      {especesList?.map((espece) => (
                        <option key={espece.id} value={espece.id}>
                          {espece.nom}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="theme-text-tertiary font-medium">{bete?.espece_nom || 'Non spécifié'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'الجنس' : 'Sexe'}
                  </label>
                  {canEditAll ? (
                    <select
                      value={formData.sexe}
                      onChange={(e) => handleInputChange('sexe', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    >
                      <option value="M">{isRTL ? 'ذكر' : 'Mâle'}</option>
                      <option value="F">{isRTL ? 'أنثى' : 'Femelle'}</option>
                    </select>
                  ) : (
                    <p className="theme-text-tertiary font-medium">{bete?.sexe_display}</p>
                  )}
                </div>
              </div>

              {/* Statut et santé */}
              <div className="space-y-4">
                <h4 className="font-medium theme-text-primary flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  {isRTL ? 'الحالة والصحة' : 'Statut et santé'}
                </h4>
                
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'ال statut' : 'Statut'}
                  </label>
                  {canEditAll ? (
                    <select
                      value={formData.statut}
                      onChange={(e) => handleInputChange('statut', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    >
                      <option value="VIVANT">{isRTL ? 'حي' : 'Vivant'}</option>
                      <option value="ABATTU">{isRTL ? 'مذبوح' : 'Abattu'}</option>
                      <option value="MORT">{isRTL ? 'ميت' : 'Mort'}</option>
                    </select>
                  ) : (
                    <div className="opacity-50">{getStatusBadge(bete?.statut)}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-1">
                    {isRTL ? 'الحالة الصحية' : 'État de santé'} {canEditHealth && <span className="text-green-600 text-xs">({isRTL ? 'قابل للتعديل' : 'Modifiable'})</span>}
                  </label>
                  {canEditHealth ? (
                    <select
                      value={formData.etat_sante}
                      onChange={(e) => handleInputChange('etat_sante', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    >
                      <option value="BON">{isRTL ? 'جيد' : 'Bon'}</option>
                      <option value="MALADE">{isRTL ? 'مريض' : 'Malade'}</option>
                    </select>
                  ) : (
                    <div className="mt-1">{getHealthBadge(bete?.etat_sante)}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.abattage_urgence}
                      onChange={(e) => handleInputChange('abattage_urgence', e.target.checked)}
                      disabled={!canEditAll}
                      className={`mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${!canEditAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <span className={`text-sm font-medium ${!canEditAll ? 'theme-text-tertiary' : 'theme-text-secondary'}`}>
                      {isRTL ? 'ذبح عاجل' : 'Abattage urgent'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Poids */}
            {canEditAll && (
              <div className="mt-6">
                <h4 className="font-medium theme-text-primary flex items-center mb-4">
                  <Scale className="h-4 w-4 mr-2" />
                  {isRTL ? 'الأوزان' : 'Poids'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن الحي (كغ)' : 'Poids vif (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.poids_vif}
                      onChange={(e) => handleInputChange('poids_vif', parseFloat(e.target.value) || '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن الساخن (كغ)' : 'Poids à chaud (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.poids_a_chaud}
                      onChange={(e) => handleInputChange('poids_a_chaud', parseFloat(e.target.value) || '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                      {isRTL ? 'الوزن البارد (كغ)' : 'Poids à froid (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.poids_a_froid}
                      onChange={(e) => handleInputChange('poids_a_froid', parseFloat(e.target.value) || '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {canEditAll && (
              <div className="mt-6">
                <h4 className="font-medium theme-text-primary flex items-center mb-4">
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </h4>
                
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                  placeholder={isRTL ? 'أدخل ملاحظات إضافية...' : 'Entrez des notes supplémentaires...'}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="theme-bg-elevated px-6 py-4 border-t theme-border-primary flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              onClick={handleSave}
              disabled={updateBeteMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateBeteMutation.isPending ? (isRTL ? 'جاري الحفظ...' : 'Sauvegarde...') : (isRTL ? 'حفظ' : 'Sauvegarder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
