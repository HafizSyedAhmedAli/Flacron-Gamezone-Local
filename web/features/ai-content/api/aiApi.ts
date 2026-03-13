import { apiGet, apiPost, apiDelete } from "@/shared/api/base";

export interface AISummary {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  match?: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    score: string | null;
    status: string;
  };
  league?: { id: string; name: string };
  team?: { id: string; name: string };
}

export const getAISummaries = (page = 0, limit = 5) =>
  apiGet<{ summaries: AISummary[]; total: number }>(
    `/api/ai/summaries?page=${page}&limit=${limit}`,
  );

export const generateMatchSummary = (matchId: string) =>
  apiPost<AISummary>("/api/ai/match-summary", { matchId });

export const generateLeagueSummary = (leagueId: string) =>
  apiPost<AISummary>("/api/ai/league-summary", { leagueId });

export const generateTeamSummary = (teamId: string) =>
  apiPost<AISummary>("/api/ai/team-summary", { teamId });

export const deleteAISummary = (id: string) =>
  apiDelete(`/api/ai/summaries/${id}`);
