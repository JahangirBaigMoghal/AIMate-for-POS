import { z } from "zod";

export const FulfillmentTypeSchema = z.enum(["DELIVERY", "COLLECTION", "INSTORE"]);

export const CustomerDetailsSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1).optional(),
  phone: z.string().max(24).optional(),
  email: z.string().email().optional()
});

export const DeliveryAddressSchema = z.object({
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

export const ModifierSelectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive().default(1),
  modifier_group_name: z.string().optional(),
  placement: z.string().optional()
});

export const CartItemSchema = z.object({
  cart_line_id: z.string().min(1).optional(),
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  category_name: z.string().optional(),
  notes: z.string().max(1024).optional(),
  addons: z.array(ModifierSelectionSchema).default([])
});

export const CartSchema = z.object({
  cart_id: z.string().min(1),
  version: z.number().int().nonnegative(),
  fulfillment_type: FulfillmentTypeSchema.optional(),
  items: z.array(CartItemSchema).default([]),
  customer: CustomerDetailsSchema.optional(),
  delivery_address: DeliveryAddressSchema.optional(),
  notes: z.string().max(1024).optional()
});

export const PriceBreakdownSchema = z.object({
  subtotal: z.number().int().nonnegative(),
  charges: z.object({
    tax: z.number().int().nonnegative(),
    delivery_fee: z.number().int().nonnegative().optional(),
    service_fee: z.number().int().nonnegative().optional()
  }),
  discounts: z
    .array(
      z.object({
        discount_type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
        discount_value: z.number().int().nonnegative(),
        discount_percentage: z.number().int().min(0).max(100).optional()
      })
    )
    .default([]),
  total: z.number().int().nonnegative()
});

export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type CustomerDetails = z.infer<typeof CustomerDetailsSchema>;
export type DeliveryAddress = z.infer<typeof DeliveryAddressSchema>;
export type PriceBreakdown = z.infer<typeof PriceBreakdownSchema>;

export function calculateSubtotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => {
    const addonTotal = item.addons.reduce(
      (addonSum, addon) => addonSum + addon.price * addon.quantity,
      0
    );
    return sum + (item.price + addonTotal) * item.quantity;
  }, 0);
}
