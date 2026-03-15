import { apiGet, apiPut, apiPost, apiDelete } from "@/shared/api/base";

export interface AdminStream {
  id?: string;
  matchId?: string;
  type: "EMBED" | "NONE";
  provider: string | null;
  url: string | null;
  isActive: boolean;
  youtubeVideoId?: string | null;
  streamTitle?: string | null;
  match?: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    kickoffTime: string;
    status: string;
  };
}

export interface MatchWithStream {
  id: string;
  homeTeam: { id: string; name: string; logo: string | null };
  awayTeam: { id: string; name: string; logo: string | null };
  league: { id: string; name: string } | null;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  stream: AdminStream | null;
}

/** Alias used by the AdminStreamsManagement component. */
export type StreamMatch = MatchWithStream;

/** Fetch all streams (admin list view). */
export const getStreams = async () => apiGet<AdminStream[]>("/api/admin/streams");

/**
 * Fetch matches with their stream data for the stream management tab.
 * Used by the StreamManagement component.
 */
export const getMatchesForStreams = (page = 1, limit = 50, status?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.set("status", status);
  return apiGet<{ matches: MatchWithStream[]; pagination: { total: number } }>(
    `/api/admin/matches?${params}`,
  ).then((r) => ({ matches: r.matches, total: r.pagination.total }));
};

/** Fetch the stream for a specific match. */
export const getStreamByMatchId = (matchId: string) =>
  apiGet<AdminStream | null>(`/api/admin/streams/${matchId}`);

/**
 * Upsert a stream record (create or update).
 * Accepts the full stream payload including matchId.
 */
export const upsertStream = (data: {
  matchId: string;
  type: "EMBED" | "NONE";
  provider?: string | null;
  url?: string | null;
  youtubeVideoId?: string | null;
  isActive?: boolean;
}) => apiPost<AdminStream>("/api/admin/streams", data);

/** Create or update a stream via PUT (passes matchId in the URL). */
export const updateStream = (
  matchId: string,
  data: {
    type?: "EMBED" | "NONE";
    provider?: string | null;
    url?: string | null;
    isActive?: boolean;
    youtubeVideoId?: string | null;
  },
) => apiPut<AdminStream>(`/api/admin/streams/${matchId}`, data);

/** Remove a stream record. */
export const deleteStream = (matchId: string) =>
  apiDelete(`/api/admin/streams/${matchId}`);

/** Trigger YouTube search for a single match. */
export const triggerYoutubeSearch = (matchId: string) =>
  apiPost<{ found: boolean; stream: AdminStream | null }>(
    `/api/admin/streams/${matchId}/youtube-search`,
    {},
  );

/** Trigger YouTube search across all live matches. */
export const triggerBulkYoutubeSearch = () =>
  apiPost<{ success: boolean; searched: number; message: string }>(
    "/api/admin/streams/bulk-youtube-search",
    {},
  );
