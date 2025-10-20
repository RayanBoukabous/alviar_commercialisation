'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Thermometer, 
  Plus, 
  RefreshCw, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useChambresFroides, useHistoriqueAbattoir, useCreateTemperatureMeasurement, useCreateChambreFroide } from '@/lib/hooks/useChambresFroides';
import { ChambreFroide, HistoriqueChambreFroide } from '@/lib/api/chambreFroideService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TemperatureHistory from './TemperatureHistory';

interface ChambresFroidesManagementProps {
  abattoirId: number;
  isRTL: boolean;
}

// Interface pour les statistiques des chambres froides
interface ChambreFroideStats {
  totalChambres: number;
  chambresActives: number;
  temperatureMoyenne: number;
  temperatureMin: number;
  temperatureMax: number;
  alertesTemperature: number;
}

// Composant pour afficher les statistiques des chambres froides (simplifié)
const ChambreFroideStatsCards: React.FC<{
  stats: ChambreFroideStats;
  isRTL: boolean;
}> = ({ stats, isRTL }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total des chambres froides */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'إجمالي الغرف' : 'Total chambres'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {stats.totalChambres}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Thermometer className="h-6 w-6 text-blue-800 dark:text-blue-300" />
          </div>
        </div>
      </div>

      {/* Température moyenne */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'متوسط الحرارة' : 'Temp. moyenne'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {stats.temperatureMoyenne.toFixed(1)}°C
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-800 dark:text-purple-300" />
          </div>
        </div>
      </div>

      {/* Alertes température */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-medium theme-text-secondary theme-transition">
              {isRTL ? 'تنبيهات' : 'Alertes'}
            </p>
            <p className="text-2xl font-bold theme-text-primary theme-transition">
              {stats.alertesTemperature}
            </p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <AlertTriangle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction pour obtenir le statut de température avec style professionnel et accessible
const getTemperatureStatus = (temp: number | string | null) => {
  if (temp === null || temp === undefined || temp === '') return { 
    status: 'unknown', 
    color: 'gray', 
    bgColor: 'bg-gray-200 dark:bg-gray-800', 
    textColor: 'text-gray-900 dark:text-gray-300',
    borderColor: 'border-gray-600 dark:border-gray-600',
    icon: XCircle,
    label: 'N/A'
  };
  
  const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp;
  
  if (isNaN(tempNum)) return { 
    status: 'unknown', 
    color: 'gray', 
    bgColor: 'bg-gray-200 dark:bg-gray-800', 
    textColor: 'text-gray-900 dark:text-gray-300',
    borderColor: 'border-gray-600 dark:border-gray-600',
    icon: XCircle,
    label: 'N/A'
  };
  
  if (tempNum < -18) return { 
    status: 'excellent', 
    color: 'green', 
    bgColor: 'bg-green-50 dark:bg-green-900/30', 
    textColor: 'text-green-900 dark:text-green-200',
    borderColor: 'border-green-700 dark:border-green-700',
    icon: CheckCircle,
    label: 'Excellent'
  };
  if (tempNum < -15) return { 
    status: 'good', 
    color: 'blue', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/30', 
    textColor: 'text-blue-900 dark:text-blue-200',
    borderColor: 'border-blue-700 dark:border-blue-700',
    icon: CheckCircle,
    label: 'Bon'
  };
  if (tempNum < -10) return { 
    status: 'warning', 
    color: 'orange', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/30', 
    textColor: 'text-orange-900 dark:text-orange-200',
    borderColor: 'border-orange-700 dark:border-orange-700',
    icon: AlertTriangle,
    label: 'Attention'
  };
  return { 
    status: 'critical', 
    color: 'red', 
    bgColor: 'bg-red-50 dark:bg-red-900/30', 
    textColor: 'text-red-900 dark:text-red-200',
    borderColor: 'border-red-700 dark:border-red-700',
    icon: XCircle,
    label: 'Critique'
  };
};


// Modal pour ajouter une nouvelle chambre froide
const AddChambreFroideModal: React.FC<{
  abattoirId: number;
  isRTL: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ abattoirId, isRTL, onClose, onSuccess }) => {
  const [numero, setNumero] = useState('');
  const [dimensions, setDimensions] = useState('');
  const createChambreMutation = useCreateChambreFroide();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !dimensions) return;

    try {
      await createChambreMutation.mutateAsync({
        abattoir: abattoirId,
        numero: numero.trim(),
        dimensions_m3: parseFloat(dimensions),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la chambre froide:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated rounded-lg shadow-xl border theme-border-primary theme-transition max-w-md w-full">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} p-6 border-b theme-border-primary`}>
          <h2 className="text-xl font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إضافة غرفة باردة' : 'Ajouter une chambre froide'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <XCircle className="h-5 w-5 theme-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'رقم الغرفة' : 'Numéro de la chambre'}
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              placeholder={isRTL ? 'مثال: CF-001' : 'Ex: CF-001'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'الأبعاد (م³)' : 'Dimensions (m³)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              placeholder="0.00"
              required
            />
          </div>

          <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} pt-4`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={createChambreMutation.isPending}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createChambreMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin inline" />
              ) : (
                isRTL ? 'إضافة' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pour ajouter une mesure de température
const AddTemperatureModal: React.FC<{
  chambres: ChambreFroide[];
  isRTL: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ chambres, isRTL, onClose, onSuccess }) => {
  const [selectedChambre, setSelectedChambre] = useState<number | ''>('');
  const [temperature, setTemperature] = useState('');
  const createTemperatureMutation = useCreateTemperatureMeasurement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChambre || !temperature) return;

    try {
      await createTemperatureMutation.mutateAsync({
        chambre_froide: selectedChambre as number,
        temperature: parseFloat(temperature),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la mesure:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-elevated rounded-lg shadow-xl border theme-border-primary theme-transition max-w-md w-full">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} p-6 border-b theme-border-primary`}>
          <h2 className="text-xl font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إضافة قياس درجة حرارة' : 'Ajouter une mesure de température'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-secondary rounded-lg theme-transition"
          >
            <XCircle className="h-5 w-5 theme-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'الغرفة الباردة' : 'Chambre froide'}
            </label>
            <select
              value={selectedChambre}
              onChange={(e) => setSelectedChambre(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              required
            >
              <option value="">{isRTL ? 'اختر الغرفة' : 'Sélectionner une chambre'}</option>
              {chambres.map((chambre) => (
                <option key={chambre.id} value={chambre.id}>
                  {chambre.numero} ({chambre.dimensions_m3} m³)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary theme-transition mb-2">
              {isRTL ? 'درجة الحرارة (°C)' : 'Température (°C)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
              placeholder="-18.0"
              required
            />
          </div>

          <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} pt-4`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={createTemperatureMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTemperatureMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin inline" />
              ) : (
                isRTL ? 'إضافة' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant principal
const ChambresFroidesManagement: React.FC<ChambresFroidesManagementProps> = ({ abattoirId, isRTL }) => {
  const router = useRouter();
  const [showAddChambre, setShowAddChambre] = useState(false);
  const [showAddTemperature, setShowAddTemperature] = useState(false);
  const [showTemperatureHistory, setShowTemperatureHistory] = useState(false);

  // Hooks pour récupérer les données
  const { data: chambres, isLoading: loadingChambres, error: errorChambres, refetch: refetchChambres } = useChambresFroides(abattoirId);
  const { data: historique, isLoading: loadingHistorique } = useHistoriqueAbattoir(abattoirId, { limit: 100 });

  // Calculer les statistiques
  const stats: ChambreFroideStats = React.useMemo(() => {
    if (!chambres || !historique) {
      return {
        totalChambres: 0,
        chambresActives: 0,
        temperatureMoyenne: 0,
        temperatureMin: 0,
        temperatureMax: 0,
        alertesTemperature: 0,
      };
    }

    const temperatures = historique.map(h => h.temperature);
    const chambresAvecMesures = chambres.filter(c => c.nombre_mesures > 0);
    const alertes = historique.filter(h => h.temperature > -10).length;

    return {
      totalChambres: chambres.length,
      chambresActives: chambresAvecMesures.length,
      temperatureMoyenne: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
      temperatureMin: temperatures.length > 0 ? Math.min(...temperatures) : 0,
      temperatureMax: temperatures.length > 0 ? Math.max(...temperatures) : 0,
      alertesTemperature: alertes,
    };
  }, [chambres, historique]);

  const handleViewDetails = (chambre: ChambreFroide) => {
    router.push(`/dashboard/abattoirs/${abattoirId}/chambres-froides/${chambre.id}`);
  };

  if (loadingChambres) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (errorChambres) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
          {isRTL ? 'خطأ' : 'Erreur'}
        </h3>
        <p className="theme-text-secondary theme-transition">
          {isRTL ? 'فشل في تحميل بيانات الغرف الباردة' : 'Erreur lors du chargement des chambres froides'}
        </p>
        <button
          onClick={() => refetchChambres()}
          className="mt-4 px-4 py-2 theme-bg-primary text-white rounded-lg hover:theme-bg-primary-dark theme-transition"
        >
          <RefreshCw className={`h-4 w-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'إعادة المحاولة' : 'Réessayer'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <ChambreFroideStatsCards stats={stats} isRTL={isRTL} />

      {/* Actions */}
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
        <h2 className="text-xl font-semibold theme-text-primary theme-transition">
          {isRTL ? 'الغرف الباردة' : 'Chambres froides'}
        </h2>
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
          <button
            onClick={() => refetchChambres()}
            className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تحديث' : 'Actualiser'}
          </button>
          <button
            onClick={() => setShowTemperatureHistory(!showTemperatureHistory)}
            className={`px-4 py-2 rounded-lg flex items-center theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              showTemperatureHistory 
                ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500' 
                : 'theme-bg-elevated hover:theme-bg-secondary theme-text-primary border theme-border-primary hover:theme-border-secondary focus:ring-primary-500'
            }`}
          >
            <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? (showTemperatureHistory ? 'إخفاء التاريخ' : 'عرض التاريخ') : (showTemperatureHistory ? 'Masquer historique' : 'Voir historique')}
          </button>
          <button
            onClick={() => setShowAddTemperature(true)}
            className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Thermometer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة قياس' : 'Ajouter mesure'}
          </button>
          <button
            onClick={() => setShowAddChambre(true)}
            className="px-4 py-2 rounded-lg flex items-center bg-green-600 hover:bg-green-700 text-white theme-transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة غرفة' : 'Ajouter chambre'}
          </button>
        </div>
      </div>

      {/* Tableau des chambres froides */}
      {chambres && chambres.length > 0 ? (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="theme-bg-secondary border-b theme-border-primary">
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'رقم الغرفة' : 'Numéro'}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الأبعاد' : 'Dimensions'}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'درجة الحرارة الحالية' : 'Température actuelle'}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'آخر قياس' : 'Dernière mesure'}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'عدد القياسات' : 'Mesures'}
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border-primary">
                {chambres.map((chambre) => {
                  const chambreHistorique = historique?.filter(h => h.chambre_froide === chambre.id) || [];
                  const tempStatus = getTemperatureStatus(chambre.derniere_temperature);
                  const IconComponent = tempStatus.icon;
                  
                  return (
                    <tr key={chambre.id} className="hover:theme-bg-secondary theme-transition">
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center">
                          <Thermometer className={`h-4 w-4 text-blue-900 dark:text-blue-300 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {chambre.numero}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                        {chambre.dimensions_m3} m³
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        {chambre.derniere_temperature ? (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tempStatus.bgColor} ${tempStatus.textColor} ${tempStatus.borderColor}`}>
                            <IconComponent className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {typeof chambre.derniere_temperature === 'number' ? chambre.derniere_temperature.toFixed(1) : chambre.derniere_temperature}°C
                            <span className={`ml-1 text-xs ${tempStatus.textColor}`}>
                              ({tempStatus.label})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-600 dark:border-gray-600">
                            <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            N/A
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                        {chambreHistorique.length > 0 ? format(new Date(chambreHistorique[0].date_mesure), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-700 dark:border-blue-700">
                          {chambre.nombre_mesures}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        <button
                          onClick={() => handleViewDetails(chambre)}
                          className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Thermometer className="h-12 w-12 mx-auto mb-4 theme-text-secondary" />
          <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
            {isRTL ? 'لا توجد غرف باردة' : 'Aucune chambre froide'}
          </h3>
          <p className="theme-text-secondary theme-transition">
            {isRTL ? 'لم يتم العثور على غرف باردة لهذا المجزر' : 'Aucune chambre froide trouvée pour cet abattoir'}
          </p>
        </div>
      )}

      {/* Historique des températures */}
      {showTemperatureHistory && (
        <TemperatureHistory
          abattoirId={abattoirId}
          isRTL={isRTL}
          onRefresh={() => {
            refetchChambres();
          }}
          isLoading={loadingHistorique}
        />
      )}

      {/* Modal d'ajout de chambre froide */}
      {showAddChambre && (
        <AddChambreFroideModal
          abattoirId={abattoirId}
          isRTL={isRTL}
          onClose={() => setShowAddChambre(false)}
          onSuccess={() => refetchChambres()}
        />
      )}

      {/* Modal d'ajout de mesure de température */}
      {showAddTemperature && chambres && (
        <AddTemperatureModal
          chambres={chambres}
          isRTL={isRTL}
          onClose={() => setShowAddTemperature(false)}
          onSuccess={() => refetchChambres()}
        />
      )}
    </div>
  );
};

export default ChambresFroidesManagement;
