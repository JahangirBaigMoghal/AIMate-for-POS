import { describe, expect, it, vi } from "vitest";
import { StripePaymentProvider } from "./stripe";

const mockCreate = vi.fn();

// Mock Stripe class to avoid constructor type errors
vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockCreate
        }
      };
      constructor() {}
    }
  };
});

describe("StripePaymentProvider", () => {
  it("creates a checkout session with the correct parameters", async () => {
    mockCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123"
    });

    const provider = new StripePaymentProvider("sk_test_mock");
    const result = await provider.createPaymentLink({
      tenant_id: "t1",
      store_id: "s1",
      order_attempt_id: "o1",
      idempotency_key: "key123",
      amount: 1599,
      currency: "GBP"
    });

    expect(result.payment_attempt_id).toBe("cs_test_123");
    expect(result.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
    expect(result.provider).toBe("stripe");
    expect(result.expires_at).toBeDefined();

    expect(mockCreate).toHaveBeenCalledWith(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "Order payment - Ref: o1"
              },
              unit_amount: 1599
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: "https://payments.example.test/success?id=o1",
        cancel_url: "https://payments.example.test/cancel?id=o1",
        metadata: {
          tenant_id: "t1",
          store_id: "s1",
          order_attempt_id: "o1"
        }
      },
      {
        idempotencyKey: "key123"
      }
    );
  });
});
