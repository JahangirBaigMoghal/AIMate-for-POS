import { describe, expect, it } from "vitest";
import { MenuIndex } from "./menu-index";

describe("MenuIndex", () => {
  it("finds menu items by alias and excludes unavailable items", () => {
    const index = new MenuIndex([
      {
        tenant_id: "t1",
        store_id: "s1",
        menu_snapshot_id: "m1",
        entity_type: "ITEM",
        entity_id: "burger_1",
        name: "Chicken Burger",
        aliases: ["chicken sandwich"],
        price: 699,
        fulfillment_modes: ["DELIVERY"],
        stock_status: "AVAILABLE",
        modifier_group_ids: [],
        updated_at: new Date().toISOString()
      },
      {
        tenant_id: "t1",
        store_id: "s1",
        menu_snapshot_id: "m1",
        entity_type: "ITEM",
        entity_id: "pizza_1",
        name: "Margherita Pizza",
        aliases: ["marg"],
        price: 899,
        fulfillment_modes: ["DELIVERY"],
        stock_status: "UNAVAILABLE",
        modifier_group_ids: [],
        updated_at: new Date().toISOString()
      }
    ]);

    expect(index.search("chicken sandwich")[0]?.entity_id).toBe("burger_1");
    expect(index.search("marg")).toHaveLength(0);
  });
});
