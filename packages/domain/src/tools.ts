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

export const AddItemToCartToolInputSchema = ToolEnvelopeSchema.extend({
  item_id: z.string().min(1).optional(),
  query: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(25).default(1),
  notes: z.string().max(1024).optional(),
  fulfillment_type: z.enum(["DELIVERY", "COLLECTION", "INSTORE"]).optional()
}).refine((value) => value.item_id || value.query, {
  message: "Provide either item_id or query"
});

export const RemoveItemFromCartToolInputSchema = ToolEnvelopeSchema.extend({
  cart_line_id: z.string().min(1).optional(),
  item_id: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(25).optional()
}).refine((value) => value.cart_line_id || value.item_id, {
  message: "Provide either cart_line_id or item_id"
});

export const SetFulfillmentToolInputSchema = ToolEnvelopeSchema.extend({
  fulfillment_type: z.enum(["DELIVERY", "COLLECTION", "INSTORE"]),
  requested_time: z.string().datetime().optional()
});

export const SetCustomerDetailsToolInputSchema = ToolEnvelopeSchema.extend({
  first_name: z.string().min(1),
  last_name: z.string().min(1).optional(),
  phone: z.string().max(24).optional(),
  email: z.string().email().optional()
});

export const SetDeliveryAddressToolInputSchema = ToolEnvelopeSchema.extend({
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  formatted_address: z.string().optional(),
  flat_no: z.string().optional(),
  unit_number: z.string().optional(),
  notes: z.string().max(1024).optional(),
  confirmed: z.boolean().default(false)
});

export const GetCartToolInputSchema = ToolEnvelopeSchema;

export const ConfirmOrderToolInputSchema = ToolEnvelopeSchema.extend({
  customer_confirmed: z.literal(true),
  payment_type: z.enum(["CASH", "CARD", "ONLINE"]).default("CASH")
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

export const CreatePaymentLinkToolInputSchema = ToolEnvelopeSchema.extend({
  order_attempt_id: z.string().min(1),
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3).default("GBP")
});

export type SearchMenuToolInput = z.infer<typeof SearchMenuToolInputSchema>;
export type AddItemToCartToolInput = z.infer<typeof AddItemToCartToolInputSchema>;
export type RemoveItemFromCartToolInput = z.infer<typeof RemoveItemFromCartToolInputSchema>;
export type SetFulfillmentToolInput = z.infer<typeof SetFulfillmentToolInputSchema>;
export type SetCustomerDetailsToolInput = z.infer<typeof SetCustomerDetailsToolInputSchema>;
export type SetDeliveryAddressToolInput = z.infer<typeof SetDeliveryAddressToolInputSchema>;
export type GetCartToolInput = z.infer<typeof GetCartToolInputSchema>;
export type ConfirmOrderToolInput = z.infer<typeof ConfirmOrderToolInputSchema>;
export type CreatePaymentLinkToolInput = z.infer<typeof CreatePaymentLinkToolInputSchema>;
