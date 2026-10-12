import { Redis } from "ioredis";

import { env } from "../config/env";

const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 500, 10_000),
    })
  : null;

let connected = true;
redis?.on("error", (error: NodeJS.ErrnoException) => {
  if (!connected) return;
  connected = false;
  console.warn(`Redis unavailable (${error.code ?? error.message}), serving from database`);
});
redis?.on("ready", () => {
  connected = true;
});

export async function getOrSetJson(
  namespace: string,
  variant: string,
  ttlSeconds: number,
  load: () => Promise<string>,
): Promise<string> {
  if (!redis) return load();

  const version = await redis.get(`${namespace}:version`).catch(() => null);
  const key = `${namespace}:v${version ?? "0"}:${variant}`;
  const hit = await redis.get(key).catch(() => null);
  if (hit !== null) return hit;

  const body = await load();
  redis.set(key, body, "EX", ttlSeconds).catch(() => undefined);
  return body;
}

export async function invalidate(namespace: string): Promise<void> {
  await redis?.incr(`${namespace}:version`).catch(() => undefined);
}

export async function disconnectRedis(): Promise<void> {
  await redis?.quit();
}
