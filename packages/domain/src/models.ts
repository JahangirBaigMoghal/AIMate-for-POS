import { z } from "zod";

export const TenantScopedSchema = z.object({
  tenant_id: z.string().min(1),
  store_id: z.string().min(1)
});

export const CallSessionStatusSchema = z.enum([
  "STARTED",
  "LANGUAGE_DETECTED",
  "CART_BUILDING",
  "CONFIRMING",
  "ORDER_COMMITTING",
  "PAYMENT_PENDING",
  "HANDOFF",
  "ENDED"
]);

export const CallSessionSchema = TenantScopedSchema.extend({
  call_id: z.string().min(1),
  status: CallSessionStatusSchema,
  caller_phone: z.string().optional(),
  language: z.string().default("en"),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  prompt_hash: z.string().optional()
});

export const OrderAttemptStateSchema = z.enum([
  "DRAFT",
  "CONFIRMING",
  "CONFIRMED",
  "SUBMITTING",
  "SUBMITTED",
  "RECONCILING",
  "FAILED",
  "CANCELLED",
  "HANDOFF"
]);

export const OrderAttemptSchema = TenantScopedSchema.extend({
  order_attempt_id: z.string().min(1),
  call_id: z.string().min(1),
  external_reference_id: z.string().min(1),
  state: OrderAttemptStateSchema,
  cart_version: z.number().int().nonnegative(),
  foodhub_order_id: z.string().optional(),
  resource_uri: z.string().optional(),
  last_error: z.unknown().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const PaymentAttemptSchema = TenantScopedSchema.extend({
  payment_attempt_id: z.string().min(1),
  order_attempt_id: z.string().min(1),
  provider: z.string().min(1),
  idempotency_key: z.string().min(1),
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
  status: z.enum(["CREATED", "SENT", "PAID", "EXPIRED", "FAILED", "RECONCILING"]),
  url: z.string().url().optional(),
  expires_at: z.string().datetime().optional()
});

export type CallSession = z.infer<typeof CallSessionSchema>;
export type OrderAttempt = z.infer<typeof OrderAttemptSchema>;
export type PaymentAttempt = z.infer<typeof PaymentAttemptSchema>;
