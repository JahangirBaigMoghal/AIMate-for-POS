import type { Redis } from "ioredis";
import type { TokenStore, CachedToken } from "./token-manager";

/**
 * A TokenStore implementation backed by Redis for multi-instance deployments.
 */
export class RedisTokenStore implements TokenStore {
  constructor(
    private readonly redis: Redis,
    private readonly prefix = "foodhub:token:"
  ) {}

  async get(key: string): Promise<CachedToken | undefined> {
    const raw = await this.redis.get(this.prefix + key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as CachedToken;
    } catch {
      return undefined;
    }
  }

  async set(key: string, token: CachedToken): Promise<void> {
    const now = Date.now();
    const ttlMs = Math.max(token.expiresAt - now, 0);
    if (ttlMs <= 0) return;

    await this.redis.set(
      this.prefix + key,
      JSON.stringify(token),
      "PX",
      ttlMs
    );
  }
}
