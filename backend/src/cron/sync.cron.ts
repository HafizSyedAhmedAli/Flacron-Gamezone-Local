import cron from "node-cron";
import { matchService } from "../services/match.service.js";
import { youtubeService } from "../services/youtube.service.js";
import { config } from "../config/index.js";

let isLiveSyncing = false; // Prevents overlapping syncs

export function startSyncCron() {
  if (!config.isProduction) return;
  console.log("[cron:sync] Initializing cron jobs...");

  // Run one sync immediately when server starts
  runLiveSync("initial");

  // Schedule sync every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    runLiveSync("cron");
  });

  // YouTube refresh every 6 minutes
  cron.schedule("*/6 * * * *", async () => {
    try {
      await youtubeService.refreshAllLiveStreams();
      console.log("[cron:youtube] ✓ Live streams refreshed");
    } catch (err) {
      console.error("[cron:youtube] ✗ Error refreshing streams:", err);
    }
  });

  console.log("[cron:sync] Scheduled successfully (live sync every 5 minutes)");
}

// Helper function with lock to prevent overlapping runs
async function runLiveSync(source: string) {
  if (isLiveSyncing) {
    console.log(
      `[cron:sync] ${source} → Sync already running, skipping this execution`,
    );
    return;
  }

  isLiveSyncing = true;
  const startTime = Date.now();

  try {
    console.log(`[cron:sync] ${source} → Starting live sync...`);

    const ids = await matchService.syncLiveFromApi();
    const duration = Date.now() - startTime;

    if (ids.length > 0) {
      console.log(
        `[cron:sync] ${source} ✓ Success: ${ids.length} live matches synced (${duration}ms)`,
      );
    } else {
      console.log(
        `[cron:sync] ${source} ✓ No live matches right now (${duration}ms)`,
      );
    }
  } catch (err) {
    console.error(`[cron:sync] ${source} ✗ Failed:`, err);
  } finally {
    isLiveSyncing = false;
  }
}
