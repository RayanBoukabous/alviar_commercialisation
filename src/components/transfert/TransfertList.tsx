'use client';

import React, { useState } from 'react';
import { useTransferts, useDeleteTransfert, useLivrerTransfert, useAnnulerTransfert } from '@/lib/hooks/useTransferts';
import { Transfert, TransfertFilters } from '@/lib/api/transfertService';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Truck, 
    CheckCircle, 
    XCircle, 
    Clock,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

interface TransfertListProps {
    isRTL?: boolean;
    onTransfertSelect?: (transfert: Transfert) => void;
    onCreateTransfert?: () => void;
    filters?: TransfertFilters;
    showActions?: boolean;
}

export default function TransfertList({ 
    isRTL = false, 
    onTransfertSelect,
    onCreateTransfert,
    filters = {},
    showActions = true 
}: TransfertListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Hooks
    const { data, isLoading, error, refetch } = useTransferts({
        ...filters,
        search: searchTerm || undefined,
        statut: statusFilter || undefined,
    });

    const deleteTransfertMutation = useDeleteTransfert();
    const livrerTransfertMutation = useLivrerTransfert();
    const annulerTransfertMutation = useAnnulerTransfert();

    // Handlers
    const handleDelete = async (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce transfert ?')) {
            try {
                await deleteTransfertMutation.mutateAsync(id);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleLivrer = async (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir marquer ce transfert comme livré ?')) {
            try {
                await livrerTransfertMutation.mutateAsync(id);
            } catch (error) {
                console.error('Erreur lors de la livraison:', error);
            }
        }
    };

    const handleAnnuler = async (id: number) => {
        const motif = prompt('Motif d\'annulation (optionnel):');
        try {
            await annulerTransfertMutation.mutateAsync({ id, motif_annulation: motif || undefined });
        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
        }
    };

    const getStatusBadge = (statut: string) => {
        const statusConfig = {
            'EN_COURS': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En cours' },
            'LIVRE': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Livré' },
            'ANNULE': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulé' },
        };

        const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['EN_COURS'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Erreur lors du chargement des transferts</p>
                <button 
                    onClick={() => refetch()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const transferts = data?.results || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'قائمة النقل' : 'Liste des Transferts'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {transferts.length} transfert{transferts.length !== 1 ? 's' : ''} trouvé{transferts.length !== 1 ? 's' : ''}
                    </p>
                </div>
                
                {onCreateTransfert && (
                    <button
                        onClick={onCreateTransfert}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isRTL ? 'إنشاء نقل جديد' : 'Nouveau Transfert'}
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={isRTL ? 'البحث في النقل...' : 'Rechercher un transfert...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="LIVRE">Livré</option>
                        <option value="ANNULE">Annulé</option>
                    </select>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                        <Filter className="w-4 h-4 mr-1" />
                        Filtres
                    </button>
                </div>
            </div>

            {/* Transferts List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {transferts.length === 0 ? (
                    <div className="text-center py-12">
                        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {isRTL ? 'لا توجد عمليات نقل' : 'Aucun transfert trouvé'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isRTL ? 'ابدأ بإنشاء أول عملية نقل' : 'Commencez par créer votre premier transfert'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'رقم النقل' : 'Numéro'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'من' : 'De'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'إلى' : 'Vers'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'عدد الحيوانات' : 'Bêtes'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'الحالة' : 'Statut'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {isRTL ? 'التاريخ' : 'Date'}
                                    </th>
                                    {showActions && (
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {isRTL ? 'الإجراءات' : 'Actions'}
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transferts.map((transfert) => (
                                    <tr 
                                        key={transfert.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => onTransfertSelect?.(transfert)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {transfert.numero_transfert}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {transfert.abattoir_expediteur.nom}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {transfert.abattoir_expediteur.adresse_complete}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {transfert.abattoir_destinataire.nom}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {transfert.abattoir_destinataire.adresse_complete}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {transfert.nombre_betes_actuelles} / {transfert.nombre_betes}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(transfert.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(transfert.date_creation).toLocaleDateString('fr-FR')}
                                        </td>
                                        {showActions && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTransfertSelect?.(transfert);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {transfert.peut_etre_livre && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLivrer(transfert.id);
                                                            }}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Marquer comme livré"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {transfert.peut_etre_annule && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAnnuler(transfert.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Annuler"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(transfert.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data?.next || data?.previous ? (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de {transferts.length} résultat{transferts.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-2">
                        {data.previous && (
                            <button
                                onClick={() => refetch()}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                        )}
                        {data.next && (
                            <button
                                onClick={() => refetch()}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Suivant
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

