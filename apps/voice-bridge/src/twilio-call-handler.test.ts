import { describe, expect, it, vi } from "vitest";
import { TwilioCallHandler } from "./twilio-call-handler.js";
import type { VoiceToolRouter } from "@aimate/voice-tools";
import type WebSocket from "ws";

const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockSendAudio = vi.fn();

vi.mock("@aimate/voice-engine", () => {
  return {
    GeminiLiveSession: class {
      connect = mockConnect;
      sendAudio = mockSendAudio;
      on = vi.fn();
      close = vi.fn();
    },
    buildToolDeclarations: () => []
  };
});

describe("TwilioCallHandler", () => {
  it("initializes on start event and forwards audio on media event", async () => {
    const mockWs = {
      send: vi.fn(),
      readyState: 1
    } as unknown as WebSocket;

    const mockRouter = {
      startSession: vi.fn(),
      endSession: vi.fn()
    } as unknown as VoiceToolRouter;

    const handler = new TwilioCallHandler(mockWs, {
      router: mockRouter,
      geminiApiKey: "apikey",
      geminiModel: "gemini-model",
      storeContext: "context"
    });

    // Send start message
    await handler.handleMessage(
      JSON.stringify({
        event: "start",
        start: {
          callSid: "CAtest",
          streamSid: "STtest",
          customParameters: {
            tenant_id: "t1",
            store_id: "s1",
            language: "en"
          }
        }
      })
    );

    expect(mockConnect).toHaveBeenCalled();

    // Send media message (mulaw silence 0xFF)
    await handler.handleMessage(
      JSON.stringify({
        event: "media",
        media: {
          track: "inbound",
          payload: Buffer.from([0xff]).toString("base64")
        }
      })
    );

    // Forwards transcoded PCM to Gemini
    expect(mockSendAudio).toHaveBeenCalled();
  });
});
