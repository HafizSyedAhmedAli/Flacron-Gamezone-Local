import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const publicRouter = Router();

publicRouter.get("/leagues", async (_req, res) => {
  const leagues = await prisma.league.findMany({ orderBy: { name: "asc" } });
  res.json({success: true, leagues});
});

publicRouter.get("/teams", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const teams = await prisma.team.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: { league: true },
    orderBy: { name: "asc" }
  });
  res.json(teams);
});

publicRouter.get("/matches", async (req, res) => {
  const status = String(req.query.status || "").toUpperCase();
  const leagueId = String(req.query.leagueId || "");
  const teamId = String(req.query.teamId || "");
  const date = String(req.query.date || ""); // YYYY-MM-DD (interpreted as UTC day boundary for MVP)
  const where: any = {};
  if (status === "LIVE" || status === "UPCOMING" || status === "FINISHED") where.status = status;
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
      awayTeam: true
    },
    orderBy: { kickoffTime: "asc" }
  });
  res.json(matches);
});

publicRouter.get("/matches/live", async (_req, res) => {
  const matches = await prisma.match.findMany({
    where: { status: "LIVE" },
    include: { league: true, homeTeam: true, awayTeam: true },
    orderBy: { kickoffTime: "asc" }
  });
  res.json(matches);
});

publicRouter.get("/match/:id", async (req, res) => {
  const id = req.params.id;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      stream: true,
      aiTexts: true
    }
  });
  if (!match) return res.status(404).json({ error: "Not found" });
  res.json(match);
});

publicRouter.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ leagues: [], teams: [], matches: [] });

  const [leagues, teams, matches] = await Promise.all([
    prisma.league.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
    prisma.team.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
    prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { name: { contains: q, mode: "insensitive" } } },
          { awayTeam: { name: { contains: q, mode: "insensitive" } } }
        ]
      },
      include: { homeTeam: true, awayTeam: true, league: true },
      take: 10,
      orderBy: { kickoffTime: "desc" }
    })
  ]);

  res.json({ leagues, teams, matches });
});
