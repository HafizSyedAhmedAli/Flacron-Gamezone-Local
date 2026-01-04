import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../lib/validate.js";

export const adminRouter = Router();

// League CRUD
const leagueSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  apiLeagueId: z.number().int().optional(),
});

adminRouter.post("/league", validateBody(leagueSchema), async (req, res) => {
  const data = (req as any).validated;
  const league = await prisma.league.create({
    data: { ...data, logo: data.logo || null },
  });
  res.json(league);
});

adminRouter.put(
  "/league/:id",
  validateBody(leagueSchema.partial()),
  async (req, res) => {
    const data = (req as any).validated;
    const league = await prisma.league.update({
      where: { id: req.params.id },
      data: { ...data, logo: data.logo === "" ? null : data.logo },
    });
    res.json(league);
  }
);

adminRouter.delete("/league/:id", async (req, res) => {
  await prisma.league.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Team CRUD
const teamSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().or(z.literal("")),
  apiTeamId: z.number().int().optional(),
  leagueId: z.string().optional().nullable(),
});

adminRouter.post("/team", validateBody(teamSchema), async (req, res) => {
  const data = (req as any).validated;
  const team = await prisma.team.create({
    data: { ...data, logo: data.logo || null },
  });
  res.json(team);
});

adminRouter.put(
  "/team/:id",
  validateBody(teamSchema.partial()),
  async (req, res) => {
    const data = (req as any).validated;
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { ...data, logo: data.logo === "" ? null : data.logo },
    });
    res.json(team);
  }
);

adminRouter.delete("/team/:id", async (req, res) => {
  await prisma.team.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Match CRUD
const matchSchema = z.object({
  leagueId: z.string().optional().nullable(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffTime: z.string().min(1), // ISO string
  status: z.enum(["UPCOMING", "LIVE", "FINISHED"]).optional(),
  score: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  apiFixtureId: z.number().int().optional().nullable(),
});

adminRouter.post("/match", validateBody(matchSchema), async (req, res) => {
  const data = (req as any).validated;
  const match = await prisma.match.create({
    data: {
      leagueId: data.leagueId ?? null,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      kickoffTime: new Date(data.kickoffTime),
      status: data.status ?? "UPCOMING",
      score: data.score ?? null,
      venue: data.venue ?? null,
      apiFixtureId: data.apiFixtureId ?? null,
    },
  });
  res.json(match);
});

adminRouter.put(
  "/match/:id",
  validateBody(matchSchema.partial()),
  async (req, res) => {
    const data = (req as any).validated;
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        ...("leagueId" in data ? { leagueId: data.leagueId ?? null } : {}),
        ...("homeTeamId" in data ? { homeTeamId: data.homeTeamId } : {}),
        ...("awayTeamId" in data ? { awayTeamId: data.awayTeamId } : {}),
        ...("kickoffTime" in data
          ? { kickoffTime: new Date(data.kickoffTime) }
          : {}),
        ...("status" in data ? { status: data.status } : {}),
        ...("score" in data ? { score: data.score ?? null } : {}),
        ...("venue" in data ? { venue: data.venue ?? null } : {}),
        ...("apiFixtureId" in data
          ? { apiFixtureId: data.apiFixtureId ?? null }
          : {}),
      },
    });
    res.json(match);
  }
);

adminRouter.delete("/match/:id", async (req, res) => {
  await prisma.match.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Stream assignment
const streamSchema = z.object({
  matchId: z.string().min(1),
  type: z.enum(["EMBED", "NONE"]),
  provider: z.string().optional().nullable(),
  url: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

adminRouter.post("/stream", validateBody(streamSchema), async (req, res) => {
  const data = (req as any).validated;
  const stream = await prisma.stream.upsert({
    where: { matchId: data.matchId },
    create: {
      matchId: data.matchId,
      type: data.type,
      provider: data.provider ?? null,
      url: data.url ?? null,
      isActive: data.isActive ?? data.type === "EMBED",
    },
    update: {
      type: data.type,
      provider: data.provider ?? null,
      url: data.url ?? null,
      isActive: data.isActive ?? data.type === "EMBED",
    },
  });
  res.json(stream);
});

adminRouter.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      subscription: u.subscription,
    }))
  );
});
