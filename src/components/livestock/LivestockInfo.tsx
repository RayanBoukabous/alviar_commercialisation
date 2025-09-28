'use client';

import React from 'react';
import { 
  MapPin,
  Calendar,
  User,
  Activity,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Scale,
  Heart,
  Tag
} from 'lucide-react';

interface LivestockInfoProps {
  livestock: any;
  isRTL: boolean;
}

export default function LivestockInfo({ livestock, isRTL }: LivestockInfoProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      EN_ATTENTE: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-300', 
        label: isRTL ? 'في الانتظار' : 'En attente',
        icon: Clock
      },
      EN_TRAITEMENT: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'قيد المعالجة' : 'En traitement',
        icon: Activity
      },
      ABATTU: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'مذبوح' : 'Abattu',
        icon: CheckCircle
      },
      TRANSFERE: { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        label: isRTL ? 'منقول' : 'Transféré',
        icon: ArrowRight
      },
      REJETE: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'مرفوض' : 'Rejeté',
        icon: X
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_ATTENTE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      BON: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'جيد' : 'Bon',
        icon: Heart
      },
      MOYEN: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'متوسط' : 'Moyen',
        icon: Heart
      },
      MAUVAIS: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'سيء' : 'Mauvais',
        icon: Heart
      }
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.BON;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a consistent format
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a default age
      return isRTL ? 'غير محدد' : 'Non spécifié';
    }
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} ${isRTL ? 'سنة' : 'an(s)'} ${months} ${isRTL ? 'شهر' : 'mois'}`;
    }
    return `${months} ${isRTL ? 'شهر' : 'mois'}`;
  };

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'معلومات عامة' : 'Informations générales'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            {getStatusBadge(livestock.status)}
            {getHealthBadge(livestock.healthStatus)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-md font-medium theme-text-primary theme-transition mb-3">
              {isRTL ? 'هوية الحيوان' : 'Identité de l\'animal'}
            </h3>
            <div className="space-y-2">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Tag className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'رقم البوق' : 'Numéro de boucle'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {livestock.loopNumber}
                </span>
              </div>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Activity className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'النوع' : 'Type'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {livestock.type} - {livestock.breed}
                </span>
              </div>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'الجنس' : 'Sexe'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {livestock.gender === 'MALE' ? (isRTL ? 'ذكر' : 'Mâle') : (isRTL ? 'أنثى' : 'Femelle')}
                </span>
              </div>
            </div>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-md font-medium theme-text-primary theme-transition mb-3">
              {isRTL ? 'الخصائص الفيزيائية' : 'Caractéristiques physiques'}
            </h3>
            <div className="space-y-2">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Scale className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'الوزن' : 'Poids'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {livestock.weight} kg
                </span>
              </div>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'العمر' : 'Âge'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {calculateAge(livestock.birthDate)}
                </span>
              </div>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Tag className={`h-4 w-4 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'اللون' : 'Couleur'}: 
                </span>
                <span className="font-medium theme-text-primary theme-transition ml-2">
                  {livestock.color}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Origine et provenance */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'المنشأ والبروفينانس' : 'Origine et provenance'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className={`h-5 w-5 text-primary-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div>
                <h3 className="font-medium theme-text-primary theme-transition mb-1">
                  {isRTL ? 'مكان المنشأ' : 'Lieu d\'origine'}
                </h3>
                <p className="text-sm theme-text-secondary theme-transition">{livestock.origin}</p>
              </div>
            </div>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className={`h-5 w-5 text-primary-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div>
                <h3 className="font-medium theme-text-primary theme-transition mb-1">
                  {isRTL ? 'تاريخ الوصول' : 'Date d\'arrivée'}
                </h3>
                <p className="text-sm theme-text-secondary theme-transition">
                  {formatDate(livestock.arrivalDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ascendance */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'النسل' : 'Ascendance'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'الأم' : 'Mère'}
            </h3>
            {livestock.motherLoopNumber ? (
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm font-medium theme-text-primary theme-transition">
                  {livestock.motherLoopNumber}
                </p>
                <p className="text-xs theme-text-secondary theme-transition">
                  {isRTL ? 'رقم البوق' : 'Numéro de boucle'}
                </p>
              </div>
            ) : (
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'غير محدد' : 'Non spécifié'}
              </p>
            )}
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'الأب' : 'Père'}
            </h3>
            {livestock.fatherLoopNumber ? (
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm font-medium theme-text-primary theme-transition">
                  {livestock.fatherLoopNumber}
                </p>
                <p className="text-xs theme-text-secondary theme-transition">
                  {isRTL ? 'رقم البوق' : 'Numéro de boucle'}
                </p>
              </div>
            ) : (
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'غير محدد' : 'Non spécifié'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Marques distinctives */}
      {livestock.markings && livestock.markings.length > 0 && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'العلامات المميزة' : 'Marques distinctives'}
          </h2>
          
          <div className="space-y-2">
            {livestock.markings.map((marking: string, index: number) => (
              <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`h-2 w-2 bg-primary-600 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                <span className="text-sm theme-text-primary theme-transition">{marking}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {livestock.notes && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'ملاحظات' : 'Notes'}
          </h2>
          
          <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm theme-text-primary theme-transition">
              {livestock.notes}
            </p>
          </div>
        </div>
      )}

      {/* Métadonnées */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'معلومات النظام' : 'Informations système'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="theme-text-secondary theme-transition mb-1">
              {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
            </p>
            <p className="theme-text-primary theme-transition">
              {formatDate(livestock.createdAt)}
            </p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="theme-text-secondary theme-transition mb-1">
              {isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}
            </p>
            <p className="theme-text-primary theme-transition">
              {formatDate(livestock.updatedAt)}
            </p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="theme-text-secondary theme-transition mb-1">
              {isRTL ? 'أنشأ بواسطة' : 'Créé par'}
            </p>
            <p className="theme-text-primary theme-transition">
              {livestock.createdBy}
            </p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="theme-text-secondary theme-transition mb-1">
              {isRTL ? 'آخر تحديث بواسطة' : 'Dernière mise à jour par'}
            </p>
            <p className="theme-text-primary theme-transition">
              {livestock.lastUpdatedBy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

