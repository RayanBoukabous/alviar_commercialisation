'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface StockAnalyticsProps {
  isRTL: boolean;
}

interface AnalyticsData {
  totalLivestock: number;
  totalSlaughtered: number;
  totalCarcassWeight: number;
  averageYield: number;
  totalValue: number;
  dailySlaughter: {
    date: string;
    count: number;
    weight: number;
  }[];
  typeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  abattoirPerformance: {
    name: string;
    livestockCount: number;
    slaughterCount: number;
    averageYield: number;
  }[];
  alerts: {
    type: 'WARNING' | 'INFO' | 'SUCCESS';
    message: string;
    date: string;
  }[];
}

// Données mock pour les analyses
const mockAnalyticsData: AnalyticsData = {
  totalLivestock: 8,
  totalSlaughtered: 3,
  totalCarcassWeight: 615,
  averageYield: 54.4,
  totalValue: 125000,
  dailySlaughter: [
    { date: '2024-01-12', count: 1, weight: 35 },
    { date: '2024-01-13', count: 1, weight: 320 },
    { date: '2024-01-07', count: 1, weight: 260 }
  ],
  typeDistribution: [
    { type: 'BOVIN', count: 4, percentage: 50 },
    { type: 'OVIN', count: 2, percentage: 25 },
    { type: 'CAPRIN', count: 2, percentage: 25 }
  ],
  abattoirPerformance: [
    { name: "Abattoir Central d'Alger", livestockCount: 3, slaughterCount: 0, averageYield: 0 },
    { name: 'Abattoir de Blida', livestockCount: 1, slaughterCount: 1, averageYield: 53.8 },
    { name: 'Abattoir d\'Oran', livestockCount: 1, slaughterCount: 1, averageYield: 55.2 },
    { name: 'Abattoir de Sétif', livestockCount: 1, slaughterCount: 1, averageYield: 54.2 }
  ],
  alerts: [
    { type: 'WARNING', message: 'Stock vif élevé dans l\'Abattoir Central d\'Alger', date: '2024-01-17' },
    { type: 'INFO', message: '3 nouvelles carcasses ajoutées cette semaine', date: '2024-01-15' },
    { type: 'SUCCESS', message: 'Rendement moyen supérieur à 54%', date: '2024-01-14' }
  ]
};

export default function StockAnalyticsTab({ isRTL }: StockAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalyticsData(mockAnalyticsData);
      } catch (err) {
        console.error('Erreur lors du chargement des analyses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'INFO': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'INFO': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'SUCCESS': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0];
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
          {isRTL ? 'خطأ في تحميل البيانات' : 'Erreur de chargement des données'}
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي الماشية' : 'Total bétail'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{analyticsData.totalLivestock}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'المذبوح' : 'Abattu'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{analyticsData.totalSlaughtered}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'الوزن الإجمالي' : 'Poids total'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{analyticsData.totalCarcassWeight} kg</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'متوسط المردود' : 'Rendement moyen'}
              </p>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{analyticsData.averageYield}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par type */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'التوزيع حسب النوع' : 'Distribution par type'}
          </h3>
          <div className="space-y-3">
            {analyticsData.typeDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-3 w-3 rounded-full ${isRTL ? 'ml-2' : 'mr-2'} ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm theme-text-primary theme-transition">{item.type}</span>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <div className="text-sm font-medium theme-text-primary theme-transition">{item.count}</div>
                  <div className="text-xs theme-text-secondary theme-transition">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance des abattoirs */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'أداء المجازر' : 'Performance des abattoirs'}
          </h3>
          <div className="space-y-3">
            {analyticsData.abattoirPerformance.map((abattoir, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-2`}>
                  <h4 className="text-sm font-medium theme-text-primary theme-transition">{abattoir.name}</h4>
                  <span className="text-xs theme-text-secondary theme-transition">
                    {abattoir.slaughterCount}/{abattoir.livestockCount}
                  </span>
                </div>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                  <span className="text-xs theme-text-secondary theme-transition">
                    {isRTL ? 'مردود' : 'Rendement'}
                  </span>
                  <span className="text-sm font-medium theme-text-primary theme-transition">
                    {abattoir.averageYield}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abattage quotidien */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'النشاط اليومي' : 'Activité quotidienne'}
          </h3>
          <div className="space-y-3">
            {analyticsData.dailySlaughter.map((day, index) => (
              <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} p-3 bg-gray-50 dark:bg-slate-700 rounded-lg`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <div className="text-sm font-medium theme-text-primary theme-transition">
                    {formatDate(day.date)}
                  </div>
                  <div className="text-xs theme-text-secondary theme-transition">
                    {day.count} {isRTL ? 'رأس' : 'tête(s)'} - {day.weight} kg
                  </div>
                </div>
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'التنبيهات' : 'Alertes'}
          </h3>
          <div className="space-y-3">
            {analyticsData.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`${isRTL ? 'ml-3' : 'mr-3'} mt-0.5`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">{formatDate(alert.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé des tendances */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'ملخص الاتجاهات' : 'Résumé des tendances'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-green-50 dark:bg-green-900/20`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <CheckCircle className={`h-5 w-5 text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {isRTL ? 'مردود ممتاز' : 'Rendement excellent'}
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              {isRTL ? 'متوسط المردود أعلى من 54%' : 'Rendement moyen supérieur à 54%'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-blue-50 dark:bg-blue-900/20`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Activity className={`h-5 w-5 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {isRTL ? 'نشاط مستقر' : 'Activité stable'}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {isRTL ? '3 عمليات ذبح هذا الأسبوع' : '3 abattages cette semaine'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'} bg-yellow-50 dark:bg-yellow-900/20`}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <AlertTriangle className={`h-5 w-5 text-yellow-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {isRTL ? 'انتباه' : 'Attention'}
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              {isRTL ? 'مخزون حي مرتفع في بعض المجازر' : 'Stock vif élevé dans certains abattoirs'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
