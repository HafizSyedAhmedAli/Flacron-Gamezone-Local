import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { getLiveFixturesCached } from "../services/footballApi.js";
import { refreshAllLiveStreams } from "../services/youtubeStreamService.js";
import {
  autoGenerateMatchPreviews,
  autoGenerateMatchSummaries,
} from "./ai-cron.js";

async function syncLiveMatches() {
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
              update: {},
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
              update: { leagueId: league?.id },
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
              update: { leagueId: league?.id },
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
              score: `${fixture.goals?.home ?? 0}-${fixture.goals?.away ?? 0}`,
            },
            create: {
              apiFixtureId: fixtureId,
              leagueId: league?.id || null,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffTime: new Date(fixture.fixture.date),
              status: "LIVE",
              score: `${fixture.goals?.home ?? 0}-${fixture.goals?.away ?? 0}`,
              venue: fixture.fixture?.venue?.name,
            },
          });
          liveMatchIds.push(match.id);
        }
      } catch (err) {
        console.error(
          `[cron] Error syncing fixture ${fixture.fixture?.id}:`,
          err,
        );
      }
    }

    // Mark stale LIVE matches as FINISHED
    const finished = await prisma.match.updateMany({
      where: { status: "LIVE", id: { notIn: liveMatchIds } },
      data: { status: "FINISHED" },
    });

    if (finished.count > 0) {
      console.log(
        `[cron] Marked ${finished.count} stale match(es) as FINISHED`,
      );
    }

    const live = await prisma.match.count({ where: { status: "LIVE" } });
    if (live > 0) console.log(`[cron] Live matches after sync: ${live}`);

    // Fire-and-forget YouTube stream refresh
    refreshAllLiveStreams().catch((e) =>
      console.error("[cron] refreshAllLiveStreams error:", e),
    );
  } catch (err) {
    console.error("[cron] syncLiveMatches error:", err);
  }
}

export function startCrons() {
  // Daily fixture sync (every day at 03:10)
  cron.schedule("10 3 * * *", async () => {
    console.log("[cron] daily fixture sync (placeholder)");
  });

  // Live sync every 60 seconds
  cron.schedule("*/1 * * * *", async () => {
    await syncLiveMatches();
  });
}

/**
 * Setup AI cron jobs
 * Call this ONCE when server starts
 */
export function setupAICronJobs() {
  console.log("[CRON] Setting up AI cron jobs with node-cron...");

  // Every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Running AI summary generation...");
    try {
      await autoGenerateMatchSummaries();
    } catch (err) {
      console.error("[CRON ERROR] Summary generation failed:", err);
    }
  });

  // Every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("[CRON] Running AI preview generation...");
    try {
      await autoGenerateMatchPreviews();
    } catch (err) {
      console.error("[CRON ERROR] Preview generation failed:", err);
    }
  });

  console.log("[CRON] AI cron jobs setup complete");
}
