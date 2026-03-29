import { prisma } from "../lib/prisma.js";
import type { PaginationParams } from "../types/index.js";

export const leagueRepository = {
  findAll() {
    return prisma.league.findMany({ orderBy: { name: "asc" } });
  },

  findById(id: string) {
    return prisma.league.findUnique({ where: { id } });
  },

  findByApiId(apiLeagueId: number) {
    return prisma.league.findUnique({ where: { apiLeagueId } });
  },

  findFirst(where: { apiLeagueId?: number; name?: string }) {
    return prisma.league.findFirst({ where });
  },

  findPaginated({ page, limit }: PaginationParams) {
    const skip = (page - 1) * limit;
    return Promise.all([
      prisma.league.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.league.count(),
    ]);
  },

  create(data: {
    name: string;
    country?: string | null;
    logo?: string | null;
    apiLeagueId?: number | null;
  }) {
    return prisma.league.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      country: string | null;
      logo: string | null;
      apiLeagueId: number | null;
    }>,
  ) {
    return prisma.league.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.league.delete({ where: { id } });
  },

  async upsertByApiId(data: {
    apiLeagueId: number;
    name: string;
    country?: string | null;
    logo?: string | null;
  }) {
    try {
      return await prisma.league.upsert({
        where: { apiLeagueId: data.apiLeagueId },
        update: {
          // Now it actually updates the data if the league exists!
          name: data.name,
          country: data.country,
          logo: data.logo,
        },
        create: {
          name: data.name,
          country: data.country,
          logo: data.logo,
          apiLeagueId: data.apiLeagueId,
        },
      });
    } catch (error: any) {
      // If a race condition happens and it throws P2002, catch it gracefully
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("apiLeagueId")
      ) {
        console.log(
          `[League Repo] Handled race condition for league ${data.apiLeagueId}`,
        );

        // Fetch and return the record that the other parallel process just created
        return await prisma.league.findUnique({
          where: { apiLeagueId: data.apiLeagueId },
        });
      }
      // If it's a completely different error, throw it so you still see it!
      throw error;
    }
  },
};
