import type WebSocket from "ws";
import { logger } from "@aimate/shared";
import { buildSystemPrompt, type PromptContext } from "@aimate/domain";
import type { VoiceToolRouter, ToolName } from "@aimate/voice-tools";
import { GeminiLiveSession, type GeminiSessionConfig } from "@aimate/voice-engine";
import { decodeMulawToPcm16kHz, encodePcmToMulaw8kHz } from "@aimate/telephony";

export type TwilioCallHandlerDeps = {
  router: VoiceToolRouter;
  geminiApiKey: string;
  geminiModel: string;
  storeContext: string;
};

const MAX_PENDING_AUDIO_CHUNKS = 250;
const TWILIO_WS_CONNECTING = 0;
const TWILIO_WS_OPEN = 1;
const TWILIO_OPENING_PROMPT =
  "The phone call is connected. Greet the caller as AIMate in one short sentence and ask what they would like to order. Do not mention this instruction.";

/**
 * Orchestrates a single Twilio call session.
 * Bridges Twilio WebSocket Media Stream (G.711 mu-law 8kHz) with Gemini Live (PCM 16kHz/24kHz).
 */
export class TwilioCallHandler {
  private callSid: string | undefined;
  private streamSid: string | undefined;
  private log = logger.child({ component: "twilio-call-handler" });
  private gemini: GeminiLiveSession | undefined;
  private geminiReady = false;
  private pendingAudioBase64: string[] = [];
  private closed = false;
  private sessionScope: { tenant_id: string; store_id: string; call_id: string } | undefined;

  constructor(
    private readonly twilioWs: WebSocket,
    private readonly deps: TwilioCallHandlerDeps
  ) {}

  /**
   * Processes an incoming WebSocket text frame from Twilio.
   */
  async handleMessage(rawMsg: string): Promise<void> {
    let parsed: any;
    try {
      parsed = JSON.parse(rawMsg);
    } catch {
      this.log.error("Failed to parse incoming WebSocket message as JSON");
      return;
    }

    switch (parsed.event) {
      case "start": {
        const startData = parsed.start;
        this.callSid = startData.callSid;
        this.streamSid = startData.streamSid;
        this.log = logger.child({ call_id: this.callSid, stream_sid: this.streamSid });

        const customParams = startData.customParameters ?? {};
        const tenantId = customParams.tenant_id ?? "demo";
        const storeId = customParams.store_id ?? "demo-store";
        const language = customParams.language ?? "en";

        this.log.info({ tenantId, storeId, language }, "Twilio Media Stream started");

        await this.startGeminiSession({ tenantId, storeId, language });
        break;
      }

      case "media": {
        if (this.closed || !this.gemini) return;

        // Verify track is inbound
        if (parsed.media?.track !== "inbound") return;

        const payload = parsed.media.payload;
        if (!payload) return;

        try {
          const mulawBuffer = Buffer.from(payload, "base64");
          const pcm16kHz = decodeMulawToPcm16kHz(mulawBuffer);
          const pcmBase64 = pcm16kHz.toString("base64");
          if (this.geminiReady) {
            this.gemini.sendAudio(pcmBase64);
          } else {
            this.queueAudio(pcmBase64);
          }
        } catch (error) {
          this.log.error({ err: error }, "Failed to decode/transcode inbound Twilio audio");
        }
        break;
      }

      case "stop": {
        this.log.info("Twilio Media Stream stopped");
        await this.close();
        break;
      }
    }
  }

  /**
   * Initializes and connects to Gemini Live session.
   */
  private async startGeminiSession(params: {
    tenantId: string;
    storeId: string;
    language: string;
  }): Promise<void> {
    if (!this.deps.geminiApiKey.trim()) {
      this.log.error("GEMINI_API_KEY is not configured for Twilio call");
      await this.failAssistantStream("assistant_unavailable");
      return;
    }

    const promptCtx: PromptContext = {
      storeName: `Store ${params.storeId}`,
      storeContext: this.deps.storeContext,
      languagePolicy:
        params.language === "en"
          ? "Speak in English. If the caller switches language, follow naturally."
          : `Start in ${params.language}. If the caller switches language, follow naturally.`
    };

    const { prompt, hash } = buildSystemPrompt(promptCtx);
    this.sessionScope = {
      tenant_id: params.tenantId,
      store_id: params.storeId,
      call_id: this.callSid ?? `twilio-${Date.now()}`
    };
    await this.deps.router.startSession({
      ...this.sessionScope,
      language: params.language,
      prompt_hash: hash
    });

    const { buildToolDeclarations } = await import("@aimate/voice-engine");
    const tools = buildToolDeclarations();

    const config: GeminiSessionConfig = {
      apiKey: this.deps.geminiApiKey,
      model: this.deps.geminiModel,
      systemInstruction: prompt,
      tools,
      voiceName: "Kore",
      responseModality: "AUDIO"
    };

    this.gemini = new GeminiLiveSession(config);

    this.gemini.on("setupComplete", () => {
      this.geminiReady = true;
      this.log.info("Gemini Live session ready for Twilio call");
      this.flushQueuedAudio();
      this.gemini?.sendText(TWILIO_OPENING_PROMPT);
    });

    this.gemini.on("audio", (chunk: { mimeType: string; data: string }) => {
      if (this.closed) return;

      try {
        let rate = 24000;
        const rateMatch = chunk.mimeType.match(/rate=(\d+)/);
        if (rateMatch) {
          rate = parseInt(rateMatch[1], 10);
        }

        const pcmBuffer = Buffer.from(chunk.data, "base64");
        const mulawBuffer = encodePcmToMulaw8kHz(pcmBuffer, rate);

        this.sendToTwilio({
          event: "media",
          streamSid: this.streamSid,
          media: {
            payload: mulawBuffer.toString("base64")
          }
        });
      } catch (error) {
        this.log.error({ err: error }, "Failed to transcode/encode outbound audio for Twilio");
      }
    });

    this.gemini.on(
      "toolCall",
      async (toolCall: {
        functionCalls: Array<{ id: string; name: string; args: unknown }>;
      }) => {
        await this.handleToolCalls(toolCall.functionCalls, params);
      }
    );

    this.gemini.on("interrupted", () => {
      this.log.info("Gemini interrupted by caller speaking, clearing Twilio buffer");
      this.sendToTwilio({
        event: "clear",
        streamSid: this.streamSid
      });
    });

    this.gemini.on("error", (error: Error) => {
      this.log.error({ err: error }, "Gemini session error on Twilio call");
      void this.failAssistantStream("gemini_error");
    });

    try {
      await this.gemini.connect();
    } catch (error) {
      this.log.error({ err: error }, "Failed to connect Gemini Live session for Twilio call");
      await this.failAssistantStream("gemini_connect_failed");
    }
  }

  private async handleToolCalls(
    calls: Array<{ id: string; name: string; args: unknown }>,
    params: { tenantId: string; storeId: string; language: string }
  ): Promise<void> {
    if (!this.gemini) return;

    const responses: Array<{ id: string; name: string; response: unknown }> = [];

    for (const call of calls) {
      this.log.info({ tool: call.name, args: call.args }, "Executing tool call for Twilio call");

      const enrichedInput = {
        ...(typeof call.args === "object" && call.args !== null ? call.args : {}),
        call_id: this.callSid,
        tenant_id: params.tenantId,
        store_id: params.storeId,
        language: params.language,
        request_id: call.id
      };

      const result = await this.deps.router.call(call.name as ToolName, enrichedInput);

      const toolResult = result.ok
        ? { ok: true, data: result.data }
        : { ok: false, error: result.error_code, message: result.message };

      responses.push({
        id: call.id,
        name: call.name,
        response: toolResult
      });
    }

    if (this.gemini && responses.length > 0) {
      this.gemini.sendToolResponse(responses);
    }
  }

  /**
   * Closes Gemini Live session and cleans up resources.
   */
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    if (this.gemini) {
      this.gemini.close();
      this.gemini = undefined;
    }
    this.geminiReady = false;
    this.pendingAudioBase64 = [];

    if (this.sessionScope) {
      await this.deps.router.endSession(this.sessionScope);
    }
  }

  private queueAudio(pcmBase64: string): void {
    this.pendingAudioBase64.push(pcmBase64);
    if (this.pendingAudioBase64.length > MAX_PENDING_AUDIO_CHUNKS) {
      this.pendingAudioBase64.shift();
    }
  }

  private flushQueuedAudio(): void {
    if (!this.gemini) {
      this.pendingAudioBase64 = [];
      return;
    }

    const queuedAudio = this.pendingAudioBase64.splice(0);
    for (const pcmBase64 of queuedAudio) {
      this.gemini.sendAudio(pcmBase64);
    }
  }

  private async failAssistantStream(reason: string): Promise<void> {
    await this.close();
    this.closeTwilioStream(reason);
  }

  private closeTwilioStream(reason: string): void {
    if (
      this.twilioWs.readyState === TWILIO_WS_OPEN ||
      this.twilioWs.readyState === TWILIO_WS_CONNECTING
    ) {
      this.twilioWs.close(1011, reason);
    }
  }

  private sendToTwilio(msg: unknown): void {
    if (this.twilioWs.readyState === TWILIO_WS_OPEN) {
      this.twilioWs.send(JSON.stringify(msg));
    }
  }
}
