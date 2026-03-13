export interface Stream {
  id?: string;
  matchId?: string;
  type: "EMBED" | "NONE";
  provider: string | null;
  url: string | null;
  isActive: boolean;
  youtubeVideoId?: string | null;
  streamTitle?: string | null;
  lastCheckedAt?: string | null;
}
