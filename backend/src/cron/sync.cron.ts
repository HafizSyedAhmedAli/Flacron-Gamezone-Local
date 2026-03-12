import cron from "node-cron";
import { config } from "../config/index.js";
import { matchService } from "../services/match.service.js";
import { youtubeService } from "../services/youtube.service.js";

export function startSyncCron() {
  if (!config.isProduction) return;

  // Sync live matches every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const ids = await matchService.syncLiveFromApi();
      console.log(`[cron:sync] Synced ${ids.length} live match(es)`);
    } catch (err) {
      console.error("[cron:sync] Error syncing live matches:", err);
    }
  });

  // Refresh YouTube streams every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      await youtubeService.refreshAllLiveStreams();
    } catch (err) {
      console.error("[cron:sync] Error refreshing streams:", err);
    }
  });

  console.log("[cron:sync] Scheduled");
}
