import { MongoClient, type Db } from "mongodb";

let client: MongoClient | undefined;

export async function getMongoDb(uri: string, dbName: string): Promise<Db> {
  client ??= new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

export const requiredIndexes = {
  order_attempts: [
    {
      keys: { tenant_id: 1, store_id: 1, external_reference_id: 1 },
      options: { unique: true }
    }
  ],
  webhook_events: [{ keys: { provider: 1, event_id: 1 }, options: { unique: true } }],
  call_sessions: [{ keys: { tenant_id: 1, store_id: 1, call_id: 1 }, options: { unique: true } }]
} as const;
