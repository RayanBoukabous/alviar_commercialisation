'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  IdCard,
  Camera,
  Save,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCreatePersonnel } from '@/lib/hooks/usePersonnel';

interface CreatePersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  abattoirId: number;
  abattoirNom: string;
  isRTL: boolean;
  onSuccess?: () => void;
}

const CreatePersonnelModal: React.FC<CreatePersonnelModalProps> = ({
  isOpen,
  onClose,
  abattoirId,
  abattoirNom,
  isRTL,
  onSuccess
}) => {
  const { currentLocale } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Hook pour créer un employé
  const createPersonnelMutation = useCreatePersonnel();

  // État du formulaire
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M',
    nationalite: 'Algérienne',
    
    // Informations d'identité
    numero_carte_identite: '',
    date_emission_carte: '',
    lieu_emission_carte: '',
    
    // Informations de contact
    telephone: '',
    telephone_urgence: '',
    email: '',
    adresse: '',
    wilaya: '',
    commune: '',
    
    // Informations professionnelles
    role: '',
    numero_employe: '',
    date_embauche: '',
    statut: 'ACTIF',
    
    // Documents (optionnels)
    photo: null as File | null,
    carte_identite_recto: null as File | null,
    carte_identite_verso: null as File | null,
    
    // Informations supplémentaires
    notes: '',
    competences: [] as string[],
    formations: [] as string[]
  });

  // Rôles disponibles
  const roles = [
    { value: 'RESPONSABLE_ABATTOIR', label: 'Responsable de l\'abattoir' },
    { value: 'RESPONSABLE_ABATTAGE', label: 'Responsable d\'abattage' },
    { value: 'GESTIONNAIRE_STOCK', label: 'Gestionnaire de stock' },
    { value: 'RH', label: 'Ressources Humaines' },
    { value: 'COMPTABLE', label: 'Comptable' },
    { value: 'SECURITE', label: 'Agent de sécurité' },
    { value: 'MAINTENANCE', label: 'Agent de maintenance' },
    { value: 'VETERINAIRE', label: 'Vétérinaire' },
    { value: 'INSPECTEUR', label: 'Inspecteur' },
    { value: 'OPERATEUR', label: 'Opérateur' },
    { value: 'CHAUFFEUR', label: 'Chauffeur' },
    { value: 'NETTOYAGE', label: 'Agent de nettoyage' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Statuts disponibles
  const statuts = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
    { value: 'SUSPENDU', label: 'Suspendu' },
    { value: 'CONGE', label: 'En congé' },
    { value: 'DEMISSION', label: 'Démission' }
  ];

  // Sexes disponibles
  const sexes = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' }
  ];

  // Gestion des changements d'inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Gestion des fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('🔍 Validation des champs:', {
      nom: formData.nom,
      prenom: formData.prenom,
      date_naissance: formData.date_naissance,
      lieu_naissance: formData.lieu_naissance,
      numero_carte_identite: formData.numero_carte_identite,
      telephone: formData.telephone,
      adresse: formData.adresse,
      wilaya: formData.wilaya,
      commune: formData.commune,
      role: formData.role,
      numero_employe: formData.numero_employe,
      date_embauche: formData.date_embauche
    });

    // Validation des champs obligatoires
    if (!formData.nom.trim()) {
      newErrors.nom = isRTL ? 'الاسم العائلي مطلوب' : 'Le nom de famille est requis';
      console.log('❌ Nom manquant');
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = isRTL ? 'الاسم الشخصي مطلوب' : 'Le prénom est requis';
      console.log('❌ Prénom manquant');
    }
    if (!formData.date_naissance) {
      newErrors.date_naissance = isRTL ? 'تاريخ الميلاد مطلوب' : 'La date de naissance est requise';
      console.log('❌ Date de naissance manquante');
    }
    if (!formData.lieu_naissance.trim()) {
      newErrors.lieu_naissance = isRTL ? 'مكان الميلاد مطلوب' : 'Le lieu de naissance est requis';
      console.log('❌ Lieu de naissance manquant');
    }
    if (!formData.numero_carte_identite.trim()) {
      newErrors.numero_carte_identite = isRTL ? 'رقم بطاقة الهوية مطلوب' : 'Le numéro de carte d\'identité est requis';
      console.log('❌ Numéro de carte d\'identité manquant');
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = isRTL ? 'رقم الهاتف مطلوب' : 'Le numéro de téléphone est requis';
      console.log('❌ Téléphone manquant');
    }
    if (!formData.adresse.trim()) {
      newErrors.adresse = isRTL ? 'العنوان مطلوب' : 'L\'adresse est requise';
      console.log('❌ Adresse manquante');
    }
    if (!formData.wilaya.trim()) {
      newErrors.wilaya = isRTL ? 'الولاية مطلوبة' : 'La wilaya est requise';
      console.log('❌ Wilaya manquante');
    }
    if (!formData.commune.trim()) {
      newErrors.commune = isRTL ? 'البلدية مطلوبة' : 'La commune est requise';
      console.log('❌ Commune manquante');
    }
    if (!formData.role) {
      newErrors.role = isRTL ? 'الدور مطلوب' : 'Le rôle est requis';
      console.log('❌ Rôle manquant');
    }
    if (!formData.numero_employe.trim()) {
      newErrors.numero_employe = isRTL ? 'رقم الموظف مطلوب' : 'Le numéro d\'employé est requis';
      console.log('❌ Numéro d\'employé manquant');
    }
    if (!formData.date_embauche) {
      newErrors.date_embauche = isRTL ? 'تاريخ التوظيف مطلوب' : 'La date d\'embauche est requise';
      console.log('❌ Date d\'embauche manquante');
    }

    // Validation du numéro de carte d'identité (10 chiffres)
    if (formData.numero_carte_identite && !/^\d{10}$/.test(formData.numero_carte_identite)) {
      newErrors.numero_carte_identite = isRTL ? 'رقم بطاقة الهوية يجب أن يحتوي على 10 أرقام' : 'Le numéro de carte d\'identité doit contenir exactement 10 chiffres';
    }

    // Validation du téléphone algérien
    if (formData.telephone && !/^(\+213|0)[5-7]\d{8}$/.test(formData.telephone)) {
      newErrors.telephone = isRTL ? 'رقم الهاتف الجزائري غير صحيح' : 'Numéro de téléphone algérien invalide';
    }

    // Validation de l'email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صحيح' : 'Adresse email invalide';
    }

    console.log('📋 Erreurs de validation:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Formulaire valide:', isValid);
    return isValid;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Début de la soumission du formulaire');
    
    // Vérifier l'authentification
    const token = localStorage.getItem('django_token');
    console.log('🔑 Token d\'authentification:', token ? 'Présent' : 'Manquant');
    
    if (!token) {
      setErrors({ 
        general: isRTL ? 'يجب تسجيل الدخول أولاً' : 'Vous devez être connecté pour créer un employé'
      });
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie');

    try {
      // Préparer les données avec l'abattoir assigné
      const personnelData = {
        ...formData,
        abattoir: abattoirId
      };

      console.log('📤 Données à envoyer:', personnelData);
      console.log('🔗 Abattoir ID:', abattoirId);

      // Appel à l'API pour créer le personnel
      console.log('🌐 Appel de l\'API...');
      await createPersonnelMutation.mutateAsync(personnelData);
      
      // Message de succès
      setSuccessMessage(isRTL ? 'تم إنشاء الموظف بنجاح' : 'Employé créé avec succès');
      
      // Appeler le callback de succès
      onSuccess?.();
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de la création du personnel:', error);
      
      // Gestion des erreurs de validation de l'API
      if (error?.response?.data) {
        const apiErrors = error.response.data;
        const newErrors: Record<string, string> = {};
        
        // Mapper les erreurs de l'API vers les champs du formulaire
        Object.keys(apiErrors).forEach(field => {
          if (Array.isArray(apiErrors[field])) {
            newErrors[field] = apiErrors[field][0];
          } else {
            newErrors[field] = apiErrors[field];
          }
        });
        
        setErrors(newErrors);
      } else {
        // Erreur générale
        setErrors({ 
          general: isRTL ? 'حدث خطأ أثناء إنشاء الموظف' : 'Une erreur est survenue lors de la création de l\'employé'
        });
      }
    }
  };

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nom: '',
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        sexe: 'M',
        nationalite: 'Algérienne',
        numero_carte_identite: '',
        date_emission_carte: '',
        lieu_emission_carte: '',
        telephone: '',
        telephone_urgence: '',
        email: '',
        adresse: '',
        wilaya: '',
        commune: '',
        role: '',
        numero_employe: '',
        date_embauche: '',
        statut: 'ACTIF',
        photo: null,
        carte_identite_recto: null,
        carte_identite_verso: null,
        notes: '',
        competences: [],
        formations: []
      });
      setErrors({});
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border theme-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-primary">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className={isRTL ? 'mr-3 text-right' : 'ml-3'}>
              <h2 className="text-lg font-semibold theme-text-primary">
                {isRTL ? 'إضافة موظف جديد' : 'Ajouter un nouvel employé'}
              </h2>
              <p className="text-sm theme-text-secondary">
                {isRTL ? `للمجزر: ${abattoirNom}` : `Abattoir: ${abattoirNom}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <X className="h-5 w-5 theme-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Affichage des erreurs générales */}
          {errors.general && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <p className="text-error-600 dark:text-error-400 text-sm">
                {errors.general}
              </p>
            </div>
          )}
          
          {/* Message de succès */}
          {successMessage && (
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
              <p className="text-success-600 dark:text-success-400 text-sm">
                {successMessage}
              </p>
            </div>
          )}
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'المعلومات الشخصية' : 'Informations personnelles'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الاسم العائلي *' : 'Nom de famille *'}
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.nom ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل الاسم العائلي' : 'Entrez le nom de famille'}
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.nom}</p>
                )}
              </div>

              {/* Prénom */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الاسم الشخصي *' : 'Prénom *'}
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.prenom ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل الاسم الشخصي' : 'Entrez le prénom'}
                />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.prenom}</p>
                )}
              </div>

              {/* Date de naissance */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'تاريخ الميلاد *' : 'Date de naissance *'}
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${errors.date_naissance ? 'border-error-500' : ''}`}
                />
                {errors.date_naissance && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.date_naissance}</p>
                )}
              </div>

              {/* Lieu de naissance */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'مكان الميلاد *' : 'Lieu de naissance *'}
                </label>
                <input
                  type="text"
                  name="lieu_naissance"
                  value={formData.lieu_naissance}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.lieu_naissance ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل مكان الميلاد' : 'Entrez le lieu de naissance'}
                />
                {errors.lieu_naissance && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.lieu_naissance}</p>
                )}
              </div>

              {/* Sexe */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الجنس *' : 'Sexe *'}
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {sexes.map(sexe => (
                    <option key={sexe.value} value={sexe.value}>
                      {sexe.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nationalité */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الجنسية' : 'Nationalité'}
                </label>
                <input
                  type="text"
                  name="nationalite"
                  value={formData.nationalite}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'أدخل الجنسية' : 'Entrez la nationalité'}
                />
              </div>
            </div>
          </div>

          {/* Informations d'identité */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <IdCard className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'معلومات الهوية' : 'Informations d\'identité'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Numéro de carte d'identité */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'رقم بطاقة الهوية *' : 'Numéro de carte d\'identité *'}
                </label>
                <input
                  type="text"
                  name="numero_carte_identite"
                  value={formData.numero_carte_identite}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.numero_carte_identite ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل رقم بطاقة الهوية (10 أرقام)' : 'Entrez le numéro de carte d\'identité (10 chiffres)'}
                />
                {errors.numero_carte_identite && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.numero_carte_identite}</p>
                )}
              </div>

              {/* Date d'émission */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'تاريخ الإصدار' : 'Date d\'émission'}
                </label>
                <input
                  type="date"
                  name="date_emission_carte"
                  value={formData.date_emission_carte}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary`}
                />
              </div>

              {/* Lieu d'émission */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'مكان الإصدار' : 'Lieu d\'émission'}
                </label>
                <input
                  type="text"
                  name="lieu_emission_carte"
                  value={formData.lieu_emission_carte}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'أدخل مكان إصدار البطاقة' : 'Entrez le lieu d\'émission de la carte'}
                />
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'معلومات الاتصال' : 'Informations de contact'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Téléphone */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'رقم الهاتف *' : 'Téléphone *'}
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.telephone ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Entrez le numéro de téléphone'}
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.telephone}</p>
                )}
              </div>

              {/* Téléphone d'urgence */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'رقم الهاتف للطوارئ' : 'Téléphone d\'urgence'}
                </label>
                <input
                  type="tel"
                  name="telephone_urgence"
                  value={formData.telephone_urgence}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'أدخل رقم الهاتف للطوارئ' : 'Entrez le numéro de téléphone d\'urgence'}
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.email ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Entrez l\'adresse email'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'العنوان *' : 'Adresse *'}
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.adresse ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل العنوان' : 'Entrez l\'adresse'}
                />
                {errors.adresse && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.adresse}</p>
                )}
              </div>

              {/* Wilaya */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الولاية *' : 'Wilaya *'}
                </label>
                <input
                  type="text"
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.wilaya ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل الولاية' : 'Entrez la wilaya'}
                />
                {errors.wilaya && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.wilaya}</p>
                )}
              </div>

              {/* Commune */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'البلدية *' : 'Commune *'}
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.commune ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل البلدية' : 'Entrez la commune'}
                />
                {errors.commune && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.commune}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'المعلومات المهنية' : 'Informations professionnelles'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rôle */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الدور *' : 'Rôle *'}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.role ? 'border-error-500' : ''}`}
                >
                  <option value="">{isRTL ? 'اختر الدور' : 'Sélectionnez un rôle'}</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.role}</p>
                )}
              </div>

              {/* Numéro d'employé */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'رقم الموظف *' : 'Numéro d\'employé *'}
                </label>
                <input
                  type="text"
                  name="numero_employe"
                  value={formData.numero_employe}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'} ${errors.numero_employe ? 'border-error-500' : ''}`}
                  placeholder={isRTL ? 'أدخل رقم الموظف' : 'Entrez le numéro d\'employé'}
                />
                {errors.numero_employe && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.numero_employe}</p>
                )}
              </div>

              {/* Date d'embauche */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'تاريخ التوظيف *' : 'Date d\'embauche *'}
                </label>
                <input
                  type="date"
                  name="date_embauche"
                  value={formData.date_embauche}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${errors.date_embauche ? 'border-error-500' : ''}`}
                />
                {errors.date_embauche && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.date_embauche}</p>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الحالة' : 'Statut'}
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {statuts.map(statut => (
                    <option key={statut.value} value={statut.value}>
                      {statut.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documents (optionnels) */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Camera className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'المستندات (اختياري)' : 'Documents (optionnel)'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الصورة الشخصية' : 'Photo'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                />
              </div>

              {/* Carte d'identité recto */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'بطاقة الهوية (الوجه الأمامي)' : 'Carte d\'identité (recto)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'carte_identite_recto')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                />
              </div>

              {/* Carte d'identité verso */}
              <div>
                <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'بطاقة الهوية (الوجه الخلفي)' : 'Carte d\'identité (verso)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'carte_identite_verso')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className={`text-md font-medium theme-text-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {isRTL ? 'ملاحظات إضافية' : 'Notes supplémentaires'}
            </h3>
            
            <div>
              <label className={`block text-sm font-medium theme-text-primary mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={isRTL ? 'أدخل أي ملاحظات إضافية' : 'Entrez des notes supplémentaires'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t theme-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium theme-text-primary theme-bg-elevated border theme-border-primary rounded-lg hover:theme-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={createPersonnelMutation.isPending}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 theme-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {createPersonnelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isRTL ? 'جاري الحفظ...' : 'Enregistrement...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isRTL ? 'حفظ الموظف' : 'Enregistrer l\'employé'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePersonnelModal;
