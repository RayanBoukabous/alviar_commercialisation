'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  Activity,
  RefreshCw,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useAllPersonnelByAbattoir } from '@/lib/hooks/usePersonnel';
import { Personnel } from '@/lib/api/personnelService';
import { useRouter } from 'next/navigation';

interface StaffManagementProps {
  abattoir: any;
  isRTL: boolean;
}

export default function StaffManagement({ abattoir, isRTL }: StaffManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const router = useRouter();

  // Récupérer tout le personnel de l'abattoir depuis l'API
  const { data: personnelData, isLoading, error, refetch } = useAllPersonnelByAbattoir(abattoir.id);

  // Convertir les données API en format StaffMember
  const staff: Personnel[] = personnelData?.results || [];

  function getDepartmentFromRole(role: string): string {
    if (role.includes('Responsable') || role.includes('مدير')) return 'Direction';
    if (role.includes('Boucher') || role.includes('جزار')) return 'Production';
    if (role.includes('Vétérinaire') || role.includes('طبيب')) return 'Santé';
    if (role.includes('Technicien') || role.includes('فني')) return 'Maintenance';
    if (role.includes('Sécurité') || role.includes('أمن')) return 'Sécurité';
    if (role.includes('Nettoyage') || role.includes('تنظيف')) return 'Entretien';
    return 'Général';
  }

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.prenom} ${member.nom}`.toLowerCase();
    const roleName = member.role_nom || '';
    const department = getDepartmentFromRole(roleName);
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || roleName === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || member.statut === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIF: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif'
      },
      INACTIF: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif'
      },
      CONGE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في إجازة' : 'En congé'
      },
      SUSPENDU: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        label: isRTL ? 'معلق' : 'Suspendu'
      },
      DEMISSION: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'استقال' : 'Démission'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIF;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Responsable') || role.includes('مدير')) return <Shield className="h-4 w-4 text-blue-600" />;
    if (role.includes('Boucher') || role.includes('جزار')) return <Activity className="h-4 w-4 text-green-600" />;
    if (role.includes('Vétérinaire') || role.includes('طبيب')) return <User className="h-4 w-4 text-red-600" />;
    if (role.includes('Technicien') || role.includes('فني')) return <Activity className="h-4 w-4 text-purple-600" />;
    if (role.includes('Sécurité') || role.includes('أمن')) return <Shield className="h-4 w-4 text-orange-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(staff.map(member => getDepartmentFromRole(member.role_nom || '')))];
    return departments.sort();
  };

  const getRoles = () => {
    const roles = [...new Set(staff.map(member => member.role_nom).filter(Boolean))];
    return roles.sort();
  };

  // Gestion du loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className={`ml-3 theme-text-primary theme-transition ${isRTL ? 'mr-3 ml-0' : ''}`}>
              {isRTL ? 'جاري تحميل الموظفين...' : 'Chargement du personnel...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Gestion de l'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'خطأ في تحميل الموظفين' : 'Erreur lors du chargement du personnel'}
            </h3>
            <p className="theme-text-secondary theme-transition mb-4">
              {error.message || (isRTL ? 'حدث خطأ أثناء تحميل بيانات الموظفين' : 'Une erreur est survenue lors du chargement des données du personnel')}
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
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إدارة الموظفين' : 'Gestion du personnel'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button 
              onClick={() => refetch()}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              ) : (
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              )}
              {isRTL ? 'تحديث' : 'Actualiser'}
            </button>
            <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إضافة موظف' : 'Ajouter un employé'}
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-tertiary theme-transition`} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في الموظفين...' : 'Rechercher un employé...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition placeholder-gray-500 dark:placeholder-slate-400`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الأدوار' : 'Tous les rôles'}</option>
            {getRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg-elevated theme-border-primary theme-text-primary theme-transition"
          >
            <option value="ALL">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
            <option value="ACTIF">{isRTL ? 'نشط' : 'Actif'}</option>
            <option value="INACTIF">{isRTL ? 'غير نشط' : 'Inactif'}</option>
            <option value="CONGE">{isRTL ? 'في إجازة' : 'En congé'}</option>
            <option value="SUSPENDU">{isRTL ? 'معلق' : 'Suspendu'}</option>
            <option value="DEMISSION">{isRTL ? 'استقال' : 'Démission'}</option>
          </select>
        </div>
      </div>

      {/* Statistiques du personnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <User className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">{staff.length}</p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'إجمالي الموظفين' : 'Total employés'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <Activity className={`h-8 w-8 text-green-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {staff.filter(m => m.statut === 'ACTIF').length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'موظفين نشطين' : 'Employés actifs'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <Shield className={`h-8 w-8 text-purple-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {getDepartments().length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'أقسام' : 'Départements'}
              </p>
            </div>
          </div>
        </div>

        <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
            <Calendar className={`h-8 w-8 text-orange-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-2xl font-bold theme-text-primary theme-transition">
                {staff.filter(m => new Date(m.date_embauche) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm theme-text-secondary theme-transition">
                {isRTL ? 'موظفين جدد' : 'Nouveaux employés'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau du personnel */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y theme-border-secondary theme-transition">
            <thead className="theme-bg-secondary theme-transition">
              <tr>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'الموظف' : 'Employé'}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'الدور' : 'Rôle'}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'القسم' : 'Département'}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'الحالة' : 'Statut'}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'تاريخ التوظيف' : 'Date d\'embauche'}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium uppercase tracking-wider theme-text-tertiary theme-transition`}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y theme-bg-elevated theme-border-secondary theme-transition">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="transition-colors hover:theme-bg-secondary">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
                        <div className="text-sm font-medium theme-text-primary theme-transition">
                          {member.prenom} {member.nom}
                        </div>
                        <div className="text-sm theme-text-secondary theme-transition">
                          {member.email || member.telephone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getRoleIcon(member.role_nom || '')}
                      <span className={`text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                        {member.role_nom || 'Non défini'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getDepartmentFromRole(member.role_nom || '')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                    {formatDate(member.date_embauche)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                      <button 
                        onClick={() => router.push(`/dashboard/personnel/${member.id}`)}
                        className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
                        title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
                        title={isRTL ? 'تعديل الموظف' : 'Modifier l\'employé'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 theme-text-tertiary theme-transition" />
            <h3 className="text-lg font-medium mb-2 theme-text-primary theme-transition">
              {isRTL ? 'لم يتم العثور على موظفين' : 'Aucun employé trouvé'}
            </h3>
            <p className="theme-text-secondary theme-transition">
              {isRTL ? 'ابدأ بإضافة موظفين جدد' : 'Commencez par ajouter de nouveaux employés'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

