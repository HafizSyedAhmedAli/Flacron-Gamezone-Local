import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

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
