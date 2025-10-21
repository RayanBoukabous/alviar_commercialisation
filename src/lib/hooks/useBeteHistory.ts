import { useQuery } from '@tanstack/react-query';
import { getBeteHistory, BeteHistoryResponse } from '../api/beteHistoryService';

export const useBeteHistory = (beteId: number, page: number = 1, pageSize: number = 20) => {
    return useQuery<BeteHistoryResponse, Error>({
        queryKey: ['beteHistory', beteId, page, pageSize],
        queryFn: () => getBeteHistory(beteId, page, pageSize),
        enabled: !!beteId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};




