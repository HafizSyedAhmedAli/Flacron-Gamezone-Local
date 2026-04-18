import axios from "axios";
import { config } from "../config/index.js";
import { teamRepository } from "../repositories/team.repository.js";
import { leagueRepository } from "../repositories/league.repository.js";
import { cacheGet, cacheSet } from "../lib/redis.js";
import type { PaginationParams, PaginatedResult } from "../types/index.js";

const TEAMS_CACHE_KEY = "football:teams";
const TEAMS_TTL = 60 * 10;

export const teamService = {
  getAll(query?: string) {
    return teamRepository.findAll(query);
  },

  async getAllWithStats(query?: string) {
    const teams = await teamRepository.findAll(query);
    return teams.map((team) => {
      let matches = 0;
      let wins = 0;
      team.homeMatches.forEach((m: any) => {
        if (m.score) {
          const [h, a] = m.score.split("-").map(Number);
          if (!isNaN(h) && !isNaN(a)) {
            matches++;
            if (h > a) wins++;
          }
        }
      });
      team.awayMatches.forEach((m: any) => {
        if (m.score) {
          const [h, a] = m.score.split("-").map(Number);
          if (!isNaN(h) && !isNaN(a)) {
            matches++;
            if (a > h) wins++;
          }
        }
      });
      const { homeMatches, awayMatches, ...teamData } = team;
      return { ...teamData, matches, wins };
    });
  },

  getById(id: string) {
    return teamRepository.findById(id);
  },

  async getPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const [data, total] = await teamRepository.findPaginated(params);
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
    logo?: string;
    apiTeamId?: number;
    leagueId: string;
  }) {
    const existing = await teamRepository.findFirst(
      data.apiTeamId ? { apiTeamId: data.apiTeamId } : { name: data.name },
    );
    if (existing)
      throw Object.assign(new Error("Team already added"), { status: 400 });

    const league = await leagueRepository.findByApiId(Number(data.leagueId));
    if (!league) {
      const leagueName = await this._fetchLeagueName(data.leagueId);
      throw Object.assign(new Error(`Add ${leagueName} as League First!`), {
        status: 404,
      });
    }

    return teamRepository.create({
      ...data,
      logo: data.logo ?? null,
      leagueId: league.id,
    });
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      logo: string;
      apiTeamId: number;
      leagueId: string;
    }>,
  ) {
    return teamRepository.update(id, {
      ...data,
      logo: data.logo === "" ? null : (data.logo ?? undefined),
      leagueId: data.leagueId === "" ? null : (data.leagueId ?? undefined),
    });
  },

  delete(id: string) {
    return teamRepository.delete(id);
  },

  async fetchFromApi(leagueId: string | null, page: number, limit: number) {
    const cacheKey = leagueId
      ? `${TEAMS_CACHE_KEY}:league:${leagueId}`
      : TEAMS_CACHE_KEY;
    const cached = await cacheGet<any[]>(cacheKey);
    const allTeams =
      cached ?? (await this._fetchAndCacheFromApi(leagueId, cacheKey));
    return this._paginate(allTeams, page, limit);
  },

  async _fetchAndCacheFromApi(
    leagueId: string | null,
    cacheKey: string,
  ): Promise<any[]> {
    if (!config.football.key)
      throw Object.assign(new Error("Football API key not configured"), {
        status: 500,
      });

    const url = leagueId
      ? `${config.football.baseUrl}/teams?league=${leagueId}&season=${this._deriveSeasonFromNow()}`
      : `${config.football.baseUrl}/teams?league=39&season=${this._deriveSeasonFromNow()}`;

    const { data } = await axios.get(url, {
      headers: { "x-apisports-key": config.football.key },
      timeout: 10_000,
    });

    let teams: any[];
    if (!data?.response?.length) {
      teams = await this._fetchTeamsFromSportMonks(leagueId);
    } else {
      teams = data.response.map((item: any) => ({
        apiTeamId: item.team.id,
        name: item.team.name,
        logo: item.team.logo,
        country: item.team.country ?? "Unknown",
        founded: item.team.founded,
        venue: item.venue?.name ?? null,
      }));
    }

    await cacheSet(cacheKey, teams, TEAMS_TTL);
    return teams;
  },

  async _fetchTeamsFromSportMonks(leagueId: string | null): Promise<any[]> {
    if (!config.football.sportMonksKey)
      throw Object.assign(new Error("Backup Football API key not configured"), {
        status: 500,
      });

    const { data } = await axios.get(
      `${config.football.sportMonksBaseUrl}/teams`,
      {
        params: {
          api_token: config.football.sportMonksKey,
          include: "country",
          ...(leagueId && { league_id: leagueId }),
        },
        headers: { Accept: "application/json" },
        timeout: 10_000,
      },
    );

    return data.data.map((team: any) => ({
      apiTeamId: team.id,
      name: team.name,
      logo: team.image_path,
      founded: team.founded,
      venue: null,
    }));
  },

  async _fetchLeagueName(leagueId: string): Promise<string> {
    if (!config.football.key) return `League ID ${leagueId}`;
    try {
      const { data } = await axios.get(
        `${config.football.baseUrl}/leagues?id=${leagueId}&season=${this._deriveSeasonFromNow()}`,
        {
          headers: { "x-apisports-key": config.football.key },
          timeout: 10_000,
        },
      );
      return data.response?.[0]?.league?.name ?? `League ID ${leagueId}`;
    } catch {
      return `League ID ${leagueId}`;
    }
  },

  _deriveSeasonFromNow(): number {
    const today = new Date();
    return today.getMonth() >= 6
      ? today.getFullYear()
      : today.getFullYear() - 1;
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
