import { describe, expect, it, vi } from "vitest";
import { TwilioTelephonyProvider } from "./twilio";

const mockUpdate = vi.fn();

vi.mock("twilio", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        calls: vi.fn().mockImplementation(() => {
          return {
            update: mockUpdate
          };
        })
      };
    })
  };
});

describe("TwilioTelephonyProvider", () => {
  it("redirects call using TwiML update", async () => {
    mockUpdate.mockResolvedValue({ sid: "call_test_sid" });

    const provider = new TwilioTelephonyProvider({
      accountSid: "ACmock",
      authToken: "auth_mock"
    });

    const result = await provider.transferToStaff({
      call_id: "CAtest",
      staff_number: "+447000000000",
      briefing: {
        call_id: "CAtest",
        store_id: "store123",
        language: "en",
        intent: "handoff",
        risk_reason: "Customer asked for manager",
        recommended_action: "Connect call to supervisor"
      }
    });

    expect(result.ok).toBe(true);
    expect((result as { transfer_id: string }).transfer_id).toBe("call_test_sid");
    expect(mockUpdate).toHaveBeenCalledWith({
      twiml: expect.stringContaining("+447000000000")
    });
  });
});
