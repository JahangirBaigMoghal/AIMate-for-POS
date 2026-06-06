import type { MenuEntity } from "@aimate/domain";
import { MenuIndex, type MenuSearchResult } from "./menu-index";
import { normalizeFoodHubMenu } from "./menu-normalizer";

export type MenuFetchClient = {
  getMenu(storeId: string): Promise<unknown>;
};

export type MenuSnapshotRecord = {
  tenant_id: string;
  store_id: string;
  menu_snapshot_id: string;
  source: "foodhub" | "fallback" | "manual";
  refreshed_at: string;
  entities: MenuEntity[];
  last_error?: string;
};

export type MenuCatalogConfig = {
  foodhub?: MenuFetchClient;
  fallbackEntities?: MenuEntity[];
};

export class MenuCatalog {
  private readonly snapshots = new Map<string, MenuSnapshotRecord>();
  private readonly fallbackEntities: MenuEntity[];

  constructor(private readonly config: MenuCatalogConfig = {}) {
    this.fallbackEntities = config.fallbackEntities ?? [];
  }

  seed(tenantId: string, storeId: string, entities: MenuEntity[], source: "fallback" | "manual" = "manual") {
    this.setSnapshot({
      tenant_id: tenantId,
      store_id: storeId,
      menu_snapshot_id: `${source}-${storeId}`,
      source,
      refreshed_at: new Date().toISOString(),
      entities
    });
  }

  async refresh(tenantId: string, storeId: string): Promise<MenuSnapshotRecord> {
    const now = new Date().toISOString();
    if (this.config.foodhub) {
      try {
        const rawMenu = await this.config.foodhub.getMenu(storeId);
        const entities = normalizeFoodHubMenu(rawMenu, {
          tenant_id: tenantId,
          store_id: storeId,
          menu_snapshot_id: `foodhub-${storeId}-${Date.now()}`,
          updated_at: now
        });

        if (entities.length > 0) {
          return this.setSnapshot({
            tenant_id: tenantId,
            store_id: storeId,
            menu_snapshot_id: `foodhub-${storeId}-${Date.now()}`,
            source: "foodhub",
            refreshed_at: now,
            entities
          });
        }
      } catch (error) {
        return this.fallbackSnapshot(tenantId, storeId, error);
      }
    }

    return this.fallbackSnapshot(tenantId, storeId);
  }

  async search(input: {
    tenant_id: string;
    store_id: string;
    query: string;
    limit?: number;
    fulfillment_type?: string;
  }): Promise<MenuSearchResult[]> {
    const snapshot = this.getSnapshot(input.tenant_id, input.store_id) ?? (await this.refresh(input.tenant_id, input.store_id));
    return new MenuIndex(snapshot.entities).search(input.query, input.limit, input.fulfillment_type);
  }

  async findEntity(input: {
    tenant_id: string;
    store_id: string;
    item_id?: string;
    query?: string;
    fulfillment_type?: string;
  }): Promise<{ entity?: MenuEntity; candidates: MenuSearchResult[]; ambiguous: boolean }> {
    const snapshot = this.getSnapshot(input.tenant_id, input.store_id) ?? (await this.refresh(input.tenant_id, input.store_id));
    if (input.item_id) {
      const entity = snapshot.entities.find(
        (candidate) =>
          candidate.entity_id === input.item_id &&
          candidate.entity_type === "ITEM" &&
          candidate.stock_status !== "UNAVAILABLE"
      );
      return { entity, candidates: entity ? [{ ...entity, score: 100, reason: "exact_id" }] : [], ambiguous: false };
    }

    if (!input.query) return { candidates: [], ambiguous: false };
    const candidates = new MenuIndex(snapshot.entities).search(input.query, 3, input.fulfillment_type);
    const top = candidates[0];
    const second = candidates[1];
    const ambiguous = Boolean(!top || top.score < 40 || (second && top.score - second.score <= 5));
    return { entity: ambiguous ? undefined : top, candidates, ambiguous };
  }

  getSnapshot(tenantId: string, storeId: string): MenuSnapshotRecord | undefined {
    return this.snapshots.get(key(tenantId, storeId));
  }

  markStale(tenantId: string, storeId: string): void {
    this.snapshots.delete(key(tenantId, storeId));
  }

  private fallbackSnapshot(tenantId: string, storeId: string, error?: unknown): MenuSnapshotRecord {
    const existing = this.getSnapshot(tenantId, storeId);
    if (existing) {
      return error
        ? this.setSnapshot({
            ...existing,
            last_error: error instanceof Error ? error.message : String(error)
          })
        : existing;
    }

    const matchingFallback = this.fallbackEntities.filter(
      (entity) =>
        entity.store_id === storeId ||
        entity.store_id === "demo-store" ||
        entity.tenant_id === "demo"
    );

    return this.setSnapshot({
      tenant_id: tenantId,
      store_id: storeId,
      menu_snapshot_id: `fallback-${storeId}`,
      source: "fallback",
      refreshed_at: new Date().toISOString(),
      entities: matchingFallback.map((entity) => ({
        ...entity,
        tenant_id: tenantId,
        store_id: storeId
      })),
      last_error: error instanceof Error ? error.message : error ? String(error) : undefined
    });
  }

  private setSnapshot(snapshot: MenuSnapshotRecord): MenuSnapshotRecord {
    this.snapshots.set(key(snapshot.tenant_id, snapshot.store_id), snapshot);
    return snapshot;
  }
}

function key(tenantId: string, storeId: string) {
  return `${tenantId}:${storeId}`;
}
