import axios from 'axios';
import { config } from '../config/index.js';
import { cacheGet, cacheSet } from '../lib/redis.js';

const client = axios.create({
   baseURL: config.football.baseUrl,
   timeout: 30_000,
   headers: config.football.key
      ? { 'x-apisports-key': config.football.key }
      : {},
});

export class FootballApiError extends Error {
   constructor(
      message: string,
      public code: 'SUSPENDED' | 'QUOTA_EXCEEDED' | 'NO_KEY' | 'UNKNOWN'
   ) {
      super(message);
      this.name = 'FootballApiError';
   }
}

export const footballApiService = {
   async getLiveFixturesCached() {
      const cacheKey = 'api-football:live';
      const cached = await cacheGet<any>(cacheKey);
      if (cached) return cached;

      if (!config.football.key) {
         throw new FootballApiError(
            'Football API key not configured',
            'NO_KEY'
         );
      }

      try {
         const { data } = await client.get('/fixtures', {
            params: { live: 'all' },
         });

         // Check for API-level errors in the response body
         if (data?.errors?.access) {
            const msg: string = data.errors.access;
            if (msg.toLowerCase().includes('suspended')) {
               throw new FootballApiError(
                  'Football API account is suspended',
                  'SUSPENDED'
               );
            }
            throw new FootballApiError(msg, 'UNKNOWN');
         }

         if (data?.errors?.requests) {
            throw new FootballApiError(
               'Football API daily quota exceeded',
               'QUOTA_EXCEEDED'
            );
         }

         const fixtureCount = data?.response?.length ?? 0;

         if (fixtureCount === 0) {
            return { response: [] };
         }

         cacheSet(cacheKey, data, 30).catch((e) =>
            console.error('Failed to cache live fixtures:', e.message)
         );
         return data;
      } catch (err: any) {
         // Re-throw our custom errors as-is
         if (err instanceof FootballApiError) throw err;
         console.error('Error fetching live fixtures:', err.message);
         throw new FootballApiError(err.message, 'UNKNOWN');
      }
   },

   async getFixturesByDateCached(yyyy_mm_dd: string) {
      const cacheKey = `api-football:date:${yyyy_mm_dd}`;
      const cached = await cacheGet<any>(cacheKey);
      if (cached) return cached;

      if (!config.football.key) {
         console.warn(
            '⚠️  API_FOOTBALL_KEY not set — date fixtures unavailable'
         );
         return { response: [] };
      }

      try {
         const { data } = await client.get('/fixtures', {
            params: { date: yyyy_mm_dd },
         });
         cacheSet(cacheKey, data, 3600).catch((e) =>
            console.error('Failed to cache date fixtures:', e.message)
         );
         return data;
      } catch (err: any) {
         console.error(
            `Error fetching fixtures for ${yyyy_mm_dd}:`,
            err.message
         );
         return { response: [] };
      }
   },
};
