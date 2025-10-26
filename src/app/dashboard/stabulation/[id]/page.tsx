'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Warehouse,
  RefreshCw,
  AlertCircle,
  Activity,
  Users,
  FileText,
  X,
  History,
  Hash,
  User,
  Clock
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { stabulationService, Stabulation } from '@/lib/api/stabulationService';
import { useHistoriqueStabulation } from '@/lib/hooks/useStabulations';
import Tabs from '@/components/ui/Tabs';

// Interface pour les stabulations avec données détaillées
interface StabulationDetail {
  id: number;
  name: string;
  abattoir: {
    name: string;
    wilaya: string;
    commune: string;
    address: string;
  };
  capacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  status: 'EN_COURS' | 'TERMINE' | 'ANNULE';
  type: 'BOVIN' | 'OVIN' | 'CAPRIN' | 'AUTRE';
  manager: string;
  phone: string;
  email: string;
  createdAt: string;
  lastActivity: string;
  description: string;
  
  // Suivi des actions
  annule_par_nom?: string;
  date_annulation?: string;
  raison_annulation?: string;
  finalise_par_nom?: string;
  date_finalisation?: string;
  facilities: string[];
  certifications: string[];
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  statistics: {
    totalProcessed: number;
    monthlyAverage: number;
    efficiency: number;
    qualityScore: number;
  };
  recentActivity: {
    date: string;
    action: string;
    details: string;
    user: string;
  }[];
  staff: {
    name: string;
    role: string;
    phone: string;
    email: string;
  }[];
  betes: {
    id: number;
    num_boucle: string;
    nom?: string;
    espece?: string;
    race?: string;
    poids?: number;
    statut: string;
    etat_sante: string;
  }[];
}

// Fonction pour mapper les données API vers le format de l'interface
const mapApiDataToStabulationDetail = (apiData: Stabulation): StabulationDetail => {
  return {
    id: apiData.id,
    name: apiData.numero_stabulation,
    abattoir: {
      name: apiData.abattoir_nom,
      wilaya: apiData.abattoir_wilaya,
      commune: apiData.abattoir_commune,
      address: `${apiData.abattoir_commune}, ${apiData.abattoir_wilaya}`
    },
    capacity: apiData.capacite_maximale,
    currentOccupancy: apiData.nombre_betes_actuelles,
    availableSpaces: apiData.places_disponibles,
    status: apiData.statut,
    type: apiData.type_bete,
    manager: apiData.created_by_nom || 'Non assigné',
    phone: 'Non disponible',
    email: 'Non disponible',
    createdAt: apiData.created_at,
    lastActivity: apiData.updated_at,
    description: apiData.raison_annulation || `Stabulation ${apiData.numero_stabulation} pour ${apiData.type_bete.toLowerCase()}s. Capacité maximale: ${apiData.capacite_maximale} têtes.`,
    
    // Suivi des actions
    annule_par_nom: apiData.annule_par_nom,
    date_annulation: apiData.date_annulation,
    raison_annulation: apiData.raison_annulation,
    finalise_par_nom: apiData.finalise_par_nom,
    date_finalisation: apiData.date_finalisation,
    facilities: [
      `Type: ${apiData.type_bete}`,
      `Capacité: ${apiData.capacite_maximale} têtes`,
      `Taux d'occupation: ${apiData.taux_occupation}%`,
      'Abreuvoirs automatiques',
      'Mangeoires',
      'Système de ventilation',
      'Zone de quarantaine'
    ],
    certifications: [
      'Normes sanitaires',
      'Contrôle vétérinaire',
      'Certification qualité',
      'Sécurité alimentaire'
    ],
    workingHours: {
      start: "08:00",
      end: "16:00",
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"]
    },
    statistics: {
      totalProcessed: apiData.nombre_betes_actuelles,
      monthlyAverage: Math.floor(apiData.nombre_betes_actuelles / 12),
      efficiency: apiData.taux_occupation,
      qualityScore: 95
    },
    recentActivity: [
      {
        date: apiData.updated_at,
        action: "Mise à jour",
        details: `Stabulation mise à jour - ${apiData.nombre_betes_actuelles} bêtes actuellement`,
        user: apiData.created_by_nom || 'Système'
      }
    ],
    staff: apiData.created_by_nom ? [
      {
        name: apiData.created_by_nom,
        role: 'Responsable',
        phone: 'Non disponible',
        email: 'Non disponible'
      }
    ] : [],
    betes: apiData.betes_info
  };
};

export default function StabulationDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [stabulation, setStabulation] = useState<StabulationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonError, setCancelReasonError] = useState('');
  
  // États pour l'historique
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [animalWeights, setAnimalWeights] = useState<{[key: number]: number}>({});
  const [animalPostNumbers, setAnimalPostNumbers] = useState<{[key: number]: string}>({});
  const [isFinishing, setIsFinishing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';
  
  // Récupérer l'ID de la stabulation depuis les paramètres
  const stabulationId = params.id ? parseInt(params.id as string) : 0;

  // Hooks pour l'historique
  const { data: historique, isLoading: historiqueLoading } = useHistoriqueStabulation(stabulationId);

  useEffect(() => {
    const fetchStabulationDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiData = await stabulationService.getStabulation(stabulationId);
        const mappedData = mapApiDataToStabulationDetail(apiData);
        
        setStabulation(mappedData);
        console.log('Détails de la stabulation récupérés:', mappedData);
        console.log('Données API brutes:', apiData);
        console.log('Champs d\'annulation:', {
          annule_par_nom: apiData.annule_par_nom,
          date_annulation: apiData.date_annulation,
          raison_annulation: apiData.raison_annulation
        });
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des détails de la stabulation');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && stabulationId) {
      fetchStabulationDetail();
    }
  }, [isAuthenticated, stabulationId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      EN_COURS: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'في التقدم' : 'En cours'
      },
      TERMINE: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'مكتمل' : 'Terminé'
      },
      ANNULE: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'ملغي' : 'Annulé'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_COURS;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Fonction de validation du motif d'annulation
  const validateCancelReason = (reason: string) => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return isRTL ? 'يرجى كتابة سبب الإلغاء' : 'Veuillez saisir la raison de l\'annulation';
    }
    if (trimmedReason.length < 10) {
      return isRTL ? 'يجب أن يكون السبب 10 أحرف على الأقل' : 'La raison doit contenir au moins 10 caractères';
    }
    if (trimmedReason.length > 500) {
      return isRTL ? 'يجب أن يكون السبب أقل من 500 حرف' : 'La raison doit contenir moins de 500 caractères';
    }
    return '';
  };

  const handleCancelStabulation = async () => {
    // Valider le motif
    const validationError = validateCancelReason(cancelReason);
    if (validationError) {
      setCancelReasonError(validationError);
      return;
    }
    
    setCancelReasonError('');

    setIsCancelling(true);
    try {
      // Appel API pour annuler la stabulation
      const result = await stabulationService.annulerStabulation(stabulationId, cancelReason);
      
      // Rafraîchir les données depuis le serveur
      const updatedData = await stabulationService.getStabulation(stabulationId);
      const mappedData = mapApiDataToStabulationDetail(updatedData);
      setStabulation(mappedData);
      
      console.log('Données après annulation:', mappedData);
      console.log('Résultat API:', result);
      
      setShowCancelModal(false);
      setCancelReason('');
      
      // Message de succès avec détails
      const message = isRTL 
        ? `تم إلغاء الاسطبل بنجاح. تم إرجاع ${result.betes_affectees} حيوان إلى حالة "حي"`
        : `Stabulation annulée avec succès. ${result.betes_affectees} animaux remis en statut "vivant"`;
      
      alert(message);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(isRTL ? `خطأ في إلغاء الاسطبل: ${errorMessage}` : `Erreur lors de l'annulation: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Fonction pour vérifier l'unicité des numéros de poste
  const checkPostNumberUniqueness = async () => {
    if (!stabulation || !stabulation.betes) return true;
    
    try {
      // Vérifier chaque numéro de poste avec l'API
      for (const bete of stabulation.betes) {
        const postNumber = animalPostNumbers[bete.id];
        if (postNumber && postNumber.trim()) {
          // Faire une requête pour vérifier l'unicité
          const response = await fetch(`/api/betes/check-post-number/?num_boucle_post_abattage=${encodeURIComponent(postNumber)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('django_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.exists) {
              alert(isRTL ? `رقم البوست "${postNumber}" موجود بالفعل` : `Le numéro de poste "${postNumber}" existe déjà`);
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification des numéros de poste:', error);
      return false; // Arrêter en cas d'erreur de vérification
    }
  };

  const handleFinishStabulation = async () => {
    if (!stabulation || !stabulation.betes) return;

    // Vérifier que tous les poids sont saisis
    const missingWeights = stabulation.betes.filter(bete => !animalWeights[bete.id] || animalWeights[bete.id] <= 0);
    if (missingWeights.length > 0) {
      alert(isRTL ? 'يرجى إدخال وزن جميع الحيوانات' : 'Veuillez saisir le poids de tous les animaux');
      return;
    }

    // Vérifier que tous les numéros poste abattage sont saisis
    const missingPostNumbers = stabulation.betes.filter(bete => !animalPostNumbers[bete.id] || animalPostNumbers[bete.id].trim() === '');
    if (missingPostNumbers.length > 0) {
      alert(isRTL ? 'يرجى إدخال رقم البوست لجميع الحيوانات' : 'Veuillez saisir le numéro poste abattage de tous les animaux');
      return;
    }

    // Vérifier que les poids à chaud ne dépassent pas les poids vifs
    const invalidWeights = stabulation.betes.filter(bete => {
      const poidsChaud = animalWeights[bete.id];
      const poidsVif = bete.poids || 0;
      return poidsChaud > poidsVif;
    });
    
    if (invalidWeights.length > 0) {
      alert(isRTL 
        ? 'لا يمكن أن يكون الوزن الساخن أعلى من الوزن الحي' 
        : 'Le poids à chaud ne peut pas être supérieur au poids vif'
      );
      return;
    }

    // Vérifier l'unicité des numéros de poste AVANT d'appeler l'API
    const isUnique = await checkPostNumberUniqueness();
    if (!isUnique) {
      return; // Arrêter ici si les numéros ne sont pas uniques
    }

    setIsFinishing(true);
    try {
      // Préparer les données des poids et numéros poste abattage
      const poidsData = stabulation.betes.map(bete => ({
        bete_id: bete.id,
        poids_a_chaud: animalWeights[bete.id],
        num_boucle_post_abattage: animalPostNumbers[bete.id]
      }));

      // Appel API pour terminer la stabulation
      const result = await stabulationService.terminerStabulation(stabulationId, poidsData);
      
      // Mettre à jour le statut local
      if (stabulation) {
        setStabulation({
          ...stabulation,
          status: 'TERMINE',
          betes: stabulation.betes.map(bete => ({
            ...bete,
            statut: 'ABATTU'
          }))
        });
      }
      
      setShowFinishModal(false);
      setAnimalWeights({});
      setAnimalPostNumbers({});
      
      // Message de succès
      const message = isRTL 
        ? `تم إنهاء الاسطبل بنجاح. تم ذبح ${stabulation.betes.length} حيوان`
        : `Stabulation terminée avec succès. ${stabulation.betes.length} animaux abattus`;
      
      alert(message);
    } catch (error: any) {
      console.error('Erreur lors de la finalisation:', error);
      
      // Gestion spécifique des erreurs de validation du backend
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorDetails = error.response.data.details;
        const errorMessage = errorDetails.join('\n');
        alert(isRTL ? `خطأ في التحقق من صحة البيانات:\n${errorMessage}` : `Erreurs de validation:\n${errorMessage}`);
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
        alert(isRTL ? `خطأ في إنهاء الاسطبل: ${errorMessage}` : `Erreur lors de la finalisation: ${errorMessage}`);
      }
      
      // Le modal reste ouvert, la stabulation reste "EN_COURS"
      return;
    } finally {
      setIsFinishing(false);
    }
  };


  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !stabulation) {
    return (
      <Layout>
        <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="px-6 py-4">
            <button
              onClick={() => router.back()}
              className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-primary-600 hover:text-primary-700 theme-transition mb-4`}
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'العودة' : 'Retour'}
            </button>
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
                {isRTL ? 'خطأ' : 'Erreur'}
              </h3>
              <p className="theme-text-secondary theme-transition">
                {error || (isRTL ? 'الاسطبل غير موجود' : 'Stabulation non trouvée')}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => router.back()}
                  className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-primary-600 hover:text-primary-700 theme-transition ${isRTL ? 'ml-4' : 'mr-4'}`}
                >
                  <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'العودة' : 'Retour'}
                </button>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className={`text-2xl font-bold flex items-center theme-text-primary theme-transition ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Warehouse className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {stabulation.name}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {stabulation.abattoir.wilaya} - {stabulation.abattoir.commune}
                  </p>
                </div>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                {stabulation.status === 'EN_COURS' && (
                  <>
                    <button 
                      onClick={() => setShowFinishModal(true)}
                      className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إنهاء' : 'Terminer'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowCancelModal(true);
                        setCancelReason('');
                        setCancelReasonError('');
                      }}
                      className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <AlertCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إلغاء' : 'Annuler'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <Tabs
            tabs={[
              {
                id: 'info',
                label: isRTL ? 'معلومات عامة' : 'Informations générales',
                icon: <Warehouse className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4 flex items-center">
                          <Warehouse className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'معلومات الاسطبل' : 'Informations de la Stabulation'}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'معرف الاسطبل:' : 'ID Stabulation:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'النوع:' : 'Type:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                            {getStatusBadge(stabulation.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'أنشئ بواسطة:' : 'Créé par:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.manager}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'تاريخ الإنشاء:' : 'Date de création:'}</span>
                            <span className="font-medium theme-text-primary">{new Date(stabulation.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'آخر تحديث:' : 'Dernière mise à jour:'}</span>
                            <span className="font-medium theme-text-primary">{new Date(stabulation.lastActivity).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          
                          {/* Informations de suivi des actions */}
                          {stabulation.status === 'ANNULE' && stabulation.raison_annulation && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                                    {isRTL ? 'معلومات الإلغاء' : 'Informations d\'annulation'}
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                        {isRTL ? 'السبب:' : 'Raison:'}
                                      </span>
                                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                        {stabulation.raison_annulation}
                                      </p>
                                    </div>
                                    {stabulation.annule_par_nom && (
                                      <div>
                                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                          {isRTL ? 'ألغاه:' : 'Annulé par:'}
                                        </span>
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                          {stabulation.annule_par_nom}
                                        </p>
                                      </div>
                                    )}
                                    {stabulation.date_annulation && (
                                      <div>
                                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                          {isRTL ? 'تاريخ الإلغاء:' : 'Date d\'annulation:'}
                                        </span>
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                          {new Date(stabulation.date_annulation).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {stabulation.status === 'TERMINE' && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-start">
                                <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                    {isRTL ? 'معلومات الإنهاء' : 'Informations de finalisation'}
                                  </h4>
                                  <div className="space-y-2">
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                      {isRTL ? 'تم إنهاء هذه الاسطبل وذبح جميع الحيوانات' : 'Cette stabulation a été finalisée et tous les animaux ont été abattus'}
                                    </p>
                                    {stabulation.finalise_par_nom && (
                                      <div>
                                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                          {isRTL ? 'أنهاه:' : 'Finalisé par:'}
                                        </span>
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                          {stabulation.finalise_par_nom}
                                        </p>
                                      </div>
                                    )}
                                    {stabulation.date_finalisation && (
                                      <div>
                                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                          {isRTL ? 'تاريخ الإنهاء:' : 'Date de finalisation:'}
                                        </span>
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                          {new Date(stabulation.date_finalisation).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4 flex items-center">
                          <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'السعة والحيوانات' : 'Capacité et Animaux'}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'السعة الإجمالية:' : 'Capacité totale:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.capacity} {isRTL ? 'مكان' : 'places'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'الحيوانات الحالية:' : 'Animaux actuels:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.currentOccupancy} {isRTL ? 'رأس' : 'têtes'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'الأماكن المتاحة:' : 'Places disponibles:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.availableSpaces} {isRTL ? 'مكان' : 'places'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="theme-text-secondary">{isRTL ? 'معدل الإشغال:' : 'Taux d\'occupation:'}</span>
                            <span className="font-medium theme-text-primary">{stabulation.statistics.efficiency}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Abattoir et Manager */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4 flex items-center">
                          <Warehouse className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'المجزر' : 'Abattoir'}
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.abattoir.name}</p>
                          </div>
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'العنوان:' : 'Adresse:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.abattoir.address}</p>
                          </div>
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'الولاية:' : 'Wilaya:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.abattoir.wilaya}</p>
                          </div>
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'البلدية:' : 'Commune:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.abattoir.commune}</p>
                          </div>
                        </div>
                      </div>

                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4 flex items-center">
                          <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'المدير' : 'Responsable'}
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.manager}</p>
                          </div>
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.phone}</p>
                          </div>
                          <div>
                            <span className="theme-text-secondary">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                            <p className="font-medium theme-text-primary">{stabulation.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Équipements */}
                    <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                      <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                        <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'المرافق والتجهيزات' : 'Équipements et Installations'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stabulation.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center p-3 theme-bg-secondary rounded-lg">
                            <Activity className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm theme-text-primary">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'livestock',
                label: isRTL ? 'الحيوانات في الاسطبل' : 'Bétail en stabulation',
                icon: <Activity className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Résumé des animaux */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary-600 mb-2">{stabulation.currentOccupancy}</div>
                          <div className="text-sm theme-text-secondary">{isRTL ? 'إجمالي الحيوانات' : 'Total animaux'}</div>
                        </div>
                      </div>
                      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stabulation.betes?.filter(bete => bete.etat_sante === 'BON').length || 0}
          </div>
          <div className="text-sm theme-text-secondary">{isRTL ? 'حيوانات سليمة' : 'Animaux sains'}</div>
        </div>
      </div>
      <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stabulation.betes?.filter(bete => bete.etat_sante === 'MALADE').length || 0}
          </div>
                          <div className="text-sm theme-text-secondary">{isRTL ? 'حيوانات مريضة' : 'Animaux malades'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                      <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
                        <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'قائمة الحيوانات' : 'Liste des animaux'}
                      </h3>
                      <div className="space-y-4">
                        {stabulation.betes?.map((bete) => (
                          <div key={bete.id} className="border theme-border-primary rounded-lg p-4 theme-bg-secondary hover:theme-bg-elevated theme-transition">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <Activity className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                <div>
                                  <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                                    {bete.num_boucle} - {bete.espece || 'Non spécifié'}
                                  </h3>
                                  <p className="text-sm theme-text-secondary theme-transition">{bete.race || 'Race non spécifiée'}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bete.etat_sante === 'BON'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {bete.etat_sante === 'BON' ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                        </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الوزن' : 'Poids'}</label>
                                <p className="text-sm theme-text-primary theme-transition">{bete.poids || 'Non spécifié'} kg</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الحالة' : 'Statut'}</label>
                                <p className="text-sm theme-text-primary theme-transition">{bete.statut}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الاسم' : 'Nom'}</label>
                                <p className="text-sm theme-text-primary theme-transition">{bete.nom || 'Non spécifié'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'historique',
                label: isRTL ? 'التاريخ' : 'Historique',
                icon: <History className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Historique des modifications */}
                    <div className="theme-bg-elevated theme-transition p-6 rounded-lg border theme-border-primary theme-transition">
                      <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4 flex items-center">
                        <History className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تاريخ التعديلات' : 'Historique des Modifications'}
                      </h3>
                      
                      {historiqueLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                          <span className="ml-2 theme-text-secondary">{isRTL ? 'جاري التحميل...' : 'Chargement...'}</span>
                        </div>
                      ) : (historique && historique.historique.length > 0) || (stabulation && stabulation.status === 'ANNULE') ? (
                        <div className="space-y-4">
                          {/* Informations d'annulation */}
                          {stabulation && stabulation.status === 'ANNULE' && (
                            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-r-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="font-medium theme-text-primary text-red-800 dark:text-red-200">
                                      {isRTL ? 'تم الإلغاء' : 'Stabulation annulée'}
                                    </span>
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm theme-text-secondary">
                                      {stabulation.annule_par_nom && stabulation.date_annulation ? 
                                        new Date(stabulation.date_annulation).toLocaleString('fr-FR', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : 'Date inconnue'
                                      }
                                    </span>
                                  </div>
                                  <div className="theme-bg-secondary theme-transition p-3 rounded-lg">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-sm font-medium theme-text-secondary">
                                          {isRTL ? 'ألغاه:' : 'Annulé par:'}
                                        </span>
                                        <p className="text-sm theme-text-primary font-medium">
                                          {stabulation.annule_par_nom || (isRTL ? 'غير محدد' : 'Non spécifié')}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium theme-text-secondary">
                                          {isRTL ? 'سبب الإلغاء:' : 'Motif d\'annulation:'}
                                        </span>
                                        <p className="text-sm theme-text-primary bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-500">
                                          {stabulation.raison_annulation || (isRTL ? 'لم يتم تحديد سبب' : 'Aucun motif spécifié')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Historique des modifications */}
                          {historique && historique.historique.map((entry, index) => (
                            <div key={entry.id} className="border-l-4 border-primary-500 pl-4 py-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4 text-primary-500" />
                                    <span className="font-medium theme-text-primary">{entry.utilisateur_nom}</span>
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm theme-text-secondary">
                                      {new Date(entry.date_modification).toLocaleString('fr-FR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="theme-bg-secondary theme-transition p-3 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Hash className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium theme-text-primary">
                                        {isRTL ? 'الحقل المعدل:' : 'Champ modifié:'} {entry.champ_modifie}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-sm font-medium theme-text-secondary">
                                          {isRTL ? 'القيمة السابقة:' : 'Valeur précédente:'}
                                        </span>
                                        <p className="text-sm theme-text-primary bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-500">
                                          {entry.ancienne_valeur || (isRTL ? 'فارغ' : 'Vide')}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium theme-text-secondary">
                                          {isRTL ? 'القيمة الجديدة:' : 'Nouvelle valeur:'}
                                        </span>
                                        <p className="text-sm theme-text-primary bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                                          {entry.nouvelle_valeur || (isRTL ? 'فارغ' : 'Vide')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="theme-text-secondary">
                            {isRTL ? 'لا توجد تعديلات أو إلغاءات مسجلة' : 'Aucune modification ou annulation enregistrée'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            ]}
            defaultTab="info"
            isRTL={isRTL}
          />
        </div>

        {/* Modal de confirmation d'annulation */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-md mx-4">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-4">
                {/* Message d'avertissement */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {isRTL ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه' : 'Attention: Cette action est irréversible'}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {isRTL 
                          ? 'سيتم إرجاع جميع الحيوانات إلى حالة "حي" وإلغاء الاسطبل نهائياً.'
                          : 'Tous les animaux seront remis en statut "vivant" et la stabulation sera définitivement annulée.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="theme-text-secondary theme-transition mb-3">
                  {isRTL 
                    ? 'يرجى كتابة سبب إلغاء هذه الاسطبل (10 أحرف على الأقل):'
                    : 'Veuillez saisir la raison de l\'annulation de cette stabulation (minimum 10 caractères):'
                  }
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    // Valider en temps réel
                    const error = validateCancelReason(e.target.value);
                    setCancelReasonError(error);
                  }}
                  placeholder={isRTL ? 'اكتب سبب الإلغاء هنا (10 أحرف على الأقل)...' : 'Saisissez la raison de l\'annulation ici (minimum 10 caractères)...'}
                  className={`w-full p-3 border rounded-lg theme-bg-secondary theme-text-primary theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${
                    cancelReasonError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : cancelReason.trim() && !cancelReasonError 
                        ? 'border-green-500 focus:ring-green-500' 
                        : 'theme-border-primary focus:ring-red-500'
                  }`}
                  rows={4}
                />
                
                {/* Affichage des erreurs et du compteur */}
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex-1">
                    {cancelReasonError && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {cancelReasonError}
                      </p>
                    )}
                    {!cancelReasonError && cancelReason.trim() && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {isRTL ? 'السبب صحيح' : 'Raison valide'}
                      </p>
                    )}
                  </div>
                  <div className="text-xs theme-text-secondary">
                    {cancelReason.length}/500
                  </div>
                </div>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleCancelStabulation}
                  disabled={isCancelling || !cancelReason.trim() || !!cancelReasonError}
                  className={`flex-1 px-4 py-2 rounded-lg text-white theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !cancelReason.trim() || cancelReasonError
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {isCancelling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإلغاء...' : 'Annulation...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {!cancelReason.trim() || cancelReasonError ? (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Activity className="h-4 w-4 mr-2" />
                      )}
                      {isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de finalisation de stabulation */}
        {showFinishModal && stabulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg-elevated theme-transition rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                  {isRTL ? 'إنهاء الاسطبل' : 'Finaliser la stabulation'}
                </h3>
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="p-1 hover:theme-bg-secondary rounded-full theme-transition"
                >
                  <X className="h-5 w-5 theme-text-secondary" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="theme-text-secondary theme-transition mb-4">
                  {isRTL 
                    ? 'يرجى إدخال وزن كل حيوان بعد الذبح. سيتم وضع جميع الحيوانات في حالة "مذبوح" بعد التأكيد.'
                    : 'Veuillez saisir le poids de chaque animal après l\'abattage. Tous les animaux seront mis en statut "abattu" après confirmation.'
                  }
                </p>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    Debug: {stabulation.betes.length} animaux trouvés
                  </div>
                  {stabulation.betes.map((bete) => {
                    const currentWeight = animalWeights[bete.id] || 0;
                    const poidsVif = bete.poids || 0;
                    const isWeightValid = currentWeight > 0 && currentWeight <= poidsVif;
                    const isWeightTooHigh = currentWeight > poidsVif;
                    
                    return (
                      <div key={bete.id} className={`p-4 border rounded-lg theme-bg-secondary transition-all duration-200 ${
                        isWeightTooHigh 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                          : isWeightValid 
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                            : 'theme-border-primary'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                  {bete.num_boucle.slice(-2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium theme-text-primary">
                                  {bete.nom || `Animal #${bete.num_boucle}`}
                                </div>
                                <div className="text-sm theme-text-secondary">
                                  {bete.espece} • {bete.race}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="theme-text-secondary">{isRTL ? 'الوزن الحي:' : 'Poids vif:'}</span>
                                <span className="font-medium theme-text-primary">{poidsVif}kg</span>
                              </div>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                bete.etat_sante === 'BON'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {bete.etat_sante === 'BON' ? (isRTL ? 'سليم' : 'Sain') : (isRTL ? 'مريض' : 'Malade')}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            {/* Champ poids à chaud */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs theme-text-secondary font-medium">
                                {isRTL ? 'الوزن الساخن (كغ)' : 'Poids à chaud (kg)'}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={poidsVif}
                                  step="0.1"
                                  placeholder={isRTL ? 'الوزن' : 'Poids'}
                                  value={animalWeights[bete.id] || ''}
                                  onChange={(e) => setAnimalWeights(prev => ({
                                    ...prev,
                                    [bete.id]: parseFloat(e.target.value) || 0
                                  }))}
                                  className={`w-28 px-3 py-2 border rounded-lg theme-bg-primary theme-text-primary focus:outline-none focus:ring-2 transition-all duration-200 ${
                                    isWeightTooHigh
                                      ? 'border-red-500 focus:ring-red-500'
                                      : isWeightValid
                                        ? 'border-green-500 focus:ring-green-500'
                                        : 'theme-border-primary focus:ring-blue-500'
                                  }`}
                                />
                                <span className="text-sm theme-text-secondary font-medium">kg</span>
                              </div>
                            </div>

                            {/* Champ numéro poste abattage */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs theme-text-secondary font-medium">
                                {isRTL ? 'رقم البوست' : 'N° Poste abattage'}
                              </label>
                              <input
                                type="text"
                                placeholder={isRTL ? 'رقم البوست' : 'N° Poste'}
                                value={animalPostNumbers[bete.id] || ''}
                                onChange={(e) => setAnimalPostNumbers(prev => ({
                                  ...prev,
                                  [bete.id]: e.target.value
                                }))}
                                className="w-32 px-3 py-2 border rounded-lg theme-bg-primary theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 theme-border-primary transition-all duration-200"
                              />
                            </div>

                            {/* Messages de validation */}
                            {isWeightTooHigh && (
                              <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {isRTL ? 'أعلى من الوزن الحي' : 'Supérieur au poids vif'}
                              </div>
                            )}
                            {isWeightValid && (
                              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {isRTL ? 'صحيح' : 'Valide'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg theme-bg-secondary hover:theme-bg-elevated theme-text-primary theme-transition border theme-border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={handleFinishStabulation}
                  disabled={isFinishing}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFinishing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإنهاء...' : 'Finalisation...'}
                    </div>
                  ) : (
                    isRTL ? 'تأكيد الإنهاء' : 'Confirmer la finalisation'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
