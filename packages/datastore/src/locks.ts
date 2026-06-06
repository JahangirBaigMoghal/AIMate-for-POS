import type { Redis } from "ioredis";
import { createId } from "@aimate/shared";

export interface Lock {
  release(): Promise<void>;
}

export interface LockManager {
  acquire(key: string, ttlMs: number): Promise<Lock | undefined>;
}

export class InMemoryLockManager implements LockManager {
  private readonly locks = new Map<string, number>();

  async acquire(key: string, ttlMs: number): Promise<Lock | undefined> {
    const now = Date.now();
    const existing = this.locks.get(key);
    if (existing && existing > now) return undefined;
    this.locks.set(key, now + ttlMs);
    return {
      release: async () => {
        this.locks.delete(key);
      }
    };
  }
}

export class RedisLockManager implements LockManager {
  constructor(private readonly redis: Redis) {}

  async acquire(key: string, ttlMs: number): Promise<Lock | undefined> {
    const value = createId("lock");
    const result = await this.redis.set(key, value, "PX", ttlMs, "NX");
    if (result !== "OK") {
      return undefined;
    }

    return {
      release: async () => {
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        await this.redis.eval(script, 1, key, value);
      }
    };
  }
}

