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
    // Safe fallback so you can run immediately without keys
    const mock = {
      source: "mock",
      fixtures: [
        {
          fixture: {
            id: 1001,
            date: new Date().toISOString(),
            status: { short: "LIVE" },
            venue: { name: "Demo Stadium" },
          },
          league: { name: "Demo League", country: "Demo", logo: "" },
          teams: {
            home: { name: "Flacron FC", logo: "" },
            away: { name: "GameZone United", logo: "" },
          },
          goals: { home: 1, away: 0 },
        },
      ],
    };
    await cacheSet(cacheKey, mock, 30);
    return mock;
  }

  const { data } = await client.get("/fixtures", { params: { live: "all" } });
  await cacheSet(cacheKey, data, 30);
  return data;
}

export async function getFixturesByDateCached(yyyy_mm_dd: string) {
  const cacheKey = `api-football:date:${yyyy_mm_dd}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  if (!KEY) {
    const mock = {
      source: "mock",
      fixtures: [],
    };
    await cacheSet(cacheKey, mock, 3600);
    return mock;
  }

  const { data } = await client.get("/fixtures", {
    params: { date: yyyy_mm_dd },
  });
  await cacheSet(cacheKey, data, 3600);
  return data;
}
