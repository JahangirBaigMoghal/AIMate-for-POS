import { EventEmitter } from "node:events";
import WebSocket from "ws";
import { logger } from "@aimate/shared";
import type { FunctionDeclaration } from "./tool-declarations";

export type GeminiSessionConfig = {
  apiKey: string;
  model: string;
  systemInstruction: string;
  tools: FunctionDeclaration[];
  voiceName?: string;
  responseModality?: "TEXT" | "AUDIO";
};

export type GeminiToolCall = {
  functionCalls: Array<{ id: string; name: string; args: Record<string, unknown> }>;
};

export type GeminiAudioChunk = {
  mimeType: string;
  data: string; // base64
};

export interface GeminiLiveSessionEvents {
  setupComplete: [];
  text: [text: string];
  audio: [chunk: GeminiAudioChunk];
  toolCall: [call: GeminiToolCall];
  turnComplete: [];
  interrupted: [];
  error: [error: Error];
  closed: [];
}

const LIVE_API_BASE = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/**
 * Manages a single bidirectional WebSocket session with the Gemini Live API.
 *
 * Lifecycle: construct → connect() → send text/audio → receive events → close()
 */
export class GeminiLiveSession extends EventEmitter {
  private ws: WebSocket | undefined;
  private readonly log = logger.child({ component: "gemini-live" });
  private connected = false;

  constructor(private readonly config: GeminiSessionConfig) {
    super();
  }

  /**
   * Open WebSocket to Gemini Live, send setup message, and wait for setupComplete.
   */
  connect(): Promise<void> {
    if (!this.config.apiKey.trim()) {
      return Promise.reject(new Error("GEMINI_API_KEY is not configured"));
    }

    return new Promise((resolve, reject) => {
      const url = `${LIVE_API_BASE}?key=${this.config.apiKey}`;
      this.log.info({ model: this.config.model }, "connecting to gemini live");

      this.ws = new WebSocket(url);

      const setupTimeout = setTimeout(() => {
        reject(new Error("Gemini Live setup timed out after 15s"));
        this.close();
      }, 15_000);

      this.ws.on("open", () => {
        this.log.info("websocket open, sending setup");
        this.sendSetup();
      });

      this.ws.on("message", (raw: Buffer | string) => {
        try {
          const data = JSON.parse(typeof raw === "string" ? raw : raw.toString("utf8"));
          this.handleServerMessage(
            data,
            () => {
              clearTimeout(setupTimeout);
              resolve();
            },
            (error) => {
              clearTimeout(setupTimeout);
              if (!this.connected) {
                reject(error);
              } else {
                this.emit("error", error);
              }
            }
          );
        } catch (err) {
          this.log.error({ err }, "failed to parse gemini message");
        }
      });

      this.ws.on("error", (err: any) => {
        this.log.error({ err }, "gemini websocket error");
        clearTimeout(setupTimeout);
        if (!this.connected) {
          reject(err);
        } else {
          this.emit("error", err instanceof Error ? err : new Error(String(err)));
        }
      });

      this.ws.on("close", (code: number, reason: any) => {
        this.log.info({ code, reason: reason?.toString() }, "gemini websocket closed");
        const wasConnected = this.connected;
        this.connected = false;
        clearTimeout(setupTimeout);
        this.emit("closed");
        if (!wasConnected) {
          reject(new Error(`Gemini Live websocket closed before setup complete (code: ${code}, reason: ${reason?.toString() || "none"})`));
        }
      });
    });
  }

  /**
   * Send a text message from the user to Gemini.
   */
  sendText(text: string): void {
    this.sendJson({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true
      }
    });
  }

  /**
   * Send a raw PCM audio chunk (base64-encoded) to Gemini.
   */
  sendAudio(pcmBase64: string): void {
    this.sendJson({
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: pcmBase64
          }
        ]
      }
    });
  }

  /**
   * Send tool execution results back to Gemini so it can continue generation.
   */
  sendToolResponse(
    functionResponses: Array<{ id: string; name: string; response: unknown }>
  ): void {
    this.sendJson({
      toolResponse: { functionResponses }
    });
  }

  /**
   * Close the WebSocket connection.
   */
  close(): void {
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = undefined;
    }
    this.connected = false;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  // ─── Private ──────────────────────────────────────────────

  private sendSetup(): void {
    const modality = this.config.responseModality ?? "AUDIO";

    const generationConfig: Record<string, unknown> = {
      responseModalities: [modality]
    };

    if (modality === "AUDIO") {
      generationConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: this.config.voiceName ?? "Kore"
          }
        }
      };
    }

    const setup: Record<string, unknown> = {
      model: `models/${this.config.model}`,
      generationConfig,
      systemInstruction: {
        parts: [{ text: this.config.systemInstruction }]
      }
    };

    if (this.config.tools.length > 0) {
      setup.tools = [{ functionDeclarations: this.config.tools }];
    }

    this.sendJson({ setup });
  }

  private handleServerMessage(
    data: Record<string, unknown>,
    onSetupComplete: () => void,
    onError: (error: Error) => void
  ): void {
    if ("error" in data) {
      const error = parseGeminiError(data.error);
      this.log.error({ err: data.error }, "gemini live server error");
      onError(error);
      return;
    }

    // Setup acknowledgement
    if ("setupComplete" in data) {
      this.connected = true;
      this.log.info("gemini setup complete");
      this.emit("setupComplete");
      onSetupComplete();
      return;
    }

    // Tool call request from model
    if ("toolCall" in data) {
      const tc = data.toolCall as {
        functionCalls?: Array<{ id: string; name: string; args: Record<string, unknown> }>;
      };
      if (tc.functionCalls && tc.functionCalls.length > 0) {
        this.log.info(
          { tools: tc.functionCalls.map((fc) => fc.name) },
          "gemini tool call"
        );
        this.emit("toolCall", { functionCalls: tc.functionCalls });
      }
      return;
    }

    // Model content (text or audio)
    if ("serverContent" in data) {
      const sc = data.serverContent as {
        modelTurn?: { parts?: Array<Record<string, unknown>> };
        turnComplete?: boolean;
        interrupted?: boolean;
      };

      if (sc.modelTurn?.parts) {
        for (const part of sc.modelTurn.parts) {
          if ("text" in part && typeof part.text === "string") {
            this.emit("text", part.text);
          }
          if ("inlineData" in part) {
            const inline = part.inlineData as { mimeType: string; data: string };
            this.emit("audio", { mimeType: inline.mimeType, data: inline.data });
          }
        }
      }

      if (sc.turnComplete) {
        this.emit("turnComplete");
      }
      if (sc.interrupted) {
        this.emit("interrupted");
      }
    }
  }

  private sendJson(payload: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log.warn("cannot send — websocket not open");
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }
}

function parseGeminiError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  if (typeof value === "object" && value !== null) {
    const error = value as { message?: unknown; code?: unknown; status?: unknown };
    const message = typeof error.message === "string" ? error.message : JSON.stringify(value);
    const code = typeof error.code === "number" || typeof error.code === "string" ? ` ${error.code}` : "";
    const status = typeof error.status === "string" ? ` ${error.status}` : "";
    return new Error(`Gemini Live error${code}${status}: ${message}`);
  }
  return new Error("Unknown Gemini Live error");
}
