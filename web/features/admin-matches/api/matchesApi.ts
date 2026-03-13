import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/base";
import type { Match } from "@/entities/match/model/types";

export interface AdminMatch {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string | null;
    apiTeamId: number | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string | null;
    apiTeamId: number | null;
  };
  league: { id: string; name: string } | null;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  stream: {
    type: string;
    provider: string | null;
    url: string | null;
    isActive: boolean;
  } | null;
}

export const getAdminMatches = (
  page = 0,
  limit = 10,
  status?: string,
  leagueId?: string,
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.set("status", status);
  if (leagueId) params.set("leagueId", leagueId);
  return apiGet<{ matches: AdminMatch[]; total: number }>(
    `/api/admin/matches?${params}`,
  );
};

export const createMatch = (data: {
  homeTeamId: string;
  awayTeamId: string;
  leagueId?: string;
  kickoffTime: string;
  venue?: string;
}) => apiPost<AdminMatch>("/api/admin/matches", data);

export const updateMatch = (
  id: string,
  data: {
    kickoffTime?: string;
    venue?: string;
    status?: string;
    score?: string;
    leagueId?: string;
  },
) => apiPut<AdminMatch>(`/api/admin/matches/${id}`, data);

export const deleteMatch = (id: string) =>
  apiDelete(`/api/admin/matches/${id}`);

export const syncLiveMatches = () =>
  apiPost<{ message: string }>("/api/admin/matches/sync-live", {});

export const generateMatchAISummary = (id: string) =>
  apiPost(`/api/ai/match-summary`, { matchId: id });
