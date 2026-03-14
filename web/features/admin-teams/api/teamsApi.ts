import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/base";
import type { Team } from "@/entities/team/model/types";

export const getTeams = () =>
  apiGet<{ teams: Team[] } | Team[]>("/api/admin/teams").then((r) =>
    Array.isArray(r) ? r : ((r as any).teams ?? []),
  );

export const createTeam = (data: {
  name: string;
  leagueId: string;
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
