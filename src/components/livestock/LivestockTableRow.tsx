'use client';

import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Tag
} from 'lucide-react';

interface LivestockTableRowProps {
  item: any;
  isRTL: boolean;
  deletingLivestockId: string | null;
  onDelete: (livestockId: string, loopNumber: string) => void;
  onEdit: (bete: any) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getHealthBadge: (health: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
}

const LivestockTableRow = memo(function LivestockTableRow({
  item,
  isRTL,
  deletingLivestockId,
  onDelete,
  onEdit,
  getStatusBadge,
  getHealthBadge,
  formatDate
}: LivestockTableRowProps) {
  const router = useRouter();

  const handleViewDetails = useCallback(() => {
    router.push(`/dashboard/livestock/${item.id}`);
  }, [router, item.id]);

  const handleEdit = useCallback(() => {
    onEdit(item);
  }, [onEdit, item]);

  const handleDelete = useCallback(() => {
    onDelete(item.id, item.loopNumber);
  }, [onDelete, item.id, item.loopNumber]);

  return (
    <tr className="transition-colors hover:theme-bg-secondary">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Tag className="h-5 w-5 text-primary-600" />
          </div>
          <div className={isRTL ? 'mr-4 text-right' : 'ml-4'}>
            <div className="text-sm font-medium theme-text-primary theme-transition">{item.loopNumber}</div>
            <div className="text-sm theme-text-secondary theme-transition">ID: {item.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">{item.type}</div>
          <div className="text-sm theme-text-secondary theme-transition">{item.breed}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">
            {item.weight} kg
          </div>
          <div className="text-sm theme-text-secondary theme-transition">
            {item.age} {isRTL ? 'شهر' : 'mois'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="text-sm font-medium theme-text-primary theme-transition">{item.abattoirName}</div>
          <div className="text-sm theme-text-secondary theme-transition">{item.origin}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(item.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getHealthBadge(item.healthStatus)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary theme-transition">
        {item.estimatedSlaughterDate ? formatDate(item.estimatedSlaughterDate) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
          <button 
            onClick={handleViewDetails}
            className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition"
            title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={handleEdit}
            className="p-1 theme-text-tertiary hover:text-blue-500 theme-transition"
            title={isRTL ? 'تعديل البête' : 'Modifier la bête'}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={handleDelete}
            disabled={deletingLivestockId === item.id}
            className="p-1 theme-text-tertiary hover:text-red-500 theme-transition disabled:opacity-50"
            title={isRTL ? 'حذف البête' : 'Supprimer la bête'}
          >
            {deletingLivestockId === item.id ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
          <button className="p-1 theme-text-tertiary hover:theme-text-primary theme-transition">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default LivestockTableRow;
