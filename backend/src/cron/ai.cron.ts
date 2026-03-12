import cron from "node-cron";
import { config } from "../config/index.js";
import { matchRepository } from "../repositories/match.repository.js";
import { aiService } from "../services/ai.service.js";

const RECENTLY_FINISHED_MS = 2 * 60 * 60 * 1000; // 2 hours
const UPCOMING_DAYS = 2;

export function startAiCron() {
  if (!config.isProduction) return;

  // Generate summaries for recently finished matches (every 15 min)
  cron.schedule("*/15 * * * *", async () => {
    try {
      const matches =
        await matchRepository.findRecentlyFinished(RECENTLY_FINISHED_MS);
      for (const match of matches) {
        const langs = ["en", "fr"] as const;
        for (const lang of langs) {
          const hasSummary = match.aiTexts?.some(
            (t: any) => t.kind === "summary" && t.language === lang,
          );
          if (!hasSummary) {
            await aiService.generateMatchSummary(match.id, lang);
            console.log(
              `[cron:ai] Generated ${lang} summary for match ${match.id}`,
            );
          }
        }
      }
    } catch (err) {
      console.error("[cron:ai] Error generating summaries:", err);
    }
  });

  // Generate previews for upcoming matches (every 30 min)
  cron.schedule("*/30 * * * *", async () => {
    try {
      const matches = await matchRepository.findUpcomingInDays(UPCOMING_DAYS);
      for (const match of matches) {
        const langs = ["en", "fr"] as const;
        for (const lang of langs) {
          const hasPreview = match.aiTexts?.some(
            (t: any) => t.kind === "preview" && t.language === lang,
          );
          if (!hasPreview) {
            await aiService.generateMatchPreview(match.id, lang);
            console.log(
              `[cron:ai] Generated ${lang} preview for match ${match.id}`,
            );
          }
        }
      }
    } catch (err) {
      console.error("[cron:ai] Error generating previews:", err);
    }
  });

  console.log("[cron:ai] Scheduled");
}
