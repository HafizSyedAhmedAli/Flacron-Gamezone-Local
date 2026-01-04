import { prisma } from "./lib/prisma.js";

async function main() {
  const league = await prisma.league.create({
    data: { name: "Demo League", country: "Demo" },
  });
  const home = await prisma.team.create({
    data: { name: "Flacron FC", leagueId: league.id },
  });
  const away = await prisma.team.create({
    data: { name: "GameZone United", leagueId: league.id },
  });
  const match = await prisma.match.create({
    data: {
      leagueId: league.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      kickoffTime: new Date(Date.now() + 60 * 60 * 1000),
      status: "UPCOMING",
      score: "0-0",
      venue: "Demo Stadium",
    },
  });
  await prisma.stream.create({
    data: { matchId: match.id, type: "NONE", isActive: false },
  });
  console.log("Seeded:", {
    league: league.id,
    home: home.id,
    away: away.id,
    match: match.id,
  });
}

main().finally(() => prisma.$disconnect());
