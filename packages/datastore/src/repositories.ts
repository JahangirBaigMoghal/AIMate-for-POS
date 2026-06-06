import type { Db } from "mongodb";
import { requiredIndexes } from "./mongo";

// ─── Types ──────────────────────────────────────────────────
// We use lightweight record types so the repositories don't
// depend on heavy Zod parsing at the persistence boundary.

export type CallSessionDoc = {
  call_id: string;
  tenant_id: string;
  store_id: string;
  status: string;
  caller_phone?: string;
  language: string;
  started_at: string;
  ended_at?: string;
};

export type CartDoc = {
  cart_id: string;
  call_id: string;
  items: unknown[];
  version: number;
};

export type OrderAttemptDoc = {
  order_attempt_id: string;
  call_id: string;
  cart_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  foodhub_order_id?: string;
};

// ─── Repositories ───────────────────────────────────────────

export class CallSessionRepository {
  constructor(private readonly db: Db) {}

  async create(session: CallSessionDoc): Promise<void> {
    await this.db.collection<CallSessionDoc>("call_sessions").insertOne(session);
  }

  async findByCallId(callId: string): Promise<CallSessionDoc | null> {
    return this.db
      .collection<CallSessionDoc>("call_sessions")
      .findOne({ call_id: callId });
  }

  async updateStatus(callId: string, status: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === "ENDED") update.ended_at = new Date().toISOString();

    await this.db
      .collection<CallSessionDoc>("call_sessions")
      .updateOne({ call_id: callId }, { $set: update });
  }
}

export class CartRepository {
  constructor(private readonly db: Db) {}

  async create(cart: CartDoc): Promise<void> {
    await this.db.collection<CartDoc>("carts").insertOne(cart);
  }

  async findByCartId(cartId: string): Promise<CartDoc | null> {
    return this.db.collection<CartDoc>("carts").findOne({ cart_id: cartId });
  }

  async update(cartId: string, updates: Partial<CartDoc>, newVersion: number): Promise<boolean> {
    const result = await this.db.collection<CartDoc>("carts").updateOne(
      { cart_id: cartId, version: newVersion - 1 },
      { $set: { ...updates, version: newVersion } }
    );
    return result.modifiedCount === 1;
  }
}

export class OrderAttemptRepository {
  constructor(private readonly db: Db) {}

  async create(attempt: OrderAttemptDoc): Promise<void> {
    await this.db.collection<OrderAttemptDoc>("order_attempts").insertOne(attempt);
  }

  async findById(orderAttemptId: string): Promise<OrderAttemptDoc | null> {
    return this.db
      .collection<OrderAttemptDoc>("order_attempts")
      .findOne({ order_attempt_id: orderAttemptId });
  }

  async findByCallId(callId: string): Promise<OrderAttemptDoc | null> {
    return this.db
      .collection<OrderAttemptDoc>("order_attempts")
      .findOne({ call_id: callId });
  }

  async updateState(
    orderAttemptId: string,
    state: string,
    extra?: Record<string, unknown>
  ): Promise<void> {
    await this.db.collection<OrderAttemptDoc>("order_attempts").updateOne(
      { order_attempt_id: orderAttemptId },
      { $set: { state, updated_at: new Date().toISOString(), ...extra } }
    );
  }
}

// ─── Index provisioning ─────────────────────────────────────

export async function ensureIndexes(db: Db): Promise<void> {
  for (const [collectionName, indexes] of Object.entries(requiredIndexes)) {
    for (const index of indexes) {
      await db.collection(collectionName).createIndex(
        index.keys as Record<string, 1>,
        index.options as { unique?: boolean }
      );
    }
  }
  // Additional indexes not in the original requiredIndexes
  await db.collection("carts").createIndex({ cart_id: 1 }, { unique: true });
  await db.collection("carts").createIndex({ call_id: 1 });
}
