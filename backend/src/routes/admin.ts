import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../lib/validate.js";
import axios from "axios";
import { cacheGet, cacheSet } from "../lib/redis.js";

const LEAGUES_CACHE_KEY = "football:leagues";
const LEAGUES_TTL = 60 * 5; // 5 minutes

export const adminRouter = Router();

// League CRUD
const leagueSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  apiLeagueId: z.number().int().optional(),
});

// Get all leagues from Football API for browsing : /api/admin/leagues
adminRouter.get("/leagues", async (req, res) => {
  try {
    // Try Redis first
    const cachedLeagues = await cacheGet<any[]>(LEAGUES_CACHE_KEY);
    if (cachedLeagues) {
      return res.json({
        success: true,
        leagues: cachedLeagues,
        cached: true,
      });
    }

    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({
        success: false,
        message: "Football API key not configured",
      });
    }

    const config = {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
      timeout: 10_000,
    };

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/leagues",
      config
    );
    if (!data || !data.response) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from Football API",
      });
    }

    const leaguesData = data.response.map((item: any) => ({
      apiLeagueId: item.league.id,
      name: item.league.name,
      logo: item.league.logo,
      country: item.country?.name || 'Unknown',
    }));

    await cacheSet(LEAGUES_CACHE_KEY, leaguesData, LEAGUES_TTL);

    res.json({ success: true, leagues: leaguesData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred.",
    });
  }
});

// Get saved leagues from database : /api/admin/leagues/saved
adminRouter.get("/leagues/saved", async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(leagues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch saved leagues" });
  }
});

// Save a league from to your database : /api/admin/league
adminRouter.post("/league", validateBody(leagueSchema), async (req, res) => {
  try {
    const { apiLeagueId, name, country, logo } = req.body;

    // Check if league already exists
    const existing = await prisma.league.findFirst({
      where: apiLeagueId ? { apiLeagueId } : { name },
    });

    if (existing) {
      return res.status(400).json({ error: "League already added" });
    }

    const league = await prisma.league.create({
      data: { apiLeagueId, name, country, logo },
    });

    res.json(league);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create league" });
  }
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
