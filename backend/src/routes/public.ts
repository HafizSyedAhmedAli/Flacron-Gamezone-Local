import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { getLiveFixturesCached } from "../services/footballApi.js";

export const publicRouter = Router();

publicRouter.get("/leagues", async (_req, res) => {
  const leagues = await prisma.league.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, leagues });
});

// Get League Details : /api/leagues/:id
publicRouter.get("/leagues/:id", async (req, res) => {
  try {
    const leagueId = req.params.id;

    // Fetch league details
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        country: true,
        logo: true,
      },
    });

    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }

    // Fetch all finished matches for this league to calculate standings
    const finishedMatches = await prisma.match.findMany({
      where: {
        leagueId,
        status: "FINISHED",
        score: { not: null },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    // Fetch all teams in the league
    const teams = await prisma.team.findMany({
      where: { leagueId },
      select: {
        id: true,
        name: true,
        logo: true,
        apiTeamId: true,
      },
    });

    // Calculate standings
    const standingsMap = new Map();

    // Initialize all teams with zero stats
    teams.forEach((team) => {
      standingsMap.set(team.id, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    // Process finished matches
    finishedMatches.forEach((match) => {
      if (!match.score) return;

      const [homeScore, awayScore] = match.score.split("-").map(Number);
      if (isNaN(homeScore) || isNaN(awayScore)) return;

      const homeStats = standingsMap.get(match.homeTeamId);
      const awayStats = standingsMap.get(match.awayTeamId);

      if (homeStats && awayStats) {
        // Update matches played
        homeStats.played++;
        awayStats.played++;

        // Update goals
        homeStats.goalsFor += homeScore;
        homeStats.goalsAgainst += awayScore;
        awayStats.goalsFor += awayScore;
        awayStats.goalsAgainst += homeScore;

        // Update results
        if (homeScore > awayScore) {
          homeStats.won++;
          homeStats.points += 3;
          awayStats.lost++;
        } else if (awayScore > homeScore) {
          awayStats.won++;
          awayStats.points += 3;
          homeStats.lost++;
        } else {
          homeStats.drawn++;
          awayStats.drawn++;
          homeStats.points += 1;
          awayStats.points += 1;
        }

        // Update goal difference
        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;
      }
    });

    // Convert to array and sort by points, then goal difference, then goals scored
    const standings = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Fetch upcoming matches (UPCOMING or LIVE, sorted by kickoff time)
    const upcomingMatches = await prisma.match.findMany({
      where: {
        leagueId,
        status: { in: ["UPCOMING", "LIVE"] },
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
      },
      orderBy: { kickoffTime: "asc" },
      take: 10,
    });

    // Fetch recent matches (FINISHED, sorted by most recent)
    const recentMatches = await prisma.match.findMany({
      where: {
        leagueId,
        status: "FINISHED",
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
      },
      orderBy: { kickoffTime: "desc" },
      take: 10,
    });

    res.json({
      league,
      standings,
      upcomingMatches,
      recentMatches,
    });
  } catch (error) {
    console.error("Error fetching league details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

publicRouter.get("/teams", async (req, res) => {
  const q = String(req.query.q || "").trim();

  // Fetch teams with their matches
  const teams = await prisma.team.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: {
      league: true,
      homeMatches: {
        where: { status: "FINISHED" },
        select: {
          score: true,
          homeTeamId: true,
          awayTeamId: true,
        },
      },
      awayMatches: {
        where: { status: "FINISHED" },
        select: {
          score: true,
          homeTeamId: true,
          awayTeamId: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate statistics for each team
  const teamsWithStats = teams.map((team) => {
    let matches = 0;
    let wins = 0;

    // Process home matches
    team.homeMatches.forEach((match) => {
      if (match.score) {
        const [homeScore, awayScore] = match.score.split("-").map(Number);
        if (!isNaN(homeScore) && !isNaN(awayScore)) {
          matches++;
          if (homeScore > awayScore) {
            wins++;
          }
        }
      }
    });

    // Process away matches
    team.awayMatches.forEach((match) => {
      if (match.score) {
        const [homeScore, awayScore] = match.score.split("-").map(Number);
        if (!isNaN(homeScore) && !isNaN(awayScore)) {
          matches++;
          if (awayScore > homeScore) {
            wins++;
          }
        }
      }
    });

    // Return team with calculated stats, excluding the match arrays
    const { homeMatches, awayMatches, ...teamData } = team;
    return {
      ...teamData,
      matches,
      wins,
    };
  });

  res.json(teamsWithStats);
});

publicRouter.get("/teams/:id", async (req, res) => {
  try {
    const teamId = req.params.id;

    // Fetch team details
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Fetch home matches
    const homeMatches = await prisma.match.findMany({
      where: { homeTeamId: teamId },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
      orderBy: { kickoffTime: "desc" },
    });

    // Fetch away matches
    const awayMatches = await prisma.match.findMany({
      where: { awayTeamId: teamId },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            apiTeamId: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
      orderBy: { kickoffTime: "desc" },
    });

    res.json({
      ...team,
      homeMatches,
      awayMatches,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

publicRouter.get("/matches", async (req, res) => {
  const status = String(req.query.status || "").toUpperCase();
  const leagueId = String(req.query.leagueId || "");
  const teamId = String(req.query.teamId || "");
  const date = String(req.query.date || ""); // YYYY-MM-DD (interpreted as UTC day boundary for MVP)
  const where: any = {};
  if (status === "LIVE" || status === "UPCOMING" || status === "FINISHED")
    where.status = status;
  if (leagueId) where.leagueId = leagueId;
  if (teamId) where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
  if (date) {
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");
    where.kickoffTime = { gte: start, lte: end };
  }

  const matches = await prisma.match.findMany({
    where,
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      stream: true, // Include stream data
    },
    orderBy: { kickoffTime: "asc" },
  });
  res.json(matches);
});

/**
 * GET /api/matches/live
 * Returns all live matches and syncs with API-Football
 * Auto-refreshes from API-Football (cached for 30 seconds)
 */
publicRouter.get("/matches/live", async (_req, res) => {
  try {
    const apiData = await getLiveFixturesCached();
    const apiFixtures = apiData?.response || [];
    const liveMatchIds: string[] = [];

    for (const fixture of apiFixtures) {
      try {
        const fixtureId = fixture.fixture?.id;
        if (!fixtureId) continue;

        // Upsert league
        const leagueData = fixture.league;
        const league = leagueData?.id
          ? await prisma.league.upsert({
              where: { apiLeagueId: leagueData.id },
              update: {}, // No changes needed if it exists
              create: {
                name: leagueData.name || "Unknown League",
                country: leagueData.country,
                logo: leagueData.logo,
                apiLeagueId: leagueData.id,
              },
            })
          : null;

        // Upsert home team
        const homeTeamData = fixture.teams?.home;
        const homeTeam = homeTeamData?.id
          ? await prisma.team.upsert({
              where: { apiTeamId: homeTeamData.id },
              update: { leagueId: league?.id }, // ensure league assigned
              create: {
                name: homeTeamData.name || "Unknown Home",
                logo: homeTeamData.logo,
                apiTeamId: homeTeamData.id,
                leagueId: league?.id || null,
              },
            })
          : null;

        // Upsert away team
        const awayTeamData = fixture.teams?.away;
        const awayTeam = awayTeamData?.id
          ? await prisma.team.upsert({
              where: { apiTeamId: awayTeamData.id },
              update: { leagueId: league?.id }, // ensure league assigned
              create: {
                name: awayTeamData.name || "Unknown Away",
                logo: awayTeamData.logo,
                apiTeamId: awayTeamData.id,
                leagueId: league?.id || null,
              },
            })
          : null;

        // Upsert match
        if (homeTeam && awayTeam) {
          const match = await prisma.match.upsert({
            where: { apiFixtureId: fixtureId },
            update: {
              status: "LIVE",
              score: `${fixture.goals?.home || 0}-${fixture.goals?.away || 0}`,
            },
            create: {
              apiFixtureId: fixtureId,
              leagueId: league?.id || null,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffTime: new Date(fixture.fixture.date),
              status: "LIVE",
              score: `${fixture.goals?.home || 0}-${fixture.goals?.away || 0}`,
              venue: fixture.fixture?.venue?.name,
            },
          });

          liveMatchIds.push(match.id);
        }
      } catch (error) {
        console.error(`Error syncing fixture ${fixture.fixture?.id}:`, error);
      }
    }

    // Mark matches as FINISHED if they're no longer live
    await prisma.match.updateMany({
      where: {
        status: "LIVE",
        id: { notIn: liveMatchIds }, // any LIVE match not in API response
      },
      data: { status: "FINISHED" },
    });

    // Fetch live matches with relations
    const liveMatches = await prisma.match.findMany({
      where: {
        OR: [{ status: "LIVE" }, { id: { in: liveMatchIds } }],
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        stream: true,
      },
      orderBy: { kickoffTime: "asc" },
    });

    res.json(liveMatches);
  } catch (error: any) {
    console.error("Error fetching live matches:", error);

    const liveMatches = await prisma.match.findMany({
      where: { status: "LIVE" },
      include: { league: true, homeTeam: true, awayTeam: true, stream: true },
      orderBy: { kickoffTime: "asc" },
    });

    res.json(liveMatches);
  }
});

publicRouter.get("/match/:id", async (req, res) => {
  const id = req.params.id;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      stream: true, // ✅ INCLUDE STREAM DATA
      aiTexts: true,
    },
  });
  if (!match) return res.status(404).json({ error: "Not found" });

  // Check if caller is premium
  const authHeader = req.headers.authorization;
  let isPremium = false;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const secret = process.env.JWT_SECRET || "dev_secret";
      const decoded = jwt.verify(token, secret) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { subscription: true },
      });
      isPremium =
        user?.role === "ADMIN" || user?.subscription?.status === "active";
    } catch {
      isPremium = false;
    }
  }
  // Scrub stream URL for non-premium
  const safeMatch = {
    ...match,
    stream: match.stream
      ? {
          ...match.stream,
          url: isPremium ? match.stream.url : null,
          type: match.stream.type,
          isActive: isPremium ? match.stream.isActive : false,
        }
      : null,
    // Strip AI texts for non-premium too (they'll load via separate endpoint)
    aiTexts: isPremium ? match.aiTexts : [],
  };

  res.json(safeMatch);
});

publicRouter.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ leagues: [], teams: [], matches: [] });

  const [leagues, teams, matches] = await Promise.all([
    prisma.league.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
    }),
    prisma.team.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { league: true }, // ✅ INCLUDE LEAGUE DATA
      take: 10,
    }),
    prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { name: { contains: q, mode: "insensitive" } } },
          { awayTeam: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        stream: true, // ✅ INCLUDE STREAM DATA
      },
      take: 10,
      orderBy: { kickoffTime: "desc" },
    }),
  ]);

  res.json({ leagues, teams, matches });
});
