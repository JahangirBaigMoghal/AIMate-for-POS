import { MongoClient, type Db } from "mongodb";

let client: MongoClient | undefined;

export async function getMongoDb(uri: string, dbName: string): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri);
    client.on("error", (err) => {
      console.error("MongoDB background client error:", err);
    });
  }
  await client.connect();
  return client.db(dbName);
}

export const requiredIndexes = {
  order_attempts: [
    {
      keys: { tenant_id: 1, store_id: 1, external_reference_id: 1 },
      options: { unique: true }
    },
    {
      keys: { tenant_id: 1, store_id: 1, order_attempt_id: 1 },
      options: { unique: true }
    },
    {
      keys: { tenant_id: 1, store_id: 1, call_id: 1 },
      options: {}
    }
  ],
  webhook_events: [{ keys: { provider: 1, event_id: 1 }, options: { unique: true } }],
  call_sessions: [
    { keys: { tenant_id: 1, store_id: 1, call_id: 1 }, options: { unique: true } },
    { keys: { tenant_id: 1, store_id: 1, status: 1, updated_at: -1 }, options: {} }
  ],
  cart_snapshots: [
    { keys: { tenant_id: 1, store_id: 1, cart_id: 1 }, options: { unique: true } },
    { keys: { tenant_id: 1, store_id: 1, call_id: 1, version: -1 }, options: {} }
  ],
  payment_attempts: [
    { keys: { tenant_id: 1, store_id: 1, payment_attempt_id: 1 }, options: { unique: true } },
    { keys: { tenant_id: 1, store_id: 1, idempotency_key: 1 }, options: { unique: true } },
    { keys: { tenant_id: 1, store_id: 1, order_attempt_id: 1 }, options: {} }
  ],
  audit_events: [
    { keys: { tenant_id: 1, store_id: 1, created_at: -1 }, options: {} },
    { keys: { call_id: 1, created_at: -1 }, options: {} },
    { keys: { order_attempt_id: 1, created_at: -1 }, options: {} }
  ],
  prompt_versions: [
    { keys: { tenant_id: 1, store_id: 1, prompt_hash: 1 }, options: { unique: true } }
  ],
  menu_snapshots: [
    { keys: { tenant_id: 1, store_id: 1, menu_snapshot_id: 1 }, options: { unique: true } },
    { keys: { tenant_id: 1, store_id: 1, refreshed_at: -1 }, options: {} }
  ],
  store_configs: [
    { keys: { tenant_id: 1, store_id: 1, version: -1 }, options: { unique: true } }
  ],
  credential_metadata: [
    { keys: { tenant_id: 1, store_id: 1, provider: 1, key_id: 1 }, options: { unique: true } }
  ]
} as const;
