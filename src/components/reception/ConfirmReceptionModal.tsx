'use client';

import React, { useState } from 'react';
import { X, Package, AlertCircle, CheckCircle, Users, Hash } from 'lucide-react';
import { Reception } from '@/lib/api/receptionService';

interface ConfirmReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reception: Reception | null;
  onConfirm: (data: {
    nombre_betes_recues: number;
    betes_manquantes: string[];
    note?: string;
  }) => void;
  isConfirming: boolean;
  isRTL?: boolean;
}

export const ConfirmReceptionModal: React.FC<ConfirmReceptionModalProps> = ({
  isOpen,
  onClose,
  reception,
  onConfirm,
  isConfirming,
  isRTL = false
}) => {
  const [nombreBetesRecues, setNombreBetesRecues] = useState(0);
  const [betesManquantes, setBetesManquantes] = useState<string[]>([]);
  const [newBeteManquante, setNewBeteManquante] = useState('');
  const [note, setNote] = useState('');

  // Réinitialiser le formulaire quand la modal s'ouvre
  React.useEffect(() => {
    if (isOpen && reception) {
      setNombreBetesRecues(reception.nombre_betes_attendues);
      setBetesManquantes([]);
      setNewBeteManquante('');
      setNote('');
    }
  }, [isOpen, reception]);

  const handleAddBeteManquante = () => {
    if (newBeteManquante.trim() && !betesManquantes.includes(newBeteManquante.trim())) {
      setBetesManquantes([...betesManquantes, newBeteManquante.trim()]);
      setNewBeteManquante('');
    }
  };

  const handleRemoveBeteManquante = (bete: string) => {
    setBetesManquantes(betesManquantes.filter(b => b !== bete));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nombreBetesRecues < 0) {
      return;
    }

    onConfirm({
      nombre_betes_recues: nombreBetesRecues,
      betes_manquantes: betesManquantes,
      note: note.trim() || undefined
    });
  };

  if (!isOpen || !reception) return null;

  const nombreBetesManquantes = reception.nombre_betes_attendues - nombreBetesRecues;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className={`text-xl font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'تأكيد الاستلام' : 'Confirmer la réception'}
              </h3>
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'تأكيد استلام الماشية من النقل' : 'Confirmer la réception du bétail du transfert'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Informations du transfert */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className={`font-medium text-gray-900 dark:text-white mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'معلومات النقل' : 'Informations du transfert'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'رقم النقل:' : 'N° Transfert:'}
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {reception.transfert.numero_transfert}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'من:' : 'De:'}
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {reception.transfert.abattoir_expediteur.nom}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'عدد البهائم المتوقع:' : 'Bêtes attendues:'}
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {reception.nombre_betes_attendues}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'تاريخ النقل:' : 'Date transfert:'}
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(reception.transfert.date_creation).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire de confirmation */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de bêtes reçues */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'عدد البهائم المستلمة' : 'Nombre de bêtes reçues'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={reception.nombre_betes_attendues}
                value={nombreBetesRecues}
                onChange={(e) => setNombreBetesRecues(parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={isRTL ? 'أدخل عدد البهائم المستلمة' : 'Entrez le nombre de bêtes reçues'}
                required
              />
              <Users className={`absolute top-2.5 w-5 h-5 text-gray-400 ${isRTL ? 'left-3' : 'right-3'}`} />
            </div>
            {nombreBetesManquantes > 0 && (
              <div className="mt-2 flex items-center text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {isRTL 
                    ? `${nombreBetesManquantes} بة مفقودة`
                    : `${nombreBetesManquantes} bêtes manquantes`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Bêtes manquantes */}
          {nombreBetesManquantes > 0 && (
            <div>
              <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'أرقام البهائم المفقودة (اختياري)' : 'Numéros des bêtes manquantes (optionnel)'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newBeteManquante}
                  onChange={(e) => setNewBeteManquante(e.target.value)}
                  className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'رقم البة المفقودة' : 'Numéro de la bête manquante'}
                />
                <button
                  type="button"
                  onClick={handleAddBeteManquante}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isRTL ? 'إضافة' : 'Ajouter'}
                </button>
              </div>
              
              {/* Liste des bêtes manquantes */}
              {betesManquantes.length > 0 && (
                <div className="mt-3 space-y-2">
                  {betesManquantes.map((bete, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm text-red-700 dark:text-red-300">{bete}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBeteManquante(bete)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={isRTL ? 'أضف ملاحظات حول الاستلام...' : 'Ajoutez des notes sur la réception...'}
            />
          </div>

          {/* Actions */}
          <div className={`flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={isConfirming || nombreBetesRecues < 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isConfirming ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRTL ? 'جاري التأكيد...' : 'Confirmation...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isRTL ? 'تأكيد الاستلام' : 'Confirmer la réception'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

