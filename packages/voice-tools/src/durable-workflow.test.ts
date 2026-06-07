import { describe, expect, it, vi } from "vitest";
import type { VoicePersistenceRepository } from "@aimate/datastore";
import { DurableVoiceWorkflowStore } from "./durable-workflow";

const menuItem = {
  tenant_id: "t1",
  store_id: "s1",
  menu_snapshot_id: "m1",
  entity_type: "ITEM" as const,
  entity_id: "item_chicken_burger",
  name: "Chicken Burger",
  aliases: ["chicken sandwich"],
  price: 699,
  fulfillment_modes: ["COLLECTION"],
  stock_status: "AVAILABLE" as const,
  modifier_group_ids: [],
  updated_at: new Date().toISOString()
};

describe("DurableVoiceWorkflowStore", () => {
  it("writes call, cart, order, payment, prompt, and audit milestones", async () => {
    const repo = {
      upsertCallSession: vi.fn().mockResolvedValue(undefined),
      upsertCartSnapshot: vi.fn().mockResolvedValue(undefined),
      upsertOrderAttempt: vi.fn().mockResolvedValue(undefined),
      upsertPaymentAttempt: vi.fn().mockResolvedValue(undefined),
      upsertPromptVersion: vi.fn().mockResolvedValue(undefined),
      insertAuditEvent: vi.fn().mockResolvedValue(undefined)
    } as unknown as VoicePersistenceRepository;

    const store = new DurableVoiceWorkflowStore({ repository: repo });

    await store.startSession({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_1",
      language: "en",
      prompt_hash: "prompt_hash"
    });
    await store.addItem({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_1",
      language: "en",
      entity: menuItem,
      quantity: 1
    });
    await store.setFulfillment({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_1",
      language: "en",
      fulfillment_type: "COLLECTION"
    });
    await store.setCustomer({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_1",
      language: "en",
      customer: { first_name: "Sam", phone: "07123456789" }
    });
    const attempt = await store.confirmOrder({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_1",
      payment_type: "ONLINE"
    });
    await store.recordPayment({
      tenant_id: "t1",
      store_id: "s1",
      order_attempt_id: attempt.order_attempt_id,
      provider: "mock",
      payment_attempt_id: "pay_1",
      idempotency_key: "idem_1",
      amount: attempt.price.total,
      currency: "GBP",
      url: "https://payments.example.test/pay/1"
    });
    await store.markSubmitted({
      tenant_id: "t1",
      store_id: "s1",
      order_attempt_id: attempt.order_attempt_id,
      foodhub_order_id: "fh_1",
      resource_uri: "/v1/stores/s1/orders/fh_1"
    });
    await store.endSession({ tenant_id: "t1", store_id: "s1", call_id: "call_1" });

    expect(repo.upsertCallSession).toHaveBeenCalled();
    expect(repo.upsertCartSnapshot).toHaveBeenCalled();
    expect(repo.upsertOrderAttempt).toHaveBeenCalledWith(expect.objectContaining({
      tenant_id: "t1",
      store_id: "s1",
      state: "SUBMITTED"
    }));
    expect(repo.upsertPaymentAttempt).toHaveBeenCalledWith(expect.objectContaining({
      payment_attempt_id: "pay_1"
    }));
    expect(repo.upsertPromptVersion).toHaveBeenCalledWith(expect.objectContaining({
      prompt_hash: "prompt_hash"
    }));
    expect(repo.insertAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      event_type: "call.ended"
    }));
  });

  it("restores session and attempt from database if not present in memory", async () => {
    const mockSessionDoc = {
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_db_1",
      status: "CART_BUILDING",
      caller_phone: "07999888777",
      language: "en",
      prompt_hash: "prompt_1",
      started_at: "2026-06-07T12:00:00.000Z",
      updated_at: "2026-06-07T12:05:00.000Z"
    };

    const mockCartDoc = {
      tenant_id: "t1",
      store_id: "s1",
      call_id: "call_db_1",
      cart_id: "cart_db_1",
      version: 1,
      cart: {
        cart_id: "cart_db_1",
        version: 1,
        items: [{ cart_line_id: "line_1", id: "burger", name: "Burger", price: 599, quantity: 1, addons: [] }]
      }
    };

    const mockAttemptDoc = {
      tenant_id: "t1",
      store_id: "s1",
      order_attempt_id: "attempt_db_1",
      call_id: "call_db_1",
      external_reference_id: "ext_db_1",
      state: "CONFIRMED",
      cart_version: 1,
      payment_type: "ONLINE",
      price: { subtotal: 599, delivery_fee: 0, service_fee: 0, tax: 0, total: 599 },
      payload: {},
      created_at: "2026-06-07T12:05:00.000Z",
      updated_at: "2026-06-07T12:05:00.000Z"
    };

    const repo = {
      findCallSession: vi.fn().mockResolvedValue(mockSessionDoc),
      findCartSnapshot: vi.fn().mockResolvedValue(mockCartDoc),
      findOrderAttempt: vi.fn().mockResolvedValue(mockAttemptDoc)
    } as unknown as VoicePersistenceRepository;

    const store = new DurableVoiceWorkflowStore({ repository: repo });

    // 1. Verify getSession loads from database
    const session = await store.getSession({ tenant_id: "t1", store_id: "s1", call_id: "call_db_1" });
    expect(repo.findCallSession).toHaveBeenCalledWith("t1", "s1", "call_db_1");
    expect(repo.findCartSnapshot).toHaveBeenCalledWith("t1", "s1", "call_db_1");
    expect(session).toBeDefined();
    expect(session?.call_id).toBe("call_db_1");
    expect(session?.cart.cart_id).toBe("cart_db_1");
    expect(session?.cart.items[0].name).toBe("Burger");

    // 2. Verify subsequent getSession queries memory synchronously
    vi.mocked(repo.findCallSession).mockClear();
    const session2 = await store.getSession({ tenant_id: "t1", store_id: "s1", call_id: "call_db_1" });
    expect(repo.findCallSession).not.toHaveBeenCalled();
    expect(session2).toBe(session);

    // 3. Verify getAttempt loads from database
    const attempt = await store.getAttempt({ tenant_id: "t1", store_id: "s1", order_attempt_id: "attempt_db_1" });
    expect(repo.findOrderAttempt).toHaveBeenCalledWith("t1", "s1", "attempt_db_1");
    expect(attempt).toBeDefined();
    expect(attempt?.order_attempt_id).toBe("attempt_db_1");
    expect(attempt?.state).toBe("CONFIRMED");

    // 4. Verify subsequent getAttempt queries memory
    vi.mocked(repo.findOrderAttempt).mockClear();
    const attempt2 = await store.getAttempt({ tenant_id: "t1", store_id: "s1", order_attempt_id: "attempt_db_1" });
    expect(repo.findOrderAttempt).not.toHaveBeenCalled();
    expect(attempt2).toBe(attempt);
  });
});
