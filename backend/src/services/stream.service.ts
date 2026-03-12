import { streamRepository } from "../repositories/stream.repository.js";
import { matchRepository } from "../repositories/match.repository.js";
import { youtubeService } from "./youtube.service.js";

export const streamService = {
  getActiveStreams() {
    return streamRepository.findActiveStreams();
  },

  async getStreamStatus(matchId: string) {
    const match = await matchRepository.findByIdWithTeams(matchId);
    if (!match) throw Object.assign(new Error("Not found"), { status: 404 });

    if (!match.stream?.isActive || !match.stream?.url) {
      if (match.status === "LIVE") {
        youtubeService.findAndSaveStreamForMatch(match.id).catch(console.error);
      }
      return { found: false };
    }

    return {
      found: true,
      stream: {
        url: match.stream.url,
        youtubeVideoId: (match.stream as any).youtubeVideoId,
        streamTitle: (match.stream as any).streamTitle,
      },
    };
  },

  upsert(data: {
    matchId: string;
    type: "EMBED" | "NONE";
    provider?: string | null;
    url?: string | null;
    youtubeVideoId?: string | null;
    isActive?: boolean;
  }) {
    const resolvedUrl = data.youtubeVideoId
      ? `https://www.youtube.com/embed/${data.youtubeVideoId}?autoplay=1&rel=0`
      : (data.url ?? null);

    return streamRepository.upsert(
      data.matchId,
      {
        type: data.type,
        provider: data.provider ?? (data.youtubeVideoId ? "youtube" : null),
        url: resolvedUrl,
        isActive: data.isActive ?? data.type === "EMBED",
        youtubeVideoId: data.youtubeVideoId ?? null,
      },
      {
        type: data.type,
        provider: data.provider ?? (data.youtubeVideoId ? "youtube" : null),
        url: resolvedUrl,
        isActive: data.isActive ?? data.type === "EMBED",
        youtubeVideoId: data.youtubeVideoId ?? null,
        lastCheckedAt: new Date(),
      },
    );
  },

  findStreamForMatch(matchId: string) {
    return youtubeService.findAndSaveStreamForMatch(matchId);
  },
};
