import { describe, expect, it } from "vitest";
import { normalizeFoodHubMenu } from "./menu-normalizer";

describe("normalizeFoodHubMenu", () => {
  it("extracts searchable item entities from nested FoodHub-like menus", () => {
    const entities = normalizeFoodHubMenu(
      {
        data: {
          menus: [
            {
              id: "menu_1",
              name: "Main Menu",
              fulfillment: ["DELIVERY", "COLLECTION"],
              categories: [
                {
                  id: "cat_burgers",
                  name: "Burgers",
                  subcategories: [
                    {
                      id: "sub_chicken",
                      name: "Chicken",
                      items: [
                        {
                          id: "item_chicken_burger",
                          name: "Chicken Burger",
                          price: 699,
                          show_online: true,
                          fulfillment_modes: ["DELIVERY", "COLLECTION"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        tenant_id: "t1",
        store_id: "s1",
        menu_snapshot_id: "snap_1",
        updated_at: "2026-06-06T00:00:00.000Z"
      }
    );

    const item = entities.find((entity) => entity.entity_id === "item_chicken_burger");
    expect(item?.entity_type).toBe("ITEM");
    expect(item?.price).toBe(699);
    expect(item?.aliases).toContain("Burgers");
  });
});
