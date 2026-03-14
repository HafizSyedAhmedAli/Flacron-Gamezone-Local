import { apiGet, apiPost } from "@/shared/api/base";

export interface StreamMatch {
  id: string;
  homeTeam: { id?: string; name: string; logo?: string | null };
  awayTeam: { id?: string; name: string; logo?: string | null };
  kickoffTime: string;
  status: string;
  league?: { id?: string; name?: string };
  stream?: {
    id: string;
    matchId: string;
    type: "EMBED";
    provider: string | null;
    url: string | null;
    isActive: boolean;
  } | null;
}

// Streams has no GET endpoint — load matches from /api/admin/matches instead
export const getMatchesForStreams = () => apiGet<any>("/api/admin/matches");

export const upsertStream = (data: {
  matchId: string;
  type: "EMBED" | "NONE";
  provider?: string | null;
  url?: string | null;
  youtubeVideoId?: string | null;
  isActive?: boolean;
}) => apiPost("/api/admin/streams", data);

export const findStreamForMatch = (matchId: string) =>
  apiPost<{ found: boolean; stream: any }>(
    `/api/admin/streams/${matchId}/find`,
    {},
  );
