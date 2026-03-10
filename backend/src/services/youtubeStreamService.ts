/**
 * services/youtubeStreamService.ts  — FIXED (quota-safe version)
 *
 * Changes from original:
 *  1. Global quota flag — first 403 stops ALL searches for the rest of the day
 *  2. Single query per match — was 3 queries (300 units), now 1 (100 units)
 *  3. Cooldown 5 min → 2 hours — a failed search won't be retried on every 45s poll
 *  4. Quota auto-resets at midnight PT without a server restart
 *  5. Bulk loop breaks immediately when quota is hit mid-run
 *  6. Cooldown filter moved into the DB query — DB skips ineligible matches
 *     before they even reach the loop, so the loop stays short
 */

import { prisma } from "../lib/prisma.js";

const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// ─── Global quota guard ───────────────────────────────────────────────────────

let quotaExceeded = false;
let quotaResetTimer: ReturnType<typeof setTimeout> | null = null;

function markQuotaExceeded() {
  if (quotaExceeded) return;
  quotaExceeded = true;
  console.warn("[YouTube] Quota exceeded — searches paused until midnight PT");

  // Auto-clear at midnight Pacific Time (YouTube's reset timezone)
  const ptNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  const midnight = new Date(ptNow);
  midnight.setHours(24, 0, 0, 0);
  const msUntilReset = midnight.getTime() - ptNow.getTime();

  if (quotaResetTimer) clearTimeout(quotaResetTimer);
  quotaResetTimer = setTimeout(() => {
    quotaExceeded = false;
    quotaResetTimer = null;
    console.log("[YouTube] Quota reset — searches resuming");
  }, msUntilReset);
}

export function isQuotaExceeded() {
  return quotaExceeded;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// 2 hours between re-searches for the same match.
// This prevents the 45s poll cycle from hammering failed matches.
const COOLDOWN_MS = 2 * 60 * 60 * 1000;

// ─── YouTube search (single query) ───────────────────────────────────────────

async function searchYouTube(
  homeTeam: string,
  awayTeam: string,
): Promise<{ videoId: string; title: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube] YOUTUBE_API_KEY not set");
    return null;
  }
  if (quotaExceeded) return null;

  const params = new URLSearchParams({
    part: "snippet",
    q: `${homeTeam} vs ${awayTeam} live`, // single query — 100 units
    type: "video",
    eventType: "live",
    videoEmbeddable: "true",
    maxResults: "3",
    order: "relevance",
    key: apiKey,
  });

  try {
    const res = await fetch(`${YT_SEARCH_URL}?${params}`);
    const data = await res.json();

    // Detect quota exhaustion and halt everything
    if (
      res.status === 403 &&
      data?.error?.errors?.[0]?.reason === "quotaExceeded"
    ) {
      markQuotaExceeded();
      return null;
    }

    if (!res.ok) {
      console.error(
        `[YouTube] API ${res.status} — "${homeTeam} vs ${awayTeam}"`,
      );
      return null;
    }

    const items: any[] = data.items || [];
    if (items.length === 0) return null;

    return { videoId: items[0].id.videoId, title: items[0].snippet.title };
  } catch (err) {
    console.error("[YouTube] Fetch error:", err);
    return null;
  }
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function saveStream(matchId: string, videoId: string, title: string) {
  const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  return prisma.stream.upsert({
    where: { matchId },
    update: {
      url,
      provider: "youtube",
      type: "EMBED",
      isActive: true,
      youtubeVideoId: videoId,
      streamTitle: title,
      lastCheckedAt: new Date(),
    },
    create: {
      matchId,
      url,
      provider: "youtube",
      type: "EMBED",
      isActive: true,
      youtubeVideoId: videoId,
      streamTitle: title,
      lastCheckedAt: new Date(),
    },
  });
}

async function markNoStream(matchId: string) {
  return prisma.stream.upsert({
    where: { matchId },
    update: { isActive: false, lastCheckedAt: new Date() },
    create: {
      matchId,
      type: "NONE",
      isActive: false,
      lastCheckedAt: new Date(),
    },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Search and save a stream for one match.
 * Respects quota flag and per-match cooldown.
 */
export async function findAndSaveStreamForMatch(matchId: string) {
  if (quotaExceeded) return null;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true, stream: true },
  });
  if (!match) return null;

  // Already active — nothing to do
  if (match.stream?.isActive && match.stream?.url) return match.stream;

  // Cooldown — skip if searched within the last 2 hours
  if (match.stream?.lastCheckedAt) {
    const elapsed = Date.now() - new Date(match.stream.lastCheckedAt).getTime();
    if (elapsed < COOLDOWN_MS) return null;
  }

  console.log(
    `[YouTube] Searching: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
  );
  const result = await searchYouTube(match.homeTeam.name, match.awayTeam.name);

  if (result) {
    console.log(`[YouTube] Found: "${result.title}"`);
    return saveStream(matchId, result.videoId, result.title);
  }

  return markNoStream(matchId);
}

/**
 * Bulk-refresh streams for all LIVE matches that are eligible.
 * "Eligible" = no active stream AND cooldown has expired.
 * Stops the entire loop the moment quota is hit.
 */
let bulkRefreshRunning = false;

export async function refreshAllLiveStreams() {
  if (bulkRefreshRunning) {
    console.log("[YouTube] Bulk refresh already in progress — skipping");
    return;
  }
  if (quotaExceeded) {
    console.log("[YouTube] Quota exceeded — skipping bulk refresh");
    return;
  }

  bulkRefreshRunning = true; // 🔒 Lock

  try {
    const cooldownCutoff = new Date(Date.now() - COOLDOWN_MS);

    const eligible = await prisma.match.findMany({
      where: {
        status: "LIVE",
        OR: [
          { stream: null },
          {
            stream: {
              isActive: false,
              lastCheckedAt: { lt: cooldownCutoff },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (eligible.length === 0) return; // ✅ safe to return here now

    console.log(
      `[YouTube] ${eligible.length} match(es) eligible for stream search`,
    );

    for (const { id } of eligible) {
      if (quotaExceeded) {
        console.warn("[YouTube] Quota hit mid-loop — stopping bulk refresh");
        break;
      }
      await findAndSaveStreamForMatch(id);
      await new Promise((r) => setTimeout(r, 1_000));
    }
  } finally {
    bulkRefreshRunning = false; // 🔓 ALWAYS unlocks — return, break, or throw
  }
}
