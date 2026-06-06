import twilio from "twilio";
import type { TelephonyProvider, StaffBriefingPayload } from "./provider";

export type TwilioTelephonyConfig = {
  accountSid: string;
  authToken: string;
};

/**
 * Twilio implementation of the TelephonyProvider interface.
 * Updates active Twilio calls using their Call SID and redirects them using TwiML.
 */
export class TwilioTelephonyProvider implements TelephonyProvider {
  private readonly client: twilio.Twilio;

  constructor(config: TwilioTelephonyConfig) {
    this.client = twilio(config.accountSid, config.authToken);
  }

  async transferToStaff(input: {
    call_id: string; // This corresponds to Twilio's Call SID
    staff_number: string;
    briefing: StaffBriefingPayload;
  }): Promise<{ ok: true; transfer_id: string } | { ok: false; reason: string }> {
    try {
      const twiml = `
<Response>
  <Say>Transferring you to a staff member. Please hold.</Say>
  <Dial>${input.staff_number}</Dial>
</Response>
      `;

      const call = await this.client.calls(input.call_id).update({
        twiml: twiml.trim()
      });

      return {
        ok: true as const,
        transfer_id: call.sid ?? `twilio-transfer-${input.call_id}`
      };
    } catch (error) {
      return {
        ok: false as const,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
