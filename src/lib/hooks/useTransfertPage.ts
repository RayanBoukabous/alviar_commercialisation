import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTransferts, useDeleteTransfert } from './useTransferts';
import { Transfert } from '@/lib/api/transfertService';
import { toast } from 'react-hot-toast';

interface UseTransfertPageProps {
  isRTL: boolean;
}

export const useTransfertPage = ({ isRTL }: UseTransfertPageProps) => {
  // États pour les filtres avec debouncing
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [abattoirFilter, setAbattoirFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingTransfertId, setDeletingTransfertId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Debouncing pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hooks pour les transferts avec filtres optimisés
  const { 
    data: transfertsData, 
    isLoading: loading, 
    error, 
    refetch 
  } = useTransferts({
    search: debouncedSearchTerm || undefined,
    statut: statusFilter || undefined,
    abattoir_expediteur: abattoirFilter ? parseInt(abattoirFilter) : undefined,
  });

  const deleteTransfertMutation = useDeleteTransfert();

  const transferts = transfertsData?.results || [];

  // Mémorisation des abattoirs pour éviter les recalculs
  const abattoirs = useMemo(() => {
    const abattoirsSet = new Set();
    transferts.forEach(transfert => {
      abattoirsSet.add(JSON.stringify({ 
        id: transfert.abattoir_expediteur.id, 
        name: transfert.abattoir_expediteur.nom 
      }));
      abattoirsSet.add(JSON.stringify({ 
        id: transfert.abattoir_destinataire.id, 
        name: transfert.abattoir_destinataire.nom 
      }));
    });
    return Array.from(abattoirsSet)
      .map(item => JSON.parse(item as string))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [transferts]);

  // Handlers optimisés avec useCallback
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
      toast.success(isRTL ? 'تم التحديث بنجاح' : 'Données actualisées');
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      toast.error(isRTL ? 'خطأ في التحديث' : 'Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }, [refetch, isRTL]);

  const handleDeleteTransfert = useCallback(async (transfertId: number, transfertName: string) => {
    const confirmed = window.confirm(
      isRTL 
        ? `هل أنت متأكد من حذف النقل "${transfertName}"؟`
        : `Êtes-vous sûr de vouloir supprimer le transfert "${transfertName}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingTransfertId(transfertId);
      await deleteTransfertMutation.mutateAsync(transfertId);
      toast.success(
        isRTL 
          ? `تم حذف النقل "${transfertName}" بنجاح`
          : `Transfert "${transfertName}" supprimé avec succès`
      );
    } catch (err) {
      console.error('Erreur lors de la suppression du transfert:', err);
      toast.error(
        isRTL 
          ? 'خطأ في حذف النقل'
          : 'Erreur lors de la suppression du transfert'
      );
    } finally {
      setDeletingTransfertId(null);
    }
  }, [deleteTransfertMutation, isRTL]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // États
    searchTerm,
    statusFilter,
    abattoirFilter,
    refreshing,
    deletingTransfertId,
    isCreateModalOpen,
    loading,
    error,
    transferts,
    abattoirs,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setAbattoirFilter,
    setIsCreateModalOpen,
    
    // Handlers
    handleRefresh,
    handleDeleteTransfert,
    handleRetry,
  };
};
