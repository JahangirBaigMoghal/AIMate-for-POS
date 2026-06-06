import { describe, expect, it, vi } from "vitest";
import { CircuitBreaker, CircuitBreakerOpenError, retryWithBackoff } from "./resilience";

describe("Resilience Primitives", () => {
  describe("retryWithBackoff", () => {
    it("returns immediate success without retrying", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const res = await retryWithBackoff(fn, 3, 10);
      expect(res).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and succeeds eventually", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("err1"))
        .mockRejectedValueOnce(new Error("err2"))
        .mockResolvedValue("success");

      const res = await retryWithBackoff(fn, 3, 10);
      expect(res).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws the final error if all attempts fail", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("err"));
      await expect(retryWithBackoff(fn, 3, 5)).rejects.toThrow("err");
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("CircuitBreaker", () => {
    it("starts CLOSED and transitions to OPEN after threshold failures", async () => {
      const cb = new CircuitBreaker(3, 100);
      expect(cb.getState()).toBe("CLOSED");

      const failFn = vi.fn().mockRejectedValue(new Error("fail"));

      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(failFn)).rejects.toThrow("fail");
      }

      expect(cb.getState()).toBe("OPEN");
      expect(cb.getFailureCount()).toBe(3);

      // Subsequent executions should fail immediately with CircuitBreakerOpenError
      const okFn = vi.fn().mockResolvedValue("ok");
      await expect(cb.execute(okFn)).rejects.toThrow(CircuitBreakerOpenError);
      expect(okFn).not.toHaveBeenCalled();
    });

    it("transitions to HALF-OPEN after cooldown and CLOSED on success", async () => {
      const cb = new CircuitBreaker(2, 50); // 50ms cooldown
      const failFn = vi.fn().mockRejectedValue(new Error("fail"));

      await expect(cb.execute(failFn)).rejects.toThrow("fail");
      await expect(cb.execute(failFn)).rejects.toThrow("fail");
      expect(cb.getState()).toBe("OPEN");

      // Wait for cooldown
      await new Promise((resolve) => setTimeout(resolve, 60));

      const okFn = vi.fn().mockResolvedValue("success");
      // The breaker is now in HALF-OPEN state (evaluated internally on execute)
      const res = await cb.execute(okFn);
      expect(res).toBe("success");
      expect(cb.getState()).toBe("CLOSED");
      expect(cb.getFailureCount()).toBe(0);
    });

    it("goes back to OPEN from HALF-OPEN on failure", async () => {
      const cb = new CircuitBreaker(2, 50);
      const failFn = vi.fn().mockRejectedValue(new Error("fail"));

      await expect(cb.execute(failFn)).rejects.toThrow("fail");
      await expect(cb.execute(failFn)).rejects.toThrow("fail");
      expect(cb.getState()).toBe("OPEN");

      await new Promise((resolve) => setTimeout(resolve, 60));

      // In HALF-OPEN, if it fails, it should immediately trip to OPEN
      await expect(cb.execute(failFn)).rejects.toThrow("fail");
      expect(cb.getState()).toBe("OPEN");
    });
  });
});
