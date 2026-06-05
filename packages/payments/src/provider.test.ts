import { describe, expect, it } from "vitest";
import { MockPaymentProvider } from "./provider";

describe("MockPaymentProvider", () => {
  it("creates deterministic-looking hosted payment links without card capture", async () => {
    const provider = new MockPaymentProvider();
    const link = await provider.createPaymentLink({
      tenant_id: "t1",
      store_id: "s1",
      order_attempt_id: "o1",
      idempotency_key: "payment:t1:s1:o1:999",
      amount: 999,
      currency: "GBP"
    });
    expect(link.url).toContain("payments.example.test");
    expect(link.provider).toBe("mock");
  });
});
