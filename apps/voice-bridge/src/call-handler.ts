import type WebSocket from "ws";
import { logger, createId } from "@aimate/shared";
import { buildSystemPrompt, type PromptContext } from "@aimate/domain";
import type { VoiceToolRouter, ToolName } from "@aimate/voice-tools";
import { GeminiLiveSession, type GeminiSessionConfig } from "@aimate/voice-engine";
import type { SessionStartMessage, ServerMessage } from "./messages";

export type CallHandlerDeps = {
  router: VoiceToolRouter;
  geminiApiKey: string;
  geminiModel: string;
  storeContext: string;
};

/**
 * Manages a single voice call's lifecycle.
 *
 * Orchestrates: client WebSocket ↔ GeminiLiveSession ↔ VoiceToolRouter
 */
export class CallHandler {
  private readonly callId: string;
  private readonly log: ReturnType<typeof logger.child>;
  private gemini: GeminiLiveSession | undefined;
  private closed = false;
  private sessionScope: { tenant_id: string; store_id: string; call_id: string } | undefined;

  constructor(
    private readonly clientWs: WebSocket,
    private readonly deps: CallHandlerDeps
  ) {
    this.callId = createId("call");
    this.log = logger.child({ call_id: this.callId });
  }

  /**
   * Initialise the Gemini Live session after receiving session.start from the client.
   */
  async start(msg: SessionStartMessage): Promise<void> {
    this.log.info({ tenant_id: msg.tenant_id, store_id: msg.store_id }, "starting call session");

    // Build system prompt from domain
    const promptCtx: PromptContext = {
      storeName: `Store ${msg.store_id}`,
      storeContext: this.deps.storeContext,
      languagePolicy:
        msg.language === "en"
          ? "Speak in English. If the caller switches language, follow naturally."
          : `Start in ${msg.language}. If the caller switches language, follow naturally.`
    };
    const { prompt, hash } = buildSystemPrompt(promptCtx);
    this.sessionScope = {
      tenant_id: msg.tenant_id,
      store_id: msg.store_id,
      call_id: this.callId
    };
    this.deps.router.startSession({
      ...this.sessionScope,
      caller_phone: msg.caller_phone,
      language: msg.language,
      prompt_hash: hash
    });

    // Import tool declarations dynamically (avoid circular dependency at module level)
    const { buildToolDeclarations } = await import("@aimate/voice-engine");
    const tools = buildToolDeclarations();

    const config: GeminiSessionConfig = {
      apiKey: this.deps.geminiApiKey,
      model: this.deps.geminiModel,
      systemInstruction: prompt,
      tools,
      voiceName: "Kore",
      responseModality: msg.mode === "text" ? "TEXT" : "AUDIO"
    };

    this.gemini = new GeminiLiveSession(config);

    // Wire Gemini events → client WebSocket
    this.gemini.on("setupComplete", () => {
      this.log.info("gemini session ready");
      this.send({ type: "session.ready", call_id: this.callId, model: config.model });
    });

    this.gemini.on("text", (text: string) => {
      this.send({ type: "agent.text", text });
    });

    this.gemini.on("audio", (chunk: { mimeType: string; data: string }) => {
      this.send({ type: "agent.audio", data: chunk.data, mimeType: chunk.mimeType });
    });

    this.gemini.on("toolCall", async (toolCall: { functionCalls: Array<{ id: string; name: string; args: unknown }> }) => {
      await this.handleToolCalls(toolCall.functionCalls, msg);
    });

    this.gemini.on("turnComplete", () => {
      this.send({ type: "turn.complete" });
    });

    this.gemini.on("error", (error: Error) => {
      this.log.error({ err: error }, "gemini session error");
      this.send({ type: "session.error", error: error.message });
    });

    // Connect to Gemini
    try {
      await this.gemini.connect();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to connect to Gemini";
      this.log.error({ err: error }, "failed to connect to gemini");
      this.send({ type: "session.error", error: errMsg, code: "GEMINI_CONNECT_FAILED" });
    }
  }

  /**
   * Forward user text to Gemini.
   */
  handleUserText(text: string): void {
    if (!this.gemini) {
      this.send({ type: "session.error", error: "Session not started. Send session.start first.", code: "SESSION_NOT_STARTED" });
      return;
    }
    this.log.info({ text_length: text.length }, "user text received");
    this.gemini.sendText(text);
  }

  /**
   * Forward user audio to Gemini.
   */
  handleUserAudio(pcmBase64: string): void {
    if (!this.gemini) return;
    this.gemini.sendAudio(pcmBase64);
  }

  /**
   * Execute tool calls from Gemini via the VoiceToolRouter and send responses back.
   */
  private async handleToolCalls(
    calls: Array<{ id: string; name: string; args: unknown }>,
    sessionMsg: SessionStartMessage
  ): Promise<void> {
    const responses: Array<{ id: string; name: string; response: unknown }> = [];

    for (const call of calls) {
      this.log.info({ tool: call.name, args: call.args }, "executing tool call");
      this.send({ type: "tool.calling", tool: call.name, request_id: call.id });

      // Enrich tool input with session context
      const enrichedInput = {
        ...(typeof call.args === "object" && call.args !== null ? call.args : {}),
        call_id: this.callId,
        tenant_id: sessionMsg.tenant_id,
        store_id: sessionMsg.store_id,
        language: sessionMsg.language,
        request_id: call.id
      };

      const result = await this.deps.router.call(call.name as ToolName, enrichedInput);

      const toolResult = result.ok
        ? { ok: true, data: result.data }
        : { ok: false, error: result.error_code, message: result.message };

      this.send({
        type: "tool.result",
        tool: call.name,
        ok: result.ok,
        message: result.ok ? "Tool executed successfully" : (result as { message: string }).message
      });

      responses.push({
        id: call.id,
        name: call.name,
        response: toolResult
      });
    }

    // Send all tool responses back to Gemini
    if (this.gemini && responses.length > 0) {
      this.gemini.sendToolResponse(responses);
    }
  }

  /**
   * Clean up and close the call.
   */
  async close(reason = "client_disconnect"): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.log.info({ reason }, "closing call session");

    if (this.gemini) {
      this.gemini.close();
      this.gemini = undefined;
    }

    if (this.sessionScope) {
      this.deps.router.endSession(this.sessionScope);
    }

    try {
      this.send({ type: "session.ended", reason });
    } catch {
      // Client might already be disconnected
    }
  }

  /**
   * Send a typed message to the client WebSocket.
   */
  private send(msg: ServerMessage): void {
    if (this.clientWs.readyState === 1 /* OPEN */) {
      this.clientWs.send(JSON.stringify(msg));
    }
  }
}
