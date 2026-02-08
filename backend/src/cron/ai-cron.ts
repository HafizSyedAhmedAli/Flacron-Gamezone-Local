import { prisma } from "../lib/prisma";
import { generateMatchSummary } from "../services/ai-service.js";

/**
 * Cron job to automatically generate AI summaries for finished matches
 * This should be run periodically (e.g., every 30 minutes)
 */
export async function autoGenerateMatchSummaries() {
  console.log("[CRON] Starting auto AI summary generation...");

  try {
    // Find all finished matches without AI summaries
    const finishedMatches = await prisma.match.findMany({
      where: {
        status: "FINISHED",
        // Only matches that finished in the last 24 hours
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        aiTexts: true,
      },
    });

    console.log(`[CRON] Found ${finishedMatches.length} finished matches`);

    // Filter out matches that already have summaries
    const matchesNeedingSummaries = finishedMatches.filter((match) => {
      const hasSummary = match.aiTexts.some((ai) => ai.kind === "summary");
      return !hasSummary;
    });

    console.log(
      `[CRON] ${matchesNeedingSummaries.length} matches need AI summaries`,
    );

    if (matchesNeedingSummaries.length === 0) {
      console.log("[CRON] No matches need summaries. Exiting.");
      return {
        success: true,
        processed: 0,
        message: "No matches need summaries",
      };
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Generate summaries for each match
    for (const match of matchesNeedingSummaries) {
      try {
        console.log(
          `[CRON] Generating summary for match ${match.id} (${match.homeTeamId} vs ${match.awayTeamId})`,
        );

        // Generate English summary
        await generateMatchSummary(match.id, "en");

        // Optionally generate French summary
        await generateMatchSummary(match.id, "fr");

        results.successful++;
        console.log(
          `[CRON] Successfully generated summary for match ${match.id}`,
        );
      } catch (error) {
        results.failed++;
        const errorMsg = `Match ${match.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        results.errors.push(errorMsg);
        console.error(
          `[CRON] Failed to generate summary for match ${match.id}:`,
          error,
        );
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`[CRON] AI summary generation complete:`);
    console.log(`  - Successful: ${results.successful}`);
    console.log(`  - Failed: ${results.failed}`);

    return {
      success: true,
      processed: matchesNeedingSummaries.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors,
    };
  } catch (error) {
    console.error("[CRON] Error in auto AI summary generation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cron job to generate match previews for upcoming matches
 * This should be run daily
 */
export async function autoGenerateMatchPreviews() {
  console.log("[CRON] Starting auto AI preview generation...");

  try {
    // Find upcoming matches in the next 7 days
    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: "UPCOMING",
        kickoffTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        aiTexts: true,
      },
    });

    console.log(`[CRON] Found ${upcomingMatches.length} upcoming matches`);

    // Filter out matches that already have previews
    const matchesNeedingPreviews = upcomingMatches.filter((match) => {
      const hasPreview = match.aiTexts.some((ai) => ai.kind === "preview");
      return !hasPreview;
    });

    console.log(
      `[CRON] ${matchesNeedingPreviews.length} matches need AI previews`,
    );

    if (matchesNeedingPreviews.length === 0) {
      console.log("[CRON] No matches need previews. Exiting.");
      return {
        success: true,
        processed: 0,
        message: "No matches need previews",
      };
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Generate previews for each match
    for (const match of matchesNeedingPreviews) {
      try {
        console.log(
          `[CRON] Generating preview for match ${match.id} (${match.homeTeamId} vs ${match.awayTeamId})`,
        );

        const { generateMatchPreview } = await import("../services/ai-service");

        // Generate English preview
        await generateMatchPreview(match.id, "en");

        results.successful++;
        console.log(
          `[CRON] Successfully generated preview for match ${match.id}`,
        );
      } catch (error) {
        results.failed++;
        const errorMsg = `Match ${match.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        results.errors.push(errorMsg);
        console.error(
          `[CRON] Failed to generate preview for match ${match.id}:`,
          error,
        );
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`[CRON] AI preview generation complete:`);
    console.log(`  - Successful: ${results.successful}`);
    console.log(`  - Failed: ${results.failed}`);

    return {
      success: true,
      processed: matchesNeedingPreviews.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors,
    };
  } catch (error) {
    console.error("[CRON] Error in auto AI preview generation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
