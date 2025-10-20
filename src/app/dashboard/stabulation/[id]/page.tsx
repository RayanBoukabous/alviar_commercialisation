'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Warehouse,
  Edit,
  RefreshCw,
  AlertCircle,
  Activity,
  Users,
  FileText,
  X
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { stabulationService, Stabulation } from '@/lib/api/stabulationService';
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
    numero_identification: string;
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
    description: `Stabulation ${apiData.numero_stabulation} pour ${apiData.type_bete.toLowerCase()}s. Capacité maximale: ${apiData.capacite_maximale} têtes.`,
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
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [animalWeights, setAnimalWeights] = useState<{[key: number]: number}>({});
  const [animalPostNumbers, setAnimalPostNumbers] = useState<{[key: number]: string}>({});
  const [isFinishing, setIsFinishing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';
  
  // Récupérer l'ID de la stabulation depuis les paramètres
  const stabulationId = params.id ? parseInt(params.id as string) : 0;

  useEffect(() => {
    const fetchStabulationDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiData = await stabulationService.getStabulation(stabulationId);
        const mappedData = mapApiDataToStabulationDetail(apiData);
        
        setStabulation(mappedData);
        console.log('Détails de la stabulation récupérés:', mappedData);
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

  const handleCancelStabulation = async () => {
    if (!cancelReason.trim()) {
      alert(isRTL ? 'يرجى كتابة سبب الإلغاء' : 'Veuillez saisir la raison de l\'annulation');
      return;
    }

    setIsCancelling(true);
    try {
      // Appel API pour annuler la stabulation
      const result = await stabulationService.annulerStabulation(stabulationId, cancelReason);
      
      // Mettre à jour le statut local
      if (stabulation) {
        setStabulation({
          ...stabulation,
          status: 'ANNULE',
          betes: stabulation.betes.map(bete => ({
            ...bete,
            statut: 'VIVANT'
          }))
        });
      }
      
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
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';
      alert(isRTL ? `خطأ في إنهاء الاسطبل: ${errorMessage}` : `Erreur lors de la finalisation: ${errorMessage}`);
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
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <AlertCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إلغاء' : 'Annuler'}
                    </button>
                  </>
                )}
                <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </button>
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
    {stabulation.status === 'ANNULE' && stabulation.description && (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              {isRTL ? 'سبب الإلغاء:' : 'Raison de l\'annulation:'}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              {stabulation.description}
            </p>
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
                                    {bete.numero_identification} - {bete.espece || 'Non spécifié'}
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
                <p className="theme-text-secondary theme-transition mb-3">
                  {isRTL 
                    ? 'يرجى كتابة سبب إلغاء هذه الاسطبل. سيتم إرجاع جميع الحيوانات إلى حالة "حي" بعد الإلغاء.'
                    : 'Veuillez saisir la raison de l\'annulation de cette stabulation. Tous les animaux seront remis en statut "vivant" après l\'annulation.'
                  }
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={isRTL ? 'اكتب سبب الإلغاء هنا...' : 'Saisissez la raison de l\'annulation ici...'}
                  className="w-full p-3 border theme-border-primary rounded-lg theme-bg-secondary theme-text-primary theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 resize-none"
                  rows={4}
                />
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
                  disabled={isCancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRTL ? 'جاري الإلغاء...' : 'Annulation...'}
                    </div>
                  ) : (
                    isRTL ? 'تأكيد الإلغاء' : 'Confirmer l\'annulation'
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
                                  {bete.numero_identification.slice(-2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium theme-text-primary">
                                  {bete.nom || `Animal #${bete.numero_identification}`}
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
