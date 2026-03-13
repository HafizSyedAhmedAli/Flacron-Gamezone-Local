import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/base";
import type { League } from "@/entities/league/model/types";

export const getLeagues = () => apiGet<League[]>("/api/leagues");

export const createLeague = (data: {
  name: string;
  country?: string;
  logo?: string;
  apiLeagueId?: number;
}) => apiPost<League>("/api/admin/leagues", data);

export const updateLeague = (
  id: string,
  data: {
    name?: string;
    country?: string;
    logo?: string;
    apiLeagueId?: number;
  },
) => apiPut<League>(`/api/admin/leagues/${id}`, data);

export const deleteLeague = (id: string) =>
  apiDelete(`/api/admin/leagues/${id}`);

export const syncLeague = (id: string) =>
  apiPost<{ message: string }>(`/api/admin/leagues/${id}/sync`, {});

export const bulkSyncLeagues = () =>
  apiPost<{ message: string }>("/api/admin/leagues/bulk-sync", {});
