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
});
