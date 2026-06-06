/**
 * Smoke test: connect to the voice bridge WebSocket and run a text conversation.
 *
 * Usage:
 *   node tools/test-voice-session.mjs [ws-url]
 *
 * Default ws-url: ws://localhost:4100/ws/voice
 *
 * Requires GEMINI_API_KEY to be set in the voice bridge's environment.
 */

import WebSocket from "ws";

const WS_URL = process.argv[2] ?? "ws://localhost:4100/ws/voice";
const TIMEOUT_MS = 30_000;

function log(prefix, data) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${prefix}:`, typeof data === "string" ? data : JSON.stringify(data, null, 2));
}

async function run() {
  log("INFO", `Connecting to ${WS_URL}`);

  const ws = new WebSocket(WS_URL);
  let sessionReady = false;
  let gotAgentResponse = false;

  const timeout = setTimeout(() => {
    log("FAIL", "Timed out waiting for response");
    ws.close();
    process.exit(1);
  }, TIMEOUT_MS);

  ws.on("open", () => {
    log("INFO", "WebSocket connected, sending session.start");
    ws.send(JSON.stringify({
      type: "session.start",
      tenant_id: "smoke-test",
      store_id: "demo-store",
      language: "en",
      mode: "text"
    }));
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    log("RECV", msg);

    if (msg.type === "session.ready") {
      sessionReady = true;
      log("INFO", "Session ready — sending test query");
      ws.send(JSON.stringify({
        type: "user.text",
        text: "Hi, what's on the menu?"
      }));
    }

    if (msg.type === "session.error") {
      log("FAIL", `Session error: ${msg.error}`);
      clearTimeout(timeout);
      ws.close();
      process.exit(1);
    }

    if (msg.type === "agent.text") {
      gotAgentResponse = true;
      log("PASS", `Agent responded: "${msg.text}"`);
    }

    if (msg.type === "tool.calling") {
      log("INFO", `Agent calling tool: ${msg.tool}`);
    }

    if (msg.type === "tool.result") {
      log("INFO", `Tool result: ${msg.tool} ok=${msg.ok}`);
    }

    if (msg.type === "turn.complete" && gotAgentResponse) {
      log("PASS", "✅ Full conversation round-trip completed successfully!");
      clearTimeout(timeout);
      ws.send(JSON.stringify({ type: "session.end" }));
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    }
  });

  ws.on("error", (err) => {
    log("FAIL", `WebSocket error: ${err.message}`);
    clearTimeout(timeout);
    process.exit(1);
  });

  ws.on("close", () => {
    log("INFO", "WebSocket closed");
    clearTimeout(timeout);
    if (!gotAgentResponse) {
      process.exit(1);
    }
  });
}

run().catch((err) => {
  log("FAIL", err.message);
  process.exit(1);
});
