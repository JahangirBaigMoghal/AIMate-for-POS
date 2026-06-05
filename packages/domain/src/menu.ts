import { z } from "zod";

export const MenuEntitySchema = z.object({
  tenant_id: z.string().min(1),
  store_id: z.string().min(1),
  menu_snapshot_id: z.string().min(1),
  entity_type: z.enum(["ITEM", "MODIFIER", "MODIFIER_GROUP", "CATEGORY", "SUBCATEGORY"]),
  entity_id: z.string().min(1),
  name: z.string().min(1),
  name_localized: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  price: z.number().int().nonnegative().optional(),
  fulfillment_modes: z.array(z.string()).default([]),
  show_online: z.boolean().optional(),
  stock_status: z.enum(["AVAILABLE", "UNAVAILABLE", "UNKNOWN"]).default("UNKNOWN"),
  modifier_group_ids: z.array(z.string()).default([]),
  embedding_text: z.string().optional(),
  updated_at: z.string().datetime()
});

export type MenuEntity = z.infer<typeof MenuEntitySchema>;
