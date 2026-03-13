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

export const getStreams = () => apiGet<AdminStream[]>("/api/admin/streams");

export const getStreamByMatchId = (matchId: string) =>
  apiGet<AdminStream | null>(`/api/admin/streams/${matchId}`);

export const updateStream = (
  matchId: string,
  data: {
    type?: string;
    provider?: string;
    url?: string;
    isActive?: boolean;
  },
) => apiPut<AdminStream>(`/api/admin/streams/${matchId}`, data);

export const deleteStream = (matchId: string) =>
  apiDelete(`/api/admin/streams/${matchId}`);

export const triggerYoutubeSearch = (matchId: string) =>
  apiPost<{ found: boolean; stream: AdminStream | null }>(
    `/api/admin/streams/${matchId}/youtube-search`,
    {},
  );

export const triggerBulkYoutubeSearch = () =>
  apiPost<{ message: string; searched: number }>(
    "/api/admin/streams/bulk-youtube-search",
    {},
  );
