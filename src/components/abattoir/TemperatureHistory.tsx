'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Thermometer, 
  Calendar, 
  Filter, 
  Search, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HistoriqueChambreFroide } from '@/lib/api/abattoirService';
import { useHistoriqueAbattoir } from '@/lib/hooks/useChambresFroides';
import { exportHistoriqueChambresFroides, exportDetailedReport } from '@/lib/utils/excelExport';

interface TemperatureHistoryProps {
  abattoirId: number;
  chambreId?: number;
  isRTL: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  abattoirName?: string;
  abattoirLocation?: string;
}

export default function TemperatureHistory({ 
  abattoirId, 
  chambreId, 
  isRTL, 
  onRefresh,
  isLoading = false,
  abattoirName = 'Abattoir',
  abattoirLocation = 'Algérie'
}: TemperatureHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Récupérer les données depuis l'API
  const { data: historiqueData, isLoading: loadingHistorique, error: errorHistorique, refetch } = useHistoriqueAbattoir(abattoirId, { limit: 100 });
  
  // Convertir les données API en format HistoriqueChambreFroide
  const historique: HistoriqueChambreFroide[] = historiqueData || [];

  // Fonction pour obtenir le statut de température avec style professionnel
  const getTemperatureStatus = (temp: number | string) => {
    // Convertir en nombre si c'est une chaîne
    const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp;
    
    if (isNaN(tempNum)) return { 
      status: 'unknown', 
      color: 'gray', 
      bgColor: 'bg-gray-50 dark:bg-gray-900/30', 
      textColor: 'text-gray-900 dark:text-gray-200',
      borderColor: 'border-gray-700 dark:border-gray-700',
      icon: XCircle,
      label: isRTL ? 'غير معروف' : 'Inconnu'
    };
  if (tempNum < -18) return { 
    status: 'excellent', 
    color: 'green', 
    bgColor: 'bg-green-50 dark:bg-green-900/30', 
    textColor: 'text-green-900 dark:text-green-200',
    borderColor: 'border-green-700 dark:border-green-700',
    icon: CheckCircle,
    label: isRTL ? 'ممتاز' : 'Excellent'
  };
  if (tempNum < -15) return { 
    status: 'good', 
    color: 'blue', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/30', 
    textColor: 'text-blue-900 dark:text-blue-200',
    borderColor: 'border-blue-700 dark:border-blue-700',
    icon: CheckCircle,
    label: isRTL ? 'جيد' : 'Bon'
  };
  if (tempNum < -10) return { 
    status: 'warning', 
    color: 'orange', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/30', 
    textColor: 'text-orange-900 dark:text-orange-200',
    borderColor: 'border-orange-700 dark:border-orange-700',
    icon: AlertTriangle,
    label: isRTL ? 'انتباه' : 'Attention'
  };
  return { 
    status: 'critical', 
    color: 'red', 
    bgColor: 'bg-red-50 dark:bg-red-900/30', 
    textColor: 'text-red-900 dark:text-red-200',
    borderColor: 'border-red-700 dark:border-red-700',
    icon: XCircle,
    label: isRTL ? 'حرج' : 'Critique'
  };
  };

  // Filtrage des données
  const filteredHistorique = historique.filter(item => {
    const matchesSearch = !searchTerm || 
      item.chambre_froide_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mesure_par_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(item.date_mesure).toDateString() === new Date(dateFilter).toDateString();
    
    const matchesUser = !userFilter || 
      item.mesure_par_nom?.toLowerCase().includes(userFilter.toLowerCase());
    
    return matchesSearch && matchesDate && matchesUser;
  });

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  // Fonctions d'export Excel
  const handleExportExcel = () => {
    if (!historique || historique.length === 0) {
      alert(isRTL ? 'لا توجد بيانات للتصدير' : 'Aucune donnée à exporter');
      return;
    }

    try {
      exportHistoriqueChambresFroides(historique, {
        abattoirName,
        abattoirLocation,
        exportDate: new Date(),
        isRTL
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert(isRTL ? 'خطأ في التصدير' : 'Erreur lors de l\'export');
    }
  };

  const handleExportDetailedReport = () => {
    if (!historique || historique.length === 0) {
      alert(isRTL ? 'لا توجد بيانات للتصدير' : 'Aucune donnée à exporter');
      return;
    }

    try {
      exportDetailedReport(historique, {
        abattoirName,
        abattoirLocation,
        exportDate: new Date(),
        isRTL
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert(isRTL ? 'خطأ في التصدير' : 'Erreur lors de l\'export');
    }
  };

  // Gestion des états de chargement et d'erreur
  if (loadingHistorique) {
    return (
      <div className="space-y-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className={`ml-3 theme-text-primary theme-transition ${isRTL ? 'mr-3 ml-0' : ''}`}>
              {isRTL ? 'جاري تحميل تاريخ درجات الحرارة...' : 'Chargement de l\'historique des températures...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (errorHistorique) {
    return (
      <div className="space-y-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Thermometer className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'خطأ في تحميل التاريخ' : 'Erreur lors du chargement de l\'historique'}
            </h3>
            <p className="theme-text-secondary theme-transition mb-4">
              {errorHistorique.message || (isRTL ? 'حدث خطأ أثناء تحميل تاريخ درجات الحرارة' : 'Une erreur est survenue lors du chargement de l\'historique des températures')}
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-6`}>
            <h2 className="text-2xl font-bold theme-text-primary theme-transition flex items-center tracking-tight">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Thermometer className={`h-6 w-6 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              </div>
              <span className={isRTL ? 'mr-3' : 'ml-3'}>
                {isRTL ? 'تاريخ درجات الحرارة' : 'Historique des températures'}
              </span>
            </h2>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
              <button 
                onClick={handleExportExcel}
                disabled={loadingHistorique || !historique || historique.length === 0}
                className="px-4 py-2 rounded-lg flex items-center bg-green-600 hover:bg-green-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isRTL ? 'تصدير Excel' : 'Exporter Excel'}
              >
                <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصدير Excel' : 'Export Excel'}
              </button>
              <button 
                onClick={handleExportDetailedReport}
                disabled={loadingHistorique || !historique || historique.length === 0}
                className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isRTL ? 'تقرير مفصل' : 'Rapport détaillé'}
              >
                <FileSpreadsheet className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تقرير مفصل' : 'Rapport détaillé'}
              </button>
              <button 
                onClick={() => {
                  refetch();
                  onRefresh?.();
                }}
                disabled={loadingHistorique}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingHistorique ? (
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                ) : (
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                {isRTL ? 'تحديث' : 'Actualiser'}
              </button>
            </div>
          </div>

        {/* Filtres */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في التاريخ...' : 'Rechercher dans l\'historique...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
            />
          </div>
          
          <div className="relative">
            <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition`}
            />
          </div>
          
          <div className="relative">
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'فلترة بالمستخدم...' : 'Filtrer par utilisateur...'}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
            />
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 hover:shadow-md transition-all duration-200">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Thermometer className={`h-6 w-6 text-blue-800 dark:text-blue-300 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            </div>
            <div className={isRTL ? 'text-right mr-4' : 'text-left ml-4'}>
              <p className="text-3xl font-bold theme-text-primary theme-transition tracking-tight">{historique.length}</p>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي القياسات' : 'Total mesures'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 hover:shadow-md transition-all duration-200">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className={`h-6 w-6 text-green-800 dark:text-green-300 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            </div>
            <div className={isRTL ? 'text-right mr-4' : 'text-left ml-4'}>
              <p className="text-3xl font-bold theme-text-primary theme-transition tracking-tight">
                {historique.filter(h => {
                  const temp = typeof h.temperature === 'number' ? h.temperature : parseFloat(h.temperature);
                  return !isNaN(temp) && temp < -15;
                }).length}
              </p>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'قياسات جيدة' : 'Mesures bonnes'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 hover:shadow-md transition-all duration-200">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <AlertTriangle className={`h-6 w-6 text-orange-800 dark:text-orange-300 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            </div>
            <div className={isRTL ? 'text-right mr-4' : 'text-left ml-4'}>
              <p className="text-3xl font-bold theme-text-primary theme-transition tracking-tight">
                {historique.filter(h => {
                  const temp = typeof h.temperature === 'number' ? h.temperature : parseFloat(h.temperature);
                  return !isNaN(temp) && temp >= -15 && temp < -10;
                }).length}
              </p>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'تحذيرات' : 'Alertes'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 hover:shadow-md transition-all duration-200">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <XCircle className={`h-6 w-6 text-red-800 dark:text-red-300 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            </div>
            <div className={isRTL ? 'text-right mr-4' : 'text-left ml-4'}>
              <p className="text-3xl font-bold theme-text-primary theme-transition tracking-tight">
                {historique.filter(h => {
                  const temp = typeof h.temperature === 'number' ? h.temperature : parseFloat(h.temperature);
                  return !isNaN(temp) && temp >= -10;
                }).length}
              </p>
              <p className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'حالات حرجة' : 'Cas critiques'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau d'historique */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y theme-border-secondary theme-transition">
            <thead className="theme-bg-secondary theme-transition">
              <tr>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'التاريخ والوقت' : 'Date et heure'}
                </th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'الغرفة الباردة' : 'Chambre froide'}
                </th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'درجة الحرارة' : 'Température'}
                </th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'المستخدم' : 'Utilisateur'}
                </th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
              {filteredHistorique.map((item) => {
                const tempStatus = getTemperatureStatus(item.temperature);
                const IconComponent = tempStatus.icon;
                
                return (
                  <tr key={item.id} className="transition-all duration-200 hover:theme-bg-secondary hover:shadow-sm">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-semibold theme-text-primary theme-transition">
                          {formatDate(item.date_mesure)}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition flex items-center mt-1">
                          <Clock className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {formatTime(item.date_mesure)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-semibold theme-text-primary theme-transition">
                          {item.chambre_froide_numero}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {item.abattoir_nom}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${tempStatus.bgColor} ${tempStatus.textColor} ${tempStatus.borderColor} shadow-sm`}>
                        <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {typeof item.temperature === 'number' ? item.temperature.toFixed(1) : parseFloat(item.temperature).toFixed(1)}°C
                        <span className={`ml-2 text-xs font-medium ${tempStatus.textColor}`}>
                          ({tempStatus.label})
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shadow-sm">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                          <div className="text-sm font-semibold theme-text-primary theme-transition">
                            {item.mesure_par_nom}
                          </div>
                          <div className="text-sm theme-text-secondary theme-transition">
                            @{item.mesure_par_username}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        {item.notes ? (
                          <div className="flex items-start">
                            <FileText className={`h-4 w-4 text-gray-400 ${isRTL ? 'ml-2' : 'mr-2'} mt-0.5`} />
                            <span className="text-sm theme-text-secondary theme-transition max-w-xs truncate">
                              {item.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm theme-text-tertiary theme-transition italic">
                            {isRTL ? 'لا توجد ملاحظات' : 'Aucune note'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredHistorique.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Thermometer className="h-10 w-10 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 theme-text-primary theme-transition">
              {isRTL ? 'لا توجد قياسات' : 'Aucune mesure trouvée'}
            </h3>
            <p className="theme-text-secondary theme-transition max-w-md mx-auto leading-relaxed">
              {isRTL ? 'لا توجد قياسات درجة حرارة تطابق المعايير المحددة. جرب تعديل الفلاتر أو إضافة قياسات جديدة.' : 'Aucune mesure de température ne correspond aux critères sélectionnés. Essayez de modifier les filtres ou d\'ajouter de nouvelles mesures.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
