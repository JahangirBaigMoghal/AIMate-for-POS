import websocket from "@fastify/websocket";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { Redis } from "ioredis";
import { FoodHubClient, FoodHubTokenManager, RedisTokenStore } from "@aimate/foodhub";
import { MockPaymentProvider, StripePaymentProvider } from "@aimate/payments";
import { MenuCatalog } from "@aimate/rag";
import { createId, loadEnv, logger, validateVoiceBridgeProductionEnv } from "@aimate/shared";
import { MockTelephonyProvider, TwilioTelephonyProvider } from "@aimate/telephony";
import { ensureIndexes, getMongoDb, InMemoryLockManager, RedisLockManager, VoicePersistenceRepository } from "@aimate/datastore";
import { DurableVoiceWorkflowStore, InMemoryVoiceWorkflowStore, VoiceToolRouter } from "@aimate/voice-tools";
import Fastify from "fastify";
import { ClientMessageSchema } from "./messages";
import { CallHandler, type CallHandlerDeps } from "./call-handler";
import { TwilioCallHandler } from "./twilio-call-handler";

const env = loadEnv();
const productionEnvValidation = validateVoiceBridgeProductionEnv(process.env);

type MongoRuntimeState = {
  enabled: boolean;
  status: "inactive" | "connecting" | "active" | "error";
  last_error?: string;
  repository?: Promise<VoicePersistenceRepository>;
};

type RawBodyRequest = {
  rawBody?: string;
};

const inMemoryWebhookIds = new Set<string>();

// ─── Demo menu seed (replaced by live FoodHub sync in Phase 3) ──
const DEMO_MENU_ENTITIES = [
  {
    tenant_id: "demo",
    store_id: env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store",
    menu_snapshot_id: "demo-menu",
    entity_type: "ITEM" as const,
    entity_id: "demo_chicken_burger",
    name: "Chicken Burger",
    aliases: ["chicken sandwich", "crispy chicken burger"],
    price: 699,
    fulfillment_modes: ["DELIVERY", "COLLECTION"],
    stock_status: "AVAILABLE" as const,
    modifier_group_ids: [],
    updated_at: new Date().toISOString()
  },
  {
    tenant_id: "demo",
    store_id: env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store",
    menu_snapshot_id: "demo-menu",
    entity_type: "ITEM" as const,
    entity_id: "demo_margherita",
    name: "Margherita Pizza",
    name_localized: "Margherita",
    aliases: ["marg", "cheese pizza", "margarita"],
    price: 899,
    fulfillment_modes: ["DELIVERY", "COLLECTION"],
    stock_status: "AVAILABLE" as const,
    modifier_group_ids: [],
    updated_at: new Date().toISOString()
  },
  {
    tenant_id: "demo",
    store_id: env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store",
    menu_snapshot_id: "demo-menu",
    entity_type: "ITEM" as const,
    entity_id: "demo_cola",
    name: "Cola",
    aliases: ["coke", "pepsi", "fizzy drink"],
    price: 199,
    fulfillment_modes: ["DELIVERY", "COLLECTION", "INSTORE"],
    stock_status: "AVAILABLE" as const,
    modifier_group_ids: [],
    updated_at: new Date().toISOString()
  }
];

export function buildServer() {
  const app = Fastify({ logger: false });
  app.register(websocket);

  app.removeContentTypeParser("application/json");
  app.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
    const rawBody = Buffer.isBuffer(body) ? body.toString("utf8") : body;
    (request as typeof request & RawBodyRequest).rawBody = rawBody;
    if (!rawBody.trim()) {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(rawBody));
    } catch (error) {
      done(error as Error, undefined);
    }
  });

  // Support Twilio POST webhooks by registering a dummy parser for form-urlencoded content type
  app.addContentTypeParser("application/x-www-form-urlencoded", (request, payload, done) => {
    done(null, {});
  });

  // Setup Redis components if URL exists
  let tokenStore: any;
  let lockManager: any = new InMemoryLockManager();
  if (env.REDIS_URL) {
    try {
      const redis = new Redis(env.REDIS_URL);
      tokenStore = new RedisTokenStore(redis);
      lockManager = new RedisLockManager(redis);
      logger.info({ redis_url: env.REDIS_URL }, "Redis components initialized (distributed locks and token store active)");
    } catch (error) {
      logger.error({ err: error }, "Failed to connect to Redis, falling back to in-memory caching");
    }
  }

  const mongo = createMongoRuntimeState();

  // Setup Providers based on Env
  let paymentProvider: any;
  if (env.PAYMENT_PROVIDER === "stripe" && env.STRIPE_SECRET_KEY) {
    paymentProvider = new StripePaymentProvider(env.STRIPE_SECRET_KEY);
    logger.info("Stripe Payment Provider initialized");
  } else {
    paymentProvider = new MockPaymentProvider();
    logger.info("Mock Payment Provider initialized");
  }

  let telephonyProvider: any;
  if (env.TELEPHONY_PROVIDER === "twilio" && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    telephonyProvider = new TwilioTelephonyProvider({
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN
    });
    logger.info("Twilio Telephony Provider initialized");
  } else {
    telephonyProvider = new MockTelephonyProvider();
    logger.info("Mock Telephony Provider initialized");
  }

  const foodhubClient = new FoodHubClient({
    baseUrl: env.FOODHUB_BASE_URL,
    clientId: env.FOODHUB_CLIENT_ID,
    clientSecret: env.FOODHUB_CLIENT_SECRET,
    tokenManager: env.FOODHUB_CLIENT_ID && env.FOODHUB_CLIENT_SECRET
      ? new FoodHubTokenManager(env.FOODHUB_BASE_URL, tokenStore)
      : undefined
  });

  const menuCatalog = new MenuCatalog({
    foodhub: foodhubClient,
    fallbackEntities: DEMO_MENU_ENTITIES
  });

  const workflow = mongo.repository
    ? new DurableVoiceWorkflowStore({
        pricing: { defaultDeliveryFee: env.DEFAULT_DELIVERY_FEE_PENCE },
        repository: mongo.repository
      })
    : new InMemoryVoiceWorkflowStore({
        defaultDeliveryFee: env.DEFAULT_DELIVERY_FEE_PENCE
      });

  const router = new VoiceToolRouter({
    foodhub: foodhubClient,
    paymentProvider,
    telephonyProvider,
    staffNumber: env.DEFAULT_STAFF_NUMBER,
    menuEntities: DEMO_MENU_ENTITIES,
    menuCatalog,
    workflow,
    lockManager,
    killSwitches: {
      orderCommit: env.AIMATE_KILL_ORDER_COMMIT,
      paymentLinks: env.AIMATE_KILL_PAYMENT_LINKS,
      handoff: env.AIMATE_KILL_HANDOFF
    }
  });

  const geminiApiKey = env.GEMINI_API_KEY;
  const geminiModel = env.GEMINI_LIVE_MODEL || "gemini-2.0-flash-exp";

  // ─── Health / Readiness ─────────────────────────────────────

  app.get("/health", async () => ({
    ok: true,
    service: "voice-bridge",
    time: new Date().toISOString()
  }));

  app.get("/ready", async () => ({
    ok: env.NODE_ENV === "production" ? productionEnvValidation.ok : true,
    gemini: geminiApiKey ? "configured" : "missing",
    model: geminiModel,
    telephony: env.TELEPHONY_PROVIDER,
    redis: env.REDIS_URL ? "active" : "inactive",
    mongodb: {
      enabled: mongo.enabled,
      status: mongo.status,
      last_error: mongo.last_error
    },
    foodhub: foodhubClient.hasCredentials() ? "configured" : "mock-mode",
    default_delivery_fee_pence: env.DEFAULT_DELIVERY_FEE_PENCE,
    kill_switches: {
      ai_answering: env.AIMATE_KILL_AI_ANSWERING,
      order_commit: env.AIMATE_KILL_ORDER_COMMIT,
      payment_links: env.AIMATE_KILL_PAYMENT_LINKS,
      handoff: env.AIMATE_KILL_HANDOFF
    },
    production_env: productionEnvValidation
  }));

  app.post("/api/menu/refresh", async (request) => {
    const body = (await request.body) as { tenant_id?: string; store_id?: string } | undefined;
    const tenantId = body?.tenant_id ?? "demo";
    const storeId = body?.store_id ?? env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store";
    const snapshot = await menuCatalog.refresh(tenantId, storeId);
    return {
      ok: true,
      source: snapshot.source,
      entity_count: snapshot.entities.length,
      refreshed_at: snapshot.refreshed_at,
      last_error: snapshot.last_error
    };
  });

  app.post("/api/webhooks/foodhub", async (request, reply) => {
    const rawBody = getRawBody(request);
    const signature = request.headers["x-webhook-signature"];
    if (
      env.FOODHUB_WEBHOOK_SECRET &&
      !isValidWebhookSignature(rawBody, typeof signature === "string" ? signature : "", env.FOODHUB_WEBHOOK_SECRET)
    ) {
      return reply.status(401).send({ ok: false, error: "Invalid signature" });
    }

    const event = (request.body ?? {}) as {
      event_type?: string;
      store_id?: string;
      tenant_id?: string;
      event_id?: string;
    };
    const traceId = readTraceId(request.headers);
    const tenantId = event.tenant_id ?? "demo";
    const storeId = event.store_id ?? env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store";
    const eventId = event.event_id ?? createWebhookEventId(rawBody);
    const action = inferFoodHubWebhookAction(event.event_type);
    const idempotency = await recordFoodHubWebhook({
      mongo,
      traceId,
      eventId,
      eventType: event.event_type,
      tenantId,
      storeId,
      rawBody,
      signature: typeof signature === "string" ? signature : undefined
    });

    if (idempotency === "duplicate") {
      return {
        ok: true,
        received: true,
        duplicate: true,
        event_id: eventId,
        action: "already_recorded",
        trace_id: traceId
      };
    }

    const shouldRefreshMenu =
      event.event_type?.includes("MENU") ||
      event.event_type?.includes("ENTITY") ||
      event.event_type?.includes("OPEN_CLOSE") ||
      event.event_type?.includes("STOCK");

    if (shouldRefreshMenu) {
      router.markMenuStale(tenantId, storeId);
      const snapshot = await menuCatalog.refresh(tenantId, storeId);
      await markFoodHubWebhookProcessed(mongo, eventId, "PROCESSED", action);
      return {
        ok: true,
        received: true,
        event_id: eventId,
        action,
        trace_id: traceId,
        source: snapshot.source,
        entity_count: snapshot.entities.length,
        last_error: snapshot.last_error
      };
    }

    await markFoodHubWebhookProcessed(mongo, eventId, "PROCESSED", action);
    return {
      ok: true,
      received: true,
      event_id: eventId,
      action,
      trace_id: traceId
    };
  });

  // ─── Telephony Inbound Webhook (TwiML generator) ────────────

  app.post("/api/telephony/twilio/inbound", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const tenantId = query.tenant_id ?? "demo";
    const storeId = query.store_id ?? env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store";
    const language = query.language ?? "en";

    if (env.AIMATE_KILL_AI_ANSWERING) {
      logger.warn({ tenant_id: tenantId, store_id: storeId }, "Twilio inbound call rejected by AI answering kill switch");
      reply.type("text/xml").send(buildAssistantUnavailableTwiml());
      return;
    }

    if (!geminiApiKey?.trim()) {
      logger.error("Twilio inbound call rejected because GEMINI_API_KEY is not configured");
      reply.type("text/xml").send(buildAssistantUnavailableTwiml());
      return;
    }

    const wsUrl = buildTwilioStreamUrl(request.headers);

    const twiml = `
<Response>
  <Say>Hello! Welcome to our restaurant ordering system. Connecting you to the ordering assistant now.</Say>
  <Connect>
    <Stream url="${escapeXmlAttribute(wsUrl)}">
      <Parameter name="tenant_id" value="${escapeXmlAttribute(tenantId)}" />
      <Parameter name="store_id" value="${escapeXmlAttribute(storeId)}" />
      <Parameter name="language" value="${escapeXmlAttribute(language)}" />
    </Stream>
  </Connect>
  <Say>Sorry, the ordering assistant is not available right now. Please call back in a few minutes.</Say>
  <Hangup />
</Response>
    `;
    reply.type("text/xml").send(twiml.trim());
  });

  // ─── Voice WebSockets ───────────────────────────────────────

  app.register(async (fastify) => {
    // 1. Clean JSON + PCM 16kHz WebSocket
    fastify.get("/ws/voice", { websocket: true }, (socket, _request) => {
      logger.info("new voice websocket connection");

      let handler: CallHandler | undefined;

      socket.on("message", async (raw) => {
        const text = typeof raw === "string" ? raw : raw.toString("utf8");

        let parsed;
        try {
          parsed = ClientMessageSchema.parse(JSON.parse(text));
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Invalid message format";
          socket.send(JSON.stringify({
            type: "session.error",
            error: `Invalid message: ${msg}`,
            code: "INVALID_MESSAGE"
          }));
          return;
        }

        switch (parsed.type) {
          case "session.start": {
            if (env.AIMATE_KILL_AI_ANSWERING) {
              socket.send(JSON.stringify({
                type: "session.error",
                error: "AI answering is temporarily disabled by an operator.",
                code: "AI_ANSWERING_DISABLED"
              }));
              return;
            }

            if (!geminiApiKey) {
              socket.send(JSON.stringify({
                type: "session.error",
                error: "GEMINI_API_KEY is not configured. Add it to .env.local to enable the voice agent.",
                code: "NO_API_KEY"
              }));
              return;
            }

            const deps: CallHandlerDeps = {
              router,
              geminiApiKey,
              geminiModel,
              storeContext: `Store ${parsed.store_id} — handles orders for delivery and collection.`
            };

            handler = new CallHandler(socket, deps);
            await handler.start(parsed);
            break;
          }

          case "user.text": {
            if (!handler) {
              socket.send(JSON.stringify({
                type: "session.error",
                error: "Send session.start first",
                code: "SESSION_NOT_STARTED"
              }));
              return;
            }
            handler.handleUserText(parsed.text);
            break;
          }

          case "user.audio": {
            if (!handler) return;
            handler.handleUserAudio(parsed.data);
            break;
          }

          case "session.end": {
            if (handler) {
              await handler.close("client_ended");
              handler = undefined;
            }
            break;
          }
        }
      });

      socket.on("close", async () => {
        logger.info("voice websocket closed");
        if (handler) {
          await handler.close("client_disconnect");
          handler = undefined;
        }
      });
    });

    // 2. Twilio Media Stream WebSocket
    fastify.get("/ws/voice-twilio", { websocket: true }, (socket, _request) => {
      logger.info("New Twilio Media Stream WebSocket connection");

      const handler = new TwilioCallHandler(socket, {
        router,
        geminiApiKey: geminiApiKey ?? "",
        geminiModel,
        storeContext: "Store demo-store — handles orders for delivery and collection."
      });

      socket.on("message", async (raw) => {
        const text = typeof raw === "string" ? raw : raw.toString("utf8");
        await handler.handleMessage(text);
      });

      socket.on("close", async () => {
        logger.info("Twilio Media Stream WebSocket closed");
        await handler.close();
      });
    });

    // Legacy endpoint for backward compatibility
    fastify.get("/ws/calls/:callId", { websocket: true }, (socket, request) => {
      const callId = (request.params as { callId: string }).callId;
      logger.info({ call_id: callId }, "legacy voice websocket connected");

      socket.send(
        JSON.stringify({
          type: "session.started",
          call_id: callId,
          message: "AIMate voice bridge connected (legacy mode — use /ws/voice for AI features)"
        })
      );

      socket.on("message", async (raw) => {
        const text = raw.toString();
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          socket.send(JSON.stringify({ type: "error", message: "Expected JSON message" }));
          return;
        }

        const message = parsed as { type?: string; query?: string };
        if (message.type === "menu.search" && message.query) {
          const result = await router.call("search_menu", {
            call_id: callId,
            tenant_id: "demo",
            store_id: env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store",
            request_id: `req-${Date.now()}`,
            language: "en",
            query: message.query
          });
          socket.send(JSON.stringify({ type: "tool.result", result }));
          return;
        }

        socket.send(JSON.stringify({ type: "echo", call_id: callId, received: parsed }));
      });

      socket.on("close", () => {
        logger.info({ call_id: callId }, "legacy voice websocket closed");
      });
    });
  });

  return app;
}

function isValidWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha1", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.replace(/^sha1=/i, ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

function createMongoRuntimeState(): MongoRuntimeState {
  if (env.NODE_ENV === "test" || !process.env.MONGODB_URI?.trim()) {
    return { enabled: false, status: "inactive" };
  }

  const state: MongoRuntimeState = {
    enabled: true,
    status: "connecting"
  };

  const repository = getMongoDb(env.MONGODB_URI, env.MONGODB_DB)
    .then(async (db) => {
      await ensureIndexes(db);
      state.status = "active";
      logger.info({ db: env.MONGODB_DB }, "MongoDB persistence initialized");
      return new VoicePersistenceRepository(db);
    })
    .catch((error) => {
      state.status = "error";
      state.last_error = error instanceof Error ? error.message : String(error);
      logger.error({ err: error }, "MongoDB persistence initialization failed");
      throw error;
    });

  repository.catch(() => {
    // Avoid an unhandled rejection before the first request awaits the repository.
  });

  state.repository = repository;
  return state;
}

function getRawBody(request: unknown): string {
  const raw = (request as RawBodyRequest).rawBody;
  if (typeof raw === "string") return raw;
  return JSON.stringify((request as { body?: unknown }).body ?? {});
}

function readTraceId(headers: IncomingHttpHeaders): string {
  return firstHeaderValue(headers["x-request-id"])?.trim() || createId("trace");
}

function createWebhookEventId(rawBody: string): string {
  return `foodhub_${createHash("sha256").update(rawBody).digest("hex").slice(0, 32)}`;
}

function inferFoodHubWebhookAction(eventType?: string): string {
  if (!eventType) return "record_only";
  if (
    eventType.includes("MENU") ||
    eventType.includes("ENTITY") ||
    eventType.includes("OPEN_CLOSE") ||
    eventType.includes("STOCK")
  ) {
    return "menu_refreshed";
  }
  if (eventType.includes("ORDER")) return "order_reconcile_required";
  return "record_only";
}

async function recordFoodHubWebhook(input: {
  mongo: MongoRuntimeState;
  traceId: string;
  eventId: string;
  eventType?: string;
  tenantId: string;
  storeId: string;
  rawBody: string;
  signature?: string;
}): Promise<"recorded" | "duplicate"> {
  if (!input.mongo.repository) {
    const key = `foodhub:${input.eventId}`;
    if (inMemoryWebhookIds.has(key)) return "duplicate";
    inMemoryWebhookIds.add(key);
    return "recorded";
  }

  const repo = await input.mongo.repository;
  return repo.recordWebhookEvent({
    provider: "foodhub",
    event_id: input.eventId,
    event_type: input.eventType,
    tenant_id: input.tenantId,
    store_id: input.storeId,
    trace_id: input.traceId,
    signature: input.signature,
    raw_body_sha256: createHash("sha256").update(input.rawBody).digest("hex"),
    raw_body: input.rawBody,
    status: "RECEIVED",
    received_at: new Date().toISOString()
  });
}

async function markFoodHubWebhookProcessed(
  mongo: MongoRuntimeState,
  eventId: string,
  status: "PROCESSED" | "FAILED",
  action?: string,
  error?: string
): Promise<void> {
  if (!mongo.repository) return;
  const repo = await mongo.repository;
  await repo.markWebhookProcessed({
    provider: "foodhub",
    event_id: eventId,
    status,
    action,
    error
  });
}

function buildAssistantUnavailableTwiml(): string {
  return `
<Response>
  <Say>Sorry, the ordering assistant is not available right now. Please call back in a few minutes.</Say>
  <Hangup />
</Response>
  `.trim();
}

export function buildTwilioStreamUrl(headers: IncomingHttpHeaders): string {
  const host = firstHeaderValue(headers.host)?.trim() || "localhost";
  const forwardedProto = firstHeaderValue(headers["x-forwarded-proto"])
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const forwardedSsl = firstHeaderValue(headers["x-forwarded-ssl"])?.trim().toLowerCase();
  const isSecureProxy = forwardedProto === "https" || forwardedSsl === "on";
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?$/i.test(host);
  const protocol = isSecureProxy || !isLocalHost ? "wss" : "ws";
  return `${protocol}://${host}/ws/voice-twilio`;
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

if (process.env.NODE_ENV !== "test") {
  if (!productionEnvValidation.ok) {
    logger.error({ validation: productionEnvValidation }, "voice bridge production environment is incomplete");
    process.exit(1);
  }

  for (const warning of productionEnvValidation.warnings) {
    logger.warn({ warning }, "voice bridge production environment warning");
  }

  const app = buildServer();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : env.VOICE_BRIDGE_PORT;
  app.listen({ port, host: "0.0.0.0" }).catch((error) => {
    logger.error({ error }, "voice bridge failed to start");
    process.exit(1);
  });
}
