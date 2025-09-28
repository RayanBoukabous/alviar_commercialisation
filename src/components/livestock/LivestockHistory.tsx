'use client';

import React from 'react';
import { 
  Calendar,
  MapPin,
  User,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface LivestockHistoryProps {
  livestock: any;
  isRTL: boolean;
}

export default function LivestockHistory({ livestock, isRTL }: LivestockHistoryProps) {
  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - return a consistent format
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransferStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETE': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'EN_COURS': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'ANNULE': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-primary-600" />;
    }
  };

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'text-green-600 dark:text-green-400';
      case 'EN_COURS': return 'text-yellow-600 dark:text-yellow-400';
      case 'ANNULE': return 'text-red-600 dark:text-red-400';
      default: return 'text-primary-600 dark:text-primary-400';
    }
  };

  const getTransferStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETE': return isRTL ? 'مكتمل' : 'Complété';
      case 'EN_COURS': return isRTL ? 'قيد التنفيذ' : 'En cours';
      case 'ANNULE': return isRTL ? 'ملغي' : 'Annulé';
      default: return isRTL ? 'غير محدد' : 'Non spécifié';
    }
  };

  // Créer un historique chronologique combiné
  const createTimeline = () => {
    const timeline = [];
    
    // Ajouter l'arrivée
    timeline.push({
      id: 'arrival',
      type: 'ARRIVAL',
      date: livestock.arrivalDate,
      title: isRTL ? 'وصول الحيوان' : 'Arrivée de l\'animal',
      description: `${isRTL ? 'وصل من' : 'Arrivé de'} ${livestock.origin}`,
      icon: <MapPin className="h-5 w-5 text-blue-600" />,
      color: 'blue'
    });

    // Ajouter les transferts
    if (livestock.transferHistory) {
      livestock.transferHistory.forEach((transfer: any) => {
        timeline.push({
          id: transfer.id,
          type: 'TRANSFER',
          date: transfer.transferDate,
          title: isRTL ? 'نقل الحيوان' : 'Transfert de l\'animal',
          description: `${isRTL ? 'من' : 'De'} ${transfer.fromLocation} ${isRTL ? 'إلى' : 'vers'} ${transfer.toLocation}`,
          details: transfer.reason,
          icon: <ArrowRight className="h-5 w-5 text-purple-600" />,
          color: 'purple',
          status: transfer.status,
          documentNumber: transfer.documentNumber,
          authorizedBy: transfer.authorizedBy
        });
      });
    }

    // Ajouter les événements médicaux
    if (livestock.medicalHistory) {
      livestock.medicalHistory.forEach((record: any, index: number) => {
        timeline.push({
          id: `medical-${index}`,
          type: 'MEDICAL',
          date: record.date,
          title: record.condition,
          description: record.treatment,
          details: record.notes,
          icon: <FileText className="h-5 w-5 text-green-600" />,
          color: 'green',
          veterinarian: record.veterinarian
        });
      });
    }

    // Ajouter les vaccinations
    if (livestock.vaccinations) {
      livestock.vaccinations.forEach((vaccination: any, index: number) => {
        timeline.push({
          id: `vaccination-${index}`,
          type: 'VACCINATION',
          date: vaccination.date,
          title: vaccination.name,
          description: `${isRTL ? 'تم التطعيم بواسطة' : 'Vacciné par'} ${vaccination.veterinarian}`,
          details: `${isRTL ? 'الموعد القادم' : 'Prochaine échéance'}: ${formatDate(vaccination.nextDue)}`,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          color: 'green',
          veterinarian: vaccination.veterinarian
        });
      });
    }

    // Trier par date (plus récent en premier)
    return timeline.sort((a, b) => {
      if (typeof window === 'undefined') {
        // Server-side rendering - return original order
        return 0;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const timeline = createTimeline();

  return (
    <div className="space-y-6">
      {/* Résumé de l'historique */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'ملخص التاريخ' : 'Résumé de l\'historique'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <MapPin className={`h-5 w-5 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'المنشأ' : 'Origine'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {livestock.origin}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'تاريخ الوصول' : 'Date d\'arrivée'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {formatDate(livestock.arrivalDate)}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <ArrowRight className={`h-5 w-5 text-purple-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'التحويلات' : 'Transferts'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {livestock.transferHistory ? livestock.transferHistory.length : 0} {isRTL ? 'تحويل' : 'transfert(s)'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-gray-50 dark:bg-slate-700`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <FileText className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-primary theme-transition">
                {isRTL ? 'الأحداث الطبية' : 'Événements médicaux'}
              </span>
            </div>
            <p className="text-sm theme-text-secondary theme-transition">
              {(livestock.medicalHistory ? livestock.medicalHistory.length : 0) + (livestock.vaccinations ? livestock.vaccinations.length : 0)} {isRTL ? 'حدث' : 'événement(s)'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline chronologique */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'الجدول الزمني' : 'Timeline chronologique'}
        </h2>
        
        <div className="relative">
          {/* Ligne verticale */}
          <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700`}></div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className={`relative flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Point sur la timeline */}
                <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1 w-2 h-2 bg-${event.color}-600 rounded-full`}></div>
                
                {/* Contenu */}
                <div className={`${isRTL ? 'mr-12 text-right' : 'ml-12 text-left'} flex-1`}>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border theme-border-primary theme-transition">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {event.icon}
                        <h4 className={`font-medium theme-text-primary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {event.title}
                        </h4>
                      </div>
                      <span className="text-xs theme-text-tertiary theme-transition">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    
                    <p className="text-sm theme-text-secondary theme-transition mb-2">
                      {event.description}
                    </p>
                    
                    {event.details && (
                      <p className="text-sm theme-text-tertiary theme-transition mb-2">
                        {event.details}
                      </p>
                    )}
                    
                    {/* Informations supplémentaires selon le type */}
                    {event.type === 'TRANSFER' && (
                      <div className="mt-3 pt-3 border-t theme-border-primary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className="theme-text-secondary theme-transition">
                              {isRTL ? 'الوثيقة' : 'Document'}: 
                            </span>
                            <span className="theme-text-primary theme-transition ml-1">
                              {event.documentNumber}
                            </span>
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className="theme-text-secondary theme-transition">
                              {isRTL ? 'السبب' : 'Raison'}: 
                            </span>
                            <span className="theme-text-primary theme-transition ml-1">
                              {event.details}
                            </span>
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className="theme-text-secondary theme-transition">
                              {isRTL ? 'أذن بواسطة' : 'Autorisé par'}: 
                            </span>
                            <span className="theme-text-primary theme-transition ml-1">
                              {event.authorizedBy}
                            </span>
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className="theme-text-secondary theme-transition">
                              {isRTL ? 'الحالة' : 'Statut'}: 
                            </span>
                            <span className={`ml-1 ${getTransferStatusColor(event.status)}`}>
                              {getTransferStatusLabel(event.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(event.type === 'MEDICAL' || event.type === 'VACCINATION') && event.veterinarian && (
                      <div className="mt-3 pt-3 border-t theme-border-primary">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-xs`}>
                          <User className={`h-3 w-3 theme-text-tertiary ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          <span className="theme-text-secondary theme-transition">
                            {isRTL ? 'الطبيب البيطري' : 'Vétérinaire'}: 
                          </span>
                          <span className="theme-text-primary theme-transition ml-1">
                            {event.veterinarian}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des transferts détaillé */}
      {livestock.transferHistory && livestock.transferHistory.length > 0 && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'تفاصيل التحويلات' : 'Détails des transferts'}
          </h2>
          
          <div className="space-y-4">
            {livestock.transferHistory.map((transfer: any, index: number) => (
              <div key={transfer.id} className="p-4 border rounded-lg theme-border-primary theme-transition">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-3`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {getTransferStatusIcon(transfer.status)}
                    <h3 className={`font-medium theme-text-primary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {isRTL ? 'تحويل' : 'Transfert'} #{transfer.documentNumber}
                    </h3>
                  </div>
                  <span className={`text-sm ${getTransferStatusColor(transfer.status)}`}>
                    {getTransferStatusLabel(transfer.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'من' : 'De'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {transfer.fromLocation}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'إلى' : 'Vers'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {transfer.toLocation}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'التاريخ' : 'Date'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {formatDate(transfer.transferDate)}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'السبب' : 'Raison'}
                    </p>
                    <p className="theme-text-primary theme-transition">
                      {transfer.reason}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t theme-border-primary">
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-sm`}>
                    <User className={`h-4 w-4 theme-text-tertiary ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="theme-text-secondary theme-transition">
                      {isRTL ? 'أذن بواسطة' : 'Autorisé par'}:
                    </span>
                    <span className="theme-text-primary theme-transition ml-1">
                      {transfer.authorizedBy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

