import { describe, expect, it } from "vitest";
import { FoodHubClient } from "./client";
import { InMemoryTokenStore, FoodHubTokenManager } from "./token-manager";

describe("FoodHubClient", () => {
  it("validates and posts create order payloads", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      if (String(url).endsWith("/v1/auth/token")) {
        return Response.json({ access_token: "token", expires_in: 3600 });
      }
      return Response.json({
        data: {
          orderId: "ord_1",
          resourceUri: "/v1/stores/store_1/orders/ord_1",
          storeId: "store_1"
        }
      });
    };

    const client = new FoodHubClient({
      baseUrl: "https://developer.foodhub.com",
      clientId: "client",
      clientSecret: "secret",
      tokenManager: new FoodHubTokenManager(
        "https://developer.foodhub.com",
        new InMemoryTokenStore(),
        fetchImpl as typeof fetch
      ),
      fetchImpl: fetchImpl as typeof fetch
    });

    const result = await client.createOrder("store_1", {
      external_reference_id: "AIMATE-1",
      source: "AIMate Voice Agent",
      fulfillment_type: "COLLECTION",
      placed_on: new Date().toISOString(),
      customer: {
        first_name: "Sam",
        last_name: "Khan",
        phone: "07123456789"
      },
      items: [
        {
          id: "item_1",
          name: "Chicken Burger",
          price: 699,
          quantity: 1,
          addons: []
        }
      ],
      payment: {
        subtotal: 699,
        charges: { tax: 0 },
        discounts: [],
        total: 699,
        payment_type: "CASH",
        payment_status: "UNPAID"
      }
    });

    expect(result.data?.orderId).toBe("ord_1");
    expect(calls.some((call) => call.url.endsWith("/v1/stores/store_1/orders"))).toBe(true);
  });
});
