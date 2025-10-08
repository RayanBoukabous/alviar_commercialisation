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
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Heart,
  Weight,
  Truck
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';

// Interface pour les stabulations avec données détaillées
interface StabulationDetail {
  id: string;
  name: string;
  abattoir: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  capacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  status: 'ACTIVE' | 'FULL' | 'MAINTENANCE' | 'INACTIVE';
  manager: {
    name: string;
    phone: string;
    email: string;
  };
  location: string;
  facilities: string[];
  lastFeeding: string;
  nextSlaughter: string;
  createdAt: string;
  lastActivity: string;
  animals: {
    id: string;
    type: string;
    breed: string;
    age: string;
    weight: number;
    arrivalDate: string;
    status: 'HEALTHY' | 'SICK' | 'UNDER_OBSERVATION';
    feedingSchedule: string;
    notes: string;
  }[];
  feedingSchedule: {
    time: string;
    type: string;
    quantity: string;
    foodType: string;
    notes: string;
  }[];
  maintenanceHistory: {
    date: string;
    type: string;
    description: string;
    technician: string;
    notes: string;
  }[];
  statistics: {
    totalAnimals: number;
    averageWeight: number;
    totalWeight: number;
    occupancyRate: number;
    feedingCost: number;
  };
  recentActivity: {
    date: string;
    action: string;
    details: string;
    user: string;
  }[];
}

// Données mock détaillées pour les stabulations
const mockStabulationDetails: { [key: string]: StabulationDetail } = {
  'STAB001': {
    id: 'STAB001',
    name: 'Stabulation A - Bovins',
    abattoir: {
      name: 'Abattoir Central Alger',
      address: 'Zone Industrielle, Alger Centre',
      contact: 'Directeur: Ahmed Benali',
      phone: '+213 21 45 67 89'
    },
    capacity: 100,
    currentOccupancy: 30,
    availableSpaces: 70,
    status: 'ACTIVE',
    manager: {
      name: 'Ahmed Benali',
      phone: '+213 21 45 67 89',
      email: 'ahmed.benali@abattoir-alger.dz'
    },
    location: 'Zone de stabulation A, Alger Centre',
    facilities: [
      'Abreuvoirs automatiques',
      'Mangeoires individuelles',
      'Système de ventilation',
      'Éclairage LED',
      'Zone de quarantaine',
      'Système de surveillance'
    ],
    lastFeeding: '2024-01-15T06:00:00Z',
    nextSlaughter: '2024-01-16T08:00:00Z',
    createdAt: '2023-01-15T08:30:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
    animals: [
      {
        id: 'BOV001',
        type: 'Bovins',
        breed: 'Holstein',
        age: '18-24 mois',
        weight: 450,
        arrivalDate: '2024-01-14T10:00:00Z',
        status: 'HEALTHY',
        feedingSchedule: '3 repas/jour',
        notes: 'Animal en bon état de santé'
      },
      {
        id: 'BOV002',
        type: 'Bovins',
        breed: 'Holstein',
        age: '20-26 mois',
        weight: 480,
        arrivalDate: '2024-01-13T14:00:00Z',
        status: 'HEALTHY',
        feedingSchedule: '3 repas/jour',
        notes: 'Animal en excellent état'
      }
    ],
    feedingSchedule: [
      {
        time: '06:00',
        type: 'Foin',
        quantity: '15 kg/animal',
        foodType: 'Foin de qualité supérieure',
        notes: 'Distribution matinale'
      },
      {
        time: '12:00',
        type: 'Concentré',
        quantity: '8 kg/animal',
        foodType: 'Mélange céréalier enrichi',
        notes: 'Repas de midi'
      },
      {
        time: '18:00',
        type: 'Foin',
        quantity: '12 kg/animal',
        foodType: 'Foin de qualité supérieure',
        notes: 'Repas du soir'
      }
    ],
    maintenanceHistory: [
      {
        date: '2024-01-10T09:00:00Z',
        type: 'Nettoyage',
        description: 'Nettoyage complet des abreuvoirs',
        technician: 'Équipe maintenance',
        notes: 'Maintenance préventive effectuée avec succès'
      },
      {
        date: '2024-01-12T14:00:00Z',
        type: 'Réparation',
        description: 'Réparation du système de ventilation',
        technician: 'Mohamed Khelil',
        notes: 'Système de ventilation réparé et testé'
      }
    ],
    statistics: {
      totalAnimals: 30,
      averageWeight: 450,
      totalWeight: 13500,
      occupancyRate: 30,
      feedingCost: 450
    },
    recentActivity: [
      {
        date: '2024-01-15T14:30:00Z',
        action: 'Nourrissage terminé',
        details: 'Distribution du repas de midi à tous les animaux',
        user: 'Équipe de stabulation'
      },
      {
        date: '2024-01-15T10:00:00Z',
        action: 'Contrôle sanitaire',
        details: 'Examen vétérinaire de routine effectué',
        user: 'Vétérinaire'
      },
      {
        date: '2024-01-15T06:00:00Z',
        action: 'Nourrissage matinal',
        details: 'Distribution du foin du matin',
        user: 'Équipe de stabulation'
      }
    ]
  },
  'STAB002': {
    id: 'STAB002',
    name: 'Stabulation B - Ovins',
    abattoir: {
      name: 'Abattoir Central Alger',
      address: 'Zone Industrielle, Alger Centre',
      contact: 'Directeur: Ahmed Benali',
      phone: '+213 21 45 67 89'
    },
    capacity: 200,
    currentOccupancy: 180,
    availableSpaces: 20,
    status: 'FULL',
    manager: {
      name: 'Fatima Zohra',
      phone: '+213 21 45 67 90',
      email: 'fatima.zohra@abattoir-alger.dz'
    },
    location: 'Zone de stabulation B, Alger Centre',
    facilities: [
      'Abreuvoirs automatiques',
      'Mangeoires collectives',
      'Système de ventilation',
      'Éclairage LED',
      'Zone de quarantaine',
      'Système de surveillance'
    ],
    lastFeeding: '2024-01-15T06:30:00Z',
    nextSlaughter: '2024-01-15T16:00:00Z',
    createdAt: '2023-02-20T10:15:00Z',
    lastActivity: '2024-01-15T15:45:00Z',
    animals: [
      {
        id: 'OVI001',
        type: 'Ovins',
        breed: 'Ouled Djellal',
        age: '12-18 mois',
        weight: 35,
        arrivalDate: '2024-01-13T14:00:00Z',
        status: 'HEALTHY',
        feedingSchedule: '3 repas/jour',
        notes: 'Groupe en bon état de santé'
      },
      {
        id: 'OVI002',
        type: 'Ovins',
        breed: 'Ouled Djellal',
        age: '18-24 mois',
        weight: 40,
        arrivalDate: '2024-01-14T09:00:00Z',
        status: 'HEALTHY',
        feedingSchedule: '3 repas/jour',
        notes: 'Groupe en excellent état'
      }
    ],
    feedingSchedule: [
      {
        time: '06:30',
        type: 'Foin',
        quantity: '3 kg/animal',
        foodType: 'Foin de luzerne',
        notes: 'Distribution matinale'
      },
      {
        time: '13:00',
        type: 'Concentré',
        quantity: '2 kg/animal',
        foodType: 'Mélange céréalier',
        notes: 'Repas de midi'
      },
      {
        time: '18:30',
        type: 'Foin',
        quantity: '2.5 kg/animal',
        foodType: 'Foin de luzerne',
        notes: 'Repas du soir'
      }
    ],
    maintenanceHistory: [
      {
        date: '2024-01-08T10:00:00Z',
        type: 'Nettoyage',
        description: 'Nettoyage des mangeoires',
        technician: 'Équipe maintenance',
        notes: 'Nettoyage complet effectué'
      }
    ],
    statistics: {
      totalAnimals: 180,
      averageWeight: 37,
      totalWeight: 6600,
      occupancyRate: 90,
      feedingCost: 180
    },
    recentActivity: [
      {
        date: '2024-01-15T15:45:00Z',
        action: 'Préparation abattage',
        details: 'Préparation des 120 ovins pour abattage de 16h',
        user: 'Équipe de stabulation'
      },
      {
        date: '2024-01-15T13:00:00Z',
        action: 'Nourrissage terminé',
        details: 'Distribution du concentré de midi',
        user: 'Équipe de stabulation'
      }
    ]
  }
};

export default function StabulationDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [stabulation, setStabulation] = useState<StabulationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchStabulationDetail = async () => {
      try {
        setLoading(true);
        const stabulationId = params.id as string;
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const stabulationData = mockStabulationDetails[stabulationId];
        if (!stabulationData) {
          setError('Stabulation non trouvée');
          return;
        }
        
        setStabulation(stabulationData);
        console.log('Détails de la stabulation récupérés:', stabulationData);
      } catch (err) {
        setError('Erreur lors du chargement des détails de la stabulation');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchStabulationDetail();
    }
  }, [isAuthenticated, params.id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stabulationId = params.id as string;
      const stabulationData = mockStabulationDetails[stabulationId];
      if (stabulationData) {
        setStabulation(stabulationData);
      }
      
      console.log('Détails de la stabulation rafraîchis:', stabulationData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement');
      console.error('Erreur:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif',
        icon: CheckCircle
      },
      FULL: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'ممتلئ' : 'Plein',
        icon: XCircle
      },
      MAINTENANCE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'صيانة' : 'Maintenance',
        icon: AlertCircle
      },
      INACTIVE: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif',
        icon: Clock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2 theme-text-primary">
                {error || 'Stabulation non trouvée'}
              </h3>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: isRTL ? 'نظرة عامة' : 'Vue d\'ensemble',
      content: (
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Warehouse className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'معلومات الإسطبل' : 'Informations de la Stabulation'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'معرف الإسطبل:' : 'ID Stabulation:'}</span>
                  <span className="font-medium theme-text-primary">{stabulation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <span className="font-medium theme-text-primary">{stabulation.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الموقع:' : 'Localisation:'}</span>
                  <span className="font-medium theme-text-primary">{stabulation.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-text-secondary">{isRTL ? 'الحالة:' : 'Statut:'}</span>
                  {getStatusBadge(stabulation.status)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
                  <span className="font-medium theme-text-primary">{stabulation.statistics.occupancyRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Abattoir et Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <MapPin className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
                  <span className="theme-text-secondary">{isRTL ? 'جهة الاتصال:' : 'Contact:'}</span>
                  <p className="font-medium theme-text-primary">{stabulation.abattoir.contact}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{stabulation.abattoir.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                <Users className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'المدير' : 'Responsable'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الاسم:' : 'Nom:'}</span>
                  <p className="font-medium theme-text-primary">{stabulation.manager.name}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                  <p className="font-medium theme-text-primary">{stabulation.manager.phone}</p>
                </div>
                <div>
                  <span className="theme-text-secondary">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <p className="font-medium theme-text-primary">{stabulation.manager.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Équipements */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'المرافق والتجهيزات' : 'Équipements et Installations'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stabulation.facilities.map((facility, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm theme-text-primary">{facility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'animals',
      label: isRTL ? 'الحيوانات' : 'Animaux',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Heart className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الحيوانات في الإسطبل' : 'Animaux en Stabulation'}
            </h3>
            <div className="space-y-4">
              {stabulation.animals?.map((animal) => (
                <div key={animal.id} className="border theme-border-primary rounded-lg p-4 theme-bg-elevated hover:theme-bg-secondary theme-transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Heart className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <div>
                        <h3 className="text-lg font-semibold theme-text-primary theme-transition">
                          {animal.id} - {animal.type}
                        </h3>
                        <p className="text-sm theme-text-secondary theme-transition">{animal.breed} • {animal.age}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm theme-text-secondary theme-transition">{formatDate(animal.arrivalDate)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        animal.status === 'HEALTHY' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : animal.status === 'SICK'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {animal.status === 'HEALTHY' ? (isRTL ? 'سليم' : 'Sain') : 
                         animal.status === 'SICK' ? (isRTL ? 'مريض' : 'Malade') : 
                         (isRTL ? 'تحت المراقبة' : 'Sous surveillance')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الوزن' : 'Poids'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{animal.weight} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الغذاء' : 'Alimentation'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{animal.feedingSchedule}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium theme-text-secondary theme-transition">{isRTL ? 'الملاحظات' : 'Notes'}</label>
                      <p className="text-sm theme-text-primary theme-transition">{animal.notes}</p>
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
      id: 'feeding',
      label: isRTL ? 'التغذية' : 'Alimentation',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Package className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'جدول التغذية' : 'Planning d\'Alimentation'}
            </h3>
            <div className="space-y-4">
              {stabulation.feedingSchedule.map((feeding, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium theme-text-primary">{feeding.time} - {feeding.type}</h4>
                      <p className="text-sm theme-text-secondary">{feeding.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium theme-text-primary">{feeding.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Weight className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إحصائيات التغذية' : 'Statistiques d\'Alimentation'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{stabulation.statistics.totalAnimals}</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'إجمالي الحيوانات' : 'Total Animaux'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{stabulation.statistics.totalWeight} kg</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'الوزن الإجمالي' : 'Poids Total'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{stabulation.statistics.feedingCost} DA</div>
                <div className="text-sm theme-text-secondary">{isRTL ? 'تكلفة التغذية/يوم' : 'Coût Alimentation/jour'}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'maintenance',
      label: isRTL ? 'الصيانة' : 'Maintenance',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Activity className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'سجل الصيانة' : 'Historique de Maintenance'}
            </h3>
            <div className="space-y-4">
              {stabulation.maintenanceHistory?.map((maintenance, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-yellow-500 mr-2" />
                      <div>
                        <h4 className="font-medium theme-text-primary">{maintenance.type}</h4>
                        <p className="text-sm theme-text-secondary">{maintenance.description}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {isRTL ? 'مكتمل' : 'Terminé'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm theme-text-secondary">
                    <span>{isRTL ? 'التقني:' : 'Technicien:'} {maintenance.technician}</span>
                    <span>{formatDate(maintenance.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'activity',
      label: isRTL ? 'النشاط' : 'Activité',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center">
              <Clock className={`h-5 w-5 text-primary-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'النشاط الأخير' : 'Activité Récente'}
            </h3>
            <div className="space-y-4">
              {stabulation.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium theme-text-primary">{activity.action}</p>
                      <p className="text-sm theme-text-secondary">{formatDate(activity.date)}</p>
                    </div>
                    <p className="text-sm theme-text-secondary">{activity.details}</p>
                    <p className="text-xs theme-text-tertiary mt-1">{isRTL ? 'بواسطة:' : 'Par:'} {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen theme-bg-secondary theme-transition" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="shadow-sm border-b theme-bg-elevated theme-border-primary theme-transition">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className={`${isRTL ? 'ml-4' : 'mr-4'} p-2 rounded-lg hover:theme-bg-secondary theme-transition`}
                >
                  <ArrowLeft className="h-5 w-5 theme-text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center theme-text-primary theme-transition">
                    <Warehouse className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? 'إسطبل' : 'Stabulation'} {stabulation.id}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {stabulation.name} • {stabulation.abattoir.name} • {getStatusBadge(stabulation.status)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition disabled:opacity-50 border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
                <button 
                  onClick={() => console.log('Modifier stabulation')}
                  className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تعديل' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <Tabs tabs={tabs} isRTL={isRTL} />
        </div>
      </div>
    </Layout>
  );
}
