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
  UserPlus
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  avatar?: string;
}

interface StaffManagementProps {
  abattoir: any;
  isRTL: boolean;
}

export default function StaffManagement({ abattoir, isRTL }: StaffManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Générer le personnel à partir des données de l'abattoir
  const staff: StaffMember[] = abattoir.staff.map((member: any, index: number) => ({
    id: `STAFF-${index + 1}`,
    name: member.name,
    role: member.role,
    phone: member.phone,
    email: member.email,
    department: getDepartmentFromRole(member.role),
    hireDate: '2023-01-15T08:30:00Z',
    status: 'ACTIVE' as const
  }));

  function getDepartmentFromRole(role: string): string {
    if (role.includes('Directeur') || role.includes('مدير')) return 'Direction';
    if (role.includes('Production') || role.includes('إنتاج')) return 'Production';
    if (role.includes('Vétérinaire') || role.includes('طبيب')) return 'Santé';
    if (role.includes('Maintenance') || role.includes('صيانة')) return 'Maintenance';
    return 'Général';
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        label: isRTL ? 'نشط' : 'Actif'
      },
      INACTIVE: { 
        bg: 'bg-gray-100 dark:bg-gray-900/30', 
        text: 'text-gray-800 dark:text-gray-300', 
        label: isRTL ? 'غير نشط' : 'Inactif'
      },
      ON_LEAVE: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        label: isRTL ? 'في إجازة' : 'En congé'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Directeur') || role.includes('مدير')) return <Shield className="h-4 w-4 text-blue-600" />;
    if (role.includes('Production') || role.includes('إنتاج')) return <Activity className="h-4 w-4 text-green-600" />;
    if (role.includes('Vétérinaire') || role.includes('طبيب')) return <User className="h-4 w-4 text-red-600" />;
    if (role.includes('Maintenance') || role.includes('صيانة')) return <Activity className="h-4 w-4 text-purple-600" />;
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
    const departments = [...new Set(staff.map(member => member.department))];
    return departments.sort();
  };

  const getRoles = () => {
    const roles = [...new Set(staff.map(member => member.role))];
    return roles.sort();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="theme-bg-elevated rounded-lg shadow-sm border theme-border-primary theme-transition p-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'} mb-4`}>
          <h2 className="text-lg font-semibold theme-text-primary theme-transition">
            {isRTL ? 'إدارة الموظفين' : 'Gestion du personnel'}
          </h2>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <button className="px-4 py-2 rounded-lg flex items-center theme-bg-elevated hover:theme-bg-secondary theme-text-primary theme-transition border theme-border-primary hover:theme-border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
            <option value="ACTIVE">{isRTL ? 'نشط' : 'Actif'}</option>
            <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactif'}</option>
            <option value="ON_LEAVE">{isRTL ? 'في إجازة' : 'En congé'}</option>
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
                {staff.filter(m => m.status === 'ACTIVE').length}
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
                {staff.filter(m => new Date(m.hireDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
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
                        <div className="text-sm font-medium theme-text-primary theme-transition">{member.name}</div>
                        <div className="text-sm theme-text-secondary theme-transition">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getRoleIcon(member.role)}
                      <span className={`text-sm font-medium theme-text-primary theme-transition ${isRTL ? 'mr-2' : 'ml-2'}`}>
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {member.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
                    {formatDate(member.hireDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                      <button 
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

