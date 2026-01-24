import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../lib/validate.js";
import axios from "axios";
import { cacheGet, cacheSet } from "../lib/redis.js";

const LEAGUES_CACHE_KEY = "football:leagues";
const TEAMS_CACHE_KEY = "football:teams";
const LEAGUES_TTL = 60 * 5; // 5 minutes
const TEAMS_TTL = 60 * 10; // 10 minutes

export const adminRouter = Router();

// ==================== LEAGUES ====================

const leagueSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  apiLeagueId: z.number().int().optional(),
});

// Get all leagues from Football API for browsing : /api/admin/leagues
adminRouter.get("/leagues", async (req, res) => {
  try {
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
      config,
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
      country: item.country?.name || "Unknown",
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

adminRouter.get("/leagues/saved", async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(leagues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch saved leagues" });
  }
});

adminRouter.post("/league", validateBody(leagueSchema), async (req, res) => {
  try {
    const { apiLeagueId, name, country, logo } = req.body;

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
  },
);

adminRouter.delete("/league/:id", async (req, res) => {
  await prisma.league.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ==================== TEAMS ====================

const teamSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().or(z.literal("")),
  apiTeamId: z.number().int().optional(),
  leagueId: z.string().optional().nullable(),
});

// Get all teams from Football API for browsing : /api/admin/teams
adminRouter.get("/teams", async (req, res) => {
  try {
    const { leagueId } = req.query;

    // Build cache key based on league filter
    const cacheKey = leagueId
      ? `${TEAMS_CACHE_KEY}:league:${leagueId}`
      : TEAMS_CACHE_KEY;

    const cachedTeams = await cacheGet<any[]>(cacheKey);
    if (cachedTeams) {
      return res.json({
        success: true,
        teams: cachedTeams,
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

    // If leagueId is provided, fetch teams for that league
    // Otherwise fetch teams from popular leagues
    const url = leagueId
      ? `https://v3.football.api-sports.io/teams?league=${leagueId}&season=2024`
      : "https://v3.football.api-sports.io/teams?league=39&season=2024"; // Default: Premier League

    const { data } = await axios.get(url, config);

    if (!data || !data.response) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from Football API",
      });
    }

    const teamsData = data.response.map((item: any) => ({
      apiTeamId: item.team.id,
      name: item.team.name,
      logo: item.team.logo,
      country: item.team.country || "Unknown",
      founded: item.team.founded,
      venue: item.venue?.name,
    }));

    await cacheSet(cacheKey, teamsData, TEAMS_TTL);

    res.json({ success: true, teams: teamsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred.",
    });
  }
});

// Get saved teams from database : /api/admin/teams/saved
adminRouter.get("/teams/saved", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        league: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch saved teams" });
  }
});

// Save a team to your database : /api/admin/team
adminRouter.post("/team", validateBody(teamSchema), async (req, res) => {
  try {
    const { apiTeamId, name, logo, leagueId } = req.body;

    // Check if team already exists
    const existing = await prisma.team.findFirst({
      where: apiTeamId ? { apiTeamId } : { name },
    });

    if (existing) {
      return res.status(400).json({ error: "Team already added" });
    }

    if (!leagueId) {
      return res.status(400).json({ message: "leagueId is required" });
    }

    const league = await prisma.league.findUnique({
      where: { apiLeagueId: Number.parseInt(leagueId) },
    });

    if (!league) {
      return res.status(400).json({ message: "League does not exist" });
    }

    const team = await prisma.team.create({
      data: {
        apiTeamId,
        name,
        logo: logo || null,
        leagueId: league.id || null,
      },
      include: {
        league: true,
      },
    });
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

adminRouter.put(
  "/team/:id",
  validateBody(teamSchema.partial()),
  async (req, res) => {
    try {
      const data = (req as any).validated;
      const team = await prisma.team.update({
        where: { id: req.params.id },
        data: {
          ...data,
          logo: data.logo === "" ? null : data.logo,
          leagueId: data.leagueId === "" ? null : data.leagueId,
        },
        include: {
          league: true,
        },
      });
      res.json(team);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update team" });
    }
  },
);

adminRouter.delete("/team/:id", async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

// ==================== MATCHES ====================

const matchSchema = z.object({
  leagueId: z.string().optional().nullable(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffTime: z.string().min(1),
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
  },
);

adminRouter.delete("/match/:id", async (req, res) => {
  await prisma.match.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ==================== STREAMS ====================

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

// ==================== USERS ====================

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
    })),
  );
});
