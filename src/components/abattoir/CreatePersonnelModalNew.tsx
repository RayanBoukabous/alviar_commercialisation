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
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  Briefcase,
  FileText,
  Plus,
  Trash2,
  CreditCard,
  Image
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCreatePersonnel, useRoles } from '@/lib/hooks/usePersonnel';

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  // Hook pour créer un employé
  const createPersonnelMutation = useCreatePersonnel();
  
  // Hook pour récupérer les rôles
  const { data: rolesData, isLoading: rolesLoading } = useRoles();

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

  // Rôles disponibles depuis l'API
  const roles = rolesData || [];
  
  // Fonction pour obtenir le nom affiché du rôle
  const getRoleDisplayName = (role: any) => {
    const roleNames: { [key: string]: string } = {
      'RESPONSABLE_ABATTOIR': 'Responsable de l\'abattoir',
      'RESPONSABLE_ABATTAGE': 'Responsable d\'abattage',
      'GESTIONNAIRE_STOCK': 'Gestionnaire de stock',
      'RH': 'Ressources Humaines',
      'COMPTABLE': 'Comptable',
      'SECURITE': 'Agent de sécurité',
      'MAINTENANCE': 'Agent de maintenance',
      'VETERINAIRE': 'Vétérinaire',
      'INSPECTEUR': 'Inspecteur',
      'OPERATEUR': 'Opérateur',
      'CHAUFFEUR': 'Chauffeur',
      'NETTOYAGE': 'Agent de nettoyage',
      'AUTRE': 'Autre'
    };
    return roleNames[role.nom] || role.nom;
  };

  // Wilayas d'Algérie
  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
    'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
    'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
    'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair',
    'El Meniaa'
  ];

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
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
      setCurrentStep(1);
      setShowSubmitButton(false);
    }
  }, [isOpen]);

  // Gestion des changements d'input
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Fonction pour gérer l'upload des fichiers
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Ajouter une compétence
  const addCompetence = () => {
    const competence = prompt(isRTL ? 'أدخل المهارة' : 'Entrez la compétence');
    if (competence && competence.trim()) {
      setFormData(prev => ({
        ...prev,
        competences: [...prev.competences, competence.trim()]
      }));
    }
  };

  // Supprimer une compétence
  const removeCompetence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences.filter((_, i) => i !== index)
    }));
  };

  // Ajouter une formation
  const addFormation = () => {
    const formation = prompt(isRTL ? 'أدخل التكوين' : 'Entrez la formation');
    if (formation && formation.trim()) {
      setFormData(prev => ({
        ...prev,
        formations: [...prev.formations, formation.trim()]
      }));
    }
  };

  // Supprimer une formation
  const removeFormation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      formations: prev.formations.filter((_, i) => i !== index)
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Vérifier que les rôles sont chargés
    if (!roles || roles.length === 0) {
      newErrors.role = isRTL ? 'جاري تحميل الأدوار، يرجى الانتظار' : 'Chargement des rôles en cours, veuillez patienter';
      setErrors(newErrors);
      return false;
    }

    // Informations personnelles
    if (!formData.nom.trim()) {
      newErrors.nom = isRTL ? 'الاسم العائلي مطلوب' : 'Le nom de famille est requis';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = isRTL ? 'الاسم الأول مطلوب' : 'Le prénom est requis';
    }
    if (!formData.date_naissance) {
      newErrors.date_naissance = isRTL ? 'تاريخ الميلاد مطلوب' : 'La date de naissance est requise';
    }
    if (!formData.lieu_naissance.trim()) {
      newErrors.lieu_naissance = isRTL ? 'مكان الميلاد مطلوب' : 'Le lieu de naissance est requis';
    }

    // Informations d'identité
    if (!formData.numero_carte_identite.trim()) {
      newErrors.numero_carte_identite = isRTL ? 'رقم بطاقة الهوية مطلوب' : 'Le numéro de carte d\'identité est requis';
    } else if (!/^\d{10}$/.test(formData.numero_carte_identite)) {
      newErrors.numero_carte_identite = isRTL ? 'رقم بطاقة الهوية يجب أن يحتوي على 10 أرقام' : 'Le numéro de carte d\'identité doit contenir exactement 10 chiffres';
    }
    if (!formData.date_emission_carte) {
      newErrors.date_emission_carte = isRTL ? 'تاريخ إصدار البطاقة مطلوب' : 'La date d\'émission de la carte est requise';
    }
    if (!formData.lieu_emission_carte.trim()) {
      newErrors.lieu_emission_carte = isRTL ? 'مكان إصدار البطاقة مطلوب' : 'Le lieu d\'émission de la carte est requis';
    }

    // Informations de contact
    if (!formData.telephone.trim()) {
      newErrors.telephone = isRTL ? 'رقم الهاتف مطلوب' : 'Le numéro de téléphone est requis';
    } else if (!/^(\+213|0)[5-7]\d{8}$/.test(formData.telephone)) {
      newErrors.telephone = isRTL ? 'رقم الهاتف الجزائري غير صحيح' : 'Numéro de téléphone algérien invalide';
    }
    if (!formData.adresse.trim()) {
      newErrors.adresse = isRTL ? 'العنوان مطلوب' : 'L\'adresse est requise';
    }
    if (!formData.wilaya) {
      newErrors.wilaya = isRTL ? 'الولاية مطلوبة' : 'La wilaya est requise';
    }
    if (!formData.commune.trim()) {
      newErrors.commune = isRTL ? 'البلدية مطلوبة' : 'La commune est requise';
    }

    // Informations professionnelles
    if (!formData.role) {
      newErrors.role = isRTL ? 'الدور مطلوب' : 'Le rôle est requis';
    }
    if (!formData.numero_employe.trim()) {
      newErrors.numero_employe = isRTL ? 'رقم الموظف مطلوب' : 'Le numéro d\'employé est requis';
    }
    if (!formData.date_embauche) {
      newErrors.date_embauche = isRTL ? 'تاريخ التوظيف مطلوب' : 'La date d\'embauche est requise';
    }

    // Validation de l'email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صحيح' : 'Adresse email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e?: React.FormEvent) => {
    console.log('handleSubmit appelé!'); // Debug
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      console.log('Validation échouée!'); // Debug
      return;
    }
    
    console.log('Validation réussie, création du personnel...'); // Debug

    try {
      // Créer FormData pour gérer les fichiers
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs texte
      Object.keys(formData).forEach(key => {
        if (key !== 'photo' && key !== 'carte_identite_recto' && key !== 'carte_identite_verso' && key !== 'competences' && key !== 'formations') {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string);
        }
      });
      
      // Ajouter les compétences et formations
      formData.competences.forEach(competence => {
        formDataToSend.append('competences', competence);
      });
      formData.formations.forEach(formation => {
        formDataToSend.append('formations', formation);
      });
      
      // Ajouter les fichiers
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      if (formData.carte_identite_recto) {
        formDataToSend.append('carte_identite_recto', formData.carte_identite_recto);
      }
      if (formData.carte_identite_verso) {
        formDataToSend.append('carte_identite_verso', formData.carte_identite_verso);
      }
      
      // Ajouter l'ID de l'abattoir
      formDataToSend.append('abattoir', abattoirId.toString());

      console.log('Appel de l\'API...'); // Debug
      await createPersonnelMutation.mutateAsync(formDataToSend);
      
      console.log('Personnel créé avec succès!'); // Debug
      setSuccessMessage(isRTL ? 'تم إنشاء الموظف بنجاح' : 'Employé créé avec succès');
      
      onSuccess?.();
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de la création du personnel:', error);
      console.error('Détails de l\'erreur:', error?.response?.data); // Debug
      
      if (error?.response?.data) {
        const apiErrors = error.response.data;
        const newErrors: Record<string, string> = {};
        
        Object.keys(apiErrors).forEach(field => {
          if (Array.isArray(apiErrors[field])) {
            newErrors[field] = apiErrors[field][0];
          } else {
            newErrors[field] = apiErrors[field];
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors({ 
          general: isRTL ? 'حدث خطأ أثناء إنشاء الموظف' : 'Une erreur est survenue lors de la création de l\'employé'
        });
      }
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Afficher le bouton de soumission seulement à la dernière étape
      if (currentStep + 1 === totalSteps) {
        console.log('Affichage du bouton de soumission!'); // Debug
        setShowSubmitButton(true);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Cacher le bouton de soumission si on revient en arrière
      if (currentStep - 1 < totalSteps) {
        setShowSubmitButton(false);
      }
    }
  };

  // Gestion du clic sur le bouton de soumission
  const handleSubmitClick = async () => {
    console.log('Bouton Créer cliqué!'); // Debug
    await handleSubmit();
  };

  if (!isOpen) return null;

  // Afficher un loader pendant le chargement des rôles
  if (rolesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mr-3" />
            <span className="text-lg font-medium theme-text-primary">
              {isRTL ? 'جاري تحميل الأدوار...' : 'Chargement des rôles...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl shadow-xl theme-bg-elevated theme-transition">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                  <h3 className="text-xl font-semibold text-white">
                    {isRTL ? 'إضافة موظف جديد' : 'Ajouter un nouvel employé'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {isRTL ? `للمجزر: ${abattoirNom}` : `Pour l'abattoir: ${abattoirNom}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={createPersonnelMutation.isPending}
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b theme-border-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium theme-text-primary">
                {isRTL ? 'الخطوة' : 'Étape'} {currentStep} {isRTL ? 'من' : 'sur'} {totalSteps}
              </span>
              <span className="text-sm theme-text-secondary">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{isRTL ? 'معلومات شخصية' : 'Infos personnelles'}</span>
              <span>{isRTL ? 'هوية' : 'Identité'}</span>
              <span>{isRTL ? 'اتصال' : 'Contact'}</span>
              <span>{isRTL ? 'مهني' : 'Professionnel'}</span>
              <span>{isRTL ? 'وثائق' : 'Documents'}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6">
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'mr-3' : 'ml-3'}`}>
                    {isRTL ? 'المعلومات الشخصية' : 'Informations personnelles'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الاسم العائلي *' : 'Nom de famille *'}
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.nom ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل الاسم العائلي' : 'Entrez le nom de famille'}
                    />
                    {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الاسم الأول *' : 'Prénom *'}
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.prenom ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل الاسم الأول' : 'Entrez le prénom'}
                    />
                    {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'تاريخ الميلاد *' : 'Date de naissance *'}
                    </label>
                    <input
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.date_naissance ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.date_naissance && <p className="mt-1 text-sm text-red-600">{errors.date_naissance}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'مكان الميلاد *' : 'Lieu de naissance *'}
                    </label>
                    <input
                      type="text"
                      value={formData.lieu_naissance}
                      onChange={(e) => handleInputChange('lieu_naissance', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.lieu_naissance ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل مكان الميلاد' : 'Entrez le lieu de naissance'}
                    />
                    {errors.lieu_naissance && <p className="mt-1 text-sm text-red-600">{errors.lieu_naissance}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الجنس *' : 'Sexe *'}
                    </label>
                    <select
                      value={formData.sexe}
                      onChange={(e) => handleInputChange('sexe', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.sexe ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="M">{isRTL ? 'ذكر' : 'Masculin'}</option>
                      <option value="F">{isRTL ? 'أنثى' : 'Féminin'}</option>
                    </select>
                    {errors.sexe && <p className="mt-1 text-sm text-red-600">{errors.sexe}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الجنسية *' : 'Nationalité *'}
                    </label>
                    <input
                      type="text"
                      value={formData.nationalite}
                      onChange={(e) => handleInputChange('nationalite', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.nationalite ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل الجنسية' : 'Entrez la nationalité'}
                    />
                    {errors.nationalite && <p className="mt-1 text-sm text-red-600">{errors.nationalite}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Informations d'identité */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <IdCard className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'mr-3' : 'ml-3'}`}>
                    {isRTL ? 'معلومات الهوية' : 'Informations d\'identité'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'رقم بطاقة الهوية *' : 'Numéro de carte d\'identité *'}
                    </label>
                    <input
                      type="text"
                      value={formData.numero_carte_identite}
                      onChange={(e) => handleInputChange('numero_carte_identite', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.numero_carte_identite ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? '1234567890' : '1234567890'}
                      maxLength={10}
                    />
                    {errors.numero_carte_identite && <p className="mt-1 text-sm text-red-600">{errors.numero_carte_identite}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'تاريخ إصدار البطاقة *' : 'Date d\'émission de la carte *'}
                    </label>
                    <input
                      type="date"
                      value={formData.date_emission_carte}
                      onChange={(e) => handleInputChange('date_emission_carte', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.date_emission_carte ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.date_emission_carte && <p className="mt-1 text-sm text-red-600">{errors.date_emission_carte}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'مكان إصدار البطاقة *' : 'Lieu d\'émission de la carte *'}
                    </label>
                    <input
                      type="text"
                      value={formData.lieu_emission_carte}
                      onChange={(e) => handleInputChange('lieu_emission_carte', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.lieu_emission_carte ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل مكان إصدار البطاقة' : 'Entrez le lieu d\'émission de la carte'}
                    />
                    {errors.lieu_emission_carte && <p className="mt-1 text-sm text-red-600">{errors.lieu_emission_carte}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Informations de contact */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'mr-3' : 'ml-3'}`}>
                    {isRTL ? 'معلومات الاتصال' : 'Informations de contact'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'رقم الهاتف *' : 'Numéro de téléphone *'}
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.telephone ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? '0555123456' : '0555123456'}
                    />
                    {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'رقم هاتف الطوارئ' : 'Téléphone d\'urgence'}
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone_urgence}
                      onChange={(e) => handleInputChange('telephone_urgence', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.telephone_urgence ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? '0555123457' : '0555123457'}
                    />
                    {errors.telephone_urgence && <p className="mt-1 text-sm text-red-600">{errors.telephone_urgence}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'البريد الإلكتروني' : 'Adresse email'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'exemple@email.com' : 'exemple@email.com'}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الولاية *' : 'Wilaya *'}
                    </label>
                    <select
                      value={formData.wilaya}
                      onChange={(e) => handleInputChange('wilaya', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.wilaya ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">{isRTL ? 'اختر الولاية' : 'Sélectionnez une wilaya'}</option>
                      {wilayas.map(wilaya => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                    {errors.wilaya && <p className="mt-1 text-sm text-red-600">{errors.wilaya}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'العنوان *' : 'Adresse *'}
                    </label>
                    <textarea
                      value={formData.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.adresse ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل العنوان الكامل' : 'Entrez l\'adresse complète'}
                    />
                    {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'البلدية *' : 'Commune *'}
                    </label>
                    <input
                      type="text"
                      value={formData.commune}
                      onChange={(e) => handleInputChange('commune', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.commune ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'أدخل البلدية' : 'Entrez la commune'}
                    />
                    {errors.commune && <p className="mt-1 text-sm text-red-600">{errors.commune}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4: Informations professionnelles */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Briefcase className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className={`text-lg font-semibold theme-text-primary ${isRTL ? 'mr-3' : 'ml-3'}`}>
                    {isRTL ? 'المعلومات المهنية' : 'Informations professionnelles'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الدور *' : 'Rôle *'}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.role ? 'border-red-500' : ''
                      }`}
                      disabled={rolesLoading}
                    >
                      <option value="">{isRTL ? 'اختر الدور' : 'Sélectionnez un rôle'}</option>
                      {roles && roles.length > 0 ? roles.map(role => (
                        <option key={role.id} value={role.id}>{getRoleDisplayName(role)}</option>
                      )) : (
                        <option value="" disabled>
                          {rolesLoading ? (isRTL ? 'جاري التحميل...' : 'Chargement...') : (isRTL ? 'لا توجد أدوار' : 'Aucun rôle disponible')}
                        </option>
                      )}
                    </select>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'رقم الموظف *' : 'Numéro d\'employé *'}
                    </label>
                    <input
                      type="text"
                      value={formData.numero_employe}
                      onChange={(e) => handleInputChange('numero_employe', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.numero_employe ? 'border-red-500' : ''
                      }`}
                      placeholder={isRTL ? 'EMP001' : 'EMP001'}
                    />
                    {errors.numero_employe && <p className="mt-1 text-sm text-red-600">{errors.numero_employe}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'تاريخ التوظيف *' : 'Date d\'embauche *'}
                    </label>
                    <input
                      type="date"
                      value={formData.date_embauche}
                      onChange={(e) => handleInputChange('date_embauche', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.date_embauche ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.date_embauche && <p className="mt-1 text-sm text-red-600">{errors.date_embauche}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'الحالة *' : 'Statut *'}
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => handleInputChange('statut', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition ${
                        errors.statut ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="ACTIF">{isRTL ? 'نشط' : 'Actif'}</option>
                      <option value="INACTIF">{isRTL ? 'غير نشط' : 'Inactif'}</option>
                      <option value="CONGE">{isRTL ? 'في إجازة' : 'En congé'}</option>
                      <option value="SUSPENDU">{isRTL ? 'معلق' : 'Suspendu'}</option>
                    </select>
                    {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'ملاحظات' : 'Notes'}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                      placeholder={isRTL ? 'أدخل ملاحظات إضافية' : 'Entrez des notes supplémentaires'}
                    />
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {isRTL ? 'المهارات' : 'Compétences'}
                  </label>
                  <div className="space-y-2">
                    {formData.competences.map((competence, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <span className="theme-text-primary">{competence}</span>
                        <button
                          type="button"
                          onClick={() => removeCompetence(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCompetence}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isRTL ? 'إضافة مهارة' : 'Ajouter une compétence'}
                    </button>
                  </div>
                </div>

                {/* Formations */}
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {isRTL ? 'التكوينات' : 'Formations'}
                  </label>
                  <div className="space-y-2">
                    {formData.formations.map((formation, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <span className="theme-text-primary">{formation}</span>
                        <button
                          type="button"
                          onClick={() => removeFormation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFormation}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isRTL ? 'إضافة تكوين' : 'Ajouter une formation'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">
                    {isRTL ? 'الوثائق' : 'Documents'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isRTL ? 'قم برفع الصور المطلوبة (اختياري)' : 'Téléchargez les images requises (optionnel)'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo d'identité */}
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'صورة شخصية' : 'Photo d\'identité'}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-500 theme-transition ${
                      errors.photo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {formData.photo ? (
                          <div className="space-y-2">
                            <img 
                              src={URL.createObjectURL(formData.photo)} 
                              alt="Photo preview" 
                              className="mx-auto h-20 w-20 object-cover rounded-lg"
                            />
                            <p className="text-sm text-green-600">{formData.photo.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm theme-text-primary">
                              {isRTL ? 'انقر لرفع الصورة' : 'Cliquez pour télécharger'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                  </div>

                  {/* Carte d'identité recto */}
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'بطاقة الهوية - الوجه الأمامي' : 'Carte d\'identité - Recto'}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-500 theme-transition ${
                      errors.carte_identite_recto ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('carte_identite_recto', e.target.files?.[0] || null)}
                        className="hidden"
                        id="carte-recto-upload"
                      />
                      <label htmlFor="carte-recto-upload" className="cursor-pointer">
                        {formData.carte_identite_recto ? (
                          <div className="space-y-2">
                            <img 
                              src={URL.createObjectURL(formData.carte_identite_recto)} 
                              alt="Carte recto preview" 
                              className="mx-auto h-20 w-20 object-cover rounded-lg"
                            />
                            <p className="text-sm text-green-600">{formData.carte_identite_recto.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <IdCard className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm theme-text-primary">
                              {isRTL ? 'انقر لرفع الصورة' : 'Cliquez pour télécharger'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.carte_identite_recto && <p className="mt-1 text-sm text-red-600">{errors.carte_identite_recto}</p>}
                  </div>

                  {/* Carte d'identité verso */}
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'بطاقة الهوية - الوجه الخلفي' : 'Carte d\'identité - Verso'}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-500 theme-transition ${
                      errors.carte_identite_verso ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('carte_identite_verso', e.target.files?.[0] || null)}
                        className="hidden"
                        id="carte-verso-upload"
                      />
                      <label htmlFor="carte-verso-upload" className="cursor-pointer">
                        {formData.carte_identite_verso ? (
                          <div className="space-y-2">
                            <img 
                              src={URL.createObjectURL(formData.carte_identite_verso)} 
                              alt="Carte verso preview" 
                              className="mx-auto h-20 w-20 object-cover rounded-lg"
                            />
                            <p className="text-sm text-green-600">{formData.carte_identite_verso.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <IdCard className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm theme-text-primary">
                              {isRTL ? 'انقر لرفع الصورة' : 'Cliquez pour télécharger'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.carte_identite_verso && <p className="mt-1 text-sm text-red-600">{errors.carte_identite_verso}</p>}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-primary mb-2">
                      {isRTL ? 'ملاحظات إضافية' : 'Notes supplémentaires'}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
                      placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Toute note supplémentaire...'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur et de succès */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 dark:text-red-200">{errors.general}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Navigation et boutons */}
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mt-8 pt-6 border-t theme-border-primary`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition"
                  >
                    {isRTL ? 'السابق' : 'Précédent'}
                  </button>
                )}
              </div>

              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                
                {!showSubmitButton ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 theme-transition"
                  >
                    {isRTL ? 'التالي' : 'Suivant'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={() => {
                      console.log('Bouton Créer cliqué!', { showSubmitButton, currentStep }); // Debug
                    }}
                    disabled={createPersonnelMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 theme-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {createPersonnelMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isRTL ? 'إنشاء الموظف' : 'Créer l\'employé'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePersonnelModal;
