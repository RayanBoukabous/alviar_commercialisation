'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building2, Package, Hash, Shuffle, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateTransfert } from '@/lib/hooks/useTransferts';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useProfile } from '@/lib/hooks/useDjangoAuth';
import { useLivestock } from '@/lib/hooks/useLivestock';
import toast from 'react-hot-toast';

interface CreateTransfertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTransfertModal: React.FC<CreateTransfertModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: userProfile } = useProfile();
  const { data: abattoirsList, isLoading: abattoirsLoading, error: abattoirsError } = useAbattoirsList();
  const createTransfertMutation = useCreateTransfert();

  // Debug
  console.log('🔍 Debug CreateTransfertModal:');
  console.log('  - abattoirsList:', abattoirsList);
  console.log('  - abattoirsLoading:', abattoirsLoading);
  console.log('  - abattoirsError:', abattoirsError);

  const isSuperuser = userProfile?.is_superuser || false;
  const userAbattoirId = userProfile?.abattoir?.id || userProfile?.abattoir;

  // États du formulaire
  const [formData, setFormData] = useState({
    abattoir_expediteur_id: userAbattoirId || '',
    abattoir_destinataire_id: '',
    nombre_betes: '',
    espece: 'BOVIN' as 'BOVIN' | 'OVIN' | 'CAPRIN',
    selection_mode: 'MANUAL' as 'MANUAL' | 'RANDOM', // MANUAL = par numéro de boucle, RANDOM = tirage aléatoire
    betes_ids: [] as number[], // IDs des bêtes sélectionnées manuellement
    date_livraison_prevue: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBetes, setAvailableBetes] = useState<any[]>([]);
  const [selectedBeteIds, setSelectedBeteIds] = useState<number[]>([]);

  // Récupérer les bêtes disponibles pour l'abattoir expéditeur
  // Seulement si l'abattoir et l'espèce sont sélectionnés
  const shouldLoadLivestock = formData.abattoir_expediteur_id && formData.espece;
  
  const { data: livestockData, isLoading: livestockLoading, error: livestockError } = useLivestock({
    abattoir_id: shouldLoadLivestock ? parseInt(formData.abattoir_expediteur_id) : undefined,
    statut: 'VIVANT', // Seulement les bêtes vivantes
    espece_nom: shouldLoadLivestock ? formData.espece : undefined,
  }, {
    enabled: shouldLoadLivestock, // Ne charger que si les conditions sont remplies
  });

  // Debug livestock
  console.log('🔍 Debug Livestock:');
  console.log('  - shouldLoadLivestock:', shouldLoadLivestock);
  console.log('  - livestockData:', livestockData);
  console.log('  - livestockLoading:', livestockLoading);
  console.log('  - livestockError:', livestockError);

  // Mettre à jour l'abattoir expéditeur par défaut
  useEffect(() => {
    if (!isSuperuser && userAbattoirId && !formData.abattoir_expediteur_id) {
      setFormData(prev => ({ ...prev, abattoir_expediteur_id: userAbattoirId }));
    }
  }, [userAbattoirId, isSuperuser, formData.abattoir_expediteur_id]);

  // Mettre à jour les bêtes disponibles quand l'abattoir ou l'espèce change
  useEffect(() => {
    if (livestockData?.betes) {
      setAvailableBetes(livestockData.betes);
    }
  }, [livestockData]);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        abattoir_expediteur_id: userAbattoirId || '',
        abattoir_destinataire_id: '',
        nombre_betes: '',
        espece: 'BOVIN',
        selection_mode: 'MANUAL',
        betes_ids: [],
        date_livraison_prevue: '',
        notes: '',
      });
      setErrors({});
      setIsSubmitting(false);
      setSelectedBeteIds([]);
    }
  }, [isOpen, userAbattoirId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si on change de mode de sélection, réinitialiser les champs liés
    if (field === 'selection_mode') {
      if (value === 'MANUAL') {
        // Mode manuel : vider le nombre de bêtes et les bêtes sélectionnées
        setFormData(prev => ({ 
          ...prev, 
          nombre_betes: '',
          betes_ids: []
        }));
        setSelectedBeteIds([]);
      } else if (value === 'RANDOM') {
        // Mode aléatoire : vider les bêtes sélectionnées
        setFormData(prev => ({ 
          ...prev, 
          betes_ids: []
        }));
        setSelectedBeteIds([]);
      }
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBeteSelection = (beteId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedBeteIds(prev => [...prev, beteId]);
    } else {
      setSelectedBeteIds(prev => prev.filter(id => id !== beteId));
    }
  };

  const handleRandomSelection = () => {
    const nombreBetes = parseInt(formData.nombre_betes);
    if (nombreBetes > 0 && availableBetes.length >= nombreBetes) {
      const shuffled = [...availableBetes].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, nombreBetes).map(bete => bete.id);
      setSelectedBeteIds(selected);
      setFormData(prev => ({ ...prev, betes_ids: selected }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.abattoir_expediteur_id) {
      newErrors.abattoir_expediteur_id = 'Veuillez sélectionner l\'abattoir expéditeur';
    }

    if (!formData.abattoir_destinataire_id) {
      newErrors.abattoir_destinataire_id = 'Veuillez sélectionner l\'abattoir destinataire';
    }

    if (formData.abattoir_expediteur_id === formData.abattoir_destinataire_id) {
      newErrors.abattoir_destinataire_id = 'L\'abattoir destinataire doit être différent de l\'expéditeur';
    }

    // Validation selon le mode de sélection
    if (formData.selection_mode === 'MANUAL') {
      // Mode manuel : vérifier qu'au moins une bête est sélectionnée
      if (selectedBeteIds.length === 0) {
        newErrors.betes_ids = 'Veuillez sélectionner au moins une bête';
      }
      // Le nombre de bêtes n'est pas requis en mode manuel
    } else if (formData.selection_mode === 'RANDOM') {
      // Mode aléatoire : vérifier le nombre de bêtes
      if (!formData.nombre_betes || parseInt(formData.nombre_betes) <= 0) {
        newErrors.nombre_betes = 'Le nombre de bêtes doit être supérieur à 0';
      } else {
        const nombreBetes = parseInt(formData.nombre_betes);
        if (availableBetes.length < nombreBetes) {
          newErrors.nombre_betes = `Seulement ${availableBetes.length} bêtes disponibles pour le tirage aléatoire`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        abattoir_expediteur_id: parseInt(formData.abattoir_expediteur_id),
        abattoir_destinataire_id: parseInt(formData.abattoir_destinataire_id),
        nombre_betes: formData.selection_mode === 'RANDOM' ? parseInt(formData.nombre_betes) : selectedBeteIds.length,
        betes_ids: formData.selection_mode === 'MANUAL' ? selectedBeteIds : undefined,
        date_livraison_prevue: formData.date_livraison_prevue || undefined,
        notes: formData.notes || undefined,
      };

      const result = await createTransfertMutation.mutateAsync(submitData);
      
      console.log('✅ Transfert créé:', result);
      toast.success('Transfert créé avec succès (réception créée automatiquement)');
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création du transfert:', error);
      toast.error(error.message || 'Erreur lors de la création du transfert');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated theme-transition rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary theme-transition">
                Nouveau transfert
              </h2>
              <p className="text-sm theme-text-secondary theme-transition">
                Créer un nouveau transfert de bétail entre abattoirs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Abattoir expéditeur */}
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                <Building2 className="inline h-4 w-4 mr-2" />
                Abattoir expéditeur
              </label>
              <select
                value={formData.abattoir_expediteur_id}
                onChange={(e) => handleInputChange('abattoir_expediteur_id', e.target.value)}
                disabled={!isSuperuser || abattoirsLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.abattoir_expediteur_id ? 'border-red-500' : ''
                }`}
              >
                <option value="">
                  {abattoirsLoading ? 'Chargement...' : 'Sélectionner l\'abattoir expéditeur'}
                </option>
                {abattoirsList?.map((abattoir) => (
                  <option key={abattoir.id} value={abattoir.id}>
                    {abattoir.nom} - {abattoir.wilaya}
                  </option>
                ))}
              </select>
              {errors.abattoir_expediteur_id && (
                <p className="mt-1 text-sm text-red-600">{errors.abattoir_expediteur_id}</p>
              )}
            </div>

            {/* Abattoir destinataire */}
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                <Building2 className="inline h-4 w-4 mr-2" />
                Abattoir destinataire
              </label>
              <select
                value={formData.abattoir_destinataire_id}
                onChange={(e) => handleInputChange('abattoir_destinataire_id', e.target.value)}
                disabled={abattoirsLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.abattoir_destinataire_id ? 'border-red-500' : ''
                }`}
              >
                <option value="">
                  {abattoirsLoading ? 'Chargement...' : 'Sélectionner l\'abattoir destinataire'}
                </option>
                {abattoirsList?.filter(abattoir => abattoir.id.toString() !== formData.abattoir_expediteur_id).map((abattoir) => (
                  <option key={abattoir.id} value={abattoir.id}>
                    {abattoir.nom} - {abattoir.wilaya}
                  </option>
                ))}
              </select>
              {errors.abattoir_destinataire_id && (
                <p className="mt-1 text-sm text-red-600">{errors.abattoir_destinataire_id}</p>
              )}
            </div>
          </div>

          {/* Espèce et nombre de bêtes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                <Package className="inline h-4 w-4 mr-2" />
                Espèce
              </label>
              <select
                value={formData.espece}
                onChange={(e) => handleInputChange('espece', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="BOVIN">Bovin</option>
                <option value="OVIN">Ovin</option>
                <option value="CAPRIN">Caprin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
                <Hash className="inline h-4 w-4 mr-2" />
                Nombre de bêtes
                {formData.selection_mode === 'MANUAL' && (
                  <span className="text-xs text-gray-500 ml-2">(Désactivé en mode sélection manuelle)</span>
                )}
              </label>
              <input
                type="number"
                min="1"
                value={formData.nombre_betes}
                onChange={(e) => handleInputChange('nombre_betes', e.target.value)}
                disabled={formData.selection_mode === 'MANUAL'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                  errors.nombre_betes ? 'border-red-500' : ''
                } ${formData.selection_mode === 'MANUAL' ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={formData.selection_mode === 'MANUAL' ? 'Sélection manuelle activée' : 'Nombre de bêtes à transférer'}
              />
              {errors.nombre_betes && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre_betes}</p>
              )}
            </div>
          </div>

          {/* Mode de sélection */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-3">
              Mode de sélection des bêtes
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('selection_mode', 'MANUAL')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.selection_mode === 'MANUAL'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'theme-border-primary hover:theme-bg-secondary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium theme-text-primary">Sélection manuelle</h3>
                    <p className="text-sm theme-text-secondary">Choisir par numéro de boucle</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('selection_mode', 'RANDOM')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.selection_mode === 'RANDOM'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'theme-border-primary hover:theme-bg-secondary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shuffle className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium theme-text-primary">Tirage aléatoire</h3>
                    <p className="text-sm theme-text-secondary">Sélection automatique</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sélection des bêtes - seulement en mode manuel et si abattoir + espèce sélectionnés */}
          {formData.selection_mode === 'MANUAL' && shouldLoadLivestock && (
            <div>
              <label className="block text-sm font-medium theme-text-primary theme-transition mb-3">
                Sélectionner les bêtes ({selectedBeteIds.length} sélectionnées)
              </label>
              <div className="max-h-60 overflow-y-auto border rounded-lg theme-border-primary">
                {livestockLoading ? (
                  <div className="p-4 text-center theme-text-secondary">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    Chargement des bêtes...
                  </div>
                ) : livestockError ? (
                  <div className="p-4 text-center text-red-600">
                    Erreur lors du chargement des bêtes: {livestockError.message}
                  </div>
                ) : availableBetes.length === 0 ? (
                  <div className="p-4 text-center theme-text-secondary">
                    Aucune bête disponible pour cette espèce
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                    {availableBetes.map((bete) => (
                      <label
                        key={bete.id}
                        className="flex items-center space-x-3 p-3 hover:theme-bg-secondary rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBeteIds.includes(bete.id)}
                          onChange={(e) => handleBeteSelection(bete.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium theme-text-primary">
                            {bete.numero_identification || bete.num_boucle || 'N/A'}
                          </div>
                          <div className="text-xs theme-text-secondary">
                            {bete.espece_nom} • {bete.sexe} • {bete.poids_vif}kg
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.betes_ids && (
                <p className="mt-1 text-sm text-red-600">{errors.betes_ids}</p>
              )}
            </div>
          )}

          {/* Message informatif si les conditions ne sont pas remplies */}
          {!shouldLoadLivestock && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {!formData.abattoir_expediteur_id 
                  ? 'Veuillez d\'abord sélectionner un abattoir expéditeur'
                  : !formData.espece 
                    ? 'Veuillez d\'abord sélectionner une espèce'
                    : 'Sélectionnez un abattoir et une espèce pour voir les bêtes disponibles'
                }
              </p>
            </div>
          )}

          {/* Bouton de tirage aléatoire - seulement en mode aléatoire et si abattoir + espèce sélectionnés */}
          {formData.selection_mode === 'RANDOM' && shouldLoadLivestock && (
            <div>
              <button
                type="button"
                onClick={handleRandomSelection}
                disabled={!formData.nombre_betes || parseInt(formData.nombre_betes) <= 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Shuffle className="h-4 w-4" />
                <span>Effectuer le tirage aléatoire</span>
              </button>
              {selectedBeteIds.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {selectedBeteIds.length} bêtes sélectionnées aléatoirement
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Date de livraison prévue */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Date de livraison prévue
            </label>
            <input
              type="datetime-local"
              value={formData.date_livraison_prevue}
              onChange={(e) => handleInputChange('date_livraison_prevue', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              <FileText className="inline h-4 w-4 mr-2" />
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition resize-none"
              placeholder="Ajouter des notes sur ce transfert..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t theme-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg theme-border-primary theme-text-primary hover:theme-bg-secondary theme-transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Créer le transfert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
