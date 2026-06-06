import { describe, expect, it, vi } from "vitest";
import { RedisTokenStore } from "./redis-token-store";
import type { Redis } from "ioredis";

describe("RedisTokenStore", () => {
  it("gets and sets a token successfully", async () => {
    const cachedToken = {
      accessToken: "t123",
      scope: "s1",
      expiresAt: Date.now() + 10000
    };

    const mockRedis = {
      get: vi.fn().mockResolvedValue(JSON.stringify(cachedToken)),
      set: vi.fn().mockResolvedValue("OK")
    } as unknown as Redis;

    const store = new RedisTokenStore(mockRedis);
    const token = await store.get("test-key");

    expect(token).toEqual(cachedToken);
    expect(mockRedis.get).toHaveBeenCalledWith("foodhub:token:test-key");

    await store.set("test-key", cachedToken);
    expect(mockRedis.set).toHaveBeenCalledWith(
      "foodhub:token:test-key",
      JSON.stringify(cachedToken),
      "PX",
      expect.any(Number)
    );
  });

  it("returns undefined if token not found", async () => {
    const mockRedis = {
      get: vi.fn().mockResolvedValue(null)
    } as unknown as Redis;

    const store = new RedisTokenStore(mockRedis);
    const token = await store.get("test-key");

    expect(token).toBeUndefined();
  });
});
