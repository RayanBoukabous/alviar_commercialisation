'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Building2,
  Edit,
  RefreshCw,
  AlertCircle,
  Activity,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Tabs from '@/components/ui/Tabs';
import AbattoirInfo from '@/components/abattoir/AbattoirInfo';
import LivestockManagement from '@/components/abattoir/LivestockManagement';
import RecentActivity from '@/components/abattoir/RecentActivity';
import StaffManagement from '@/components/abattoir/StaffManagement';

// Interface pour les abattoirs avec données détaillées
interface AbattoirDetail {
  id: number;
  name: string;
  wilaya: string;
  commune: string;
  address: string;
  capacity: number;
  currentStock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
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
}

// Données mock détaillées pour les abattoirs
const mockAbattoirDetails: { [key: number]: AbattoirDetail } = {
  1: {
    id: 1,
    name: "Abattoir Central d'Alger",
    wilaya: "Alger",
    commune: "Alger Centre",
    address: "Route de l'Abattoir, Alger Centre, 16000 Alger",
    capacity: 500,
    currentStock: 320,
    status: 'ACTIVE',
    manager: "Ahmed Benali",
    phone: "+213 21 45 67 89",
    email: "ahmed.benali@abattoir-alger.dz",
    createdAt: "2023-01-15T08:30:00Z",
    lastActivity: "2024-01-15T14:30:00Z",
    description: "L'Abattoir Central d'Alger est le plus grand abattoir de la capitale, équipé des dernières technologies pour assurer une qualité optimale et respecter toutes les normes sanitaires internationales.",
    facilities: [
      "Salles de traitement modernes",
      "Système de réfrigération avancé",
      "Laboratoire d'analyse",
      "Zone de quarantaine",
      "Parking pour camions",
      "Système de traitement des eaux"
    ],
    certifications: [
      "ISO 22000 - Sécurité alimentaire",
      "HACCP - Analyse des dangers",
      "Certification Halal",
      "Normes européennes"
    ],
    workingHours: {
      start: "06:00",
      end: "18:00",
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    },
    statistics: {
      totalProcessed: 125000,
      monthlyAverage: 8500,
      efficiency: 94,
      qualityScore: 98
    },
    recentActivity: [
      {
        date: "2024-01-15T14:30:00Z",
        action: "Traitement terminé",
        details: "Lot de 150 bovins traité avec succès",
        user: "Ahmed Benali"
      },
      {
        date: "2024-01-15T10:15:00Z",
        action: "Arrivée de bétail",
        details: "200 têtes de bétail reçues de la ferme de Blida",
        user: "Fatima Zohra"
      },
      {
        date: "2024-01-14T16:45:00Z",
        action: "Contrôle qualité",
        details: "Inspection sanitaire réussie - Score: 98/100",
        user: "Dr. Mohamed Khelil"
      },
      {
        date: "2024-01-14T08:20:00Z",
        action: "Maintenance",
        details: "Entretien préventif des équipements de réfrigération",
        user: "Omar Boukhelifa"
      }
    ],
    staff: [
      {
        name: "Ahmed Benali",
        role: "Directeur",
        phone: "+213 21 45 67 89",
        email: "ahmed.benali@abattoir-alger.dz"
      },
      {
        name: "Fatima Zohra",
        role: "Responsable Production",
        phone: "+213 21 45 67 90",
        email: "fatima.zohra@abattoir-alger.dz"
      },
      {
        name: "Dr. Mohamed Khelil",
        role: "Vétérinaire",
        phone: "+213 21 45 67 91",
        email: "mohamed.khelil@abattoir-alger.dz"
      },
      {
        name: "Omar Boukhelifa",
        role: "Technicien Maintenance",
        phone: "+213 21 45 67 92",
        email: "omar.boukhelifa@abattoir-alger.dz"
      }
    ]
  },
  2: {
    id: 2,
    name: "Abattoir de Blida",
    wilaya: "Blida",
    commune: "Blida",
    address: "Zone Industrielle, Blida, 09000 Blida",
    capacity: 300,
    currentStock: 180,
    status: 'ACTIVE',
    manager: "Fatima Zohra",
    phone: "+213 25 12 34 56",
    email: "fatima.zohra@abattoir-blida.dz",
    createdAt: "2023-02-20T10:15:00Z",
    lastActivity: "2024-01-14T16:45:00Z",
    description: "Abattoir moderne spécialisé dans le traitement de bétail local, avec un focus sur la qualité et l'efficacité opérationnelle.",
    facilities: [
      "Salles de traitement",
      "Réfrigération",
      "Laboratoire",
      "Zone de stockage",
      "Bureau administratif"
    ],
    certifications: [
      "ISO 22000",
      "HACCP",
      "Certification Halal"
    ],
    workingHours: {
      start: "07:00",
      end: "17:00",
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
    },
    statistics: {
      totalProcessed: 75000,
      monthlyAverage: 5200,
      efficiency: 89,
      qualityScore: 95
    },
    recentActivity: [
      {
        date: "2024-01-14T16:45:00Z",
        action: "Traitement terminé",
        details: "Lot de 120 ovins traité",
        user: "Fatima Zohra"
      },
      {
        date: "2024-01-14T11:30:00Z",
        action: "Arrivée de bétail",
        details: "150 têtes reçues",
        user: "Karim Amrani"
      }
    ],
    staff: [
      {
        name: "Fatima Zohra",
        role: "Directrice",
        phone: "+213 25 12 34 56",
        email: "fatima.zohra@abattoir-blida.dz"
      },
      {
        name: "Karim Amrani",
        role: "Superviseur",
        phone: "+213 25 12 34 57",
        email: "karim.amrani@abattoir-blida.dz"
      }
    ]
  }
};

export default function AbattoirDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const [abattoir, setAbattoir] = useState<AbattoirDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Détection RTL
  const isRTL = currentLocale === 'ar';

  useEffect(() => {
    const fetchAbattoirDetail = async () => {
      try {
        setLoading(true);
        const abattoirId = parseInt(params.id as string);
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const abattoirData = mockAbattoirDetails[abattoirId];
        if (abattoirData) {
          setAbattoir(abattoirData);
        } else {
          setError('Abattoir non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement des détails');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && params.id) {
      fetchAbattoirDetail();
    }
  }, [isAuthenticated, params.id]);


  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !abattoir) {
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
                {error || (isRTL ? 'المجزر غير موجود' : 'Abattoir non trouvé')}
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
                    <Building2 className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {abattoir.name}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {abattoir.wilaya} - {abattoir.commune}
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
                icon: <Building2 className="h-4 w-4" />,
                content: <AbattoirInfo abattoir={abattoir} isRTL={isRTL} />
              },
              {
                id: 'livestock',
                label: isRTL ? 'إدارة الماشية' : 'Gestion du bétail',
                icon: <Activity className="h-4 w-4" />,
                content: <LivestockManagement abattoirId={abattoir.id} isRTL={isRTL} />
              },
              {
                id: 'staff',
                label: isRTL ? 'الموظفين' : 'Personnel',
                icon: <Users className="h-4 w-4" />,
                content: <StaffManagement abattoir={abattoir} isRTL={isRTL} />
              },
              {
                id: 'activity',
                label: isRTL ? 'النشاط' : 'Activité',
                icon: <FileText className="h-4 w-4" />,
                content: <RecentActivity abattoir={abattoir} isRTL={isRTL} />
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
