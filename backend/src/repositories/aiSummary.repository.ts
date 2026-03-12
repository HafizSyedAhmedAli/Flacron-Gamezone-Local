import { prisma } from "../lib/prisma.js";

export const aiSummaryRepository = {
  findByMatch(matchId: string, language?: string) {
    return prisma.aISummary.findMany({
      where: { matchId, ...(language ? { language } : {}) },
      orderBy: { createdAt: "desc" },
    });
  },

  findOne(matchId: string, language: string, kind: string) {
    return prisma.aISummary.findFirst({
      where: { matchId, language, kind },
    });
  },

  upsert(data: {
    matchId: string;
    language: string;
    kind: string;
    content: string;
    provider: string;
  }) {
    return prisma.aISummary.upsert({
      where: {
        matchId_language_kind: {
          matchId: data.matchId,
          language: data.language,
          kind: data.kind,
        },
      },
      update: { content: data.content, provider: data.provider },
      create: data,
    });
  },

  deleteByMatch(
    matchId: string,
    filters?: { kind?: string; language?: string },
  ) {
    return prisma.aISummary.deleteMany({
      where: { matchId, ...filters },
    });
  },
};
