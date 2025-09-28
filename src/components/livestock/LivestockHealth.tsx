'use client';

import React from 'react';
import { 
  Heart,
  Calendar,
  User,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  Syringe
} from 'lucide-react';

interface LivestockHealthProps {
  livestock: any;
  isRTL: boolean;
}

export default function LivestockHealth({ livestock, isRTL }: LivestockHealthProps) {
  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a consistent format
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVaccinationStatus = (nextDue: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a default status
      return { status: 'VALID', color: 'text-green-600', bg: 'bg-green-100', label: isRTL ? 'صالح' : 'Valide' };
    }
    
    const dueDate = new Date(nextDue);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'EXPIRED', color: 'text-red-600', bg: 'bg-red-100', label: isRTL ? 'منتهي الصلاحية' : 'Expiré' };
    } else if (diffDays <= 30) {
      return { status: 'DUE_SOON', color: 'text-yellow-600', bg: 'bg-yellow-100', label: isRTL ? 'قريب الانتهاء' : 'Bientôt expiré' };
    } else {
      return { status: 'VALID', color: 'text-green-600', bg: 'bg-green-100', label: isRTL ? 'صالح' : 'Valide' };
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'BON': return 'text-green-600 dark:text-green-400';
      case 'MOYEN': return 'text-yellow-600 dark:text-yellow-400';
      case 'MAUVAIS': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'BON': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'MOYEN': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'MAUVAIS': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Heart className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* État de santé général */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'الحالة الصحية العامة' : 'État de santé général'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {getHealthStatusIcon(livestock.healthStatus)}
            <span className={`ml-2 font-medium ${getHealthStatusColor(livestock.healthStatus)}`}>
              {livestock.healthStatus === 'BON' ? (isRTL ? 'جيد' : 'Bon') :
               livestock.healthStatus === 'MOYEN' ? (isRTL ? 'متوسط' : 'Moyen') :
               (isRTL ? 'سيء' : 'Mauvais')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Heart className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'الحالة الحالية' : 'État actuel'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {livestock.healthStatus === 'BON' ? (isRTL ? 'الحيوان في حالة صحية جيدة' : 'L\'animal est en bonne santé') :
               livestock.healthStatus === 'MOYEN' ? (isRTL ? 'يحتاج إلى مراقبة' : 'Nécessite une surveillance') :
               (isRTL ? 'يحتاج إلى رعاية طبية' : 'Nécessite des soins médicaux')}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'آخر فحص' : 'Dernier examen'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {livestock.medicalHistory && livestock.medicalHistory.length > 0 
                ? formatDate(livestock.medicalHistory[0].date)
                : (isRTL ? 'غير محدد' : 'Non spécifié')
              }
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Shield className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'اللقاحات' : 'Vaccinations'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {livestock.vaccinations ? livestock.vaccinations.length : 0} {isRTL ? 'لقاح' : 'vaccin(s)'}
            </p>
          </div>
        </div>
      </div>

      {/* Vaccinations */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'سجل التطعيمات' : 'Carnet de vaccinations'}
        </h2>
        
        {livestock.vaccinations && livestock.vaccinations.length > 0 ? (
          <div className="space-y-4">
            {livestock.vaccinations.map((vaccination: any, index: number) => {
              const status = getVaccinationStatus(vaccination.nextDue);
              return (
                <div key={index} className="p-4 border rounded-lg theme-border-primary theme-transition">
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-3`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Syringe className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <h3 className="font-medium theme-text-primary theme-transition">
                        {vaccination.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="theme-text-secondary theme-transition mb-1">
                        {isRTL ? 'تاريخ التطعيم' : 'Date de vaccination'}
                      </p>
                      <p className="theme-text-primary theme-transition">
                        {formatDate(vaccination.date)}
                      </p>
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="theme-text-secondary theme-transition mb-1">
                        {isRTL ? 'الطبيب البيطري' : 'Vétérinaire'}
                      </p>
                      <p className="theme-text-primary theme-transition">
                        {vaccination.veterinarian}
                      </p>
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="theme-text-secondary theme-transition mb-1">
                        {isRTL ? 'الموعد القادم' : 'Prochaine échéance'}
                      </p>
                      <p className="theme-text-primary theme-transition">
                        {formatDate(vaccination.nextDue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Syringe className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا توجد تطعيمات' : 'Aucune vaccination'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لم يتم تسجيل أي تطعيم لهذا الحيوان' : 'Aucune vaccination enregistrée pour cet animal'}
            </p>
          </div>
        )}
      </div>

      {/* Historique médical */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'التاريخ الطبي' : 'Historique médical'}
        </h2>
        
        {livestock.medicalHistory && livestock.medicalHistory.length > 0 ? (
          <div className="space-y-4">
            {livestock.medicalHistory.map((record: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg theme-border-primary theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-3`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FileText className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <h3 className="font-medium theme-text-primary theme-transition">
                      {record.condition}
                    </h3>
                  </div>
                  <span className="text-sm theme-text-secondary theme-transition">
                    {formatDate(record.date)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'العلاج' : 'Traitement'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {record.treatment}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'الطبيب البيطري' : 'Vétérinaire'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {record.veterinarian}
                    </p>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm theme-text-primary theme-transition">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لا يوجد تاريخ طبي' : 'Aucun historique médical'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'لم يتم تسجيل أي سجل طبي لهذا الحيوان' : 'Aucun enregistrement médical pour cet animal'}
            </p>
          </div>
        )}
      </div>

      {/* Recommandations */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'التوصيات' : 'Recommandations'}
        </h2>
        
        <div className="space-y-3">
          {livestock.vaccinations && livestock.vaccinations.some((v: any) => {
            const status = getVaccinationStatus(v.nextDue);
            return status.status === 'EXPIRED' || status.status === 'DUE_SOON';
          }) && (
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg`}>
              <AlertTriangle className={`h-5 w-5 text-yellow-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                  {isRTL ? 'تطعيمات منتهية الصلاحية' : 'Vaccinations expirées'}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {isRTL ? 'بعض التطعيمات منتهية الصلاحية أو قريبة من الانتهاء' : 'Certaines vaccinations sont expirées ou proches de l\'expiration'}
                </p>
              </div>
            </div>
          )}
          
          {livestock.healthStatus === 'MAUVAIS' && (
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg`}>
              <AlertTriangle className={`h-5 w-5 text-red-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h4 className="font-medium text-red-800 dark:text-red-300">
                  {isRTL ? 'رعاية طبية مطلوبة' : 'Soins médicaux requis'}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {isRTL ? 'هذا الحيوان يحتاج إلى فحص طبي فوري' : 'Cet animal nécessite un examen médical immédiat'}
                </p>
              </div>
            </div>
          )}
          
          {livestock.healthStatus === 'BON' && (!livestock.medicalHistory || livestock.medicalHistory.length === 0) && (
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg`}>
              <CheckCircle className={`h-5 w-5 text-green-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h4 className="font-medium text-green-800 dark:text-green-300">
                  {isRTL ? 'حالة صحية جيدة' : 'Bonne santé'}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {isRTL ? 'الحيوان في حالة صحية جيدة ولا يحتاج إلى رعاية خاصة' : 'L\'animal est en bonne santé et ne nécessite pas de soins particuliers'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

