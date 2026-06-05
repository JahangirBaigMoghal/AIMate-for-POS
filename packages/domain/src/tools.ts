import { z } from "zod";

export const ToolEnvelopeSchema = z.object({
  call_id: z.string().min(1),
  tenant_id: z.string().min(1),
  store_id: z.string().min(1),
  language: z.string().default("en"),
  request_id: z.string().min(1)
});

export const SearchMenuToolInputSchema = ToolEnvelopeSchema.extend({
  query: z.string().min(1),
  fulfillment_type: z.enum(["DELIVERY", "COLLECTION", "INSTORE"]).optional(),
  max_results: z.number().int().min(1).max(10).default(5)
});

export const CreateFoodHubOrderToolInputSchema = ToolEnvelopeSchema.extend({
  order_attempt_id: z.string().min(1),
  customer_confirmed: z.literal(true)
});

export const HandoffToolInputSchema = ToolEnvelopeSchema.extend({
  reason: z.string().min(1),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  summary: z.string().min(1)
});

export const ToolResultSchema = z.object({
  ok: z.boolean(),
  error_code: z.string().optional(),
  human_message: z.string(),
  audit_event_id: z.string().optional(),
  data: z.unknown().optional()
});

export type SearchMenuToolInput = z.infer<typeof SearchMenuToolInputSchema>;
