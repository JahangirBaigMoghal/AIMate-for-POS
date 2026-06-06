import {
  CreateFoodHubOrderResponseSchema,
  CreateFoodHubOrderSchema,
  type CreateFoodHubOrder
} from "@aimate/domain";
import { IntegrationError, safeText, CircuitBreaker, retryWithBackoff } from "@aimate/shared";
import { FoodHubTokenManager } from "./token-manager";

export type FoodHubClientConfig = {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  tokenManager?: FoodHubTokenManager;
  fetchImpl?: typeof fetch;
};

export class FoodHubClient {
  private readonly tokenManager: FoodHubTokenManager;
  private readonly fetchImpl: typeof fetch;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly config: FoodHubClientConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.tokenManager =
      config.tokenManager ?? new FoodHubTokenManager(config.baseUrl, undefined, this.fetchImpl);
    this.circuitBreaker = new CircuitBreaker();
  }

  hasCredentials(): boolean {
    return Boolean(this.config.clientId && this.config.clientSecret);
  }

  async getStore(storeId: string): Promise<unknown> {
    return this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}`,
      scope: "stores.get"
    });
  }

  async getOpeningHours(storeId: string): Promise<unknown> {
    return this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}/opening-hours`,
      scope: "store.opening-hours.get"
    });
  }

  async getMenu(storeId: string): Promise<unknown> {
    return this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}/menu`,
      scope: "menu.get"
    });
  }

  async listOrders(storeId: string): Promise<unknown> {
    return this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}/orders`,
      scope: "orders.list"
    });
  }

  async createOrder(storeId: string, order: CreateFoodHubOrder) {
    const parsed = CreateFoodHubOrderSchema.parse(order);
    const response = await this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}/orders`,
      scope: "orders.create",
      method: "POST",
      body: parsed
    });
    return CreateFoodHubOrderResponseSchema.parse(response);
  }

  async getOrder(storeId: string, orderId: string): Promise<unknown> {
    return this.request({
      path: `/v1/stores/${encodeURIComponent(storeId)}/orders/${encodeURIComponent(orderId)}`,
      scope: "orders.get"
    });
  }

  private async request(input: {
    path: string;
    scope: string;
    method?: string;
    body?: unknown;
  }): Promise<unknown> {
    return this.circuitBreaker.execute(() =>
      retryWithBackoff(() => this.performRequest(input), 3, 50)
    );
  }

  private async performRequest(input: {
    path: string;
    scope: string;
    method?: string;
    body?: unknown;
  }): Promise<unknown> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new IntegrationError("FoodHub credentials are not configured", {
        scope: input.scope,
        path: input.path
      });
    }

    const token = await this.tokenManager.getAccessToken({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      scope: input.scope
    });

    const response = await this.fetchImpl(`${this.config.baseUrl}${input.path}`, {
      method: input.method ?? "GET",
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/json",
        "content-type": "application/json"
      },
      body: input.body === undefined ? undefined : JSON.stringify(input.body)
    });

    if (!response.ok) {
      throw new IntegrationError("FoodHub API request failed", {
        status: response.status,
        path: input.path,
        body: await safeText(response)
      });
    }

    if (response.status === 204) return {};
    return response.json();
  }
}

