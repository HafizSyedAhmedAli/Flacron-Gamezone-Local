import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/base";

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
  page = 1,
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
  // Backend returns { matches, pagination: { total, ... } } — flatten total to the
  // top level so AdminPanel can keep using data.total without changes.
  return apiGet<{ matches: AdminMatch[]; pagination: { total: number } }>(
    `/api/admin/matches?${params}`,
  ).then((r) => ({ matches: r.matches, total: r.pagination.total }));
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

/** Syncs live matches from the football API. */
export const syncLiveMatches = () =>
  apiPost<{ success: boolean; synced: number; live: number }>(
    "/api/admin/matches/sync-live",
    {},
  );

export const generateMatchAISummary = (id: string) =>
  apiPost(`/api/admin/ai/summary`, { matchId: id, language: "en" });
