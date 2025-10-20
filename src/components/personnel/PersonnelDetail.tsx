'use client';

import React from 'react';
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Activity,
  FileText,
  Award,
  Clock,
  UserCheck,
  Building2,
  IdCard,
  GraduationCap,
  Briefcase,
  Heart,
  Star
} from 'lucide-react';
import { Personnel } from '@/lib/api/personnelService';

interface PersonnelDetailProps {
  personnel: Personnel;
  isRTL: boolean;
}

export default function PersonnelDetail({ personnel, isRTL }: PersonnelDetailProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIF: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif',
        icon: UserCheck
      },
      INACTIF: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif',
        icon: Clock
      },
      CONGE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في إجازة' : 'En congé',
        icon: Calendar
      },
      SUSPENDU: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'معلق' : 'Suspendu',
        icon: Clock
      },
      DEMISSION: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'استقال' : 'Démission',
        icon: User
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIF;
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
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateAnciennete = (hireDate: string) => {
    const today = new Date();
    const hire = new Date(hireDate);
    const diffTime = Math.abs(today.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      const yearText = isRTL ? 'سنة' : (years > 1 ? 'ans' : 'an');
      const monthText = months > 0 ? ` ${months} ${isRTL ? 'شهر' : 'mois'}` : '';
      return `${years} ${yearText}${monthText}`;
    }
    return `${months} ${isRTL ? 'شهر' : 'mois'}`;
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Responsable') || role.includes('مدير')) return <Shield className="h-5 w-5 text-blue-600" />;
    if (role.includes('Boucher') || role.includes('جزار')) return <Activity className="h-5 w-5 text-green-600" />;
    if (role.includes('Vétérinaire') || role.includes('طبيب')) return <Heart className="h-5 w-5 text-red-600" />;
    if (role.includes('Technicien') || role.includes('فني')) return <Briefcase className="h-5 w-5 text-purple-600" />;
    if (role.includes('Sécurité') || role.includes('أمن')) return <Shield className="h-5 w-5 text-orange-600" />;
    return <User className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-6`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'المعلومات الشخصية' : 'Informations personnelles'}
          </h2>
          {getStatusBadge(personnel.statut)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo et nom */}
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            <div className={isRTL ? 'mr-6 text-right' : 'ml-6'}>
              <h3 className="text-2xl font-bold theme-text-primary theme-transition">
                {personnel.prenom} {personnel.nom}
              </h3>
              <p className="text-lg theme-text-secondary theme-transition">
                {personnel.role_nom}
              </p>
              <p className="text-sm theme-text-tertiary theme-transition">
                {personnel.numero_employe}
              </p>
            </div>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'تاريخ الميلاد' : 'Date de naissance'}
                </p>
                <p className="font-medium theme-text-primary theme-transition">
                  {formatDate(personnel.date_naissance)} ({calculateAge(personnel.date_naissance)} {isRTL ? 'سنة' : 'ans'})
                </p>
              </div>
            </div>
            
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'مكان الميلاد' : 'Lieu de naissance'}
                </p>
                <p className="font-medium theme-text-primary theme-transition">
                  {personnel.lieu_naissance}
                </p>
              </div>
            </div>

            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'الجنس' : 'Sexe'}
                </p>
                <p className="font-medium theme-text-primary theme-transition">
                  {personnel.sexe === 'M' ? (isRTL ? 'ذكر' : 'Masculin') : (isRTL ? 'أنثى' : 'Féminin')}
                </p>
              </div>
            </div>

            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'الجنسية' : 'Nationalité'}
                </p>
                <p className="font-medium theme-text-primary theme-transition">
                  {personnel.nationalite}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-6">
          {isRTL ? 'المعلومات المهنية' : 'Informations professionnelles'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              {getRoleIcon(personnel.role_nom || '')}
              <span className={`text-sm font-medium theme-text-secondary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {isRTL ? 'المنصب' : 'Poste'}
              </span>
            </div>
            <p className="text-lg font-semibold theme-text-primary theme-transition">
              {personnel.role_nom}
            </p>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Building2 className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'المجزر' : 'Abattoir'}
              </span>
            </div>
            <p className="text-lg font-semibold theme-text-primary theme-transition">
              {personnel.abattoir_nom}
            </p>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'تاريخ التوظيف' : 'Date d\'embauche'}
              </span>
            </div>
            <p className="text-lg font-semibold theme-text-primary theme-transition">
              {formatDate(personnel.date_embauche)}
            </p>
            <p className="text-sm theme-text-tertiary theme-transition">
              {isRTL ? 'الأقدمية' : 'Ancienneté'}: {calculateAnciennete(personnel.date_embauche)}
            </p>
          </div>
        </div>
      </div>

      {/* Contact et adresse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'معلومات الاتصال' : 'Contact'}
          </h3>
          
          <div className="space-y-4">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition">
                  {isRTL ? 'الهاتف' : 'Téléphone'}
                </p>
                <a href={`tel:${personnel.telephone}`} className="font-medium theme-text-primary hover:text-primary-600 theme-transition">
                  {personnel.telephone}
                </a>
              </div>
            </div>
            
            {personnel.telephone_urgence && (
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className={`h-5 w-5 text-orange-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm theme-text-secondary theme-transition">
                    {isRTL ? 'هاتف الطوارئ' : 'Téléphone d\'urgence'}
                  </p>
                  <a href={`tel:${personnel.telephone_urgence}`} className="font-medium theme-text-primary hover:text-primary-600 theme-transition">
                    {personnel.telephone_urgence}
                  </a>
                </div>
              </div>
            )}
            
            {personnel.email && (
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm theme-text-secondary theme-transition">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <a href={`mailto:${personnel.email}`} className="font-medium theme-text-primary hover:text-primary-600 theme-transition">
                    {personnel.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'العنوان' : 'Adresse'}
          </h3>
          
          <div className="space-y-4">
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className={`h-5 w-5 text-primary-600 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm theme-text-secondary theme-transition mb-1">
                  {isRTL ? 'العنوان الكامل' : 'Adresse complète'}
                </p>
                <p className="font-medium theme-text-primary theme-transition">
                  {personnel.adresse}
                </p>
                <p className="text-sm theme-text-tertiary theme-transition">
                  {personnel.commune}, {personnel.wilaya}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations d'identité */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h2 className="text-lg font-semibold theme-text-primary theme-transition mb-6">
          {isRTL ? 'معلومات الهوية' : 'Informations d\'identité'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <IdCard className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'رقم بطاقة الهوية' : 'Numéro de carte d\'identité'}
              </span>
            </div>
            <p className="font-medium theme-text-primary theme-transition">
              {personnel.numero_carte_identite}
            </p>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <Calendar className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'تاريخ الإصدار' : 'Date d\'émission'}
              </span>
            </div>
            <p className="font-medium theme-text-primary theme-transition">
              {formatDate(personnel.date_emission_carte)}
            </p>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <MapPin className={`h-5 w-5 text-primary-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-sm font-medium theme-text-secondary theme-transition">
                {isRTL ? 'مكان الإصدار' : 'Lieu d\'émission'}
              </span>
            </div>
            <p className="font-medium theme-text-primary theme-transition">
              {personnel.lieu_emission_carte}
            </p>
          </div>
        </div>
      </div>

      {/* Compétences et formations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compétences */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'المهارات' : 'Compétences'}
          </h3>
          
          <div className="space-y-2">
            {personnel.competences && personnel.competences.length > 0 ? (
              personnel.competences.map((competence, index) => (
                <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Star className={`h-4 w-4 text-yellow-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-sm theme-text-primary theme-transition">{competence}</span>
                </div>
              ))
            ) : (
              <p className="text-sm theme-text-tertiary theme-transition">
                {isRTL ? 'لا توجد مهارات مسجلة' : 'Aucune compétence enregistrée'}
              </p>
            )}
          </div>
        </div>

        {/* Formations */}
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'التدريبات' : 'Formations'}
          </h3>
          
          <div className="space-y-2">
            {personnel.formations && personnel.formations.length > 0 ? (
              personnel.formations.map((formation, index) => (
                <div key={index} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <GraduationCap className={`h-4 w-4 text-blue-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-sm theme-text-primary theme-transition">{formation}</span>
                </div>
              ))
            ) : (
              <p className="text-sm theme-text-tertiary theme-transition">
                {isRTL ? 'لا توجد تدريبات مسجلة' : 'Aucune formation enregistrée'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {personnel.notes && (
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
            {isRTL ? 'ملاحظات' : 'Notes'}
          </h3>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="theme-text-primary theme-transition whitespace-pre-wrap">
              {personnel.notes}
            </p>
          </div>
        </div>
      )}

      {/* Informations système */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <h3 className="text-lg font-semibold theme-text-primary theme-transition mb-4">
          {isRTL ? 'معلومات النظام' : 'Informations système'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'تاريخ الإنشاء' : 'Date de création'}
            </p>
            <p className="font-medium theme-text-primary theme-transition">
              {formatDate(personnel.created_at)}
            </p>
          </div>
          
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm theme-text-secondary theme-transition mb-1">
              {isRTL ? 'آخر تحديث' : 'Dernière mise à jour'}
            </p>
            <p className="font-medium theme-text-primary theme-transition">
              {formatDate(personnel.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
