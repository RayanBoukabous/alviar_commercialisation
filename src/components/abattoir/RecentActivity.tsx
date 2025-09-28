'use client';

import React from 'react';
import { 
  Activity,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

interface RecentActivityProps {
  abattoir: any;
  isRTL: boolean;
}

export default function RecentActivity({ abattoir, isRTL }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('Traitement') || action.includes('terminé')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (action.includes('Arrivée') || action.includes('reçues')) {
      return <ArrowRight className="h-5 w-5 text-blue-600" />;
    }
    if (action.includes('Contrôle') || action.includes('Inspection')) {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
    if (action.includes('Maintenance')) {
      return <Clock className="h-5 w-5 text-purple-600" />;
    }
    return <Activity className="h-5 w-5 text-primary-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Activité récente */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'النشاط الأخير' : 'Activité récente'}
        </h2>
        
        <div className="space-y-4">
          {abattoir.recentActivity.map((activity: any, index: number) => (
            <div key={index} className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} p-4 rounded-lg theme-bg-secondary theme-transition`}>
              <div className={`flex-shrink-0 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                  <h4 className="font-medium theme-text-primary theme-transition">{activity.action}</h4>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-sm theme-text-secondary theme-transition`}>
                    <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {formatDate(activity.date)}
                  </div>
                </div>
                <p className="text-sm theme-text-secondary theme-transition mb-2">{activity.details}</p>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-xs theme-text-tertiary theme-transition`}>
                  <User className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {isRTL ? 'بواسطة' : 'Par'} {activity.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques d'activité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <CheckCircle className={`h-8 w-8 text-green-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {abattoir.recentActivity.filter((a: any) => a.action.includes('terminé')).length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'عمليات مكتملة اليوم' : 'Opérations terminées aujourd\'hui'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <ArrowRight className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {abattoir.recentActivity.filter((a: any) => a.action.includes('Arrivée')).length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'وصولات جديدة' : 'Nouvelles arrivées'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <AlertTriangle className={`h-8 w-8 text-yellow-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {abattoir.recentActivity.filter((a: any) => a.action.includes('Contrôle')).length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'فحوصات جودة' : 'Contrôles qualité'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline d'activité */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'الجدول الزمني للنشاط' : 'Timeline d\'activité'}
        </h3>
        
        <div className="relative">
          {/* Ligne verticale */}
          <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700`}></div>
          
          <div className="space-y-6">
            {abattoir.recentActivity.map((activity: any, index: number) => (
              <div key={index} className={`relative flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Point sur la timeline */}
                <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1 w-2 h-2 bg-primary-600 rounded-full`}></div>
                
                {/* Contenu */}
                <div className={`${isRTL ? 'mr-12 text-right' : 'ml-12 text-left'} flex-1`}>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border theme-border-primary theme-transition">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                      <h4 className="font-medium theme-text-primary theme-transition">{activity.action}</h4>
                      <span className="text-xs theme-text-tertiary theme-transition">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <p className="text-sm theme-text-secondary theme-transition mb-2">{activity.details}</p>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-xs theme-text-tertiary theme-transition`}>
                      <User className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'بواسطة' : 'Par'} {activity.user}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

