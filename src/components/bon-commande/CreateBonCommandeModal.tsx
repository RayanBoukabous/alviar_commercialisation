'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Scale, Calendar, Building2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateBonDeCommande } from '@/lib/hooks/useBonsCommande';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useClients } from '@/lib/hooks/useClients';
import { useProfile } from '@/lib/hooks/useDjangoAuth';
import toast from 'react-hot-toast';

interface CreateBonCommandeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBonCommandeModal: React.FC<CreateBonCommandeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: userProfile } = useProfile();
  const { data: abattoirsList } = useAbattoirsList();
  const { data: clientsList } = useClients();
  const createBonMutation = useCreateBonDeCommande();

  const isSuperuser = userProfile?.is_superuser || false;
  const userAbattoirId = userProfile?.abattoir?.id || userProfile?.abattoir;

  // États du formulaire
  const [formData, setFormData] = useState({
    type_quantite: 'NOMBRE' as 'NOMBRE' | 'POIDS',
    quantite: '',
    type_bete: 'BOVIN' as 'BOVIN' | 'OVIN' | 'CAPRIN',
    type_produit: 'CARCASSE' as 'CARCASSE' | 'VIF',
    avec_cinquieme_quartier: false,
    source: 'ABATTOIR' as 'PRODUCTION' | 'ABATTOIR', // Nouvelle option
    abattoir: userAbattoirId || '',
    client: '',
    date_livraison_prevue: '',
    versement: '', // Nouveau champ pour le versement
    notes: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour l'abattoir par défaut quand userProfile change
  useEffect(() => {
    if (!isSuperuser && userAbattoirId && !formData.abattoir) {
      setFormData(prev => ({ ...prev, abattoir: userAbattoirId }));
    }
  }, [userAbattoirId, isSuperuser, formData.abattoir]);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        type_quantite: 'NOMBRE',
        quantite: '',
        type_bete: 'BOVIN',
        type_produit: 'CARCASSE',
        avec_cinquieme_quartier: false,
        source: 'ABATTOIR',
        abattoir: userAbattoirId || '',
        client: '',
        date_livraison_prevue: '',
        versement: '',
        notes: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, userAbattoirId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.quantite || parseFloat(formData.quantite) <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }

    if (!formData.client) {
      newErrors.client = 'Veuillez sélectionner un client';
    }

    // Validation de l'abattoir pour superuser (toujours requis)
    if (isSuperuser && !formData.abattoir) {
      newErrors.abattoir = formData.source === 'PRODUCTION' 
        ? "Veuillez sélectionner l'abattoir d'attribution"
        : "Veuillez sélectionner l'abattoir source";
    }

    // Validation du versement (optionnel mais doit être positif si renseigné)
    if (formData.versement && parseFloat(formData.versement) < 0) {
      newErrors.versement = 'Le versement ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        type_quantite: formData.type_quantite,
        quantite: parseFloat(formData.quantite),
        type_bete: formData.type_bete,
        type_produit: formData.type_produit,
        avec_cinquieme_quartier: formData.avec_cinquieme_quartier,
        source: formData.source,
        client: parseInt(formData.client as string),
        date_livraison_prevue: formData.date_livraison_prevue || undefined,
        notes: formData.notes,
        statut: 'BROUILLON',
      };

      // Ajouter l'abattoir (toujours requis)
      // Pour superuser : celui sélectionné
      // Pour user normal : son abattoir par défaut
      const abattoirToUse = formData.abattoir || userAbattoirId;
      if (abattoirToUse) {
        payload.abattoir = parseInt(abattoirToUse as string);
      }

      // Ajouter le versement s'il est renseigné
      if (formData.versement) {
        payload.versement = parseFloat(formData.versement);
      }

      await createBonMutation.mutateAsync(payload);

      toast.success('Bon de commande créé avec succès !');
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création du bon de commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated theme-transition rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 theme-bg-elevated border-b theme-border-primary px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary">
                Nouveau bon de commande
              </h2>
              <p className="text-sm theme-text-secondary">
                Créer une nouvelle commande pour un client
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

        {/* Body */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de quantité */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Type de quantité *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('type_quantite', 'NOMBRE')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type_quantite === 'NOMBRE'
                      ? 'border-primary-500 theme-bg-secondary'
                      : 'theme-border-primary theme-bg-elevated hover:theme-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Package className={`h-6 w-6 ${
                      formData.type_quantite === 'NOMBRE' ? 'text-primary-600' : 'theme-text-secondary'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium theme-text-primary">Nombre de bêtes</div>
                    <div className="text-xs theme-text-secondary mt-1">Commande par têtes</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type_quantite', 'POIDS')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type_quantite === 'POIDS'
                      ? 'border-primary-500 theme-bg-secondary'
                      : 'theme-border-primary theme-bg-elevated hover:theme-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Scale className={`h-6 w-6 ${
                      formData.type_quantite === 'POIDS' ? 'text-primary-600' : 'theme-text-secondary'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium theme-text-primary">Kilogrammes</div>
                    <div className="text-xs theme-text-secondary mt-1">Commande par poids</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Quantité *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantite}
                onChange={(e) => handleInputChange('quantite', e.target.value)}
                placeholder={formData.type_quantite === 'NOMBRE' ? 'Nombre de têtes' : 'Poids en kg'}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition ${
                  errors.quantite ? 'border-red-500' : 'theme-border-primary'
                }`}
              />
              {errors.quantite && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.quantite}
                </p>
              )}
            </div>

            {/* Type de bête */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Type de bête *
              </label>
              <select
                value={formData.type_bete}
                onChange={(e) => handleInputChange('type_bete', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="BOVIN">Bovin</option>
                <option value="OVIN">Ovin</option>
                <option value="CAPRIN">Caprin</option>
              </select>
            </div>

            {/* Type de produit */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Type de produit *
              </label>
              <select
                value={formData.type_produit}
                onChange={(e) => handleInputChange('type_produit', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              >
                <option value="CARCASSE">Carcasse</option>
                <option value="VIF">Vif</option>
              </select>
            </div>

            {/* Cinquième quartier */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.avec_cinquieme_quartier}
                  onChange={(e) => handleInputChange('avec_cinquieme_quartier', e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium theme-text-primary">
                    Avec cinquième quartier
                  </span>
                  <p className="text-xs theme-text-secondary">
                    Inclure les abats et les viscères
                  </p>
                </div>
              </label>
            </div>

            {/* Source du bon de commande - Pour tous les utilisateurs */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Source de la commande *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('source', 'PRODUCTION')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.source === 'PRODUCTION'
                      ? 'border-primary-500 theme-bg-secondary'
                      : 'theme-border-primary theme-bg-elevated hover:theme-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className={`h-6 w-6 ${
                      formData.source === 'PRODUCTION' ? 'text-primary-600' : 'theme-text-secondary'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium theme-text-primary">Production</div>
                    <div className="text-xs theme-text-secondary mt-1">Depuis la production centrale</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('source', 'ABATTOIR')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.source === 'ABATTOIR'
                      ? 'border-primary-500 theme-bg-secondary'
                      : 'theme-border-primary theme-bg-elevated hover:theme-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className={`h-6 w-6 ${
                      formData.source === 'ABATTOIR' ? 'text-primary-600' : 'theme-text-secondary'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium theme-text-primary">Abattoir</div>
                    <div className="text-xs theme-text-secondary mt-1">Depuis un abattoir spécifique</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Abattoir - Toujours affiché pour superuser, jamais pour user normal */}
            {isSuperuser && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  {formData.source === 'PRODUCTION' 
                    ? "Abattoir d'attribution *" 
                    : "Abattoir source *"}
                </label>
                <select
                  value={formData.abattoir}
                  onChange={(e) => handleInputChange('abattoir', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition ${
                    errors.abattoir ? 'border-red-500' : 'theme-border-primary'
                  }`}
                >
                  <option value="">Sélectionner un abattoir</option>
                  {Array.isArray(abattoirsList) && abattoirsList.map((abattoir: any) => (
                    <option key={abattoir.id} value={abattoir.id}>
                      {abattoir.nom} - {abattoir.wilaya}
                    </option>
                  ))}
                </select>
                {errors.abattoir && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.abattoir}
                  </p>
                )}
                <p className="text-xs theme-text-secondary mt-1">
                  {formData.source === 'PRODUCTION' 
                    ? "L'abattoir qui recevra le bon de commande"
                    : "L'abattoir source de la commande"}
                </p>
              </div>
            )}

            {/* Info pour user normal */}
            {!isSuperuser && (
              <div className="md:col-span-2">
                <div className="px-4 py-3 theme-bg-secondary border theme-border-primary rounded-lg">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-4 w-4 mr-2 theme-text-secondary" />
                    <p className="text-sm font-medium theme-text-primary">
                      Abattoir : {userProfile?.abattoir?.nom || 'Non spécifié'}
                    </p>
                  </div>
                  <p className="text-xs theme-text-secondary">
                    {formData.source === 'PRODUCTION' 
                      ? "Votre abattoir recevra automatiquement ce bon de commande"
                      : "Votre abattoir est la source de cette commande"}
                  </p>
                </div>
              </div>
            )}

            {/* Client */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Client *
              </label>
              <select
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition ${
                  errors.client ? 'border-red-500' : 'theme-border-primary'
                }`}
              >
                <option value="">Sélectionner un client</option>
                {Array.isArray(clientsList) && clientsList.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} - {client.telephone}
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.client}
                </p>
              )}
            </div>

            {/* Date de livraison prévue */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de livraison prévue
              </label>
              <input
                type="date"
                value={formData.date_livraison_prevue}
                onChange={(e) => handleInputChange('date_livraison_prevue', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              />
            </div>

            {/* Versement */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Versement (DA)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.versement}
                onChange={(e) => handleInputChange('versement', e.target.value)}
                placeholder="Montant du versement"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary theme-transition ${
                  errors.versement ? 'border-red-500' : 'theme-border-primary'
                }`}
              />
              {errors.versement && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.versement}
                </p>
              )}
              <p className="text-xs theme-text-secondary mt-1">
                Montant versé par le client (optionnel)
              </p>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes et remarques sur la commande..."
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition resize-none"
              />
            </div>
          </div>

          {/* Résumé */}
          {formData.quantite && formData.type_bete && (
            <div className="mt-6 p-4 theme-bg-secondary border theme-border-primary rounded-lg">
              <h3 className="text-sm font-semibold theme-text-primary mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Résumé de la commande
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="theme-text-secondary">Quantité</p>
                  <p className="font-medium theme-text-primary">
                    {formData.quantite} {formData.type_quantite === 'NOMBRE' ? 'têtes' : 'kg'}
                  </p>
                </div>
                <div>
                  <p className="theme-text-secondary">Type</p>
                  <p className="font-medium theme-text-primary">{formData.type_bete}</p>
                </div>
                <div>
                  <p className="theme-text-secondary">Produit</p>
                  <p className="font-medium theme-text-primary">{formData.type_produit}</p>
                </div>
                <div>
                  <p className="theme-text-secondary">5ème quartier</p>
                  <p className="font-medium theme-text-primary">
                    {formData.avec_cinquieme_quartier ? 'Oui' : 'Non'}
                  </p>
                </div>
                <div>
                  <p className="theme-text-secondary">Source</p>
                  <p className="font-medium theme-text-primary">
                    {formData.source === 'PRODUCTION' ? 'Production' : 'Abattoir'}
                  </p>
                </div>
                {formData.versement && (
                  <div>
                    <p className="theme-text-secondary">Versement</p>
                    <p className="font-medium theme-text-primary text-green-600">
                      {parseFloat(formData.versement).toLocaleString()} DA
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 theme-bg-elevated border-t theme-border-primary px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg theme-transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </div>
            ) : (
              'Créer le bon de commande'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

