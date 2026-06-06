import Stripe from "stripe";
import type { PaymentProvider, CreatePaymentLinkInput, PaymentLinkResult } from "./provider";

/**
 * Stripe implementation of the PaymentProvider interface.
 * Uses Stripe Checkout Sessions to generate SCA-compliant hosted payment links.
 */
export class StripePaymentProvider implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2023-10-16" as any
    });
  }

  async createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLinkResult> {
    const session = await this.stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: `Order payment - Ref: ${input.order_attempt_id}`
              },
              unit_amount: input.amount
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: `https://payments.example.test/success?id=${encodeURIComponent(
          input.order_attempt_id
        )}`,
        cancel_url: `https://payments.example.test/cancel?id=${encodeURIComponent(
          input.order_attempt_id
        )}`,
        metadata: {
          tenant_id: input.tenant_id,
          store_id: input.store_id,
          order_attempt_id: input.order_attempt_id
        }
      },
      {
        idempotencyKey: input.idempotency_key
      }
    );

    const expiresAt = new Date(Date.now() + (input.ttl_minutes ?? 15) * 60_000);

    return {
      payment_attempt_id: session.id,
      provider: "stripe",
      url: session.url ?? "",
      expires_at: expiresAt.toISOString()
    };
  }
}
