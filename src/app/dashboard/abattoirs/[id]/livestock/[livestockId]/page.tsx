'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Activity,
  Edit,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  FileText,
  Heart,
  Scale,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';
import LivestockInfo from '@/components/livestock/LivestockInfo';
import LivestockHealth from '@/components/livestock/LivestockHealth';
import LivestockHistory from '@/components/livestock/LivestockHistory';
import LivestockDocuments from '@/components/livestock/LivestockDocuments';

// Interface pour les bêtes avec données détaillées
interface LivestockDetail {
  id: string;
  loopNumber: string;
  type: 'BOVIN' | 'OVIN' | 'CAPRIN';
  breed: string;
  age: number; // en mois
  weight: number; // en kg
  gender: 'MALE' | 'FEMALE';
  status: 'EN_ATTENTE' | 'EN_TRAITEMENT' | 'ABATTU' | 'TRANSFERE' | 'REJETE';
  arrivalDate: string;
  lastActivity: string;
  origin: string;
  healthStatus: 'BON' | 'MOYEN' | 'MAUVAIS';
  notes?: string;
  
  // Informations détaillées
  birthDate: string;
  motherLoopNumber?: string;
  fatherLoopNumber?: string;
  color: string;
  markings: string[];
  
  // Santé
  vaccinations: {
    name: string;
    date: string;
    veterinarian: string;
    nextDue: string;
  }[];
  medicalHistory: {
    date: string;
    condition: string;
    treatment: string;
    veterinarian: string;
    notes: string;
  }[];
  
  // Historique
  transferHistory: {
    id: string;
    fromLocation: string;
    toLocation: string;
    transferDate: string;
    reason: string;
    authorizedBy: string;
    documentNumber: string;
  }[];
  
  // Documents
  documents: {
    id: string;
    type: 'CERTIFICAT_SANTE' | 'CERTIFICAT_ORIGINE' | 'BON_TRANSFERT' | 'CERTIFICAT_ABATTAGE';
    title: string;
    date: string;
    issuedBy: string;
    fileUrl: string;
    status: 'VALID' | 'EXPIRED' | 'PENDING';
  }[];
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUpdatedBy: string;
}

// Données mock détaillées pour les bêtes
const mockLivestockDetails: { [key: string]: LivestockDetail } = {
  'LIV001': {
    id: 'LIV001',
    loopNumber: 'DZ-ALG-2024-001234',
    type: 'BOVIN',
    breed: 'Holstein',
    age: 24,
    weight: 450,
    gender: 'FEMALE',
    status: 'EN_ATTENTE',
    arrivalDate: '2024-01-15T08:30:00Z',
    lastActivity: '2024-01-15T08:30:00Z',
    origin: 'Ferme de Blida',
    healthStatus: 'BON',
    notes: 'Animal en bonne santé, prêt pour l\'abattage',
    
    birthDate: '2022-01-15T00:00:00Z',
    motherLoopNumber: 'DZ-ALG-2022-005678',
    fatherLoopNumber: 'DZ-ALG-2021-003456',
    color: 'Noir et blanc',
    markings: ['Tache blanche sur le front', 'Marque sur l\'oreille droite'],
    
    vaccinations: [
      {
        name: 'Vaccin contre la fièvre aphteuse',
        date: '2023-12-15T00:00:00Z',
        veterinarian: 'Dr. Mohamed Khelil',
        nextDue: '2024-12-15T00:00:00Z'
      },
      {
        name: 'Vaccin contre la brucellose',
        date: '2023-11-20T00:00:00Z',
        veterinarian: 'Dr. Mohamed Khelil',
        nextDue: '2024-11-20T00:00:00Z'
      }
    ],
    
    medicalHistory: [
      {
        date: '2024-01-10T00:00:00Z',
        condition: 'Contrôle de routine',
        treatment: 'Examen général',
        veterinarian: 'Dr. Mohamed Khelil',
        notes: 'Animal en parfaite santé'
      },
      {
        date: '2023-12-15T00:00:00Z',
        condition: 'Vaccination',
        treatment: 'Vaccin fièvre aphteuse',
        veterinarian: 'Dr. Mohamed Khelil',
        notes: 'Vaccination effectuée sans réaction'
      }
    ],
    
    transferHistory: [
      {
        id: 'TRF001',
        fromLocation: 'Ferme de Blida',
        toLocation: 'Abattoir Central d\'Alger',
        transferDate: '2024-01-15T08:30:00Z',
        reason: 'Abattage programmé',
        authorizedBy: 'Ahmed Benali',
        documentNumber: 'TRF-2024-001'
      }
    ],
    
    documents: [
      {
        id: 'DOC001',
        type: 'CERTIFICAT_SANTE',
        title: 'Certificat de santé',
        date: '2024-01-10T00:00:00Z',
        issuedBy: 'Dr. Mohamed Khelil',
        fileUrl: '/documents/cert-sante-LIV001.pdf',
        status: 'VALID'
      },
      {
        id: 'DOC002',
        type: 'CERTIFICAT_ORIGINE',
        title: 'Certificat d\'origine',
        date: '2024-01-12T00:00:00Z',
        issuedBy: 'Service vétérinaire de Blida',
        fileUrl: '/documents/cert-origine-LIV001.pdf',
        status: 'VALID'
      },
      {
        id: 'DOC003',
        type: 'BON_TRANSFERT',
        title: 'Bon de transfert',
        date: '2024-01-15T08:30:00Z',
        issuedBy: 'Ahmed Benali',
        fileUrl: '/documents/bon-transfert-LIV001.pdf',
        status: 'VALID'
      }
    ],
    
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    createdBy: 'Ahmed Benali',
    lastUpdatedBy: 'Ahmed Benali'
  },
  'LIV002': {
    id: 'LIV002',
    loopNumber: 'DZ-ALG-2024-001235',
    type: 'BOVIN',
    breed: 'Charolais',
    age: 30,
    weight: 520,
    gender: 'MALE',
    status: 'EN_TRAITEMENT',
    arrivalDate: '2024-01-14T10:15:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
    origin: 'Ferme de Tipaza',
    healthStatus: 'BON',
    notes: 'En cours de traitement',
    
    birthDate: '2021-07-20T00:00:00Z',
    motherLoopNumber: 'DZ-ALG-2020-007890',
    fatherLoopNumber: 'DZ-ALG-2019-002345',
    color: 'Blanc crème',
    markings: ['Marque sur l\'épaule gauche'],
    
    vaccinations: [
      {
        name: 'Vaccin contre la fièvre aphteuse',
        date: '2023-11-10T00:00:00Z',
        veterinarian: 'Dr. Fatima Zohra',
        nextDue: '2024-11-10T00:00:00Z'
      }
    ],
    
    medicalHistory: [
      {
        date: '2024-01-14T10:15:00Z',
        condition: 'Arrivée à l\'abattoir',
        treatment: 'Examen d\'entrée',
        veterinarian: 'Dr. Mohamed Khelil',
        notes: 'Animal en bonne santé, prêt pour le traitement'
      }
    ],
    
    transferHistory: [
      {
        id: 'TRF002',
        fromLocation: 'Ferme de Tipaza',
        toLocation: 'Abattoir Central d\'Alger',
        transferDate: '2024-01-14T10:15:00Z',
        reason: 'Abattage programmé',
        authorizedBy: 'Ahmed Benali',
        documentNumber: 'TRF-2024-002'
      }
    ],
    
    documents: [
      {
        id: 'DOC004',
        type: 'CERTIFICAT_SANTE',
        title: 'Certificat de santé',
        date: '2024-01-12T00:00:00Z',
        issuedBy: 'Dr. Fatima Zohra',
        fileUrl: '/documents/cert-sante-LIV002.pdf',
        status: 'VALID'
      }
    ],
    
    createdAt: '2024-01-14T10:15:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: 'Ahmed Benali',
    lastUpdatedBy: 'Fatima Zohra'
  }
};

export default function LivestockDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [livestock, setLivestock] = useState<LivestockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchLivestockDetail = async () => {
      try {
        setLoading(true);
        const livestockId = params.livestockId as string;
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const livestockData = mockLivestockDetails[livestockId];
        if (livestockData) {
          setLivestock(livestockData);
        } else {
          setError('Animal non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement des détails');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.livestockId) {
      fetchLivestockDetail();
    }
  }, [isAuthenticated, params.livestockId]);

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !livestock) {
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
                {error || (isRTL ? 'الحيوان غير موجود' : 'Animal non trouvé')}
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
                    <Activity className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {livestock.loopNumber}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {livestock.type} - {livestock.breed} ({livestock.weight} kg)
                  </p>
                </div>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تحديث' : 'Actualiser'}
                </button>
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
                icon: <User className="h-4 w-4" />,
                content: <LivestockInfo livestock={livestock} isRTL={isRTL} />
              },
              {
                id: 'health',
                label: isRTL ? 'الصحة' : 'Santé',
                icon: <Heart className="h-4 w-4" />,
                content: <LivestockHealth livestock={livestock} isRTL={isRTL} />
              },
              {
                id: 'history',
                label: isRTL ? 'التاريخ' : 'Historique',
                icon: <Calendar className="h-4 w-4" />,
                content: <LivestockHistory livestock={livestock} isRTL={isRTL} />
              },
              {
                id: 'documents',
                label: isRTL ? 'الوثائق' : 'Documents',
                icon: <FileText className="h-4 w-4" />,
                content: <LivestockDocuments livestock={livestock} isRTL={isRTL} />
              }
            ]}
            defaultTab="info"
            isRTL={isRTL}
          />
        </div>
      </div>
    </Layout>
  );
}
