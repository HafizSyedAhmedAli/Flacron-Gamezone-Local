import { prisma } from "../lib/prisma.js";

export const streamRepository = {
  findByMatchId(matchId: string) {
    return prisma.stream.findUnique({ where: { matchId } });
  },

  upsert(
    matchId: string,
    create: {
      type: "EMBED" | "NONE";
      provider?: string | null;
      url?: string | null;
      isActive?: boolean;
      youtubeVideoId?: string | null;
      streamTitle?: string | null;
    },
    update?: Partial<typeof create & { lastCheckedAt: Date }>,
  ) {
    return prisma.stream.upsert({
      where: { matchId },
      create: { matchId, ...create },
      update: update ?? { ...create, lastCheckedAt: new Date() },
    });
  },

  saveYoutubeStream(matchId: string, videoId: string, title: string) {
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    return prisma.stream.upsert({
      where: { matchId },
      update: {
        url,
        provider: "youtube",
        type: "EMBED",
        isActive: true,
        youtubeVideoId: videoId,
        streamTitle: title,
        lastCheckedAt: new Date(),
      },
      create: {
        matchId,
        url,
        provider: "youtube",
        type: "EMBED",
        isActive: true,
        youtubeVideoId: videoId,
        streamTitle: title,
        lastCheckedAt: new Date(),
      },
    });
  },

  markNoStream(matchId: string) {
    return prisma.stream.upsert({
      where: { matchId },
      update: { isActive: false, lastCheckedAt: new Date() },
      create: {
        matchId,
        type: "NONE",
        isActive: false,
        lastCheckedAt: new Date(),
      },
    });
  },

  findActiveStreams() {
    return prisma.match.findMany({
      where: {
        status: { in: ["LIVE", "UPCOMING"] },
        stream: { is: { type: "EMBED" } },
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        stream: true,
      },
      orderBy: [{ status: "asc" }, { kickoffTime: "asc" }],
      take: 200,
    });
  },
};
