import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(url);

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}
