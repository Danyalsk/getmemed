import { Redis } from "ioredis";
import type { z } from "zod";

import { env } from "../config/env";

const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      // Fail fast: a slow cache must never slow down the request it is meant to speed up.
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 500, 10_000),
    })
  : null;

// Log once per outage instead of on every reconnect attempt.
let connected = true;
redis?.on("error", (error: NodeJS.ErrnoException) => {
  if (!connected) return;
  connected = false;
  console.warn(`Redis unavailable (${error.code ?? error.message}), serving from database`);
});
redis?.on("ready", () => {
  connected = true;
});

/**
 * Read-through cache. Falls back to `load` when Redis is not configured, down,
 * or holds data that no longer matches the schema.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  schema: z.ZodType<T>,
  load: () => Promise<T>,
): Promise<T> {
  if (!redis) return load();

  try {
    const hit = await redis.get(key);
    if (hit !== null) {
      const parsed = schema.safeParse(JSON.parse(hit));
      if (parsed.success) return parsed.data;
    }
  } catch {
    // Cache miss on any Redis or parse failure.
  }

  const value = await load();
  redis.set(key, JSON.stringify(value), "EX", ttlSeconds).catch(() => undefined);
  return value;
}

export async function invalidate(key: string): Promise<void> {
  await redis?.del(key).catch(() => undefined);
}

export async function disconnectCache(): Promise<void> {
  await redis?.quit();
}
