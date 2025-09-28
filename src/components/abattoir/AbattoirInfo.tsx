'use client';

import React from 'react';
import { 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AbattoirInfoProps {
  abattoir: any;
  isRTL: boolean;
}

export default function AbattoirInfo({ abattoir, isRTL }: AbattoirInfoProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif',
        icon: CheckCircle
      },
      INACTIVE: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif',
        icon: Clock
      },
      MAINTENANCE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'صيانة' : 'Maintenance',
        icon: AlertCircle
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return 'text-green-600 dark:text-green-400';
    if (quality >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Statut et informations générales */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'معلومات عامة' : 'Informations générales'}
          </h2>
          {getStatusBadge(abattoir.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'الوصف' : 'Description'}
            </p>
            <p className="theme-text-primary theme-transition">{abattoir.description}</p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'العنوان' : 'Adresse'}
            </p>
            <div className="flex items-start">
              <MapPin className={`h-4 w-4 text-primary-600 mt-0.5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <p className="theme-text-primary theme-transition">{abattoir.address}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'السعة الإجمالية' : 'Capacité totale'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">{abattoir.capacity}</p>
            <p className="text-sm theme-text-secondary theme-transition">{isRTL ? 'رأس' : 'têtes'}</p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'ال stock الحالي' : 'Stock actuel'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">{abattoir.currentStock}</p>
            <p className="text-sm theme-text-secondary theme-transition">{isRTL ? 'رأس' : 'têtes'}</p>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'معدل الاستخدام' : 'Taux d\'utilisation'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {Math.round((abattoir.currentStock / abattoir.capacity) * 100)}%
            </p>
            <p className="text-sm theme-text-secondary theme-transition">{isRTL ? 'من السعة' : 'de la capacité'}</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'الإحصائيات' : 'Statistiques'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center">
              <BarChart3 className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي المعالج' : 'Total traité'}
              </p>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {abattoir.statistics.totalProcessed.toLocaleString()}
            </p>
          </div>
          
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center">
              <TrendingUp className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'متوسط شهري' : 'Moyenne mensuelle'}
              </p>
            </div>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {abattoir.statistics.monthlyAverage.toLocaleString()}
            </p>
          </div>
          
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center">
              <Activity className={`h-5 w-5 ${getEfficiencyColor(abattoir.statistics.efficiency)} ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'الكفاءة' : 'Efficacité'}
              </p>
            </div>
            <p className={`text-2xl font-bold ${getEfficiencyColor(abattoir.statistics.efficiency)}`}>
              {abattoir.statistics.efficiency}%
            </p>
          </div>
          
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center">
              <CheckCircle className={`h-5 w-5 ${getQualityColor(abattoir.statistics.qualityScore)} ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'نقاط الجودة' : 'Score qualité'}
              </p>
            </div>
            <p className={`text-2xl font-bold ${getQualityColor(abattoir.statistics.qualityScore)}`}>
              {abattoir.statistics.qualityScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Contact et horaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'معلومات الاتصال' : 'Contact'}
          </h3>
          
          <div className="space-y-3">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="font-medium theme-text-primary theme-transition">{abattoir.manager}</p>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'مدير' : 'Directeur'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <a href={`tel:${abattoir.phone}`} className="theme-text-primary hover:text-primary-600 theme-transition">
                {abattoir.phone}
              </a>
            </div>
            
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Mail className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <a href={`mailto:${abattoir.email}`} className="theme-text-primary hover:text-primary-600 theme-transition">
                {abattoir.email}
              </a>
            </div>
          </div>
        </div>

        {/* Horaires de travail */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'ساعات العمل' : 'Horaires de travail'}
          </h3>
          
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-2">
              {isRTL ? 'من' : 'De'} {abattoir.workingHours.start} {isRTL ? 'إلى' : 'à'} {abattoir.workingHours.end}
            </p>
            <div className="flex flex-wrap gap-1">
              {abattoir.workingHours.days.map((day: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Équipements et certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Équipements */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'المرافق' : 'Équipements'}
          </h3>
          
          <div className="space-y-2">
            {abattoir.facilities.map((facility: string, index: number) => (
              <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CheckCircle className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-primary theme-transition">{facility}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'الشهادات' : 'Certifications'}
          </h3>
          
          <div className="space-y-2">
            {abattoir.certifications.map((cert: string, index: number) => (
              <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CheckCircle className={`h-4 w-4 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm theme-text-primary theme-transition">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

