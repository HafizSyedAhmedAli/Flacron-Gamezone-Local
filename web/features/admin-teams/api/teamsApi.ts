import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import type { Team } from '@/shared/types';

export const getTeams = () =>
   apiGet<Team[] | { teams: Team[] }>('/api/teams?limit=10000').then((r) =>
      Array.isArray(r) ? r : ((r as any).teams as Team[])
   );

export const createTeam = (data: {
   name: string;
   leagueId?: string;
   logo?: string;
   apiTeamId?: number;
}) => apiPost<Team>('/api/admin/teams', data);

export const updateTeam = (
   id: string,
   data: Partial<{
      name: string;
      leagueId: string;
      logo: string;
      apiTeamId: number;
   }>
) => apiPut<Team>(`/api/admin/teams/${id}`, data);

export const deleteTeam = (id: string) => apiDelete(`/api/admin/teams/${id}`);

export const getTeamsFromApi = (leagueId?: string, page = 1, limit = 100) => {
   const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
   });
   if (leagueId) params.set('leagueId', leagueId);
   return apiGet<{
      success: boolean;
      data: any[];
      pagination: { total: number; hasMore: boolean };
   }>(`/api/admin/teams/api?${params}`);
};
