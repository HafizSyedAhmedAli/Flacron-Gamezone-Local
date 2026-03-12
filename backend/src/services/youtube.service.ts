import { config } from "../config/index.js";
import { matchRepository } from "../repositories/match.repository.js";
import { streamRepository } from "../repositories/stream.repository.js";

const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const COOLDOWN_MS = 2 * 60 * 60 * 1000;

// ─── Quota guard ──────────────────────────────────────────────────────────────

let quotaExceeded = false;
let quotaResetTimer: ReturnType<typeof setTimeout> | null = null;

function markQuotaExceeded() {
  if (quotaExceeded) return;
  quotaExceeded = true;
  console.warn("[YouTube] Quota exceeded — searches paused until midnight PT");

  const ptNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const midnight = new Date(ptNow);
  midnight.setHours(24, 0, 0, 0);

  if (quotaResetTimer) clearTimeout(quotaResetTimer);
  quotaResetTimer = setTimeout(() => {
    quotaExceeded = false;
    quotaResetTimer = null;
    console.log("[YouTube] Quota reset — searches resuming");
  }, midnight.getTime() - ptNow.getTime());
}

let _bulkRefreshRunning = false;

export const youtubeService = {
  isQuotaExceeded: () => quotaExceeded,

  async search(
    homeTeam: string,
    awayTeam: string
  ): Promise<{ videoId: string; title: string } | null> {
    if (!config.youtube.apiKey) {
      console.warn("[YouTube] YOUTUBE_API_KEY not set");
      return null;
    }
    if (quotaExceeded) return null;

    const params = new URLSearchParams({
      part: "snippet",
      q: `${homeTeam} vs ${awayTeam} live`,
      type: "video",
      eventType: "live",
      videoEmbeddable: "true",
      maxResults: "3",
      order: "relevance",
      key: config.youtube.apiKey,
    });

    try {
      const res = await fetch(`${YT_SEARCH_URL}?${params}`);
      const data = await res.json();

      if (
        res.status === 403 &&
        data?.error?.errors?.[0]?.reason === "quotaExceeded"
      ) {
        markQuotaExceeded();
        return null;
      }

      if (!res.ok) {
        console.error(
          `[YouTube] API ${res.status} — "${homeTeam} vs ${awayTeam}"`
        );
        return null;
      }

      const items: any[] = data.items ?? [];
      if (!items.length) return null;
      return { videoId: items[0].id.videoId, title: items[0].snippet.title };
    } catch (err) {
      console.error("[YouTube] Fetch error:", err);
      return null;
    }
  },

  async findAndSaveStreamForMatch(matchId: string) {
    if (quotaExceeded) return null;

    const match = await matchRepository.findByIdWithTeams(matchId);
    if (!match) return null;

    if (match.stream?.isActive && match.stream?.url) return match.stream;

    if (match.stream?.lastCheckedAt) {
      const elapsed =
        Date.now() - new Date(match.stream.lastCheckedAt).getTime();
      if (elapsed < COOLDOWN_MS) return null;
    }

    console.log(
      `[YouTube] Searching: ${(match as any).homeTeam.name} vs ${(match as any).awayTeam.name}`
    );
    const result = await this.search(
      (match as any).homeTeam.name,
      (match as any).awayTeam.name
    );

    if (result) {
      console.log(`[YouTube] Found: "${result.title}"`);
      return streamRepository.saveYoutubeStream(
        matchId,
        result.videoId,
        result.title
      );
    }

    return streamRepository.markNoStream(matchId);
  },

  async refreshAllLiveStreams() {
    if (_bulkRefreshRunning) {
      console.log("[YouTube] Bulk refresh already in progress — skipping");
      return;
    }
    if (quotaExceeded) {
      console.log("[YouTube] Quota exceeded — skipping bulk refresh");
      return;
    }

    _bulkRefreshRunning = true;

    try {
      const cooldownCutoff = new Date(Date.now() - COOLDOWN_MS);
      const eligible =
        await matchRepository.findLiveEligibleForStream(cooldownCutoff);

      if (!eligible.length) return;
      console.log(
        `[YouTube] ${eligible.length} match(es) eligible for stream search`
      );

      for (const { id } of eligible) {
        if (quotaExceeded) {
          console.warn("[YouTube] Quota hit mid-loop — stopping");
          break;
        }
        await this.findAndSaveStreamForMatch(id);
        await new Promise((r) => setTimeout(r, 1_000));
      }
    } finally {
      _bulkRefreshRunning = false;
    }
  },
};