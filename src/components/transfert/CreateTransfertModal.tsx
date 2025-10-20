'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  Building2, 
  Hash, 
  FileText, 
  Search,
  CheckCircle,
  AlertCircle,
  Users,
  Shuffle,
  ArrowDown
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useAbattoirs } from '@/lib/hooks/useAbattoirs';
import { useEspeces } from '@/lib/hooks/useEspeces';
import { useBetesDisponibles, useCreateTransfert } from '@/lib/hooks/useTransferts';

// Types pour les données
interface Abattoir {
  id: number;
  nom: string;
  wilaya: string;
  commune: string;
}

interface Espece {
  id: number;
  nom: string;
}

interface Bete {
  id: number;
  num_boucle: string;
  espece_nom: string;
  sexe: string;
  age_mois: number;
  poids: number;
}

interface CreateTransfertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTransfertModal: React.FC<CreateTransfertModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  const { user } = useAuth();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    abattoir_source: '',
    abattoir_destinataire: '',
    espece: '',
    type_produit: 'VIF', // 'VIF' ou 'CARCASSE'
    selection_mode: 'manual', // 'manual' ou 'random'
    nombre_betes: '',
    betes_selectionnees: [] as number[],
    note: ''
  });

  // État des données
  const [searchTerm, setSearchTerm] = useState('');
  const [showBeteSelection, setShowBeteSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allBetes, setAllBetes] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Hooks pour récupérer les données
  const { data: abattoirsData, isLoading: abattoirsLoading } = useAbattoirs();
  const { data: especesData, isLoading: especesLoading } = useEspeces();
  const createTransfertMutation = useCreateTransfert();
  
  // Récupérer les bêtes disponibles basées sur l'abattoir source, l'espèce et le type de produit
  const { 
    data: betesData, 
    isLoading: betesLoading,
    refetch: refetchBetes 
  } = useBetesDisponibles(
    formData.abattoir_source && formData.espece && formData.type_produit 
      ? parseInt(formData.abattoir_source) 
      : undefined,
    searchTerm || undefined,
    formData.espece || undefined,
    formData.type_produit || undefined,
    currentPage,
    30
  );

  useEffect(() => {
    if (isOpen) {
      // Initialiser l'abattoir source pour les utilisateurs normaux
      if (!user?.is_superuser && user?.abattoir?.id) {
        setFormData(prev => ({
          ...prev,
          abattoir_source: user.abattoir!.id.toString()
        }));
      }
    }
  }, [isOpen, user]);

  // Recharger les bêtes quand l'abattoir source, l'espèce ou le type de produit change
  useEffect(() => {
    if (formData.abattoir_source && formData.espece && formData.type_produit) {
      setCurrentPage(1);
      setAllBetes([]);
      setHasMore(true);
      refetchBetes();
    }
  }, [formData.abattoir_source, formData.espece, formData.type_produit, refetchBetes]);

  // Gérer la pagination infinie
  useEffect(() => {
    if (betesData?.results) {
      if (currentPage === 1) {
        // Première page : remplacer toutes les bêtes
        setAllBetes(betesData.results);
      } else {
        // Pages suivantes : ajouter aux bêtes existantes
        setAllBetes(prev => [...prev, ...betesData.results]);
      }
      setHasMore(betesData.has_next);
    }
  }, [betesData, currentPage]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si l'abattoir source change, réinitialiser l'abattoir destinataire et les bêtes
      if (field === 'abattoir_source') {
        newData.abattoir_destinataire = '';
        newData.betes_selectionnees = [];
      }
      
      // Si l'espèce ou le type de produit change, réinitialiser les bêtes sélectionnées
      if (field === 'espece' || field === 'type_produit') {
        newData.betes_selectionnees = [];
      }
      
      return newData;
    });
  };

  const handleBeteToggle = (beteId: number) => {
    setFormData(prev => ({
      ...prev,
      betes_selectionnees: prev.betes_selectionnees.includes(beteId)
        ? prev.betes_selectionnees.filter(id => id !== beteId)
        : [...prev.betes_selectionnees, beteId]
    }));
  };

  const handleRandomSelection = () => {
    const nombre = parseInt(formData.nombre_betes);
    const availableBetes = allBetes.filter(bete => 
      bete?.id && bete?.numero_identification && bete?.espece_nom
    );
    if (nombre > 0 && nombre <= availableBetes.length) {
      const shuffled = [...availableBetes].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, nombre).map(b => b.id);
      setFormData(prev => ({
        ...prev,
        betes_selectionnees: selected
      }));
    }
  };

  const loadMoreBetes = () => {
    if (hasMore && !betesLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation pour les superusers
    if (user?.is_superuser && !formData.abattoir_source) {
      toast.error(isRTL ? 'يرجى اختيار المجزر المصدر' : 'Veuillez sélectionner l\'abattoir source');
      return;
    }
    
    if (!formData.abattoir_destinataire) {
      toast.error(isRTL ? 'يرجى اختيار المجزر الوجهة' : 'Veuillez sélectionner l\'abattoir destinataire');
      return;
    }
    
    if (!formData.espece) {
      toast.error(isRTL ? 'يرجى اختيار النوع' : 'Veuillez sélectionner l\'espèce');
      return;
    }
    
    // Vérifier que l'abattoir source et destinataire sont différents
    if (user?.is_superuser && formData.abattoir_source === formData.abattoir_destinataire) {
      toast.error(isRTL ? 'المجزر المصدر والوجهة يجب أن يكونا مختلفين' : 'L\'abattoir source et destinataire doivent être différents');
      return;
    }

    if (formData.selection_mode === 'manual' && formData.betes_selectionnees.length === 0) {
      toast.error(isRTL ? 'يرجى اختيار البهائم' : 'Veuillez sélectionner des bêtes');
      return;
    }

    if (formData.selection_mode === 'random' && (!formData.nombre_betes || parseInt(formData.nombre_betes) <= 0)) {
      toast.error(isRTL ? 'يرجى تحديد عدد البهائم' : 'Veuillez spécifier le nombre de bêtes');
      return;
    }

    // Préparer les données pour l'API
    const transfertData: any = {
      abattoir_destinataire_id: parseInt(formData.abattoir_destinataire),
      note: formData.note || undefined,
    };

    // Ajouter l'abattoir expéditeur pour les superusers
    if (user?.is_superuser && formData.abattoir_source) {
      transfertData.abattoir_expediteur_id = parseInt(formData.abattoir_source);
    }

    // Ajouter les bêtes selon le mode de sélection
    if (formData.selection_mode === 'manual') {
      transfertData.betes_ids = formData.betes_selectionnees;
    } else {
      transfertData.nombre_betes_aleatoire = parseInt(formData.nombre_betes);
    }
    
    try {
      await createTransfertMutation.mutateAsync(transfertData);
      
      // Reset du formulaire
      setFormData({
        abattoir_source: '',
        abattoir_destinataire: '',
        espece: '',
        type_produit: 'VIF',
        selection_mode: 'manual',
        nombre_betes: '',
        betes_selectionnees: [],
        note: ''
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error('Erreur lors de la création du transfert:', error);
    }
  };

  // Debug: Vérifier la structure des données
  if (betesData?.results && betesData.results.length > 0) {
    console.log('🔍 Structure des données bêtes:', betesData.results[0]);
  }

  const filteredBetes = allBetes.filter(bete => {
    // Vérifier que la bête a toutes les propriétés nécessaires
    if (!bete || !bete.id || !bete.numero_identification || !bete.espece_nom) {
      console.warn('⚠️ Bête avec données incomplètes:', bete);
      return false;
    }
    
    return bete.numero_identification.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (formData.espece ? bete.espece_nom === formData.espece : true);
  });

  if (!isOpen) return null;

  // Afficher un message si les données sont en cours de chargement
  if (abattoirsLoading || especesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="theme-bg-elevated rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <span className="theme-text-primary">
              {isRTL ? 'جاري تحميل البيانات...' : 'Chargement des données...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative theme-bg-elevated rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="px-6 py-4 border-b theme-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                <ArrowRightLeft className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold theme-text-primary">
                  {isRTL ? 'إنشاء نقل جديد' : 'Créer un nouveau transfert'}
                </h3>
                <p className="text-sm theme-text-secondary">
                  {isRTL ? 'نقل البهائم إلى مجزر آخر' : 'Transférer des bêtes vers un autre abattoir'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:theme-bg-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection de l'abattoir source (uniquement pour les superusers) */}
          {user?.is_superuser && (
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Building2 className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المجزر المصدر' : 'Abattoir source'}
              </label>
              <select
                value={formData.abattoir_source}
                onChange={(e) => handleInputChange('abattoir_source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                required
                disabled={abattoirsLoading}
              >
                <option value="">
                  {isRTL ? 'اختر المجزر المصدر' : 'Sélectionnez l\'abattoir source'}
                </option>
                {abattoirsData?.abattoirs?.map((abattoir: any) => (
                  <option key={abattoir.id} value={abattoir.id}>
                    {abattoir.nom} - {abattoir.wilaya}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection de l'abattoir destinataire */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Building2 className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المجزر الوجهة' : 'Abattoir destinataire'}
            </label>
            <select
              value={formData.abattoir_destinataire}
              onChange={(e) => handleInputChange('abattoir_destinataire', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
              required
              disabled={abattoirsLoading}
            >
              <option value="">
                {isRTL ? 'اختر المجزر الوجهة' : 'Sélectionnez l\'abattoir destinataire'}
              </option>
              {abattoirsData?.abattoirs
                ?.filter((abattoir: any) => {
                  // Pour les superusers : exclure l'abattoir source sélectionné
                  if (user?.is_superuser && formData.abattoir_source) {
                    return abattoir.id.toString() !== formData.abattoir_source;
                  }
                  // Pour les utilisateurs normaux : exclure leur abattoir
                  return user?.abattoir?.id !== abattoir.id;
                })
                .map((abattoir: any) => (
                  <option key={abattoir.id} value={abattoir.id}>
                    {abattoir.nom} - {abattoir.wilaya}
                  </option>
                ))}
            </select>
          </div>

          {/* Sélection de l'espèce */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Users className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'النوع' : 'Espèce'}
            </label>
            <select
              value={formData.espece}
              onChange={(e) => handleInputChange('espece', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
              required
              disabled={especesLoading}
            >
              <option value="">
                {isRTL ? 'اختر النوع' : 'Sélectionnez l\'espèce'}
              </option>
              {especesData?.map(espece => (
                <option key={espece.id} value={espece.nom}>
                  {espece.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Type de produit */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <FileText className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'نوع المنتج' : 'Type de produit'}
            </label>
            <select
              value={formData.type_produit}
              onChange={(e) => handleInputChange('type_produit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
              required
            >
              <option value="VIF">
                {isRTL ? 'حي' : 'Vif'}
              </option>
              <option value="CARCASSE">
                {isRTL ? 'ذبيحة' : 'Carcasse'}
              </option>
            </select>
          </div>

          {/* Information sur les bêtes disponibles */}
          {formData.abattoir_source && formData.espece && formData.type_produit && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {isRTL ? 'معلومات البهائم المتاحة' : 'Informations sur les bêtes disponibles'}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      {isRTL ? 'سيتم عرض البهائم التالية:' : 'Les bêtes suivantes seront affichées:'}
                    </p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>
                        {isRTL ? 'من المجزر:' : 'De l\'abattoir:'} <strong>
                          {abattoirsData?.abattoirs?.find((a: any) => a.id.toString() === formData.abattoir_source)?.nom || 'N/A'}
                        </strong>
                      </li>
                      <li>
                        {isRTL ? 'النوع:' : 'Espèce:'} <strong>{formData.espece}</strong>
                      </li>
                      <li>
                        {isRTL ? 'الحالة:' : 'État:'} <strong>
                          {formData.type_produit === 'VIF' 
                            ? (isRTL ? 'حي (لم يتم ذبحه)' : 'Vif (non abattu)')
                            : (isRTL ? 'ذبيحة (تم ذبحه)' : 'Carcasse (abattu)')
                          }
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode de sélection */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-3">
              {isRTL ? 'طريقة اختيار البهائم' : 'Mode de sélection des bêtes'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('selection_mode', 'manual')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.selection_mode === 'manual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <div className="text-left">
                    <div className="font-medium theme-text-primary">
                      {isRTL ? 'اختيار يدوي' : 'Sélection manuelle'}
                    </div>
                    <div className="text-sm theme-text-secondary">
                      {isRTL ? 'اختر البهائم واحدة تلو الأخرى' : 'Sélectionnez les bêtes individuellement'}
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('selection_mode', 'random')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.selection_mode === 'random'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shuffle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <div className="text-left">
                    <div className="font-medium theme-text-primary">
                      {isRTL ? 'اختيار عشوائي' : 'Sélection aléatoire'}
                    </div>
                    <div className="text-sm theme-text-secondary">
                      {isRTL ? 'اختيار عشوائي حسب العدد' : 'Sélection aléatoire par nombre'}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sélection aléatoire */}
          {formData.selection_mode === 'random' && (
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Hash className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'عدد البهائم' : 'Nombre de bêtes'}
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  min="1"
                  max={allBetes.length}
                  value={formData.nombre_betes}
                  onChange={(e) => handleInputChange('nombre_betes', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                  placeholder={isRTL ? 'أدخل العدد' : 'Entrez le nombre'}
                />
                <button
                  type="button"
                  onClick={handleRandomSelection}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs theme-text-secondary mt-1">
                {isRTL ? `متاح: ${allBetes.length} بهيمة` : `Disponible: ${allBetes.length} bêtes`}
                {betesData?.count && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({isRTL ? `من أصل ${betesData.count}` : `sur ${betesData.count}`})
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Message si critères non remplis */}
          {formData.selection_mode === 'manual' && (!formData.abattoir_source || !formData.espece || !formData.type_produit) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {isRTL 
                    ? 'يرجى اختيار المجزر المصدر والنوع ونوع المنتج أولاً لعرض البهائم المتاحة'
                    : 'Veuillez d\'abord sélectionner l\'abattoir source, l\'espèce et le type de produit pour afficher les bêtes disponibles'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Sélection manuelle */}
          {formData.selection_mode === 'manual' && formData.abattoir_source && formData.espece && formData.type_produit && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium theme-text-primary">
                  {isRTL ? 'اختيار البهائم' : 'Sélection des bêtes'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowBeteSelection(!showBeteSelection)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {showBeteSelection ? (isRTL ? 'إخفاء' : 'Masquer') : (isRTL ? 'عرض' : 'Afficher')}
                </button>
              </div>

              {showBeteSelection && (
                <div className="border theme-border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {/* Recherche */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isRTL ? 'البحث برقم التعريف...' : 'Rechercher par numéro d\'identification...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                    />
                  </div>

                  {/* Liste des bêtes */}
                  <div className="space-y-2">
                    {filteredBetes.map(bete => (
                      <div
                        key={bete.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.betes_selectionnees.includes(bete.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleBeteToggle(bete.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              formData.betes_selectionnees.includes(bete.id)
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {formData.betes_selectionnees.includes(bete.id) && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium theme-text-primary">
                                {bete?.numero_identification || 'N/A'}
                              </div>
                              <div className="text-sm theme-text-secondary">
                                {bete?.espece_nom || 'N/A'} • {bete?.sexe_display || 'N/A'} • {bete?.poids_vif || 0} kg
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bouton "Charger plus" */}
                  {hasMore && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={loadMoreBetes}
                        disabled={betesLoading}
                        className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {betesLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                            {isRTL ? 'جاري التحميل...' : 'Chargement...'}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <ArrowDown className="h-4 w-4 mr-2" />
                            {isRTL ? 'تحميل المزيد' : 'Charger plus'}
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 text-sm theme-text-secondary">
                {isRTL ? `تم اختيار ${formData.betes_selectionnees.length} بهيمة` : `${formData.betes_selectionnees.length} bêtes sélectionnées`}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <FileText className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'ملاحظة' : 'Note'}
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-bg-secondary theme-text-primary"
              placeholder={isRTL ? 'أضف ملاحظة حول النقل...' : 'Ajoutez une note sur le transfert...'}
            />
          </div>

          {/* Résumé */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {isRTL ? 'ملخص النقل' : 'Résumé du transfert'}
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>
                    {isRTL ? 'من:' : 'De:'} <strong>{user?.abattoir?.nom}</strong>
                  </p>
                  <p>
                    {isRTL ? 'إلى:' : 'Vers:'} <strong>
                      {abattoirsData?.abattoirs?.find((a: any) => a.id.toString() === formData.abattoir_destinataire)?.nom || (isRTL ? 'غير محدد' : 'Non spécifié')}
                    </strong>
                  </p>
                  <p>
                    {isRTL ? 'عدد البهائم:' : 'Nombre de bêtes:'} <strong>
                      {formData.selection_mode === 'manual' 
                        ? formData.betes_selectionnees.length 
                        : formData.nombre_betes || 0}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-secondary theme-bg-secondary hover:theme-bg-secondary-hover rounded-lg transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={createTransfertMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              {createTransfertMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isRTL ? 'جاري الإنشاء...' : 'Création...'}</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>{isRTL ? 'إنشاء النقل' : 'Créer le transfert'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransfertModal;
