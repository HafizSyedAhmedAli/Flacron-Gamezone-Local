import axios from "axios";
import { config } from "../config/index.js";
import { cacheGet, cacheSet } from "../lib/redis.js";

const client = axios.create({
  baseURL: config.football.baseUrl,
  timeout: 30_000,
  headers: config.football.key
    ? { "x-apisports-key": config.football.key }
    : {},
});

export const footballApiService = {
  async getLiveFixturesCached() {
    const cacheKey = "api-football:live";
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    if (!config.football.key) {
      console.warn("⚠️  API_FOOTBALL_KEY not set — live fixtures unavailable");
      return { response: [] };
    }

    try {
      const { data } = await client.get("/fixtures", {
        params: { live: "all" },
      });
      cacheSet(cacheKey, data, 30).catch((e) =>
        console.error("Failed to cache live fixtures:", e.message),
      );
      return data;
    } catch (err: any) {
      console.error("Error fetching live fixtures:", err.message);
      return { response: [] };
    }
  },

  async getFixturesByDateCached(yyyy_mm_dd: string) {
    const cacheKey = `api-football:date:${yyyy_mm_dd}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    if (!config.football.key) {
      console.warn("⚠️  API_FOOTBALL_KEY not set — date fixtures unavailable");
      return { response: [] };
    }

    try {
      const { data } = await client.get("/fixtures", {
        params: { date: yyyy_mm_dd },
      });
      cacheSet(cacheKey, data, 3600).catch((e) =>
        console.error("Failed to cache date fixtures:", e.message),
      );
      return data;
    } catch (err: any) {
      console.error(`Error fetching fixtures for ${yyyy_mm_dd}:`, err.message);
      return { response: [] };
    }
  },
};
