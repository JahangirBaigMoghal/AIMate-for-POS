import { z } from "zod";
import { CartItemSchema, FulfillmentTypeSchema, PriceBreakdownSchema } from "./cart";

export const FoodHubCustomerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().max(15).optional(),
  email: z.string().email().optional(),
  phone_code: z.string().max(12).optional()
});

export const FoodHubDeliverySchema = z.object({
  type: z.enum(["DELIVERY_BY_RESTAURANT", "DELIVERY_BY_COURIER"]),
  notes: z.string().max(1024).optional(),
  address: z.object({
    type: z.literal("STREET_ADDRESS"),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    formatted_address: z.string().optional(),
    flat_no: z.string().optional(),
    unit_number: z.string().optional(),
    area: z.string().optional(),
    state: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(),
    long: z.number().min(-180).max(180).optional()
  })
});

export const CreateFoodHubOrderSchema = z.object({
  external_reference_id: z.string().min(1),
  source: z.string().optional(),
  fulfillment_type: FulfillmentTypeSchema,
  placed_on: z.string().datetime(),
  pre_order_time: z.string().datetime().optional(),
  est_delivery_time: z.string().datetime().optional(),
  est_pick_up_time: z.string().datetime().optional(),
  notes: z.string().max(1024).optional(),
  customer: FoodHubCustomerSchema,
  delivery: FoodHubDeliverySchema.optional(),
  items: z.array(CartItemSchema).min(1),
  payment: PriceBreakdownSchema.extend({
    payment_type: z.enum(["CASH", "CARD", "ONLINE"]),
    payment_status: z.enum(["PAID", "UNPAID"])
  }),
  utensils: z.boolean().optional(),
  total_carry_bags: z.number().int().nonnegative().optional()
});

export const CreateFoodHubOrderResponseSchema = z.object({
  data: z
    .object({
      orderId: z.string(),
      resourceUri: z.string(),
      storeId: z.string()
    })
    .optional()
});

export type CreateFoodHubOrder = z.infer<typeof CreateFoodHubOrderSchema>;
