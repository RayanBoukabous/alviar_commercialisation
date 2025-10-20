'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Thermometer, 
  Building2,
  Calendar,
  Clock,
  User,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useDjangoAuth';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useChambresFroides, useHistoriqueTemperatures, useCreateTemperatureMeasurement } from '@/lib/hooks/useChambresFroides';
import { ChambreFroide, HistoriqueChambreFroide } from '@/lib/api/chambreFroideService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    bgColor: 'bg-green-200 dark:bg-green-900/30', 
    textColor: 'text-green-900 dark:text-green-200',
    borderColor: 'border-green-700 dark:border-green-700',
    icon: CheckCircle,
    label: 'Excellent'
  };
  if (tempNum < -15) return { 
    status: 'good', 
    color: 'blue', 
    bgColor: 'bg-blue-200 dark:bg-blue-900/30', 
    textColor: 'text-blue-900 dark:text-blue-200',
    borderColor: 'border-blue-700 dark:border-blue-700',
    icon: CheckCircle,
    label: 'Bon'
  };
  if (tempNum < -10) return { 
    status: 'warning', 
    color: 'orange', 
    bgColor: 'bg-orange-200 dark:bg-orange-900/30', 
    textColor: 'text-orange-900 dark:text-orange-200',
    borderColor: 'border-orange-700 dark:border-orange-700',
    icon: AlertTriangle,
    label: 'Attention'
  };
  return { 
    status: 'critical', 
    color: 'red', 
    bgColor: 'bg-red-200 dark:bg-red-900/30', 
    textColor: 'text-red-900 dark:text-red-200',
    borderColor: 'border-red-700 dark:border-red-700',
    icon: XCircle,
    label: 'Critique'
  };
};

// Composant pour ajouter une mesure de température
const AddTemperatureForm: React.FC<{
  chambreId: number;
  isRTL: boolean;
  onSuccess: () => void;
}> = ({ chambreId, isRTL, onSuccess }) => {
  const [temperature, setTemperature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTemperatureMutation = useCreateTemperatureMeasurement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperature) return;

    setIsSubmitting(true);
    try {
      await createTemperatureMutation.mutateAsync({
        chambre_froide: chambreId,
        temperature: parseFloat(temperature),
      });
      onSuccess();
      setTemperature('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la mesure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
      <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
        {isRTL ? 'إضافة قياس درجة حرارة' : 'Ajouter une mesure de température'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg theme-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {isRTL ? 'إضافة القياس' : 'Ajouter la mesure'}
        </button>
      </form>
    </div>
  );
};

export default function ChambreFroideDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { t, loading: translationLoading, currentLocale } = useLanguage();
  const router = useRouter();
  const params = useParams();
  
  // Détection RTL
  const isRTL = currentLocale === 'ar';
  
  // Récupérer les IDs depuis les paramètres
  const abattoirId = params.id ? parseInt(params.id as string) : 0;
  const chambreId = params.chambreId ? parseInt(params.chambreId as string) : 0;
  
  // Hooks pour récupérer les données
  const { data: chambres, isLoading: loadingChambres, refetch: refetchChambres } = useChambresFroides(abattoirId);
  const { data: historique, isLoading: loadingHistorique, refetch: refetchHistorique } = useHistoriqueTemperatures(chambreId, { limit: 50 });
  
  // Trouver la chambre spécifique
  const chambre = chambres?.find(c => c.id === chambreId);
  
  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!historique) {
      return {
        totalMesures: 0,
        temperatureMoyenne: 0,
        temperatureMin: 0,
        temperatureMax: 0,
        alertesTemperature: 0,
      };
    }

    const temperatures = historique.map(h => typeof h.temperature === 'string' ? parseFloat(h.temperature) : h.temperature).filter(t => !isNaN(t));
    const alertes = temperatures.filter(t => t > -10).length;

    return {
      totalMesures: historique.length,
      temperatureMoyenne: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
      temperatureMin: temperatures.length > 0 ? Math.min(...temperatures) : 0,
      temperatureMax: temperatures.length > 0 ? Math.max(...temperatures) : 0,
      alertesTemperature: alertes,
    };
  }, [historique]);

  const handleRefresh = () => {
    refetchChambres();
    refetchHistorique();
  };

  if (isLoading || translationLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (loadingChambres || !chambre) {
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="theme-text-secondary theme-transition">
                {isRTL ? 'جاري التحميل...' : 'Chargement...'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const tempStatus = getTemperatureStatus(chambre.derniere_temperature);
  const IconComponent = tempStatus.icon;

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
                    <Thermometer className={`h-7 w-7 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {isRTL ? `غرفة باردة ${chambre.numero}` : `Chambre froide ${chambre.numero}`}
                  </h1>
                  <p className="mt-1 theme-text-secondary theme-transition">
                    {chambre.abattoir_nom}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تحديث' : 'Actualiser'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Informations de la chambre */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations générales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Détails de la chambre */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold theme-text-primary theme-transition mb-4">
                  {isRTL ? 'معلومات الغرفة' : 'Informations de la chambre'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'رقم الغرفة' : 'Numéro de la chambre'}
                    </p>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {chambre.numero}
                    </p>
                  </div>
                  
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'الأبعاد' : 'Dimensions'}
                    </p>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {chambre.dimensions_m3} m³
                    </p>
                  </div>
                  
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'العدد الإجمالي للقياسات' : 'Total des mesures'}
                    </p>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {chambre.nombre_mesures}
                    </p>
                  </div>
                  
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium theme-text-secondary theme-transition mb-1">
                      {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
                    </p>
                    <p className="text-lg font-semibold theme-text-primary theme-transition">
                      {format(new Date(chambre.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Température actuelle */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h2 className="text-xl font-semibold theme-text-primary theme-transition mb-4">
                  {isRTL ? 'درجة الحرارة الحالية' : 'Température actuelle'}
                </h2>
                
                <div className="flex items-center justify-center">
                  <div className={`p-8 rounded-full border-2 ${tempStatus.bgColor} ${tempStatus.borderColor}`}>
                    <div className="text-center">
                      <IconComponent className={`h-16 w-16 mx-auto mb-4 ${tempStatus.textColor}`} />
                      <p className={`text-4xl font-bold ${tempStatus.textColor}`}>
                        {typeof chambre.derniere_temperature === 'number' ? chambre.derniere_temperature.toFixed(1) : chambre.derniere_temperature}°C
                      </p>
                      <p className={`text-lg font-medium ${tempStatus.textColor} mt-2`}>
                        {tempStatus.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-6">
              {/* Statistiques générales */}
              <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
                <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
                  {isRTL ? 'الإحصائيات' : 'Statistiques'}
                </h3>
                
                <div className="space-y-4">
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                    <span className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'متوسط الحرارة' : 'Temp. moyenne'}
                    </span>
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {stats.temperatureMoyenne.toFixed(1)}°C
                    </span>
                  </div>
                  
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                    <span className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'أدنى حرارة' : 'Temp. min'}
                    </span>
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {stats.temperatureMin.toFixed(1)}°C
                    </span>
                  </div>
                  
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                    <span className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'أعلى حرارة' : 'Temp. max'}
                    </span>
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {stats.temperatureMax.toFixed(1)}°C
                    </span>
                  </div>
                  
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                    <span className="text-sm theme-text-secondary theme-transition">
                      {isRTL ? 'تنبيهات' : 'Alertes'}
                    </span>
                    <span className="text-sm font-medium theme-text-primary theme-transition">
                      {stats.alertesTemperature}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulaire d'ajout de mesure */}
              <AddTemperatureForm 
                chambreId={chambreId} 
                isRTL={isRTL} 
                onSuccess={handleRefresh}
              />
            </div>
          </div>

          {/* Historique des températures */}
          <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
            <h2 className="text-xl font-semibold theme-text-primary theme-transition mb-6">
              {isRTL ? 'تاريخ درجات الحرارة' : 'Historique des températures'}
            </h2>
            
            {loadingHistorique ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'جاري التحميل...' : 'Chargement...'}
                </p>
              </div>
            ) : historique && historique.length > 0 ? (
              <div className="space-y-3">
                {historique.map((mesure) => {
                  const mesureTempStatus = getTemperatureStatus(mesure.temperature);
                  const MesureIconComponent = mesureTempStatus.icon;

                  return (
                    <div
                      key={mesure.id}
                      className={`p-4 rounded-lg border ${mesureTempStatus.bgColor} ${mesureTempStatus.borderColor} theme-transition`}
                    >
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
                          <div className={`p-2 rounded-full ${mesureTempStatus.bgColor} ${mesureTempStatus.borderColor} border`}>
                            <MesureIconComponent className={`h-5 w-5 ${mesureTempStatus.textColor}`} />
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <p className={`text-xl font-bold ${mesureTempStatus.textColor}`}>
                              {typeof mesure.temperature === 'number' ? mesure.temperature.toFixed(1) : mesure.temperature}°C
                            </p>
                            <p className={`text-sm font-medium ${mesureTempStatus.textColor}`}>
                              {mesureTempStatus.label}
                            </p>
                          </div>
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <p className="text-sm font-medium theme-text-primary theme-transition">
                            {format(new Date(mesure.date_mesure), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                          <p className="text-sm theme-text-secondary theme-transition">
                            {format(new Date(mesure.date_mesure), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Thermometer className="h-12 w-12 mx-auto mb-4 theme-text-secondary" />
                <p className="theme-text-secondary theme-transition">
                  {isRTL ? 'لا توجد قياسات متاحة' : 'Aucune mesure disponible'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
