import type { MenuEntity } from "@aimate/domain";

export type MenuNormalizeContext = {
  tenant_id: string;
  store_id: string;
  menu_snapshot_id?: string;
  updated_at?: string;
};

type RecordValue = Record<string, unknown>;

export function normalizeFoodHubMenu(menu: unknown, context: MenuNormalizeContext): MenuEntity[] {
  const entities = new Map<string, MenuEntity>();
  const snapshotId = context.menu_snapshot_id ?? `foodhub-menu-${context.store_id}`;
  const updatedAt = context.updated_at ?? new Date().toISOString();

  walk(menu, (node, parents) => {
    const entity = normalizeNode(node, parents, {
      ...context,
      menu_snapshot_id: snapshotId,
      updated_at: updatedAt
    });
    if (!entity) return;
    const key = `${entity.entity_type}:${entity.entity_id}`;
    entities.set(key, entity);
  });

  return [...entities.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function walk(value: unknown, visitor: (node: RecordValue, parents: RecordValue[]) => void, parents: RecordValue[] = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, visitor, parents);
    }
    return;
  }

  if (!isRecord(value)) return;
  visitor(value, parents);

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        walk(item, visitor, [...parents, value]);
      }
    } else if (isRecord(child)) {
      walk(child, visitor, [...parents, value]);
    }
  }
}

function normalizeNode(
  node: RecordValue,
  parents: RecordValue[],
  context: Required<MenuNormalizeContext>
): MenuEntity | undefined {
  const id = readString(node, ["id", "item_id", "modifier_id", "modifier_group_id", "category_id", "subcategory_id"]);
  const name = readString(node, ["name", "title", "display_name"]);
  if (!id || !name) return undefined;

  const entityType = inferEntityType(node, parents);
  if (!entityType) return undefined;

  const price = readNumber(node, ["price", "amount", "unit_amount"]);
  const fulfillmentModes = readStringArray(node, ["fulfillment_modes", "fulfillment", "service_modes"]);
  const aliases = unique([
    name,
    readString(node, ["description"]),
    ...parents.map((parent) => readString(parent, ["name", "title"])).filter((value): value is string => Boolean(value))
  ]).filter((value) => value !== name);

  return {
    tenant_id: context.tenant_id,
    store_id: context.store_id,
    menu_snapshot_id: context.menu_snapshot_id,
    entity_type: entityType,
    entity_id: id,
    name,
    name_localized: readString(node, ["name_localized", "localized_name"]),
    aliases,
    price,
    fulfillment_modes: fulfillmentModes,
    show_online: readBoolean(node, ["show_online", "is_online", "enabled"]),
    stock_status: inferStockStatus(node),
    modifier_group_ids: readStringArray(node, ["modifier_group_ids", "modifierGroups", "modifier_groups"]),
    embedding_text: unique([name, ...aliases]).join(". "),
    updated_at: context.updated_at
  };
}

function inferEntityType(
  node: RecordValue,
  parents: RecordValue[]
): MenuEntity["entity_type"] | undefined {
  const keys = new Set(Object.keys(node).map((key) => key.toLowerCase()));
  if (keys.has("modifier_group_id") || keys.has("min_permitted") || keys.has("max_permitted")) {
    return "MODIFIER_GROUP";
  }
  if (keys.has("modifier_id")) return "MODIFIER";
  if (keys.has("price") || parents.some((parent) => hasArrayKey(parent, "items"))) return "ITEM";
  if (hasArrayKey(node, "subcategories")) return "CATEGORY";
  if (hasArrayKey(node, "items")) return "SUBCATEGORY";
  if (keys.has("category_id")) return "CATEGORY";
  if (keys.has("subcategory_id")) return "SUBCATEGORY";
  return undefined;
}

function inferStockStatus(node: RecordValue): MenuEntity["stock_status"] {
  const raw = readString(node, ["stock_status", "status", "availability_status"])?.toUpperCase();
  if (raw?.includes("OUT") || raw?.includes("UNAVAILABLE") || raw?.includes("DISABLED")) return "UNAVAILABLE";
  const showOnline = readBoolean(node, ["show_online", "is_online", "enabled"]);
  if (showOnline === false) return "UNAVAILABLE";
  if (raw?.includes("AVAILABLE") || showOnline === true) return "AVAILABLE";
  return "UNKNOWN";
}

function readString(node: RecordValue, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function readNumber(node: RecordValue, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  }
  return undefined;
}

function readBoolean(node: RecordValue, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function readStringArray(node: RecordValue, keys: string[]): string[] {
  for (const key of keys) {
    const value = node[key];
    if (!Array.isArray(value)) continue;
    return value
      .map((item) => (typeof item === "string" ? item : isRecord(item) ? readString(item, ["id", "name"]) : undefined))
      .filter((item): item is string => Boolean(item));
  }
  return [];
}

function hasArrayKey(node: RecordValue, key: string) {
  return Array.isArray(node[key]);
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}
