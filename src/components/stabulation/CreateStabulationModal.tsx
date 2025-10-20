'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckSquare, 
  Square,
  Scale,
  Target,
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  Info,
  TrendingUp,
  Package,
  Search
} from 'lucide-react';
import { useCreateStabulation, useBetesDisponibles, useEspecesDisponibles } from '@/lib/hooks/useStabulations';
import { useAbattoirsList } from '@/lib/hooks/useAbattoirStats';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/hooks/useAuth';

interface CreateStabulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  abattoirId: number;
  abattoirNom: string;
  capaciteStabulationOvin?: number;
  capaciteStabulationBovin?: number;
}

export const CreateStabulationModal: React.FC<CreateStabulationModalProps> = ({
  isOpen,
  onClose,
  abattoirId,
  abattoirNom,
  capaciteStabulationOvin = 0,
  capaciteStabulationBovin = 0
}) => {
  const { currentLocale } = useLanguage();
  const { user } = useAuth();
  const isRTL = currentLocale === 'ar';
  
  // Vérifier si l'utilisateur est superuser
  const isSuperuser = user?.is_superuser || false;
  
  // État pour l'abattoir sélectionné (pour superuser)
  const [selectedAbattoirId, setSelectedAbattoirId] = useState<number>(abattoirId);
  const [selectedAbattoir, setSelectedAbattoir] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    espece: '' as string,
    date_debut: '',
    notes: ''
  });
  
  const [selectedBetes, setSelectedBetes] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [searchBoucle, setSearchBoucle] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'automatic'>('manual');
  const [automaticCount, setAutomaticCount] = useState<number>(0);
  
  const createStabulationMutation = useCreateStabulation();
  
  // Récupérer les espèces disponibles
  const { data: especesData, isLoading: especesLoading, error: especesError } = useEspecesDisponibles();
  
  // Récupérer la liste des abattoirs (pour superuser)
  const { data: abattoirsList } = useAbattoirsList();
  
  // Initialiser l'abattoir sélectionné quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && user) {
      if (isSuperuser) {
        // Pour superuser : ne pas pré-sélectionner d'abattoir, laisser l'utilisateur choisir
        setSelectedAbattoirId(0);
        setSelectedAbattoir(null);
      } else {
        // Pour utilisateur normal : utiliser l'abattoir attribué
        setSelectedAbattoirId(abattoirId);
        const abattoir = abattoirsList?.find(a => a.id === abattoirId);
        setSelectedAbattoir(abattoir);
      }
    }
  }, [isOpen, user, isSuperuser, abattoirsList, abattoirId]);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchBoucle]);
  
  // Récupérer les bêtes disponibles selon l'espèce sélectionnée
  // Pour superuser : TOUJOURS utiliser l'abattoir sélectionné (même s'il a un abattoir attribué)
  // Pour utilisateur normal : utiliser l'abattoir de l'utilisateur
  const effectiveAbattoirId = isSuperuser ? selectedAbattoirId : (abattoirId || 1);
  
  // Debug logs
  console.log('=== DEBUG MODAL ===');
  console.log('Is Superuser:', isSuperuser);
  console.log('User abattoir ID:', abattoirId);
  console.log('Selected Abattoir ID:', selectedAbattoirId);
  console.log('Selected Abattoir:', selectedAbattoir);
  console.log('Effective Abattoir ID:', effectiveAbattoirId);
  console.log('Especes data:', especesData);
  console.log('Especes loading:', especesLoading);
  console.log('Especes error:', especesError);
  console.log('==================');
  // Récupérer les bêtes avec pagination classique
  const { 
    data: betesData, 
    isLoading: betesLoading, 
    error: betesError
  } = useBetesDisponibles(
    effectiveAbattoirId,
    formData.espece,
    searchBoucle,
    currentPage
  );
  
  // Debug logs pour les bêtes (déplacés après les déclarations)
  
  // Calculer la capacité maximale selon l'espèce et l'abattoir sélectionné
  const capaciteMaximale = useMemo(() => {
    // Pour superuser : utiliser les capacités de l'abattoir sélectionné
    let capaciteOvin = capaciteStabulationOvin;
    let capaciteBovin = capaciteStabulationBovin;
    
    if (isSuperuser && selectedAbattoir) {
      capaciteOvin = selectedAbattoir.capacite_stabulation_ovin || 0;
      capaciteBovin = selectedAbattoir.capacite_stabulation_bovin || 0;
    }
    
    // Si pas de capacités définies, utiliser une capacité par défaut
    if (capaciteOvin === 0 && capaciteBovin === 0) {
      return 100; // Capacité par défaut
    }
    if (formData.espece === 'BOVIN') return capaciteBovin || 50;
    if (formData.espece === 'OVIN') return capaciteOvin || 100;
    if (formData.espece === 'CAPRIN') return capaciteOvin || 100;
    return Math.max(capaciteOvin || 100, capaciteBovin || 50);
  }, [formData.espece, capaciteStabulationOvin, capaciteStabulationBovin, isSuperuser, selectedAbattoir]);

  // Extraire les bêtes de la page courante
  const currentBetes = useMemo(() => {
    return betesData?.betes || [];
  }, [betesData?.betes]);

  // Calculer le poids total des bêtes sélectionnées
  const totalWeight = useMemo(() => {
    if (!currentBetes || selectedBetes.length === 0) {
      return 0;
    }
    
    const weight = selectedBetes.reduce((total, beteId) => {
      const bete = currentBetes.find(b => b.id === beteId);
      if (!bete) return total;
      
      const beteWeight = bete.poids_vif || 0;
      const numericWeight = typeof beteWeight === 'number' ? beteWeight : parseFloat(String(beteWeight)) || 0;
      
      return total + numericWeight;
    }, 0);
    
    return typeof weight === 'number' ? weight : 0;
  }, [selectedBetes, currentBetes]);

  // Calculer le poids moyen des bêtes sélectionnées
  const averageWeight = useMemo(() => {
    if (selectedBetes.length === 0) {
      return 0;
    }
    
    const avg = totalWeight / selectedBetes.length;
    return typeof avg === 'number' && !isNaN(avg) ? avg : 0;
  }, [totalWeight, selectedBetes.length]);

  // Debug logs pour les bêtes (après toutes les déclarations)
  console.log('=== DEBUG BETES ===');
  console.log('Betes data:', betesData);
  console.log('Current page:', currentPage);
  console.log('Total pages:', betesData?.pagination?.total_pages || 0);
  console.log('Total betes:', betesData?.pagination?.total || 0);
  console.log('Loading:', betesLoading);
  console.log('Error:', betesError);
  console.log('Selected espece:', formData.espece);
  console.log('Search boucle:', searchBoucle);
  console.log('Current betes count:', currentBetes.length);
  console.log('==================');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset selected betes when espece changes
    if (name === 'espece') {
      setSelectedBetes([]);
      setSearchBoucle(''); // Reset search when species changes
      setCurrentPage(1); // Reset to first page
      setAutomaticCount(0); // Reset automatic count
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleBeteSelection = (beteId: number) => {
    setSelectedBetes(prev => {
      if (prev.includes(beteId)) {
        return prev.filter(id => id !== beteId);
      } else {
        // Vérifier la capacité maximale
        if (prev.length >= capaciteMaximale) {
          setErrors(prev => ({
            ...prev,
            betes: isRTL ? `لا يمكن تجاوز السعة القصوى (${capaciteMaximale})` : `Impossible de dépasser la capacité maximale (${capaciteMaximale})`
          }));
          return prev;
        }
        return [...prev, beteId];
      }
    });
    
    // Clear betes error
    if (errors.betes) {
      setErrors(prev => ({
        ...prev,
        betes: ''
      }));
    }
  };
  
  const handleSelectAll = () => {
    if (!currentBetes) return;
    
    const maxSelectable = Math.min(currentBetes.length, capaciteMaximale);
    const beteIds = currentBetes.slice(0, maxSelectable).map(bete => bete.id);
    setSelectedBetes(beteIds);
  };
  
  const handleDeselectAll = () => {
    setSelectedBetes([]);
  };

  // Gérer le changement de mode de sélection
  const handleSelectionModeChange = (mode: 'manual' | 'automatic') => {
    setSelectionMode(mode);
    setSelectedBetes([]);
    setAutomaticCount(0);
    setErrors(prev => ({ ...prev, betes: '' }));
  };
  
  // Gérer le changement d'abattoir (pour superuser)
  const handleAbattoirChange = (abattoirId: number) => {
    setSelectedAbattoirId(abattoirId);
    const abattoir = abattoirsList?.find(a => a.id === abattoirId);
    setSelectedAbattoir(abattoir);
    // Réinitialiser les sélections quand on change d'abattoir
    setSelectedBetes([]);
    setSearchBoucle('');
    setCurrentPage(1);
    setAutomaticCount(0);
    setFormData(prev => ({ ...prev, espece: '' }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validation pour superuser : abattoir OBLIGATOIRE
    if (isSuperuser && (!selectedAbattoirId || selectedAbattoirId === 0)) {
      newErrors.abattoir = isRTL ? 'يجب اختيار مجزر' : 'Vous devez sélectionner un abattoir';
    }
    
    if (!formData.espece) {
      newErrors.espece = isRTL ? 'نوع الماشية مطلوب' : 'L\'espèce est requise';
    }
    
    if (!formData.date_debut) {
      newErrors.date_debut = isRTL ? 'تاريخ البداية مطلوب' : 'La date de début est requise';
    } else {
      const selectedDate = new Date(formData.date_debut);
      const today = new Date();
      // Réinitialiser l'heure à 00:00:00 pour comparer seulement les dates
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date_debut = isRTL ? 'لا يمكن إنشاء أمر ذبح بتاريخ أمس' : 'Impossible de créer un ordre d\'abattage avec une date d\'hier';
      }
    }
    
    // Validation des bêtes selon le mode de sélection
    if (selectionMode === 'manual') {
      if (selectedBetes.length === 0) {
        newErrors.betes = isRTL ? 'يجب اختيار حيوان واحد على الأقل' : 'Veuillez sélectionner au moins un animal';
      } else if (selectedBetes.length > capaciteMaximale) {
        newErrors.betes = isRTL ? `لا يمكن اختيار أكثر من ${capaciteMaximale} حيوان` : `Vous ne pouvez pas sélectionner plus de ${capaciteMaximale} animaux`;
      }
    } else {
      if (automaticCount <= 0) {
        newErrors.betes = isRTL ? 'يجب تحديد عدد الحيوانات' : 'Veuillez spécifier le nombre d\'animaux';
      } else if (automaticCount > capaciteMaximale) {
        newErrors.betes = isRTL ? `لا يمكن اختيار أكثر من ${capaciteMaximale} حيوان` : `Vous ne pouvez pas sélectionner plus de ${capaciteMaximale} animaux`;
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
    
    try {
      await createStabulationMutation.mutateAsync({
        abattoir: effectiveAbattoirId,
        type_bete: formData.espece as 'BOVIN' | 'OVIN' | 'CAPRIN' | 'AUTRE',
        date_debut: formData.date_debut,
        notes: formData.notes || undefined,
        betes: selectionMode === 'manual' ? selectedBetes : [],
        automatic_count: selectionMode === 'automatic' ? automaticCount : undefined
      } as any);
      
      // Reset form
      setFormData({
        espece: '',
        date_debut: '',
        notes: ''
      });
      setSelectedBetes([]);
      setSearchBoucle('');
      setAutomaticCount(0);
      setSelectionMode('manual');
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la stabulation:', error);
    }
  };
  
  const handleClose = () => {
    setFormData({
      espece: '',
      date_debut: '',
      notes: ''
    });
    setSelectedBetes([]);
    setSearchBoucle('');
    setAutomaticCount(0);
    setSelectionMode('manual');
    setErrors({});
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Attendre que les données utilisateur soient chargées
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-gray-600 dark:text-gray-300">
              {isRTL ? 'جاري التحميل...' : 'Chargement...'}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {isRTL ? 'جاري تحميل بيانات المستخدم...' : 'Chargement des données utilisateur...'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className={`theme-bg-elevated rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className={isRTL ? 'mr-4' : 'ml-4'}>
              <h3 className="text-xl font-bold theme-text-primary">
                {isRTL ? 'نظام إسطبل جديد' : 'Nouvel ordre d\'abattage'}
              </h3>
              <p className="text-sm theme-text-secondary flex items-center">
                <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isSuperuser 
                  ? (selectedAbattoir ? `${selectedAbattoir.nom} - ${selectedAbattoir.wilaya}` : 'Sélectionner un abattoir')
                  : abattoirNom
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-6 w-6 theme-text-secondary hover:theme-text-primary" />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Informations générales */}
              <div className="space-y-6">
                <div className="theme-bg-secondary rounded-lg p-4 border theme-border-primary">
                  <h4 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                    <Info className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'المعلومات العامة' : 'Informations générales'}
                  </h4>
                  
                  {/* Sélecteur d'abattoir (pour superuser) */}
                  {isSuperuser && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'المجزر' : 'Abattoir'} *
                      </label>
                      <div className="relative">
                        <select
                          value={selectedAbattoirId}
                          onChange={(e) => handleAbattoirChange(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                        >
                          <option value="">
                            {isRTL ? 'اختر المجزر' : 'Sélectionner un abattoir'}
                          </option>
                          {abattoirsList?.map(abattoir => (
                            <option key={abattoir.id} value={abattoir.id}>
                              {abattoir.nom} - {abattoir.wilaya}
                            </option>
                          ))}
                        </select>
                        <Building2 className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                      </div>
                      {errors.abattoir && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.abattoir}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Espèce */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      {isRTL ? 'نوع الماشية' : 'Espèce'} *
                    </label>
                    <div className="relative">
                      <select
                        name="espece"
                        value={formData.espece}
                        onChange={handleInputChange}
                        disabled={especesLoading}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.espece ? 'border-red-500' : 'theme-border-primary'
                        } theme-bg-elevated theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">
                          {especesLoading 
                            ? (isRTL ? 'جاري التحميل...' : 'Chargement...') 
                            : (isRTL ? 'اختر نوع الماشية' : 'Sélectionner l\'espèce')
                          }
                        </option>
                        {especesData?.map(espece => (
                          <option key={espece.id} value={espece.nom}>{espece.nom}</option>
                        ))}
                      </select>
                      <Target className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                    </div>
                    {errors.espece && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.espece}
                      </p>
                    )}
                    {especesError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {isRTL ? 'خطأ في تحميل الأنواع' : 'Erreur lors du chargement des espèces'}
                      </p>
                    )}
                  </div>
                  
                  {/* Date de début */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      {isRTL ? 'تاريخ البداية' : 'Date de début'} *
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        name="date_debut"
                        value={formData.date_debut}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.date_debut ? 'border-red-500' : 'theme-border-primary'
                        } theme-bg-elevated theme-text-primary`}
                      />
                      <Calendar className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                    </div>
                    {errors.date_debut && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.date_debut}
                      </p>
                    )}
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      {isRTL ? 'ملاحظات' : 'Notes'}
                    </label>
                    <div className="relative">
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary resize-none"
                        placeholder={isRTL ? 'ملاحظات إضافية...' : 'Notes supplémentaires...'}
                      />
                      <FileText className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 h-4 w-4 theme-text-tertiary`} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Colonne droite - Statistiques et objectif de poids */}
              <div className="space-y-6">
                {/* Statistiques de sélection */}
                <div className="theme-bg-secondary rounded-lg p-4 border theme-border-primary">
                  <h4 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                    <TrendingUp className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إحصائيات الاختيار' : 'Statistiques de sélection'}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 theme-bg-secondary rounded-lg border theme-border-primary">
                      <div className="text-2xl font-bold theme-text-primary">
                        {selectedBetes.length}
                      </div>
                      <div className="text-sm theme-text-secondary">
                        {isRTL ? 'حيوان مختار' : 'Animaux sélectionnés'}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 theme-bg-secondary rounded-lg border theme-border-primary">
                      <div className="text-2xl font-bold theme-text-primary">
                        {capaciteMaximale}
                      </div>
                      <div className="text-sm theme-text-secondary">
                        {isRTL ? 'السعة القصوى' : 'Capacité max'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm theme-text-secondary mb-1">
                      <span>{isRTL ? 'معدل الإشغال' : 'Taux d\'occupation'}</span>
                      <span>{capaciteMaximale > 0 ? Math.round((selectedBetes.length / capaciteMaximale) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${capaciteMaximale > 0 ? Math.min((selectedBetes.length / capaciteMaximale) * 100, 100) : 0}%`,
                          minWidth: '2px' // Assurer une largeur minimale visible
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Objectif de poids */}
                <div className="theme-bg-secondary rounded-lg p-4 border theme-border-primary">
                  <h4 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                    <Scale className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إدارة الأوزان' : 'Gestion des poids'}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        {isRTL ? 'الوزن المستهدف (كغ)' : 'Poids cible (kg)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border theme-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-text-primary"
                          placeholder={isRTL ? 'أدخل الوزن المستهدف' : 'Entrez le poids cible'}
                        />
                        <Scale className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary`} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 theme-bg-secondary rounded-lg border theme-border-primary">
                        <div className="text-xl font-bold theme-text-primary">
                          {(totalWeight || 0).toFixed(1)} kg
                        </div>
                        <div className="text-sm theme-text-secondary">
                          {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
                        </div>
                      </div>
                      
                      <div className="text-center p-3 theme-bg-secondary rounded-lg border theme-border-primary">
                        <div className="text-xl font-bold theme-text-primary">
                          {(averageWeight || 0).toFixed(1)} kg
                        </div>
                        <div className="text-sm theme-text-secondary">
                          {isRTL ? 'الوزن المتوسط' : 'Poids moyen'}
                        </div>
                      </div>
                    </div>
                    
                    {targetWeight > 0 && (
                      <div className="p-3 rounded-lg border-2 border-dashed theme-border-primary">
                        <div className="flex items-center justify-between">
                          <span className="text-sm theme-text-secondary">
                            {isRTL ? 'الفرق عن الهدف' : 'Écart par rapport à l\'objectif'}
                          </span>
                          <span className={`text-sm font-medium ${
                            Math.abs((totalWeight || 0) - targetWeight) <= 10 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {(totalWeight || 0) > targetWeight ? '+' : ''}{((totalWeight || 0) - targetWeight).toFixed(1)} kg
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              Math.abs((totalWeight || 0) - targetWeight) <= 10 
                                ? 'bg-green-500' 
                                : 'bg-orange-500'
                            }`}
                            style={{ 
                              width: `${Math.min(((totalWeight || 0) / targetWeight) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sélection des bêtes */}
            {formData.espece && (
              <div className="theme-bg-secondary rounded-lg p-4 border theme-border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold theme-text-primary flex items-center">
                    <Users className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'اختيار الحيوانات' : 'Sélectionner les animaux'} *
                  </h4>
                </div>

                {/* Mode de sélection */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="selectionMode"
                        value="manual"
                        checked={selectionMode === 'manual'}
                        onChange={() => handleSelectionModeChange('manual')}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="theme-text-primary">
                        {isRTL ? 'اختيار يدوي' : 'Sélection manuelle'}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="selectionMode"
                        value="automatic"
                        checked={selectionMode === 'automatic'}
                        onChange={() => handleSelectionModeChange('automatic')}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="theme-text-primary">
                        {isRTL ? 'اختيار تلقائي' : 'Sélection automatique'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Mode automatique */}
                {selectionMode === 'automatic' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'عدد الحيوانات المطلوبة' : 'Nombre d\'animaux requis'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={capaciteMaximale}
                      value={automaticCount}
                      onChange={(e) => setAutomaticCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                      placeholder={isRTL ? 'أدخل عدد الحيوانات...' : 'Entrez le nombre d\'animaux...'}
                    />
                    <div className="mt-1 text-sm theme-text-secondary">
                      {isRTL ? `الحد الأقصى: ${capaciteMaximale} حيوان` : `Maximum: ${capaciteMaximale} animaux`}
                    </div>
                  </div>
                )}

                {/* Mode manuel - Interface existante */}
                {selectionMode === 'manual' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                    <span className="text-sm theme-text-secondary theme-bg-secondary px-3 py-1 rounded-full border theme-border-primary">
                      {selectedBetes.length} / {capaciteMaximale}
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs px-3 py-1 theme-bg-secondary theme-text-primary rounded-lg hover:theme-bg-elevated transition-colors border theme-border-primary"
                    >
                      {isRTL ? 'اختيار الكل' : 'Tout sélectionner'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-xs px-3 py-1 theme-bg-secondary theme-text-primary rounded-lg hover:theme-bg-elevated transition-colors border theme-border-primary"
                    >
                      {isRTL ? 'إلغاء الكل' : 'Tout désélectionner'}
                    </button>
                  </div>
                </div>
                
                {/* Barre de recherche par numéro de boucle */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchBoucle}
                      onChange={(e) => setSearchBoucle(e.target.value)}
                      placeholder={isRTL ? 'البحث برقم البوق...' : 'Rechercher par numéro de boucle...'}
                      className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
                    />
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
                  </div>
                  <div className="mt-2 text-sm theme-text-secondary">
                    {searchBoucle ? (
                      isRTL ? `نتائج البحث: ${currentBetes.length} حيوان` : `${currentBetes.length} animal(s) trouvé(s)`
                    ) : (
                      isRTL ? `إجمالي الحيوانات: ${betesData?.pagination?.total || 0} - صفحة ${currentPage} من ${betesData?.pagination?.total_pages || 1}` : 
                              `Total: ${betesData?.pagination?.total || 0} animaux - Page ${currentPage} sur ${betesData?.pagination?.total_pages || 1}`
                    )}
                  </div>
                </div>
                
                {errors.betes && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.betes}
                    </p>
                  </div>
                )}
                
                <div className="max-h-80 overflow-y-auto border theme-border-primary rounded-lg theme-bg-elevated">
                  {betesLoading ? (
                    <div className="p-8 text-center theme-text-secondary">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                      {isRTL ? 'جاري تحميل الحيوانات...' : 'Chargement des animaux...'}
                    </div>
                  ) : betesError ? (
                    <div className="p-8 text-center text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                      {isRTL ? 'خطأ في تحميل الحيوانات' : 'Erreur lors du chargement des animaux'}
                    </div>
                  ) : currentBetes && currentBetes.length > 0 ? (
                    <div className="divide-y theme-border-secondary">
                      {currentBetes.map((bete) => {
                        const isSelected = selectedBetes.includes(bete.id);
                        const isHealthy = bete.etat_sante === 'BON';
                        
                        return (
                          <div
                            key={bete.id}
                            className={`p-4 hover:theme-bg-secondary cursor-pointer transition-all duration-200 ${
                              isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''
                            }`}
                            onClick={() => handleBeteSelection(bete.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isSelected ? (
                                  <CheckSquare className="h-5 w-5 text-primary-600" />
                                ) : (
                                  <Square className="h-5 w-5 theme-text-tertiary" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="text-sm font-medium theme-text-primary">
                                      {bete.numero_identification}
                                    </div>
                                    {bete.nom && (
                                      <div className="text-sm theme-text-secondary">
                                        • {bete.nom}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs theme-text-secondary">
                                    <span className="flex items-center">
                                      <Target className="h-3 w-3 mr-1" />
                                      {bete.espece_nom || bete.espece?.nom}
                                    </span>
                    <span className="flex items-center">
                      <Scale className="h-3 w-3 mr-1" />
                      {bete.poids_vif || 0}kg
                      {/* Debug: {JSON.stringify(bete.poids_vif)} */}
                    </span>
                                    {bete.race?.nom && (
                                      <span>{bete.race.nom}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isHealthy
                                    ? 'bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-100'
                                    : 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-100'
                                }`}>
                                  {isHealthy ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                                </div>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-primary-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Pagination classique avec numéros de pages */}
                      {betesData?.pagination && betesData.pagination.total_pages > 1 && (
                        <div className="p-4 border-t theme-border-secondary">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Bouton Précédent */}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1 rounded-lg theme-bg-secondary theme-text-primary hover:theme-bg-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed border theme-border-primary"
                            >
                              {isRTL ? 'السابق' : 'Précédent'}
                            </button>
                            
                            {/* Numéros de pages */}
                            {Array.from({ length: Math.min(5, betesData.pagination.total_pages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(
                                betesData.pagination.total_pages - 4,
                                currentPage - 2
                              )) + i;
                              
                              if (pageNum > betesData.pagination.total_pages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 rounded-lg transition-colors border ${
                                    currentPage === pageNum
                                      ? 'bg-primary-600 text-white border-primary-600'
                                      : 'theme-bg-secondary theme-text-primary hover:theme-bg-elevated theme-border-primary'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            
                            {/* Bouton Suivant */}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(prev => Math.min(betesData.pagination.total_pages, prev + 1))}
                              disabled={currentPage === betesData.pagination.total_pages}
                              className="px-3 py-1 rounded-lg theme-bg-secondary theme-text-primary hover:theme-bg-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed border theme-border-primary"
                            >
                              {isRTL ? 'التالي' : 'Suivant'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center theme-text-secondary">
                      <Users className="h-8 w-8 mx-auto mb-3 theme-text-tertiary" />
                      {searchBoucle 
                        ? (isRTL ? 'لا توجد حيوانات تطابق البحث' : 'Aucun animal ne correspond à la recherche')
                        : (isRTL ? 'لا توجد حيوانات متاحة من هذا النوع' : 'Aucun animal disponible de cette espèce')
                      }
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t theme-border-primary theme-bg-elevated theme-transition">
          <div className="flex items-center space-x-4">
            {selectionMode === 'manual' && selectedBetes.length > 0 && (
              <div className="text-sm theme-text-secondary">
                <span className="font-medium">{selectedBetes.length}</span> {isRTL ? 'حيوان مختار' : 'animaux sélectionnés'} • 
                <span className="font-medium ml-1">{(totalWeight || 0).toFixed(1)} kg</span> {isRTL ? 'إجمالي' : 'total'}
              </div>
            )}
            {selectionMode === 'automatic' && automaticCount > 0 && (
              <div className="text-sm theme-text-secondary">
                <span className="font-medium">{automaticCount}</span> {isRTL ? 'حيوان سيتم اختياره تلقائياً' : 'animaux seront sélectionnés automatiquement'}
              </div>
            )}
          </div>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={createStabulationMutation.isPending}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createStabulationMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isRTL ? 'جاري الإنشاء...' : 'Création...'}
                </div>
              ) : (
                <>
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إنشاء أمر ذبح' : 'Créer ordre d\'abattage'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
