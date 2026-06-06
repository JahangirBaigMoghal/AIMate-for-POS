import websocket from "@fastify/websocket";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Redis } from "ioredis";
import { FoodHubClient, FoodHubTokenManager, RedisTokenStore } from "@aimate/foodhub";
import { MockPaymentProvider, StripePaymentProvider } from "@aimate/payments";
import { MenuCatalog } from "@aimate/rag";
import { loadEnv, logger } from "@aimate/shared";
import { MockTelephonyProvider, TwilioTelephonyProvider } from "@aimate/telephony";
import { InMemoryLockManager, RedisLockManager } from "@aimate/datastore";
import { InMemoryVoiceWorkflowStore, VoiceToolRouter } from "@aimate/voice-tools";
import Fastify from "fastify";
import { ClientMessageSchema } from "./messages";
import { CallHandler, type CallHandlerDeps } from "./call-handler";
import { TwilioCallHandler } from "./twilio-call-handler";

const env = loadEnv();

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

  const workflow = new InMemoryVoiceWorkflowStore({
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
    lockManager
  });

  const geminiApiKey = env.GEMINI_API_KEY;
  const geminiModel = env.GEMINI_LIVE_MODEL ?? "gemini-2.0-flash-exp";

  // ─── Health / Readiness ─────────────────────────────────────

  app.get("/health", async () => ({
    ok: true,
    service: "voice-bridge",
    time: new Date().toISOString()
  }));

  app.get("/ready", async () => ({
    ok: true,
    gemini: geminiApiKey ? "configured" : "missing",
    model: geminiModel,
    telephony: env.TELEPHONY_PROVIDER,
    redis: env.REDIS_URL ? "active" : "inactive",
    foodhub: foodhubClient.hasCredentials() ? "configured" : "mock-mode",
    default_delivery_fee_pence: env.DEFAULT_DELIVERY_FEE_PENCE
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
    const body = JSON.stringify(request.body ?? {});
    const signature = request.headers["x-webhook-signature"];
    if (
      env.FOODHUB_WEBHOOK_SECRET &&
      !isValidWebhookSignature(body, typeof signature === "string" ? signature : "", env.FOODHUB_WEBHOOK_SECRET)
    ) {
      return reply.status(401).send({ ok: false, error: "Invalid signature" });
    }

    const event = (request.body ?? {}) as {
      event_type?: string;
      store_id?: string;
      event_id?: string;
    };
    const tenantId = "demo";
    const storeId = event.store_id ?? env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store";
    const shouldRefreshMenu =
      event.event_type?.includes("MENU") ||
      event.event_type?.includes("ENTITY") ||
      event.event_type?.includes("OPEN_CLOSE") ||
      event.event_type?.includes("STOCK");

    if (shouldRefreshMenu) {
      router.markMenuStale(tenantId, storeId);
      const snapshot = await menuCatalog.refresh(tenantId, storeId);
      return {
        ok: true,
        received: true,
        event_id: event.event_id,
        action: "menu_refreshed",
        source: snapshot.source,
        entity_count: snapshot.entities.length,
        last_error: snapshot.last_error
      };
    }

    return {
      ok: true,
      received: true,
      event_id: event.event_id,
      action: "record_only"
    };
  });

  // ─── Telephony Inbound Webhook (TwiML generator) ────────────

  app.post("/api/telephony/twilio/inbound", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const tenantId = query.tenant_id ?? "demo";
    const storeId = query.store_id ?? env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store";
    const language = query.language ?? "en";

    const host = request.headers.host ?? "localhost";
    // Detect protocol - if behind proxy (like Vercel/ngrok) use wss, otherwise ws
    const protocol = request.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}/ws/voice-twilio`;

    const twiml = `
<Response>
  <Say>Hello! Welcome to our restaurant ordering system. Connecting you to the assistant now.</Say>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="tenant_id" value="${tenantId}" />
      <Parameter name="store_id" value="${storeId}" />
      <Parameter name="language" value="${language}" />
    </Stream>
  </Connect>
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
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

if (process.env.NODE_ENV !== "test") {
  const app = buildServer();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : env.VOICE_BRIDGE_PORT;
  app.listen({ port, host: "0.0.0.0" }).catch((error) => {
    logger.error({ error }, "voice bridge failed to start");
    process.exit(1);
  });
}
