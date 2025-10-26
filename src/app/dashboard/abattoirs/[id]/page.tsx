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
  FileText,
  Thermometer
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAbattoirDetailWithFacilities } from '@/lib/hooks/useAbattoirs';
import { AbattoirDetailResponse, ChambreFroide } from '@/lib/api/abattoirService';
import { useAbattoirManager } from '@/lib/hooks/usePersonnel';
import Tabs from '@/components/ui/Tabs';
import AbattoirInfo from '@/components/abattoir/AbattoirInfo';
import LivestockManagement from '@/components/abattoir/LivestockManagement';
import RecentActivity from '@/components/abattoir/RecentActivity';
import StaffManagement from '@/components/abattoir/StaffManagement';
import ChambresFroidesManagement from '@/components/abattoir/ChambresFroidesManagement';

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
  chambresFroides: ChambreFroide[];
}

// Fonction pour mapper les données API vers le format de l'interface
const mapApiDataToAbattoirDetail = (apiData: AbattoirDetailResponse, manager?: any): AbattoirDetail => {
  const { abattoir, chambres_froides, statistics } = apiData;
  
  return {
    id: abattoir.id,
    name: abattoir.nom,
    wilaya: abattoir.wilaya,
    commune: abattoir.commune,
    address: abattoir.adresse_complete,
    capacity: abattoir.capacite_totale_reception,
    currentStock: abattoir.betes_count,
    status: abattoir.actif ? 'ACTIVE' : 'INACTIVE',
    manager: manager ? `${manager.prenom} ${manager.nom}` : (abattoir.responsable_nom || 'Non assigné'),
    phone: abattoir.telephone || 'Non disponible',
    email: abattoir.email || 'Non disponible',
    createdAt: abattoir.created_at,
    lastActivity: abattoir.updated_at,
    description: `Abattoir ${abattoir.nom} situé à ${abattoir.commune}, ${abattoir.wilaya}. Capacité totale de réception: ${abattoir.capacite_totale_reception} têtes.`,
    facilities: [
      `Capacité réception ovins: ${abattoir.capacite_reception_ovin}`,
      `Capacité réception bovins: ${abattoir.capacite_reception_bovin}`,
      `Capacité stabulation: ${abattoir.capacite_stabulation}`,
      `Chambres froides: ${statistics.chambres_froides_count}`,
      'Système de réfrigération',
      'Laboratoire d\'analyse'
    ],
    certifications: [
      'ISO 22000 - Sécurité alimentaire',
      'HACCP - Analyse des dangers',
      'Certification Halal',
      'Normes sanitaires'
    ],
    workingHours: {
      start: "08:00",
      end: "16:00",
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"]
    },
    statistics: {
      totalProcessed: statistics.betes_abattues,
      monthlyAverage: Math.floor(statistics.betes_abattues / 12),
      efficiency: statistics.capacite_utilisee,
      qualityScore: 95
    },
    recentActivity: [
      {
        date: abattoir.updated_at,
        action: "Mise à jour",
        details: `Abattoir mis à jour - ${statistics.betes_count} bêtes actuellement`,
        user: abattoir.responsable_nom || 'Système'
      }
    ],
    staff: manager ? [
      {
        name: `${manager.prenom} ${manager.nom}`,
        role: manager.role_nom || 'Responsable',
        phone: abattoir.telephone || 'Non disponible',
        email: abattoir.email || 'Non disponible'
      }
    ] : [],
    chambresFroides: chambres_froides
  };
};


export default function AbattoirDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  
  // Détection RTL
  const isRTL = currentLocale === 'ar';
  
  // Récupérer l'ID de l'abattoir depuis les paramètres
  const abattoirId = params.id ? parseInt(params.id as string) : 0;
  
  // Hook pour récupérer les détails de l'abattoir
  const { data: apiData, isLoading: loading, error } = useAbattoirDetailWithFacilities(abattoirId);
  
  // Hook pour récupérer le responsable de l'abattoir
  const { data: manager, isLoading: managerLoading, error: managerError } = useAbattoirManager(abattoirId);
  
  // Mapper les données API vers le format de l'interface
  const abattoir = apiData ? mapApiDataToAbattoirDetail(apiData, manager) : null;


  if (isLoading || translationLoading || managerLoading) {
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
                {error?.message || (isRTL ? 'المجزر غير موجود' : 'Abattoir non trouvé')}
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
                id: 'chambres-froides',
                label: isRTL ? 'الغرف الباردة' : 'Chambres froides',
                icon: <Thermometer className="h-4 w-4" />,
                content: <ChambresFroidesManagement 
                  abattoirId={abattoir.id} 
                  isRTL={isRTL} 
                  abattoirName={abattoir.name}
                  abattoirLocation={`${abattoir.commune}, ${abattoir.wilaya}`}
                />
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
