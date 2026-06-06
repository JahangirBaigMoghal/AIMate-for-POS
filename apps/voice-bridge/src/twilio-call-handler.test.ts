import { beforeEach, describe, expect, it, vi } from "vitest";
import { TwilioCallHandler } from "./twilio-call-handler.js";
import type { VoiceToolRouter } from "@aimate/voice-tools";
import type WebSocket from "ws";

type Handler = (...args: any[]) => void;

const geminiMock = vi.hoisted(() => ({
  close: vi.fn(),
  connect: vi.fn(),
  handlers: {} as Record<string, Handler[]>,
  sendAudio: vi.fn(),
  sendText: vi.fn()
}));

vi.mock("@aimate/voice-engine", () => {
  return {
    GeminiLiveSession: class {
      close = geminiMock.close;
      connect = geminiMock.connect;
      sendAudio = geminiMock.sendAudio;
      sendText = geminiMock.sendText;

      on(event: string, handler: Handler) {
        geminiMock.handlers[event] ??= [];
        geminiMock.handlers[event].push(handler);
        return this;
      }
    },
    buildToolDeclarations: () => []
  };
});

describe("TwilioCallHandler", () => {
  beforeEach(() => {
    geminiMock.close.mockReset();
    geminiMock.connect.mockReset().mockResolvedValue(undefined);
    geminiMock.handlers = {};
    geminiMock.sendAudio.mockReset();
    geminiMock.sendText.mockReset();
  });

  it("starts Gemini, opens with an assistant greeting, and forwards inbound audio after setup", async () => {
    const { handler } = createHandler();

    await handler.handleMessage(startEvent());
    expect(geminiMock.connect).toHaveBeenCalled();

    await handler.handleMessage(mediaEvent([0xff]));
    expect(geminiMock.sendAudio).not.toHaveBeenCalled();

    geminiMock.handlers.setupComplete[0]();
    expect(geminiMock.sendText).toHaveBeenCalledWith(expect.stringContaining("Greet the caller"));
    expect(geminiMock.sendAudio).toHaveBeenCalled();

    await handler.handleMessage(mediaEvent([0xff]));
    expect(geminiMock.sendAudio).toHaveBeenCalledTimes(2);
  });

  it("closes the Twilio stream when Gemini setup fails so Twilio can play fallback TwiML", async () => {
    geminiMock.connect.mockRejectedValueOnce(new Error("bad model"));
    const { handler, mockWs, mockRouter } = createHandler();

    await handler.handleMessage(startEvent());

    expect(geminiMock.close).toHaveBeenCalled();
    expect(mockRouter.endSession).toHaveBeenCalledWith({
      tenant_id: "t1",
      store_id: "s1",
      call_id: "CAtest"
    });
    expect(mockWs.close).toHaveBeenCalledWith(1011, "gemini_connect_failed");
  });
});

function createHandler() {
  const mockWs = {
    close: vi.fn(),
    send: vi.fn(),
    readyState: 1
  } as unknown as WebSocket & { close: ReturnType<typeof vi.fn> };

  const mockRouter = {
    startSession: vi.fn(),
    endSession: vi.fn()
  } as unknown as VoiceToolRouter & { endSession: ReturnType<typeof vi.fn> };

  const handler = new TwilioCallHandler(mockWs, {
    router: mockRouter,
    geminiApiKey: "apikey",
    geminiModel: "gemini-model",
    storeContext: "context"
  });

  return { handler, mockRouter, mockWs };
}

function startEvent() {
  return JSON.stringify({
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
  });
}

function mediaEvent(bytes: number[]) {
  return JSON.stringify({
    event: "media",
    media: {
      track: "inbound",
      payload: Buffer.from(bytes).toString("base64")
    }
  });
}
