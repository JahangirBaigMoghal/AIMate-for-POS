import type {
  AuditEventDoc,
  CallSessionDoc,
  CartSnapshotDoc,
  OrderAttemptDoc,
  PaymentAttemptDoc,
  VoicePersistenceRepository
} from "@aimate/datastore";
import { createId, logger } from "@aimate/shared";
import type {
  CartSnapshot,
  ConfirmedOrderAttempt,
  FulfillmentType,
  SessionStartInput,
  VoiceOrderSession,
  VoiceWorkflowStore,
  WorkflowPricingConfig
} from "./workflow";
import { InMemoryVoiceWorkflowStore } from "./workflow";
import type {
  CustomerDetails,
  DeliveryAddress,
  MenuEntity,
  PaymentAttempt,
  PriceBreakdown,
  CreateFoodHubOrder
} from "@aimate/domain";

export type DurableVoiceWorkflowStoreConfig = {
  pricing?: WorkflowPricingConfig;
  repository: Promise<VoicePersistenceRepository> | VoicePersistenceRepository;
};

/**
 * Write-through workflow store.
 *
 * The in-memory store remains the low-latency call state for the active WebSocket,
 * while MongoDB receives every operational milestone for recovery, audit, and dashboards.
 */
export class DurableVoiceWorkflowStore implements VoiceWorkflowStore {
  private readonly memory: InMemoryVoiceWorkflowStore;
  private readonly log = logger.child({ component: "durable-voice-workflow" });

  constructor(private readonly config: DurableVoiceWorkflowStoreConfig) {
    this.memory = new InMemoryVoiceWorkflowStore(config.pricing);
  }

  async startSession(input: SessionStartInput): Promise<VoiceOrderSession> {
    const session = this.memory.startSession(input);
    await this.persistSession(session);
    await this.persistCart(session, this.memory.snapshot(input));
    if (input.prompt_hash) {
      await this.repository().then((repo) =>
        repo.upsertPromptVersion({
          tenant_id: input.tenant_id,
          store_id: input.store_id,
          prompt_hash: input.prompt_hash!,
          call_id: input.call_id,
          status: "OBSERVED",
          created_at: session.created_at,
          updated_at: session.updated_at
        })
      );
    }
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: input.call_id,
      event_type: "call.started",
      data: { language: input.language, prompt_hash: input.prompt_hash }
    });
    return session;
  }

  async endSession(input: { tenant_id: string; store_id: string; call_id: string }): Promise<void> {
    this.memory.endSession(input);
    const session = this.memory.getSession(input);
    if (!session) return;
    await this.persistSession(session);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: input.call_id,
      event_type: "call.ended",
      data: { status: session.status }
    });
  }

  async getSession(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
  }): Promise<VoiceOrderSession | undefined> {
    const memSession = this.memory.getSession(input);
    if (memSession) return memSession;

    const repo = await this.repository();
    const sessionDoc = await repo.findCallSession(input.tenant_id, input.store_id, input.call_id);
    if (!sessionDoc) return undefined;

    const cartDoc = await repo.findCartSnapshot(input.tenant_id, input.store_id, input.call_id);
    if (!cartDoc) return undefined;

    const restored: VoiceOrderSession = {
      call_id: sessionDoc.call_id,
      tenant_id: sessionDoc.tenant_id,
      store_id: sessionDoc.store_id,
      language: sessionDoc.language,
      caller_phone: sessionDoc.caller_phone,
      prompt_hash: sessionDoc.prompt_hash,
      status: sessionDoc.status as VoiceOrderSession["status"],
      cart: cartDoc.cart as any,
      payment_type: sessionDoc.payment_type as "CASH" | "CARD" | "ONLINE" | undefined,
      created_at: sessionDoc.started_at,
      updated_at: sessionDoc.updated_at
    };

    this.memory.restoreSession(restored);
    return restored;
  }

  async addItem(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    entity: MenuEntity;
    quantity: number;
    notes?: string;
    fulfillment_type?: FulfillmentType;
  }): Promise<CartSnapshot> {
    const snapshot = this.memory.addItem(input);
    await this.persistSessionAndCart(input, snapshot);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: input.call_id,
      event_type: "cart.item_added",
      data: { item_id: input.entity.entity_id, quantity: input.quantity }
    });
    return snapshot;
  }

  async removeItem(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    cart_line_id?: string;
    item_id?: string;
    quantity?: number;
  }): Promise<CartSnapshot> {
    const snapshot = this.memory.removeItem(input);
    await this.persistSessionAndCart(input, snapshot);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: input.call_id,
      event_type: "cart.item_removed",
      data: { cart_line_id: input.cart_line_id, item_id: input.item_id, quantity: input.quantity }
    });
    return snapshot;
  }

  async setFulfillment(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    fulfillment_type: FulfillmentType;
  }): Promise<CartSnapshot> {
    const snapshot = this.memory.setFulfillment(input);
    await this.persistSessionAndCart(input, snapshot);
    return snapshot;
  }

  async setCustomer(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    customer: CustomerDetails;
  }): Promise<CartSnapshot> {
    const snapshot = this.memory.setCustomer(input);
    await this.persistSessionAndCart(input, snapshot);
    return snapshot;
  }

  async setDeliveryAddress(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    delivery_address: DeliveryAddress;
  }): Promise<CartSnapshot> {
    const snapshot = this.memory.setDeliveryAddress(input);
    await this.persistSessionAndCart(input, snapshot);
    return snapshot;
  }

  async snapshot(input: { tenant_id: string; store_id: string; call_id: string }): Promise<CartSnapshot> {
    await this.getSession(input);
    return this.memory.snapshot(input);
  }

  async confirmOrder(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    payment_type: "CASH" | "CARD" | "ONLINE";
  }): Promise<ConfirmedOrderAttempt> {
    const attempt = this.memory.confirmOrder(input);
    await this.persistSessionAndCart(input, this.memory.snapshot(input));
    await this.persistAttempt(attempt);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: input.call_id,
      order_attempt_id: attempt.order_attempt_id,
      event_type: "order.confirmed",
      data: { external_reference_id: attempt.external_reference_id, total: attempt.price.total }
    });
    return attempt;
  }

  async getAttempt(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
  }): Promise<ConfirmedOrderAttempt | undefined> {
    const memAttempt = this.memory.getAttempt(input);
    if (memAttempt) return memAttempt;

    const repo = await this.repository();
    const attemptDoc = await repo.findOrderAttempt(input.tenant_id, input.store_id, input.order_attempt_id);
    if (!attemptDoc) return undefined;

    const restored: ConfirmedOrderAttempt = {
      tenant_id: attemptDoc.tenant_id,
      store_id: attemptDoc.store_id,
      order_attempt_id: attemptDoc.order_attempt_id,
      call_id: attemptDoc.call_id,
      external_reference_id: attemptDoc.external_reference_id,
      state: attemptDoc.state as ConfirmedOrderAttempt["state"],
      cart_version: attemptDoc.cart_version,
      payment_type: attemptDoc.payment_type as "CASH" | "CARD" | "ONLINE",
      price: attemptDoc.price as PriceBreakdown,
      payload: attemptDoc.payload as CreateFoodHubOrder,
      foodhub_order_id: attemptDoc.foodhub_order_id,
      resource_uri: attemptDoc.resource_uri,
      last_error: attemptDoc.last_error,
      created_at: attemptDoc.created_at,
      updated_at: attemptDoc.updated_at
    };

    this.memory.restoreAttempt(restored);
    return restored;
  }

  async markSubmitting(input: { tenant_id: string; store_id: string; order_attempt_id: string }): Promise<void> {
    this.memory.markSubmitting(input);
    const attempt = this.memory.getAttempt(input);
    if (attempt) await this.persistAttempt(attempt);
  }

  async markSubmitted(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    foodhub_order_id: string;
    resource_uri: string;
  }): Promise<ConfirmedOrderAttempt> {
    const attempt = this.memory.markSubmitted(input);
    await this.persistAttempt(attempt);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: attempt.call_id,
      order_attempt_id: attempt.order_attempt_id,
      event_type: "order.submitted",
      data: { foodhub_order_id: input.foodhub_order_id, resource_uri: input.resource_uri }
    });
    return attempt;
  }

  async markFailed(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    error: unknown;
  }): Promise<ConfirmedOrderAttempt> {
    const attempt = this.memory.markFailed(input);
    await this.persistAttempt(attempt);
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      call_id: attempt.call_id,
      order_attempt_id: attempt.order_attempt_id,
      event_type: "order.failed",
      data: { error: serializeUnknown(input.error) }
    });
    return attempt;
  }

  async recordPayment(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    provider: string;
    payment_attempt_id: string;
    idempotency_key: string;
    amount: number;
    currency: string;
    url?: string;
    expires_at?: string;
  }): Promise<PaymentAttempt> {
    const payment = this.memory.recordPayment(input);
    await this.repository().then((repo) => repo.upsertPaymentAttempt(paymentToDoc(payment)));
    await this.audit({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      order_attempt_id: input.order_attempt_id,
      event_type: "payment.link_created",
      data: { provider: input.provider, amount: input.amount, currency: input.currency }
    });
    return payment;
  }

  private async persistSessionAndCart(
    scope: { tenant_id: string; store_id: string; call_id: string },
    snapshot: CartSnapshot
  ): Promise<void> {
    const session = this.memory.getSession(scope);
    if (!session) return;
    await this.persistSession(session);
    await this.persistCart(session, snapshot);
  }

  private async persistSession(session: VoiceOrderSession): Promise<void> {
    await this.repository().then((repo) =>
      repo.upsertCallSession({
        tenant_id: session.tenant_id,
        store_id: session.store_id,
        call_id: session.call_id,
        status: session.status,
        caller_phone: session.caller_phone,
        language: session.language,
        prompt_hash: session.prompt_hash,
        payment_type: session.payment_type,
        started_at: session.created_at,
        updated_at: session.updated_at,
        ended_at: session.status === "ENDED" ? session.updated_at : undefined
      })
    );
  }

  private async persistCart(session: VoiceOrderSession, snapshot: CartSnapshot): Promise<void> {
    await this.repository().then((repo) =>
      repo.upsertCartSnapshot({
        tenant_id: session.tenant_id,
        store_id: session.store_id,
        call_id: session.call_id,
        cart_id: snapshot.cart.cart_id,
        version: snapshot.cart.version,
        cart: snapshot.cart,
        price: snapshot.price,
        missing: snapshot.missing,
        summary: snapshot.summary,
        created_at: session.created_at,
        updated_at: session.updated_at
      })
    );
  }

  private async persistAttempt(attempt: ConfirmedOrderAttempt): Promise<void> {
    await this.repository().then((repo) =>
      repo.upsertOrderAttempt({
        tenant_id: attempt.tenant_id,
        store_id: attempt.store_id,
        order_attempt_id: attempt.order_attempt_id,
        call_id: attempt.call_id,
        external_reference_id: attempt.external_reference_id,
        state: attempt.state,
        cart_version: attempt.cart_version,
        payment_type: attempt.payment_type,
        price: attempt.price,
        payload: attempt.payload,
        foodhub_order_id: attempt.foodhub_order_id,
        resource_uri: attempt.resource_uri,
        last_error: attempt.last_error ? serializeUnknown(attempt.last_error) : undefined,
        created_at: attempt.created_at,
        updated_at: attempt.updated_at
      })
    );
  }

  private async audit(input: Omit<AuditEventDoc, "audit_event_id" | "actor" | "created_at">): Promise<void> {
    try {
      await this.repository().then((repo) =>
        repo.insertAuditEvent({
          audit_event_id: createId("audit"),
          actor: "system",
          created_at: new Date().toISOString(),
          ...input
        })
      );
    } catch (error) {
      this.log.error({ err: error, event_type: input.event_type }, "failed to persist audit event");
    }
  }

  private repository(): Promise<VoicePersistenceRepository> {
    return Promise.resolve(this.config.repository);
  }
}

function paymentToDoc(payment: PaymentAttempt): PaymentAttemptDoc {
  const now = new Date().toISOString();
  return {
    tenant_id: payment.tenant_id,
    store_id: payment.store_id,
    order_attempt_id: payment.order_attempt_id,
    payment_attempt_id: payment.payment_attempt_id,
    provider: payment.provider,
    idempotency_key: payment.idempotency_key,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    url: payment.url,
    expires_at: payment.expires_at,
    created_at: now,
    updated_at: now
  };
}

function serializeUnknown(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }
  return value;
}
