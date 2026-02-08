import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { autoGenerateMatchPreviews, autoGenerateMatchSummaries } from "./ai-cron.js";

// MVP cron placeholders: in production, you would call API-Football,
// upsert fixtures, update LIVE statuses, finalize FINISHED scores, etc.

export function startCrons() {
  // Daily fixture sync (every day at 03:10)
  cron.schedule("10 3 * * *", async () => {
    console.log("[cron] daily fixture sync (placeholder)");
  });

  // Live refresh every 60 seconds (lightweight placeholder)
  cron.schedule("*/1 * * * *", async () => {
    // Example: auto-expire old LIVE matches, etc.
    const live = await prisma.match.count({ where: { status: "LIVE" } });
    if (live > 0) console.log(`[cron] live matches currently: ${live}`);
  });
}

/**
 * Setup AI cron jobs
 * Call this ONCE when server starts
 */
export function setupAICronJobs() {
  console.log("[CRON] Setting up AI cron jobs with node-cron...");

  // 🔁 Every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Running AI summary generation...");
    try {
      await autoGenerateMatchSummaries();
    } catch (err) {
      console.error("[CRON ERROR] Summary generation failed:", err);
    }
  });

  // 🌙 Every day at 2:00 AM
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
