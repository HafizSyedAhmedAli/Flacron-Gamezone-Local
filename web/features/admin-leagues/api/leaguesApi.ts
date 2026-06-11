import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import type { League } from '@/shared/types';

export const getLeagues = () =>
   apiGet<{ leagues: League[]; pagination: unknown }>(
      '/api/admin/leagues?limit=10000'
   ).then((r) => r.leagues);

export const createLeague = (data: {
   name: string;
   country?: string;
   logo?: string;
   apiLeagueId?: number;
}) => apiPost<League>('/api/admin/leagues', data);

export const updateLeague = (
   id: string,
   data: Partial<{
      name: string;
      country: string;
      logo: string;
      apiLeagueId: number;
   }>
) => apiPut<League>(`/api/admin/leagues/${id}`, data);

export const deleteLeague = (id: string) =>
   apiDelete(`/api/admin/leagues/${id}`);

export const syncLeague = (id: string) =>
   apiPost<{ message: string }>(`/api/admin/leagues/${id}/sync`, {});

export const bulkSyncLeagues = () =>
   apiPost<{ message: string }>('/api/admin/leagues/bulk-sync', {});

export const getLeaguesFromApi = (page = 1, limit = 100) =>
   apiGet<{
      success: boolean;
      data: any[];
      pagination: { total: number; hasMore: boolean };
   }>(`/api/admin/leagues/api?page=${page}&limit=${limit}`);
