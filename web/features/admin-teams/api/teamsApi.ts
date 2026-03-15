import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/base";
import type { Team } from "@/entities/team/model/types";

/**
 * Fetch all teams for the admin panel (dropdowns, stats).
 * Passes limit=10000 to bypass any default server-side pagination cap.
 */
export const getTeams = () =>
  apiGet<Team[] | { teams: Team[]; pagination: unknown }>(
    "/api/teams?limit=10000",
  ).then((r) => (Array.isArray(r) ? r : ((r as any).teams as Team[])));

export const createTeam = (data: {
  name: string;
  leagueId?: string;
  logo?: string;
  apiTeamId?: number;
}) => apiPost<Team>("/api/admin/teams", data);

export const updateTeam = (
  id: string,
  data: {
    name?: string;
    leagueId?: string;
    logo?: string;
    apiTeamId?: number;
  },
) => apiPut<Team>(`/api/admin/teams/${id}`, data);

export const deleteTeam = (id: string) => apiDelete(`/api/admin/teams/${id}`);
