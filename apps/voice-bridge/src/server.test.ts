import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

const ENV_KEYS = [
  "NODE_ENV",
  "GEMINI_API_KEY",
  "GEMINI_LIVE_MODEL",
  "FOODHUB_DEFAULT_STORE_ID",
  "FOODHUB_WEBHOOK_SECRET",
  "MONGODB_URI",
  "MONGODB_DB",
  "REDIS_URL",
  "TELEPHONY_PROVIDER",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "AIMATE_KILL_AI_ANSWERING",
  "AIMATE_KILL_ORDER_COMMIT",
  "AIMATE_KILL_PAYMENT_LINKS",
  "AIMATE_KILL_HANDOFF"
] as const;

type EnvOverrides = Partial<Record<(typeof ENV_KEYS)[number], string>>;

describe("voice bridge", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
    vi.resetModules();
  });

  it("returns health", async () => {
    const { buildServer } = await importServer();
    const app = buildServer();

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json().service).toBe("voice-bridge");
    await app.close();
  });

  it("returns spoken unavailable TwiML instead of a silent stream when Gemini is not configured", async () => {
    const { buildServer } = await importServer();
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/telephony/twilio/inbound",
      headers: { host: "voice.example.com" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/xml");
    expect(response.body).toContain("ordering assistant is not available");
    expect(response.body).not.toContain("<Stream");
    await app.close();
  });

  it("generates a public wss Twilio media stream URL and escapes custom parameters", async () => {
    const { buildServer } = await importServer({ GEMINI_API_KEY: "test-key" });
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/telephony/twilio/inbound?tenant_id=t%261&store_id=s%3C1&language=en",
      headers: { host: "voice.example.com" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<Stream url="wss://voice.example.com/ws/voice-twilio">');
    expect(response.body).toContain('name="tenant_id" value="t&amp;1"');
    expect(response.body).toContain('name="store_id" value="s&lt;1"');
    expect(response.body).toContain("<Hangup />");
    await app.close();
  });

  it("keeps local Twilio stream URLs on ws for localhost development", async () => {
    const { buildTwilioStreamUrl } = await importServer({ GEMINI_API_KEY: "test-key" });

    expect(buildTwilioStreamUrl({ host: "localhost:4100" })).toBe(
      "ws://localhost:4100/ws/voice-twilio"
    );
  });

  it("exposes kill switch state in readiness", async () => {
    const { buildServer } = await importServer({
      GEMINI_API_KEY: "test-key",
      AIMATE_KILL_ORDER_COMMIT: "true",
      AIMATE_KILL_PAYMENT_LINKS: "1"
    });
    const app = buildServer();

    const response = await app.inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json().kill_switches.order_commit).toBe(true);
    expect(response.json().kill_switches.payment_links).toBe(true);
    await app.close();
  });

  it("uses raw body signatures and records duplicate FoodHub webhooks idempotently", async () => {
    const secret = "webhook-secret";
    const rawBody = '{ "event_id": "evt_1", "event_type": "MENU_UPDATED", "store_id": "s1" }';
    const signature = createHmac("sha1", secret).update(rawBody).digest("hex");
    const { buildServer } = await importServer({
      FOODHUB_WEBHOOK_SECRET: secret,
      FOODHUB_DEFAULT_STORE_ID: "s1"
    });
    const app = buildServer();

    const first = await app.inject({
      method: "POST",
      url: "/api/webhooks/foodhub",
      headers: {
        "content-type": "application/json",
        "x-webhook-signature": signature
      },
      payload: rawBody
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/webhooks/foodhub",
      headers: {
        "content-type": "application/json",
        "x-webhook-signature": signature
      },
      payload: rawBody
    });

    expect(first.statusCode).toBe(200);
    expect(first.json().action).toBe("menu_refreshed");
    expect(second.statusCode).toBe(200);
    expect(second.json().duplicate).toBe(true);
    await app.close();
  });

  it("rejects FoodHub webhooks with invalid raw body signatures", async () => {
    const { buildServer } = await importServer({ FOODHUB_WEBHOOK_SECRET: "webhook-secret" });
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/foodhub",
      headers: {
        "content-type": "application/json",
        "x-webhook-signature": "bad-signature"
      },
      payload: '{"event_id":"evt_bad"}'
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });
});

async function importServer(overrides: EnvOverrides = {}) {
  const env = process.env as Record<string, string | undefined>;
  for (const key of ENV_KEYS) {
    delete env[key];
  }
  env["NODE_ENV"] = "test";
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }
  vi.resetModules();
  return import("./server");
}
