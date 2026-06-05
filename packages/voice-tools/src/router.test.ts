import { describe, expect, it } from "vitest";
import { FoodHubClient } from "@aimate/foodhub";
import { MockPaymentProvider } from "@aimate/payments";
import { MockTelephonyProvider } from "@aimate/telephony";
import { VoiceToolRouter } from "./router";

const router = new VoiceToolRouter({
  foodhub: new FoodHubClient({
    baseUrl: "https://developer.foodhub.com",
    clientId: "client",
    clientSecret: "secret"
  }),
  paymentProvider: new MockPaymentProvider(),
  telephonyProvider: new MockTelephonyProvider(),
  staffNumber: "+441234567890",
  menuEntities: [
    {
      tenant_id: "t1",
      store_id: "s1",
      menu_snapshot_id: "m1",
      entity_type: "ITEM",
      entity_id: "item_chicken_burger",
      name: "Chicken Burger",
      aliases: ["chicken sandwich"],
      price: 699,
      fulfillment_modes: ["DELIVERY", "COLLECTION"],
      stock_status: "AVAILABLE",
      modifier_group_ids: [],
      updated_at: new Date().toISOString()
    }
  ]
});

describe("VoiceToolRouter", () => {
  it("searches the menu through a typed tool", async () => {
    const result = await router.call("search_menu", {
      call_id: "call_1",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_1",
      language: "en",
      query: "chicken sandwich"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.stringify(result.data)).toContain("item_chicken_burger");
    }
  });

  it("rejects handoff when input is missing required fields", async () => {
    const result = await router.call("handoff_to_staff", {
      call_id: "call_1"
    });

    expect(result.ok).toBe(false);
  });
});
