export type StaffBriefingPayload = {
  call_id: string;
  store_id: string;
  caller_phone?: string;
  language: string;
  intent: string;
  cart_summary?: string;
  customer_details?: string;
  risk_reason: string;
  confidence_score?: number;
  last_customer_utterance?: string;
  recommended_action: string;
};

export interface TelephonyProvider {
  transferToStaff(input: {
    call_id: string;
    staff_number: string;
    briefing: StaffBriefingPayload;
  }): Promise<{ ok: true; transfer_id: string } | { ok: false; reason: string }>;
}

export class MockTelephonyProvider implements TelephonyProvider {
  async transferToStaff(input: {
    call_id: string;
    staff_number: string;
    briefing: StaffBriefingPayload;
  }) {
    return { ok: true as const, transfer_id: `mock-transfer-${input.call_id}` };
  }
}
