import { describe, expect, it, vi } from "vitest";
import { RedisLockManager } from "./locks";
import type { Redis } from "ioredis";

describe("RedisLockManager", () => {
  it("acquires and releases a lock successfully", async () => {
    const mockRedis = {
      set: vi.fn().mockResolvedValue("OK"),
      eval: vi.fn().mockResolvedValue(1)
    } as unknown as Redis;

    const manager = new RedisLockManager(mockRedis);
    const lock = await manager.acquire("test-key", 5000);

    expect(lock).toBeDefined();
    expect(mockRedis.set).toHaveBeenCalledWith("test-key", expect.any(String), "PX", 5000, "NX");

    await lock?.release();
    expect(mockRedis.eval).toHaveBeenCalledWith(expect.any(String), 1, "test-key", expect.any(String));
  });

  it("returns undefined if the lock is already held", async () => {
    const mockRedis = {
      set: vi.fn().mockResolvedValue(null)
    } as unknown as Redis;

    const manager = new RedisLockManager(mockRedis);
    const lock = await manager.acquire("test-key", 5000);

    expect(lock).toBeUndefined();
    expect(mockRedis.set).toHaveBeenCalledTimes(1);
  });
});
