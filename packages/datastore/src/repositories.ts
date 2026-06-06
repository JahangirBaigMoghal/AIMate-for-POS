import type { Collection, Db } from "mongodb";
import { requiredIndexes } from "./mongo";

export type TenantStoreScope = {
  tenant_id: string;
  store_id: string;
};

export type CallSessionDoc = TenantStoreScope & {
  call_id: string;
  trace_id?: string;
  status: string;
  caller_phone?: string;
  language: string;
  prompt_hash?: string;
  started_at: string;
  updated_at: string;
  ended_at?: string;
};

export type CartSnapshotDoc = TenantStoreScope & {
  cart_id: string;
  call_id: string;
  version: number;
  cart: unknown;
  price?: unknown;
  missing?: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
};

export type OrderAttemptDoc = TenantStoreScope & {
  order_attempt_id: string;
  call_id: string;
  cart_id?: string;
  external_reference_id: string;
  state: string;
  cart_version: number;
  payment_type?: string;
  price?: unknown;
  payload?: unknown;
  foodhub_order_id?: string;
  resource_uri?: string;
  last_error?: unknown;
  created_at: string;
  updated_at: string;
};

export type PaymentAttemptDoc = TenantStoreScope & {
  payment_attempt_id: string;
  order_attempt_id: string;
  provider: string;
  idempotency_key: string;
  amount: number;
  currency: string;
  status: string;
  url?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};

export type WebhookEventDoc = Partial<TenantStoreScope> & {
  provider: "foodhub" | "stripe" | "twilio" | string;
  event_id: string;
  event_type?: string;
  trace_id: string;
  signature?: string;
  raw_body_sha256: string;
  raw_body: string;
  status: "RECEIVED" | "PROCESSED" | "FAILED";
  action?: string;
  received_at: string;
  processed_at?: string;
  error?: string;
};

export type AuditEventDoc = Partial<TenantStoreScope> & {
  audit_event_id: string;
  trace_id?: string;
  call_id?: string;
  order_attempt_id?: string;
  event_type: string;
  actor: "system" | "caller" | "staff" | "admin";
  data?: unknown;
  created_at: string;
};

export type PromptVersionDoc = TenantStoreScope & {
  prompt_hash: string;
  call_id?: string;
  status: "OBSERVED" | "APPROVED" | "ROLLED_BACK";
  created_at: string;
  updated_at: string;
};

export type MenuSnapshotDoc = TenantStoreScope & {
  menu_snapshot_id: string;
  source: string;
  entity_count: number;
  entities?: unknown[];
  last_error?: string;
  refreshed_at: string;
  updated_at: string;
};

export type StoreConfigDoc = TenantStoreScope & {
  version: number;
  voice?: string;
  language_policy?: string;
  staff_number?: string;
  payment_provider?: string;
  kill_switches?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

export type CredentialMetadataDoc = TenantStoreScope & {
  provider: "foodhub" | "twilio" | "stripe" | "gemini" | "sms" | string;
  key_id: string;
  encrypted: boolean;
  configured: boolean;
  last_rotated_at?: string;
  updated_at: string;
};

export class VoicePersistenceRepository {
  constructor(private readonly db: Db) {}

  async upsertCallSession(session: CallSessionDoc): Promise<void> {
    await this.scoped("call_sessions").updateOne(
      scopeFilter(session, { call_id: session.call_id }),
      {
        $setOnInsert: { started_at: session.started_at },
        $set: session
      },
      { upsert: true }
    );
  }

  async updateCallStatus(input: TenantStoreScope & { call_id: string; status: string }): Promise<void> {
    const update: Record<string, unknown> = {
      status: input.status,
      updated_at: new Date().toISOString()
    };
    if (input.status === "ENDED") update.ended_at = update.updated_at;
    await this.scoped("call_sessions").updateOne(scopeFilter(input, { call_id: input.call_id }), {
      $set: update
    });
  }

  async upsertCartSnapshot(cart: CartSnapshotDoc): Promise<void> {
    await this.scoped("cart_snapshots").updateOne(
      scopeFilter(cart, { cart_id: cart.cart_id }),
      {
        $setOnInsert: { created_at: cart.created_at },
        $set: cart
      },
      { upsert: true }
    );
  }

  async upsertOrderAttempt(attempt: OrderAttemptDoc): Promise<void> {
    await this.scoped("order_attempts").updateOne(
      scopeFilter(attempt, { order_attempt_id: attempt.order_attempt_id }),
      {
        $setOnInsert: { created_at: attempt.created_at },
        $set: attempt
      },
      { upsert: true }
    );
  }

  async updateOrderAttemptState(input: TenantStoreScope & {
    order_attempt_id: string;
    state: string;
    extra?: Record<string, unknown>;
  }): Promise<void> {
    await this.scoped("order_attempts").updateOne(
      scopeFilter(input, { order_attempt_id: input.order_attempt_id }),
      {
        $set: {
          state: input.state,
          updated_at: new Date().toISOString(),
          ...input.extra
        }
      }
    );
  }

  async upsertPaymentAttempt(payment: PaymentAttemptDoc): Promise<void> {
    await this.scoped("payment_attempts").updateOne(
      scopeFilter(payment, { payment_attempt_id: payment.payment_attempt_id }),
      {
        $setOnInsert: { created_at: payment.created_at },
        $set: payment
      },
      { upsert: true }
    );
  }

  async recordWebhookEvent(event: WebhookEventDoc): Promise<"recorded" | "duplicate"> {
    try {
      await this.db.collection<WebhookEventDoc>("webhook_events").insertOne(event);
      return "recorded";
    } catch (error) {
      if (isDuplicateKeyError(error)) return "duplicate";
      throw error;
    }
  }

  async markWebhookProcessed(input: {
    provider: string;
    event_id: string;
    status: "PROCESSED" | "FAILED";
    action?: string;
    error?: string;
  }): Promise<void> {
    await this.db.collection<WebhookEventDoc>("webhook_events").updateOne(
      { provider: input.provider, event_id: input.event_id },
      {
        $set: {
          status: input.status,
          action: input.action,
          error: input.error,
          processed_at: new Date().toISOString()
        }
      }
    );
  }

  async insertAuditEvent(event: AuditEventDoc): Promise<void> {
    await this.db.collection<AuditEventDoc>("audit_events").insertOne(event);
  }

  async upsertPromptVersion(prompt: PromptVersionDoc): Promise<void> {
    await this.scoped("prompt_versions").updateOne(
      scopeFilter(prompt, { prompt_hash: prompt.prompt_hash }),
      {
        $setOnInsert: { created_at: prompt.created_at },
        $set: prompt
      },
      { upsert: true }
    );
  }

  async upsertMenuSnapshot(snapshot: MenuSnapshotDoc): Promise<void> {
    await this.scoped("menu_snapshots").updateOne(
      scopeFilter(snapshot, { menu_snapshot_id: snapshot.menu_snapshot_id }),
      {
        $setOnInsert: { refreshed_at: snapshot.refreshed_at },
        $set: snapshot
      },
      { upsert: true }
    );
  }

  async upsertStoreConfig(config: StoreConfigDoc): Promise<void> {
    await this.scoped("store_configs").updateOne(
      scopeFilter(config, { version: config.version }),
      {
        $setOnInsert: { created_at: config.created_at },
        $set: config
      },
      { upsert: true }
    );
  }

  async upsertCredentialMetadata(credential: CredentialMetadataDoc): Promise<void> {
    await this.scoped("credential_metadata").updateOne(
      scopeFilter(credential, { provider: credential.provider, key_id: credential.key_id }),
      { $set: credential },
      { upsert: true }
    );
  }

  private scoped<T extends TenantStoreScope>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }
}

export class CallSessionRepository {
  constructor(private readonly db: Db) {}

  async create(session: CallSessionDoc): Promise<void> {
    await this.db.collection<CallSessionDoc>("call_sessions").insertOne(session);
  }

  async findByCallId(scope: TenantStoreScope & { call_id: string }): Promise<CallSessionDoc | null> {
    return this.db.collection<CallSessionDoc>("call_sessions").findOne(scope);
  }

  async updateStatus(scope: TenantStoreScope & { call_id: string }, status: string): Promise<void> {
    const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "ENDED") update.ended_at = update.updated_at;
    await this.db.collection<CallSessionDoc>("call_sessions").updateOne(scope, { $set: update });
  }
}

export class CartRepository {
  constructor(private readonly db: Db) {}

  async create(cart: CartSnapshotDoc): Promise<void> {
    await this.db.collection<CartSnapshotDoc>("cart_snapshots").insertOne(cart);
  }

  async findByCartId(scope: TenantStoreScope & { cart_id: string }): Promise<CartSnapshotDoc | null> {
    return this.db.collection<CartSnapshotDoc>("cart_snapshots").findOne(scope);
  }

  async update(scope: TenantStoreScope & { cart_id: string }, updates: Partial<CartSnapshotDoc>, newVersion: number): Promise<boolean> {
    const result = await this.db.collection<CartSnapshotDoc>("cart_snapshots").updateOne(
      { ...scope, version: newVersion - 1 },
      { $set: { ...updates, version: newVersion, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount === 1;
  }
}

export class OrderAttemptRepository {
  constructor(private readonly db: Db) {}

  async create(attempt: OrderAttemptDoc): Promise<void> {
    await this.db.collection<OrderAttemptDoc>("order_attempts").insertOne(attempt);
  }

  async findById(scope: TenantStoreScope & { order_attempt_id: string }): Promise<OrderAttemptDoc | null> {
    return this.db.collection<OrderAttemptDoc>("order_attempts").findOne(scope);
  }

  async findByCallId(scope: TenantStoreScope & { call_id: string }): Promise<OrderAttemptDoc | null> {
    return this.db.collection<OrderAttemptDoc>("order_attempts").findOne(scope);
  }

  async updateState(
    scope: TenantStoreScope & { order_attempt_id: string },
    state: string,
    extra?: Record<string, unknown>
  ): Promise<void> {
    await this.db.collection<OrderAttemptDoc>("order_attempts").updateOne(
      scope,
      { $set: { state, updated_at: new Date().toISOString(), ...extra } }
    );
  }
}

export async function ensureIndexes(db: Db): Promise<void> {
  for (const [collectionName, indexes] of Object.entries(requiredIndexes)) {
    for (const index of indexes) {
      await db.collection(collectionName).createIndex(
        index.keys as Record<string, 1 | -1>,
        index.options as { unique?: boolean; expireAfterSeconds?: number }
      );
    }
  }
}

function scopeFilter<T extends TenantStoreScope>(
  scope: T,
  extra: Record<string, unknown>
): Record<string, unknown> {
  return {
    tenant_id: scope.tenant_id,
    store_id: scope.store_id,
    ...extra
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;
}
