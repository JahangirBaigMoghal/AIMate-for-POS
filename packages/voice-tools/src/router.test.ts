import { describe, expect, it } from "vitest";
import { FoodHubClient } from "@aimate/foodhub";
import { MockPaymentProvider } from "@aimate/payments";
import { MockTelephonyProvider } from "@aimate/telephony";
import { VoiceToolRouter } from "./router";

const router = new VoiceToolRouter({
  foodhub: new FoodHubClient({
    baseUrl: "https://developer.foodhub.com"
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

  it("builds, confirms, and mock-submits a complete collection order", async () => {
    const localRouter = new VoiceToolRouter({
      foodhub: new FoodHubClient({
        baseUrl: "https://developer.foodhub.com"
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

    localRouter.startSession({
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      language: "en"
    });

    await localRouter.call("add_item_to_cart", {
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_add",
      language: "en",
      query: "chicken sandwich",
      quantity: 1
    });

    await localRouter.call("set_fulfillment", {
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_fulfillment",
      language: "en",
      fulfillment_type: "COLLECTION"
    });

    await localRouter.call("set_customer_details", {
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_customer",
      language: "en",
      first_name: "Sam",
      phone: "07123456789"
    });

    const confirm = await localRouter.call("confirm_order", {
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_confirm",
      language: "en",
      customer_confirmed: true,
      payment_type: "CASH"
    });

    expect(confirm.ok).toBe(true);
    const orderAttemptId = (confirm.ok ? (confirm.data as any).data.order_attempt_id : "");

    const submit = await localRouter.call("create_foodhub_order", {
      call_id: "call_order",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_submit",
      language: "en",
      order_attempt_id: orderAttemptId,
      customer_confirmed: true
    });

    expect(submit.ok).toBe(true);
    if (submit.ok) {
      expect((submit.data as any).data.provider).toBe("mock-foodhub");
      expect((submit.data as any).data.state).toBe("SUBMITTED");
    }
  });

  it("rejects payment links when amount differs from the confirmed total", async () => {
    const localRouter = new VoiceToolRouter({
      foodhub: new FoodHubClient({
        baseUrl: "https://developer.foodhub.com"
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
          entity_id: "item_cola",
          name: "Cola",
          aliases: ["coke"],
          price: 199,
          fulfillment_modes: ["COLLECTION"],
          stock_status: "AVAILABLE",
          modifier_group_ids: [],
          updated_at: new Date().toISOString()
        }
      ]
    });

    localRouter.startSession({
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      language: "en"
    });

    await localRouter.call("add_item_to_cart", {
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_add",
      language: "en",
      query: "coke"
    });
    await localRouter.call("set_fulfillment", {
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_fulfillment",
      language: "en",
      fulfillment_type: "COLLECTION"
    });
    await localRouter.call("set_customer_details", {
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_customer",
      language: "en",
      first_name: "Sam",
      phone: "07123456789"
    });
    const confirm = await localRouter.call("confirm_order", {
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_confirm",
      language: "en",
      customer_confirmed: true,
      payment_type: "ONLINE"
    });
    const orderAttemptId = (confirm.ok ? (confirm.data as any).data.order_attempt_id : "");

    const payment = await localRouter.call("create_payment_link", {
      call_id: "call_payment",
      tenant_id: "t1",
      store_id: "s1",
      request_id: "req_payment",
      language: "en",
      order_attempt_id: orderAttemptId,
      amount: 999,
      currency: "GBP"
    });

    expect(payment.ok).toBe(false);
    if (!payment.ok) expect(payment.error_code).toBe("PAYMENT_AMOUNT_MISMATCH");
  });
});
