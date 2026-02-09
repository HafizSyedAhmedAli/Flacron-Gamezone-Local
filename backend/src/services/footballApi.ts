import axios from "axios";
import { cacheGet, cacheSet } from "../lib/redis.js";

type ApiFootballFixture = any;

const BASE =
  process.env.API_FOOTBALL_BASEURL || "https://v3.football.api-sports.io";
const KEY = process.env.API_FOOTBALL_KEY || "";

const client = axios.create({
  baseURL: BASE,
  timeout: 12000,
  headers: KEY ? { "x-apisports-key": KEY } : {},
});

export async function getLiveFixturesCached() {
  const cacheKey = "api-football:live";
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  if (!KEY) {
    console.warn("⚠️ API_FOOTBALL_KEY not set - live fixtures unavailable");
    return { response: [] };
  }

  try {
    const { data } = await client.get("/fixtures", { params: { live: "all" } });

    // Handle cache failure separately, without affecting return value
    cacheSet(cacheKey, data, 30).catch((err) =>
      console.error("Failed to cache live fixtures:", err.message),
    );

    return data;
  } catch (error: any) {
    console.error(
      "Error fetching live fixtures from API-Football:",
      error.message,
    );
    return { response: [] };
  }
}

export async function getFixturesByDateCached(yyyy_mm_dd: string) {
  const cacheKey = `api-football:date:${yyyy_mm_dd}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  if (!KEY) {
    console.warn("⚠️ API_FOOTBALL_KEY not set - date fixtures unavailable");
    return { response: [] };
  }

  try {
    const { data } = await client.get("/fixtures", {
      params: { date: yyyy_mm_dd },
    });

    cacheSet(cacheKey, data, 3600).catch((err) =>
      console.error("Failed to cache live fixtures by date:", err.message),
    );
    
    return data;
  } catch (error: any) {
    console.error(`Error fetching fixtures for ${yyyy_mm_dd}:`, error.message);
    return { response: [] };
  }
}
