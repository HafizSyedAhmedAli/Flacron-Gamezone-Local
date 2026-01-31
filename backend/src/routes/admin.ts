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

    if (!process.env.API_SPORT_MONKS_KEY) {
      return res.status(500).json({
        success: false,
        message: "Backup Football API key not configured",
      });
    }

    const apiFootballConfig = {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
      timeout: 10_000,
    };

    const { data: apiFootballData } = await axios.get(
      `${process.env.API_FOOTBALL_BASEURL}/leagues`,
      apiFootballConfig,
    );

    let leaguesData: any[] = [];

    if (apiFootballData?.response?.length === 0) {
      console.log(apiFootballData?.errors);
      console.log("Using Backup API");

      const sportMonksConfig = {
        params: {
          api_token: process.env.API_SPORT_MONKS_KEY,
          include: "country",
        },
        headers: {
          Accept: "application/json",
        },
        timeout: 10_000,
      };

      const { data: sportMonksData } = await axios.get(
        `${process.env.API_SPORT_MONKS_BASEURL}/leagues`,
        sportMonksConfig,
      );

      leaguesData = sportMonksData.data.map((item: any) => ({
        apiLeagueId: item.id,
        name: item.name,
        logo: item.image_path,
        country: item.country?.name || "Unknown",
      }));

      await cacheSet(LEAGUES_CACHE_KEY, leaguesData, LEAGUES_TTL);
      return res.json({ success: true, leagues: leaguesData });
    }

    leaguesData = apiFootballData.response.map((item: any) => ({
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

    if (!process.env.API_SPORT_MONKS_KEY) {
      return res.status(500).json({
        success: false,
        message: "Backup Football API key not configured",
      });
    }

    const apiFootballConfig = {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
      timeout: 10_000,
    };

    const url = leagueId
      ? `${process.env.API_FOOTBALL_BASEURL}/teams?league=${leagueId}&season=2024`
      : `${process.env.API_FOOTBALL_BASEURL}/teams?league=39&season=2024`;

    const { data: apiFootballData } = await axios.get(url, apiFootballConfig);

    let teamsData: any[] = [];
    if (apiFootballData?.response?.length === 0) {
      console.log(apiFootballData?.errors);
      console.log("Using Backup API for teams");

      const sportMonksConfig = {
        params: {
          api_token: process.env.API_SPORT_MONKS_KEY,
          include: "country",
          ...(leagueId && { league_id: leagueId }),
        },
        headers: {
          Accept: "application/json",
        },
        timeout: 10_000,
      };

      const { data: sportMonksData } = await axios.get(
        `${process.env.API_SPORT_MONKS_BASEURL}/teams`,
        sportMonksConfig,
      );

      if (sportMonksData.data.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Invalid response from Backup Football API",
        });
      }

      const venueIds = [
        ...new Set(
          sportMonksData.data.map((team: any) => team.venue_id).filter(Boolean),
        ),
      ];

      // Build a safe venue map. If there are no venue IDs, skip the request entirely.
      let venueMap: Record<number, string> = {};
      if (venueIds.length === 0) {
        venueMap = {};
      } else {
        try {
          const venuesRes = await axios.get(
            `${process.env.API_SPORT_MONKS_BASEURL}/venues`,
            {
              params: {
                api_token: process.env.API_SPORT_MONKS_KEY,
                ids: venueIds.join(","),
              },
              timeout: 10_000,
            },
          );

          // Validate response shape before iterating
          if (venuesRes?.data?.data && Array.isArray(venuesRes.data.data)) {
            venuesRes.data.data.forEach((v: any) => {
              venueMap[v.id] = v.name;
            });
          } else {
            console.error("Invalid response when fetching venues:", venuesRes?.data);
            venueMap = {};
          }
        } catch (err) {
          // Log and fall back to empty map so callers still receive a defined value
          console.error("Failed to fetch venues from SportMonks:", err);
          venueMap = {};
        }
      }
      const teamsData = sportMonksData.data.map((team: any) => {
        const venue = venueMap[team.venue_id];

        return {
          apiTeamId: team.id,
          name: team.name,
          logo: team.image_path,
          founded: team.founded,
          venue: venue || null,
        };
      });
      await cacheSet(cacheKey, teamsData, TEAMS_TTL);
      return res.json({
        success: true,
        message: "Showing Data from Backup API",
        teams: teamsData,
      });
    }

    teamsData = apiFootballData.response.map((item: any) => ({
      apiTeamId: item.team.id,
      name: item.team.name,
      logo: item.team.logo,
      country: item.team.country || "Unknown",
      founded: item.team.founded,
      venue: item.venue?.name || null,
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
      return res
        .status(400)
        .json({ success: false, message: "Team already added" });
    }

    if (!leagueId) {
      return res
        .status(400)
        .json({ success: false, message: "League ID is required" });
    }

    const league = await prisma.league.findUnique({
      where: { apiLeagueId: Number.parseInt(leagueId) },
    });

    if (!league) {
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
        `${process.env.API_FOOTBALL_BASEURL}/leagues?id=${leagueId}&season=2024`,
        config,
      );

      const leagueInfo = data.response?.[0]?.league;
      const requiredLeague = leagueInfo?.name || `League ID ${leagueId}`;

      return res.status(404).json({
        success: false,
        message: `Add ${requiredLeague} as League First!`,
      });
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

    res.status(201).json({ success: true, message: `Added ${team.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create team" });
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

const MATCHES_CACHE_KEY = "football:matches";
const MATCHES_TTL = 60 * 2; // 2 minutes

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

// Get all matches from Football API for browsing : /api/admin/matches
adminRouter.get("/matches", async (req, res) => {
  try {
    const {
      leagueId: leagueIdRaw,
      date: dateRaw,
      status: statusRaw,
    } = req.query;

    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({
        success: false,
        message: "Football API key not configured",
      });
    }

    // ---------- Normalize query params ----------
    const leagueId =
      typeof leagueIdRaw === "string" && leagueIdRaw.trim() !== ""
        ? leagueIdRaw.trim()
        : null;

    const date =
      typeof dateRaw === "string" && dateRaw.trim() !== ""
        ? dateRaw.trim()
        : null;

    const status =
      typeof statusRaw === "string" && statusRaw.trim() !== ""
        ? statusRaw.trim()
        : null;

    // ---------- Cache key ----------
    const dateKey = date || new Date().toISOString().split("T")[0];
    const cacheKey = `${MATCHES_CACHE_KEY}:${leagueId || "all"}:${dateKey}:${status || "all"}`;

    const cachedMatches = await cacheGet<any[]>(cacheKey);
    if (cachedMatches) {
      return res.json({
        success: true,
        matches: cachedMatches,
        cached: true,
      });
    }

    // ---------- Axios config ----------
    const config = {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY!,
      },
      timeout: 10_000,
    };

    // ---------- Build API params ----------
    const params = new URLSearchParams();

    // League filter
    if (leagueId) {
      params.append("league", leagueId);

      // Season is REQUIRED when league is specified
      // Derive season from date if provided, otherwise use 2024
      // const seasonYear = date ? new Date(date).getFullYear() : 2026;

      // const season = Math.min(seasonYear, 2024);
      params.append("season", String("2024"));
    }

    // Date filter
    if (date) {
      params.append("date", date);
    } else if (!leagueId) {
      // Default: today's matches if no league and no date
      params.append("date", new Date().toISOString().split("T")[0]);
    }

    // Status filter
    if (status) {
      const apiStatus =
        status === "UPCOMING" ? "NS" : status === "LIVE" ? "LIVE" : "FT";
      params.append("status", apiStatus);
    }
    const url = `https://v3.football.api-sports.io/fixtures?${params.toString()}`;
    // ---------- Fetch ----------
    const { data } = await axios.get(url, config);
    if (!data || !data.response) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from Football API",
      });
    }

    // ---------- Map data ----------
    const matchesData = data.response.map((item: any) => ({
      apiFixtureId: item.fixture.id,
      leagueId: item.league.id,
      leagueName: item.league.name,
      leagueLogo: item.league.logo,
      homeTeam: {
        id: item.teams.home.id,
        name: item.teams.home.name,
        logo: item.teams.home.logo,
      },
      awayTeam: {
        id: item.teams.away.id,
        name: item.teams.away.name,
        logo: item.teams.away.logo,
      },
      kickoffTime: item.fixture.date,
      status: item.fixture.status.short, // NS, LIVE, FT, etc.
      score:
        item.goals.home !== null && item.goals.away !== null
          ? `${item.goals.home}-${item.goals.away}`
          : "0-0",
      venue: item.fixture.venue?.name || null,
      round: item.league.round,
    }));

    // ---------- Cache ----------
    await cacheSet(cacheKey, matchesData, MATCHES_TTL);

    // ---------- Response ----------
    res.json({
      success: true,
      matches: matchesData,
      total: matchesData.length,
    });
  } catch (error) {
    console.error("MATCH FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred.",
    });
  }
});

// Get saved matches from database : /api/admin/matches/saved
adminRouter.get("/matches/saved", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { kickoffTime: "desc" },
      take: 100, // Limit to latest 100 matches
    });
    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch saved matches" });
  }
});

adminRouter.post("/match", validateBody(matchSchema), async (req, res) => {
  try {
    const {
      apiFixtureId,
      leagueId,
      homeTeamId,
      awayTeamId,
      kickoffTime,
      status,
      score,
      venue,
    } = req.body;

    // Check if match already exists
    const existing = await prisma.match.findFirst({
      where: apiFixtureId
        ? { apiFixtureId }
        : {
            homeTeamId,
            awayTeamId,
            kickoffTime: new Date(kickoffTime),
          },
    });

    if (existing) {
      return res.status(400).json({ error: "Match already added" });
    }

    const match = await prisma.match.create({
      data: {
        leagueId: leagueId ?? null,
        homeTeamId,
        awayTeamId,
        kickoffTime: new Date(kickoffTime),
        status: status ?? "UPCOMING",
        score: score ?? null,
        venue: venue ?? null,
        apiFixtureId: apiFixtureId ?? null,
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create match" });
  }
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
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
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
