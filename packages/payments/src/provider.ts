import { createId } from "@aimate/shared";

export type CreatePaymentLinkInput = {
  tenant_id: string;
  store_id: string;
  order_attempt_id: string;
  idempotency_key: string;
  amount: number;
  currency: string;
  customer_phone?: string;
  ttl_minutes?: number;
};

export type PaymentLinkResult = {
  payment_attempt_id: string;
  provider: string;
  url: string;
  expires_at: string;
};

export interface PaymentProvider {
  createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLinkResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLinkResult> {
    const expiresAt = new Date(Date.now() + (input.ttl_minutes ?? 15) * 60_000);
    return {
      payment_attempt_id: createId("pay"),
      provider: "mock",
      url: `https://payments.example.test/pay/${encodeURIComponent(input.idempotency_key)}`,
      expires_at: expiresAt.toISOString()
    };
  }
}
