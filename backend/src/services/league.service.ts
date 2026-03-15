import axios from "axios";
import { config } from "../config/index.js";
import { leagueRepository } from "../repositories/league.repository.js";
import { cacheGet, cacheSet, cacheDel } from "../lib/redis.js";
import type { PaginationParams, PaginatedResult } from "../types/index.js";

const LEAGUES_CACHE_KEY = "football:leagues";
const LEAGUES_TTL = 60 * 5;

export const leagueService = {
  getAll() {
    return leagueRepository.findAll();
  },

  getById(id: string) {
    return leagueRepository.findById(id);
  },

  async getPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const [data, total] = await leagueRepository.findPaginated(params);
    const skip = (params.page - 1) * params.limit;
    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        hasMore: skip + data.length < total,
      },
    };
  },

  async create(data: {
    name: string;
    country?: string;
    logo?: string;
    apiLeagueId?: number;
  }) {
    const existing = await leagueRepository.findFirst(
      data.apiLeagueId
        ? { apiLeagueId: data.apiLeagueId }
        : { name: data.name },
    );
    if (existing)
      throw Object.assign(new Error("League already added"), { status: 400 });
    return leagueRepository.create(data);
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      country: string;
      logo: string;
      apiLeagueId: number;
    }>,
  ) {
    return leagueRepository.update(id, {
      ...data,
      logo: data.logo === "" ? null : data.logo,
    });
  },

  delete(id: string) {
    return leagueRepository.delete(id);
  },

  /** Invalidates the cached league list so the next fetchFromApi call pulls fresh data. */
  async invalidateCache(): Promise<void> {
    await cacheDel(LEAGUES_CACHE_KEY);
  },

  async fetchFromApi(page: number, limit: number) {
    const cached = await cacheGet<any[]>(LEAGUES_CACHE_KEY);
    const allLeagues = cached ?? (await this._fetchAndCacheFromApi());
    return this._paginate(allLeagues, page, limit);
  },

  async _fetchAndCacheFromApi(): Promise<any[]> {
    if (!config.football.key)
      throw Object.assign(new Error("Football API key not configured"), {
        status: 500,
      });

    const { data } = await axios.get(`${config.football.baseUrl}/leagues`, {
      headers: { "x-apisports-key": config.football.key },
      timeout: 10_000,
    });

    let leagues: any[];
    if (!data?.response?.length) {
      leagues = await this._fetchLeaguesFromSportMonks();
    } else {
      leagues = data.response.map((item: any) => ({
        apiLeagueId: item.league.id,
        name: item.league.name,
        logo: item.league.logo,
        country: item.country?.name ?? "Unknown",
      }));
    }

    await cacheSet(LEAGUES_CACHE_KEY, leagues, LEAGUES_TTL);
    return leagues;
  },

  async _fetchLeaguesFromSportMonks(): Promise<any[]> {
    if (!config.football.sportMonksKey)
      throw Object.assign(new Error("Backup Football API key not configured"), {
        status: 500,
      });

    const { data } = await axios.get(
      `${config.football.sportMonksBaseUrl}/leagues`,
      {
        params: {
          api_token: config.football.sportMonksKey,
          include: "country",
        },
        headers: { Accept: "application/json" },
        timeout: 10_000,
      },
    );

    return data.data.map((item: any) => ({
      apiLeagueId: item.id,
      name: item.name,
      logo: item.image_path,
      country: item.country?.name ?? "Unknown",
    }));
  },

  _paginate<T>(arr: T[], page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
      data: arr.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: arr.length,
        hasMore: endIndex < arr.length,
      },
    };
  },
};
