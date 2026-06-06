import { IntegrationError, safeText } from "@aimate/shared";

export type FoodHubTokenRequest = {
  clientId: string;
  clientSecret: string;
  scope: string;
};

export type CachedToken = {
  accessToken: string;
  scope: string;
  expiresAt: number;
};

export interface TokenStore {
  get(key: string): Promise<CachedToken | undefined>;
  set(key: string, token: CachedToken): Promise<void>;
}

export class InMemoryTokenStore implements TokenStore {
  private readonly tokens = new Map<string, CachedToken>();

  async get(key: string): Promise<CachedToken | undefined> {
    return this.tokens.get(key);
  }

  async set(key: string, token: CachedToken): Promise<void> {
    this.tokens.set(key, token);
  }
}

export class FoodHubTokenManager {
  constructor(
    private readonly baseUrl: string,
    private readonly store: TokenStore = new InMemoryTokenStore(),
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async getAccessToken(request: FoodHubTokenRequest): Promise<string> {
    const key = `${request.clientId}:${request.scope}`;
    const cached = await this.store.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt - now > this.refreshWindow(cached.expiresAt, now)) {
      return cached.accessToken;
    }

    const response = await this.fetchImpl(`${this.baseUrl}/v1/auth/token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        clientId: request.clientId,
        clientSecret: request.clientSecret,
        grant_type: "client_credentials",
        scope: request.scope
      })
    });

    if (!response.ok) {
      throw new IntegrationError("FoodHub token request failed", {
        status: response.status,
        body: await safeText(response)
      });
    }

    const body = (await response.json()) as {
      access_token?: string;
      token?: string;
      expires_in?: number;
    };
    const accessToken = body.access_token ?? body.token;
    if (!accessToken) {
      throw new IntegrationError("FoodHub token response did not include an access token", body);
    }

    const ttlMs = (body.expires_in ?? 60 * 60 * 24 * 30) * 1000;
    await this.store.set(key, {
      accessToken,
      scope: request.scope,
      expiresAt: now + ttlMs
    });

    return accessToken;
  }

  private refreshWindow(expiresAt: number, now: number): number {
    const ttlRemaining = Math.max(expiresAt - now, 0);
    return Math.max(ttlRemaining * 0.2, 60_000);
  }
}

