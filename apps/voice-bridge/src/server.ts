import websocket from "@fastify/websocket";
import { FoodHubClient } from "@aimate/foodhub";
import { MockPaymentProvider } from "@aimate/payments";
import { loadEnv, logger } from "@aimate/shared";
import { MockTelephonyProvider } from "@aimate/telephony";
import { VoiceToolRouter } from "@aimate/voice-tools";
import Fastify from "fastify";

const env = loadEnv();

export function buildServer() {
  const app = Fastify({ logger: false });
  app.register(websocket);

  const router = new VoiceToolRouter({
    foodhub: new FoodHubClient({
      baseUrl: env.FOODHUB_BASE_URL,
      clientId: env.FOODHUB_CLIENT_ID,
      clientSecret: env.FOODHUB_CLIENT_SECRET
    }),
    paymentProvider: new MockPaymentProvider(),
    telephonyProvider: new MockTelephonyProvider(),
    staffNumber: process.env.DEFAULT_STAFF_NUMBER,
    menuEntities: [
      {
        tenant_id: "demo",
        store_id: env.FOODHUB_DEFAULT_STORE_ID ?? "demo-store",
        menu_snapshot_id: "demo-menu",
        entity_type: "ITEM",
        entity_id: "demo_chicken_burger",
        name: "Chicken Burger",
        aliases: ["chicken sandwich", "crispy chicken burger"],
        price: 699,
        fulfillment_modes: ["DELIVERY", "COLLECTION"],
        stock_status: "AVAILABLE",
        modifier_group_ids: [],
        updated_at: new Date().toISOString()
      }
    ]
  });

  app.get("/health", async () => ({
    ok: true,
    service: "voice-bridge",
    time: new Date().toISOString()
  }));

  app.get("/ready", async () => ({
    ok: true,
    provider: env.GEMINI_LIVE_MODEL ? "gemini" : "mock",
    telephony: env.TELEPHONY_PROVIDER
  }));

  app.register(async (fastify) => {
    fastify.get("/ws/calls/:callId", { websocket: true }, (socket, request) => {
      const callId = (request.params as { callId: string }).callId;
      logger.info({ call_id: callId }, "voice websocket connected");

      socket.send(
        JSON.stringify({
          type: "session.started",
          call_id: callId,
          message: "AIMate voice bridge connected"
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
        logger.info({ call_id: callId }, "voice websocket closed");
      });
    });
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const app = buildServer();
  app.listen({ port: env.VOICE_BRIDGE_PORT, host: "0.0.0.0" }).catch((error) => {
    logger.error({ error }, "voice bridge failed to start");
    process.exit(1);
  });
}
