import { prisma } from "../lib/prisma.js";
import type { PaginationParams } from "../types/index.js";

const matchIncludes = {
  league: true,
  homeTeam: true,
  awayTeam: true,
  stream: true,
} as const;

const matchIncludesFull = {
  ...matchIncludes,
  aiTexts: true,
} as const;

export const matchRepository = {
  async findAll(filters: {
    status?: "LIVE" | "UPCOMING" | "FINISHED";
    leagueId?: string;
    teamId?: string;
    date?: string;
  }) {
    // console.log("filters:", filters);
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.leagueId) where.leagueId = filters.leagueId;
    if (filters.teamId)
      where.OR = [
        { homeTeamId: filters.teamId },
        { awayTeamId: filters.teamId },
      ];
    if (filters.date) {
      const parsedDate = new Date(filters.date + "T00:00:00.000Z");
      if (Number.isNaN(parsedDate.getTime())) {
        throw Object.assign(new Error("Invalid date format. Use YYYY-MM-DD"), {
          status: 400,
        });
      }
      where.kickoffTime = {
        gte: parsedDate,
        lte: new Date(filters.date + "T23:59:59.999Z"),
      };
    }
    // console.log("where:", where);
    const query = await prisma.match.findMany({
      where,
      include: matchIncludes,
      orderBy: { kickoffTime: "asc" },
    });
    // console.log("query:", query);
    return query;
  },

  findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: matchIncludesFull,
    });
  },

  findByIdWithTeams(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: { homeTeam: true, awayTeam: true, stream: true, league: true },
    });
  },

  findByApiFixtureId(apiFixtureId: number) {
    return prisma.match.findUnique({ where: { apiFixtureId } });
  },

  findFirst(where: any) {
    return prisma.match.findFirst({ where });
  },

  findLive() {
    return prisma.match.findMany({
      where: { status: "LIVE" },
      include: matchIncludes,
      orderBy: { kickoffTime: "asc" },
    });
  },

  findLiveEligibleForStream(cooldownCutoff: Date) {
    return prisma.match.findMany({
      where: {
        status: "LIVE",
        OR: [
          { stream: null },
          {
            stream: {
              isActive: false,
              lastCheckedAt: { lt: cooldownCutoff },
            },
          },
        ],
      },
      select: { id: true },
    });
  },

  findRecentlyFinished(sinceMs: number) {
    return prisma.match.findMany({
      where: {
        status: "FINISHED",
        updatedAt: { gte: new Date(Date.now() - sinceMs) },
      },
      include: { aiTexts: true },
    });
  },

  findUpcomingInDays(days: number) {
    return prisma.match.findMany({
      where: {
        status: "UPCOMING",
        kickoffTime: {
          gte: new Date(),
          lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      },
      include: { aiTexts: true },
    });
  },

  findByLeague(leagueId: string) {
    return {
      finished: () =>
        prisma.match.findMany({
          where: { leagueId, status: "FINISHED", score: { not: null } },
          include: { homeTeam: true, awayTeam: true },
        }),
      upcoming: (take = 10) =>
        prisma.match.findMany({
          where: { leagueId, status: { in: ["UPCOMING", "LIVE"] } },
          include: {
            homeTeam: {
              select: { id: true, name: true, logo: true, apiTeamId: true },
            },
            awayTeam: {
              select: { id: true, name: true, logo: true, apiTeamId: true },
            },
          },
          orderBy: { kickoffTime: "asc" },
          take,
        }),
      recent: (take = 10) =>
        prisma.match.findMany({
          where: { leagueId, status: "FINISHED" },
          include: {
            homeTeam: {
              select: { id: true, name: true, logo: true, apiTeamId: true },
            },
            awayTeam: {
              select: { id: true, name: true, logo: true, apiTeamId: true },
            },
          },
          orderBy: { kickoffTime: "desc" },
          take,
        }),
    };
  },

  findByTeam(teamId: string) {
    const base = {
      include: {
        homeTeam: {
          select: { id: true, name: true, logo: true, apiTeamId: true },
        },
        awayTeam: {
          select: { id: true, name: true, logo: true, apiTeamId: true },
        },
        league: { select: { id: true, name: true, country: true, logo: true } },
      },
      orderBy: { kickoffTime: "desc" } as const,
    };
    return {
      home: () =>
        prisma.match.findMany({ where: { homeTeamId: teamId }, ...base }),
      away: () =>
        prisma.match.findMany({ where: { awayTeamId: teamId }, ...base }),
    };
  },

  findPaginated({ page, limit }: PaginationParams) {
    const skip = (page - 1) * limit;
    return Promise.all([
      prisma.match.findMany({
        include: { league: true, homeTeam: true, awayTeam: true, stream: true },
        orderBy: { kickoffTime: "desc" },
        skip,
        take: limit,
      }),
      prisma.match.count(),
    ]);
  },

  create(data: {
    leagueId?: string | null;
    homeTeamId: string;
    awayTeamId: string;
    kickoffTime: Date;
    status?: "UPCOMING" | "LIVE" | "FINISHED";
    score?: string | null;
    venue?: string | null;
    apiFixtureId?: number | null;
  }) {
    return prisma.match.create({
      data,
      include: { league: true, homeTeam: true, awayTeam: true },
    });
  },

  update(id: string, data: Partial<any>) {
    return prisma.match.update({
      where: { id },
      data,
      include: { league: true, homeTeam: true, awayTeam: true },
    });
  },

  upsertByApiFixtureId(fixtureId: number, create: any, update: any) {
    return prisma.match.upsert({
      where: { apiFixtureId: fixtureId },
      update,
      create,
    });
  },

  markStaleLiveAsFinished(currentLiveApiIds: number[]) {
    // Since the caller already filters for numbers, we just ensure they are valid (> 0)
    const validApiIds = currentLiveApiIds.filter((id) => id > 0);

    console.log(`[markStale] Excluding ${validApiIds.length} apiFixtureIds`);

    return prisma.match.updateMany({
      where: {
        status: "LIVE", 
        ...(validApiIds.length > 0
          ? { apiFixtureId: { notIn: validApiIds } }
          : {}),
      },
      data: { status: "FINISHED" },
    });
  },

  countLive() {
    return prisma.match.count({ where: { status: "LIVE" } });
  },

  delete(id: string) {
    return prisma.match.delete({ where: { id } });
  },

  search(query: string) {
    return prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { name: { contains: query, mode: "insensitive" } } },
          { awayTeam: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { homeTeam: true, awayTeam: true, league: true, stream: true },
      take: 10,
      orderBy: { kickoffTime: "desc" },
    });
  },
};
